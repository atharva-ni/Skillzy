import { NextRequest } from 'next/server';
import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { executeCode } from '@/lib/compiler';
import { z } from 'zod';
import { analyzeBuggyCode } from '@/lib/socraticTutorAgent';


const compileRequestSchema = z.object({
  code: z.string(),
  language: z.enum(['javascript', 'python', 'cpp', 'java']),
  problemId: z.string().optional(),
  stepId: z.string().optional(),
  isSubmit: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const dbUser = await requireAuth();
    const body = await req.json();
    
    const { code, language, problemId, stepId, isSubmit } = compileRequestSchema.parse(body);

    // 1. Fetch step if stepId is provided to get metadata
    let dbStep = null;
    if (stepId) {
      dbStep = await prisma.lessonStep.findUnique({
        where: { id: stepId },
      });
    }

    // Fetch problem if problemId is provided
    let dbProblem = null;
    if (problemId) {
      dbProblem = await prisma.codingProblem.findFirst({
        where: {
          OR: [
            { id: problemId },
            { slug: problemId }
          ]
        }
      });
    }

    // 2. Append test assertions (run for both Run Code and Submit)
    let codeToExecute = code;
    let isTestRun = false;

    let assertionCode: string | null = null;
    if (stepId && dbStep?.labTestCode) {
      const stepTests = dbStep.labTestCode as Record<string, string>;
      assertionCode = stepTests[language] || null;
    } else if (problemId && dbProblem?.testCode) {
      const problemTests = dbProblem.testCode as Record<string, string>;
      assertionCode = problemTests[language] || null;
    }

    if (assertionCode) {
      if (language === 'cpp') {
        // Rename student's main function to avoid duplication with test runner main
        codeToExecute = code.replace(/(int|void)\s+main\s*\(/, '$1 student_main(');
      } else if (language === 'java') {
        // Rename student's Main class to avoid duplication with test runner Main class
        codeToExecute = code.replace(/(public\s+)?class\s+Main\b/, 'class StudentSolution');
      }
      codeToExecute += '\n' + assertionCode;
      isTestRun = true;
    }

    // 3. Run the code via sandbox compiler
    const runResult = await executeCode(codeToExecute, language, dbUser.id);

    // 4. Parse test output & extract individual test cases from stdout
    let cleanedStdout = '';
    const parsedTestCases: { index: number; passed: boolean; actual: string }[] = [];
    
    if (runResult.stdout) {
      const lines = runResult.stdout.split('\n');
      const regularLines: string[] = [];
      
      lines.forEach(line => {
        if (line.startsWith('[TEST_CASE]')) {
          const content = line.substring(11).trim(); // remove '[TEST_CASE]'
          if (content.startsWith('ERROR')) {
            return;
          }
          const parts = content.split(' | ');
          const index = parseInt(parts[0].trim(), 10);
          const passed = parts[1]?.trim() === 'PASS';
          const actual = parts[2]?.replace('Actual:', '').trim() || '';
          
          parsedTestCases.push({ index, passed, actual });
        } else if (line.startsWith('TEST_RESULTS:') || line.startsWith('TEST_FAILURE:')) {
          // Filter out internal test result markers
          return;
        } else {
          regularLines.push(line);
        }
      });
      cleanedStdout = regularLines.join('\n').trim();
    } else {
      cleanedStdout = runResult.stdout || '';
    }

    let testPassed = false;
    let testSummary = 'Executed successfully';
    let passedCount = 0;
    let totalCount = 0;

    if (isTestRun) {
      if (parsedTestCases.length > 0) {
        passedCount = parsedTestCases.filter(tc => tc.passed).length;
        totalCount = parsedTestCases.length;
        testPassed = passedCount === totalCount;
        testSummary = `${passedCount}/${totalCount} tests passed`;
      } else if (runResult.exitCode === 0 && runResult.stdout.includes('TEST_RESULTS:')) {
        testPassed = true;
        const match = runResult.stdout.match(/TEST_RESULTS:\s*(\d+)\/(\d+)\s*passed/);
        if (match) {
          passedCount = parseInt(match[1]);
          totalCount = parseInt(match[2]);
          testSummary = `${passedCount}/${totalCount} tests passed`;
        }
      } else {
        testPassed = false;
        const failMatch = runResult.stderr.match(/TEST_FAILURE:\s*(.*)/) || runResult.stdout.match(/TEST_FAILURE:\s*(.*)/);
        testSummary = failMatch ? failMatch[1] : 'Test cases failed or assertion error';
      }
    }

    // 5. If this is a submission, record progress and submission in database
    let aiFeedbackResponse: any = null;

    if (isSubmit) {
      const targetId = stepId || problemId;
      if (targetId) {
        // Find if this is a step or a standalone problem to check assignment existence
        const assignment = await prisma.assignment.findUnique({
          where: { id: targetId }
        });

        // Fetch static data to have as backup or context
        let backupData: any = {};
        if (dbStep && dbStep.metadata) {
          const meta = dbStep.metadata as any;
          backupData = meta.aiFeedback || meta || {};
        } else if (dbProblem && dbProblem.aiFeedback) {
          backupData = dbProblem.aiFeedback as any;
        }

        if (testPassed) {
          // Success feedback
          aiFeedbackResponse = {
            score: 100,
            metrics: { complexity: 'Optimal', performance: 'All tests passed', style: 'Excellent' },
            suggestions: ['Congratulations! Your solution is fully correct and passed all verification checks.'],
            optimalExplanation: 'Your solution has successfully met the correctness requirements.',
            optimalCode: code,
          };
        } else {
          // Incorrect code -> Call live Socratic Tutor Agent for personalized analysis
          let calculatedScore = 50;
          let suggestions: string[] = [];
          let optimalExplanation = '';
          let secondaryHint = null;

          try {
            const challengeTitle = dbStep?.title || dbProblem?.title || 'Coding Challenge';
            const socratic = await analyzeBuggyCode(code, language, challengeTitle);

            const logicalCount = socratic.logicalErrors?.length || 0;
            const syntaxCount = socratic.syntaxErrors?.length || 0;
            calculatedScore = Math.max(10, 100 - (logicalCount * 15) - (syntaxCount * 10));

            suggestions = [
              ...(socratic.logicalErrors?.map(e => `Line ${e.line}: ${e.issue} - Hint: ${e.hint}`) || []),
              ...(socratic.syntaxErrors?.map(s => `Syntax: ${s}`) || []),
              ...(socratic.inefficiencies?.map(i => `Performance: ${i.area} - ${i.reason}. Hint: ${i.hint}`) || []),
              ...(socratic.nextSteps?.map(n => `Next Step: ${n.step} - Review ${n.concept}. Hint: ${n.hint}`) || [])
            ];
            if (suggestions.length === 0) {
              suggestions = backupData.suggestions || ['Verify test inputs and code structure.'];
            }

            optimalExplanation = socratic.primaryHint || socratic.educationalTips || backupData.optimalExplanation || 'Review your code logic and resolve failures.';
            secondaryHint = socratic.secondaryHint || backupData.secondaryHint || null;

            aiFeedbackResponse = {
              score: calculatedScore,
              metrics: {
                complexity: socratic.inefficiencies?.map(i => i.area).join(', ') || backupData.metrics?.complexity || 'Standard',
                performance: socratic.inefficiencies?.length > 0 ? 'Review inefficiencies' : backupData.metrics?.performance || 'Passed checks',
                style: socratic.syntaxErrors?.length > 0 ? 'Needs attention' : backupData.metrics?.style || 'Good formatting'
              },
              suggestions,
              optimalExplanation,
              secondaryHint,
              optimalCode: '// Review the hints to write the optimal code!',
              rawResponse: socratic
            };
          } catch (aiErr) {
            console.error('Failed to run live Socratic tutor, falling back to static database review:', aiErr);
            aiFeedbackResponse = {
              score: backupData.score || 50,
              metrics: backupData.metrics || { complexity: 'N/A', performance: 'Failed review', style: 'Needs review' },
              suggestions: backupData.suggestions || ['Review test case assertions and edge cases.'],
              optimalExplanation: backupData.optimalExplanation || 'Examine code logic and resolve failures.',
              secondaryHint: backupData.secondaryHint || null,
              optimalCode: backupData.optimalCode || '// Review hints to solve.',
              rawResponse: backupData
            };
          }
        }

        // If assignment exists, write submission & AI review records to database
        if (assignment) {
          const dbSubmission = await prisma.submission.create({
            data: {
              assignmentId: targetId,
              userId: dbUser.id,
              code,
              language,
              status: testPassed ? 'graded' : 'pending',
              grade: testPassed ? 100.00 : 0.00,
              feedback: testPassed 
                ? 'All assertions passed successfully! Excellent work.' 
                : `Failed verification: ${testSummary}`,
            },
          });

          if (testPassed) {
            await prisma.aiReview.create({
              data: {
                submissionId: dbSubmission.id,
                overallScore: 100,
                summary: 'Perfect submission! All test cases passed.',
                strengths: ['Correct logical implementation', 'Passed all standard assertions'],
                improvements: [],
                styleFeedback: 'Excellent work completing the exercise!',
                rawResponse: { success: true },
                modelUsed: 'Static Checker'
              }
            });

            // If tests passed and this is a lesson step, complete the lesson step automatically
            if (stepId && dbStep) {
              await prisma.lessonProgress.upsert({
                where: {
                  userId_stepId: {
                    userId: dbUser.id,
                    stepId,
                  },
                },
                update: {
                  isCompleted: true,
                  completedAt: new Date(),
                },
                create: {
                  userId: dbUser.id,
                  stepId,
                  isCompleted: true,
                  completedAt: new Date(),
                },
              });

              // Re-calculate user's course progress percentage
              const stepDetails = await prisma.lessonStep.findUnique({
                where: { id: stepId },
                include: {
                  lesson: {
                    include: {
                      module: {
                        include: {
                          course: {
                            include: {
                              modules: {
                                include: {
                                  lessons: {
                                    include: {
                                      steps: true
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              });

              if (stepDetails?.lesson?.module?.course) {
                const course = stepDetails.lesson.module.course;
                const allStepIds: string[] = [];
                course.modules.forEach(m => {
                  m.lessons.forEach(l => {
                    l.steps.forEach(s => {
                      allStepIds.push(s.id);
                    });
                  });
                });

                const completedCount = await prisma.lessonProgress.count({
                  where: {
                    userId: dbUser.id,
                    stepId: { in: allStepIds },
                    isCompleted: true
                  }
                });

                const progressPct = allStepIds.length > 0 
                  ? Math.min((completedCount / allStepIds.length) * 100, 100) 
                  : 0;

                await prisma.enrollment.update({
                  where: {
                    userId_courseId: {
                      userId: dbUser.id,
                      courseId: course.id
                    }
                  },
                  data: {
                    progressPct: progressPct,
                    completedAt: progressPct === 100 ? new Date() : null
                  }
                });
              }
            }
          } else {
            // Fails
            try {
              const rawSocratic = aiFeedbackResponse.rawResponse || {};
              await prisma.aiReview.create({
                data: {
                  submissionId: dbSubmission.id,
                  overallScore: aiFeedbackResponse.score,
                  summary: rawSocratic.codeIntent || 'Socratic Analysis Feedback',
                  strengths: rawSocratic.positives || [],
                  improvements: aiFeedbackResponse.suggestions,
                  complexityAnalysis: aiFeedbackResponse.metrics.complexity,
                  performanceTips: rawSocratic.inefficiencies?.map((i: any) => i.hint).join('\n') || null,
                  styleFeedback: rawSocratic.educationalTips || null,
                  rawResponse: rawSocratic,
                  modelUsed: process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
                }
              });
            } catch (dbErr) {
              console.error('Failed to save AI review to DB:', dbErr);
            }
          }
        }
      }
    }

    return apiSuccess({
      stdout: cleanedStdout,
      stderr: runResult.stderr,
      exitCode: runResult.exitCode,
      timeMs: runResult.timeMs,
      isTimeout: runResult.isTimeout,
      memory: runResult.memory,
      cpuTime: runResult.cpuTime,
      wallTime: runResult.wallTime,
      testResults: isTestRun ? {
        passed: testPassed,
        summary: testSummary,
        passedCount,
        totalCount
      } : null,
      testCases: parsedTestCases.length > 0 ? parsedTestCases : null,
      aiFeedback: aiFeedbackResponse
    });
  } catch (error: any) {
    console.error('Compiler Route error:', error);
    return apiError(error?.message || 'Code execution service failed', 500);
  }
}
