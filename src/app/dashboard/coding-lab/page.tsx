'use client';

import React, { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

interface AiFeedbackType {
  score: number;
  metrics: { complexity: string; performance: string; style: string };
  suggestions: string[];
  positives?: string[];
  optimalCode?: string;
  optimalExplanation?: string;
  secondaryHint?: string;
}

type Language = 'javascript' | 'python' | 'cpp' | 'java';

interface TestResult {
  passed: boolean;
  summary: string;
  passedCount: number;
  totalCount: number;
}

interface ExecutionOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  isTimeout: boolean;
  memory: number | null;
  cpuTime: number | null;
  wallTime: number | null;
  testResults: TestResult | null;
  testCases: { index: number; passed: boolean; actual: string }[] | null;
  aiFeedback?: AiFeedbackType | null;
}

function CodingLabInner() {
  const searchParams = useSearchParams();
  const stepId = searchParams.get('stepId');

  const [language, setLanguage] = useState<Language>('javascript');
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackType | null>(null);
  const [showSecondaryHint, setShowSecondaryHint] = useState(false);
  const [execOutput, setExecOutput] = useState<ExecutionOutput | null>(null);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  // Dynamic step loading (when launched from a lesson lab step)
  const [dbStep, setDbStep] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);

  // Dynamic problems loading (for standalone practice mode)
  const [problems, setProblems] = useState<any[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);

  // Resizable panels
  const [leftWidth, setLeftWidth] = useState(280);     // px
  const [rightWidth, setRightWidth] = useState(300);   // px
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  const startDrag = useCallback((side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (side === 'left') isDraggingLeft.current = true;
    else isDraggingRight.current = true;

    const startX = e.clientX;
    const startLeftW = leftWidth;
    const startRightW = rightWidth;

    const onMove = (ev: MouseEvent) => {
      const totalW = containerRef.current?.offsetWidth || window.innerWidth;
      const delta = ev.clientX - startX;
      if (isDraggingLeft.current) {
        const next = Math.max(180, Math.min(totalW * 0.4, startLeftW + delta));
        setLeftWidth(next);
      } else {
        const next = Math.max(200, Math.min(totalW * 0.4, startRightW - delta));
        setRightWidth(next);
      }
    };
    const onUp = () => {
      isDraggingLeft.current = false;
      isDraggingRight.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [leftWidth, rightWidth]);

  const activeProblem = problems.find((p) => p.slug === selectedProblemId || p.id === selectedProblemId) ?? problems[0];
  const activeExamples = isStepMode && dbStep ? (dbStep.metadata?.examples || []) : (activeProblem?.examples || []);

  // Load standalone problems on mount if not in step mode
  useEffect(() => {
    if (!isStepMode) {
      setLoadingProblems(true);
      fetch('/api/problems')
        .then((r) => r.json())
        .then((data) => {
          if (data.problems) {
            setProblems(data.problems);
            if (data.problems.length > 0) {
              setSelectedProblemId(data.problems[0].slug || data.problems[0].id);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load problems:', err);
          toast.error('Failed to load coding problems');
        })
        .finally(() => setLoadingProblems(false));
    } else {
      setLoadingProblems(false);
    }
  }, [isStepMode]);

  // Load DB step if stepId is present in URL
  useEffect(() => {
    if (stepId) {
      setIsStepMode(true);
      setLoadingStep(true);
      setSelectedCaseIdx(0);
      fetch(`/api/steps/${stepId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.step) {
            const s = data.step;
            setDbStep(s);
            // Detect language from labLanguage field
            const lang = (s.labLanguage as Language) || 'javascript';
            setLanguage(lang);
            setCode(s.labStarterCode || '');
          }
        })
        .catch((err) => {
          console.error('Failed to load step:', err);
          toast.error('Failed to load lab step');
        })
        .finally(() => setLoadingStep(false));
    }
  }, [stepId]);

  // Reset language if current language is not supported by activeProblem
  useEffect(() => {
    if (!isStepMode && activeProblem) {
      const tests = activeProblem.testCode as Record<string, string> | undefined;
      const isSupported = !!(tests && tests[language] && tests[language].trim() !== '');
      if (!isSupported) {
        const supported = ['javascript', 'python', 'cpp', 'java'].find(lang => 
          tests && tests[lang] && tests[lang].trim() !== ''
        ) as Language || 'javascript';
        setLanguage(supported);
      }
    }
  }, [activeProblem, isStepMode, language]);

  // Update code when problem or language changes (free-practice mode only)
  useEffect(() => {
    if (!isStepMode && activeProblem) {
      const starter = activeProblem.starterCode as Record<string, string>;
      setCode(starter?.[language] || '');
      setExecOutput(null);
      setAiFeedback(null);
      setShowAiFeedback(false);
      setSelectedCaseIdx(0);
    }
  }, [activeProblem, language, isStepMode]);

  const callCompileApi = async (isSubmit: boolean): Promise<ExecutionOutput | null> => {
    try {
      const body: Record<string, any> = { code, language, isSubmit };
      if (isStepMode && stepId) {
        body.stepId = stepId;
      } else {
        body.problemId = selectedProblemId;
      }

      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Compilation failed');
      return data as ExecutionOutput;
    } catch (err: any) {
      toast.error(err.message || 'Execution service error');
      return null;
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setExecOutput(null);
    const result = await callCompileApi(false);
    setIsRunning(false);
    if (result) setExecOutput(result);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setExecOutput(null);
    setShowSecondaryHint(false);
    const result = await callCompileApi(true);
    setIsSubmitting(false);
    if (result) {
      setExecOutput(result);

      if (result.testResults?.passed) {
        const feedbackData = isStepMode
          ? (dbStep?.metadata?.aiFeedback || dbStep?.metadata || {})
          : (activeProblem?.aiFeedback || {});

        const feedback = result.aiFeedback || {
          score: 100,
          metrics: { complexity: 'Optimal', performance: 'All tests passed', style: 'Excellent' },
          suggestions: ['Congratulations! Your solution is fully correct and passed all verification checks.'],
          optimalExplanation: feedbackData.optimalExplanation || 'Your solution has successfully met the correctness requirements.',
          optimalCode: feedbackData.optimalCode || code,
        };
        setAiFeedback(feedback);
        setShowAiFeedback(true);
        toast.success(`✅ All ${result.testResults.passedCount} tests passed! Excellent work.`);
      } else {
        // Show AI feedback inside the side panel
        const feedbackData = isStepMode
          ? (dbStep?.metadata?.aiFeedback || dbStep?.metadata || {})
          : (activeProblem?.aiFeedback || {});

        const feedback = result.aiFeedback || {
          score: feedbackData.score || 50,
          metrics: feedbackData.metrics || { complexity: 'N/A', performance: 'Failed review', style: 'Needs review' },
          suggestions: feedbackData.suggestions || ['Review test case assertions and edge cases.'],
          optimalExplanation: feedbackData.optimalExplanation || 'Examine code logic and resolve failures.',
          optimalCode: feedbackData.optimalCode || '// Review hints to solve.',
        };
        setAiFeedback(feedback);
        setShowAiFeedback(true);

        if (result.testResults) {
          toast.error(`❌ ${result.testResults.summary}`);
        } else {
          toast.error(`❌ Submission failed. Check console error outputs.`);
        }
      }
    }
  };

  // Compute Monaco language identifier
  const monacoLang = language === 'cpp' ? 'cpp' : language;

  if (loadingStep || (loadingProblems && !isStepMode)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--border-primary)', borderTop: '3px solid var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading lab environment...</p>
      </div>
    );
  }

  const effectiveLeft = leftCollapsed ? 0 : leftWidth;
  const effectiveRight = (rightCollapsed || !showAiFeedback) ? 0 : rightWidth;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: 'calc(100vh - var(--header-height) - 48px)',
        margin: '-12px',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Collapsed left tab */}
      {leftCollapsed && (
        <div style={{
          width: '28px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '12px',
          cursor: 'pointer',
          flexShrink: 0,
        }} onClick={() => setLeftCollapsed(false)} title="Expand Problem">
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '1px', fontWeight: 700, textTransform: 'uppercase' }}>Problem</span>
          <span style={{ marginTop: '8px', fontSize: '16px' }}>›</span>
        </div>
      )}
      {/* Left Pane: Problem Description */}
      {!leftCollapsed && (
        <div className="card" style={{
          width: `${leftWidth}px`,
          minWidth: `${leftWidth}px`,
          maxWidth: `${leftWidth}px`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          padding: 0,
          flexShrink: 0,
          transition: 'width 0.05s',
        }}>
          {/* Left panel header with collapse button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Problem</span>
            <button onClick={() => setLeftCollapsed(true)} title="Collapse panel" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '16px', padding: '0 4px', lineHeight: 1, display: 'flex', alignItems: 'center' }}>‹</button>
          </div>
          {/* Step mode: show step details from DB */}

          {isStepMode && dbStep ? (
            <div style={{ padding: '20px' }}>
              <span className="badge badge-primary" style={{ marginBottom: '8px', display: 'inline-block' }}>
                💻 LESSON LAB
              </span>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: '0 0 8px 0' }}>
                {dbStep.title}
              </h2>
              {dbStep.labInstructions && (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {dbStep.labInstructions}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Problem selector dropdown */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, pointerEvents: 'none', fontSize: '0.85rem' }}>📚</span>
                  <select
                    className="input select"
                    value={selectedProblemId}
                    onChange={(e) => setSelectedProblemId(e.target.value)}
                    style={{
                      paddingLeft: '2.5rem',
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e5e5',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: 'var(--font-size-sm)',
                      height: '42px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {problems.map((problem) => (
                      <option
                        key={problem.id || problem.slug}
                        value={problem.slug || problem.id}
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      >
                        {problem.title} ({problem.difficulty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scrollable problem content */}
              {activeProblem && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 28px' }}>
                  {/* Problem number + title */}
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {activeProblem.sortOrder}. {activeProblem.title}
                  </h2>

                  {/* Difficulty badge + topic tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                      background: activeProblem.difficulty === 'easy'
                        ? 'rgba(0, 175, 155, 0.12)'
                        : activeProblem.difficulty === 'medium'
                          ? 'rgba(255, 176, 46, 0.12)'
                          : 'rgba(255, 55, 95, 0.12)',
                      color: activeProblem.difficulty === 'easy'
                        ? '#00af9b'
                        : activeProblem.difficulty === 'medium'
                          ? '#ffb02e'
                          : '#ff375f',
                    }}>
                      {activeProblem.difficulty === 'easy' ? 'Easy' : activeProblem.difficulty === 'medium' ? 'Medium' : 'Hard'}
                    </span>

                    <span style={{ color: 'var(--border-secondary)', fontSize: '14px', userSelect: 'none' }}>|</span>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}>
                      Topics
                    </span>

                    {(activeProblem.tags as string[] || []).map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)',
                          cursor: 'default',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.75,
                    whiteSpace: 'pre-wrap',
                    marginBottom: '24px',
                  }}>
                    {activeProblem.description}
                  </div>

                  {/* Horizontal separator */}
                  <div style={{ height: '1px', background: 'var(--border-primary)', marginBottom: '20px' }} />

                  {/* Examples */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                    {(activeProblem.examples as any[] || []).map((example: any, index: number) => (
                      <div key={index}>
                        <div style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                        }}>
                          Example {index + 1}:
                        </div>
                        <div style={{
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 16px',
                          borderLeft: '3px solid var(--border-secondary)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', flexShrink: 0 }}>Input:</span>
                            <code style={{
                              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                              fontSize: '12.5px',
                              color: 'var(--text-primary)',
                              wordBreak: 'break-all',
                            }}>
                              {example.input}
                            </code>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', flexShrink: 0 }}>Output:</span>
                            <code style={{
                              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                              fontSize: '12.5px',
                              color: 'var(--text-primary)',
                              wordBreak: 'break-all',
                            }}>
                              {example.output}
                            </code>
                          </div>
                          {example.explanation && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', flexShrink: 0 }}>Explanation:</span>
                              <span style={{
                                fontSize: '13px',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.5,
                              }}>
                                {example.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  {(activeProblem.constraints as string[] || []).length > 0 && (
                    <div>
                      <div style={{ height: '1px', background: 'var(--border-primary)', marginBottom: '20px' }} />
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '10px',
                      }}>
                        Constraints:
                      </div>
                      <ul style={{
                        listStyle: 'disc',
                        paddingLeft: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}>
                        {(activeProblem.constraints as string[]).map((constraint: string, idx: number) => (
                          <li key={idx} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <code style={{
                              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                              fontSize: '12px',
                              color: 'var(--text-primary)',
                              background: 'var(--bg-tertiary)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-primary)',
                            }}>
                              {constraint}
                            </code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )} {/* end left panel */}

      {/* Left drag handle */}
      {!leftCollapsed && (
        <div
          onMouseDown={startDrag('left')}
          style={{
            width: '5px',
            background: 'transparent',
            cursor: 'col-resize',
            flexShrink: 0,
            position: 'relative',
            zIndex: 10,
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-primary)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        />
      )}

      {/* Middle Pane: Monaco Editor + Output */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: 0, overflow: 'hidden', minWidth: 0 }}>
        {/* Editor Toolbar */}
        <div className="card" style={{ flex: outputCollapsed ? '1' : '1 1 60%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 16px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                className="input select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{ width: '150px', padding: '4px 8px' }}
                disabled={isStepMode}
              >
                {[
                  { value: 'javascript', label: 'JavaScript' },
                  { value: 'python', label: 'Python' },
                  { value: 'cpp', label: 'C++' },
                  { value: 'java', label: 'Java' },
                ].map(lang => {
                  const tests = activeProblem?.testCode as Record<string, string> | undefined;
                  const isSupported = isStepMode || !!(tests && tests[lang.value] && tests[lang.value].trim() !== '');
                  if (!isSupported) return null;
                  return (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  );
                })}
              </select>
              {isStepMode && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', background: 'var(--bg-glass)', padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border-primary)' }}>
                  📖 Lesson Lab
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="sm" onClick={handleRun} disabled={isRunning || isSubmitting}>
                {isRunning ? '⏳ Running...' : '▶ Run Code'}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                {isSubmitting ? '⏳ Submitting...' : '🚀 Submit'}
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={monacoLang}
              value={code}
              onChange={(val) => setCode(val ?? '')}
              theme="light"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                suggest: { showKeywords: true },
                quickSuggestions: true,
              }}
            />
          </div>
        </div>

        {/* Output / Console Output Pane */}
        {!outputCollapsed && (
          <div className="card" style={{ flex: '0 1 38%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)', padding: '0 8px' }}>
              <button
                style={{

                  padding: '10px 16px', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                  color: 'var(--accent-primary-hover)',
                  borderBottom: '2px solid var(--accent-primary)',
                  cursor: 'default', background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                📟 Console Output
              </button>
              <button onClick={() => setOutputCollapsed(true)} title="Collapse console" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '14px', padding: '4px 8px', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px' }}>▼</span> Hide
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-tertiary)', padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Output log area */}
                <div style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  minHeight: '80px'
                }}>
                  {isRunning ? (
                    <div style={{ color: 'var(--text-secondary)' }}>Running...</div>
                  ) : execOutput ? (
                    <>
                      {execOutput.stdout && (
                        <div style={{ color: 'var(--text-primary)' }}>
                          {execOutput.stdout}
                        </div>
                      )}
                      {execOutput.stderr && (
                        <div style={{ color: 'var(--error)', marginTop: execOutput.stdout ? '12px' : '0' }}>
                          {execOutput.stderr}
                        </div>
                      )}
                      {!execOutput.stdout && !execOutput.stderr && (
                        <div style={{ color: 'var(--text-muted)' }}>
                          [Process finished with exit code {execOutput.exitCode}]
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Click "Run Code" to see console output here.
                    </div>
                  )}
                </div>

                {/* LeetCode style Test Cases list */}
                {activeExamples.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📋 Test Cases
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {activeExamples.map((_: any, idx: number) => {
                        const tcResult = execOutput?.testCases?.find(tc => tc.index === idx);
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedCaseIdx(idx)}
                            style={{
                              padding: '6px 14px',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 600,
                              borderRadius: 'var(--radius-sm)',
                              border: `1px solid ${selectedCaseIdx === idx ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                              background: selectedCaseIdx === idx ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                              color: selectedCaseIdx === idx ? '#ffffff' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>Case {idx + 1}</span>
                            {tcResult && (
                              <span style={{ fontSize: '10px', lineHeight: 1 }}>
                                {tcResult.passed ? '🟢' : '🔴'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {activeExamples[selectedCaseIdx] && (
                      <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-primary)',
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        {/* Status Check Badge */}
                        {execOutput?.testCases && execOutput.testCases.find(tc => tc.index === selectedCaseIdx) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Result</div>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? 'var(--success-bg)' : 'var(--error-bg)',
                              color: execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? 'var(--success)' : 'var(--error)',
                              border: `1px solid ${execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                            }}>
                              {execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? '✅ Passed' : '❌ Failed'}
                            </span>
                          </div>
                        )}

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Input</div>
                          <div style={{ color: 'var(--text-primary)', padding: '6px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                            {activeExamples[selectedCaseIdx].input}
                          </div>
                        </div>

                        {/* Actual Output (only show if code ran and gave output) */}
                        {execOutput?.testCases && execOutput.testCases.find(tc => tc.index === selectedCaseIdx) && (
                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Actual Output</div>
                            <div style={{
                              color: execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.passed ? 'var(--text-primary)' : 'var(--error)',
                              padding: '6px 8px',
                              background: 'var(--bg-tertiary)',
                              borderRadius: '4px',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {execOutput.testCases.find(tc => tc.index === selectedCaseIdx)?.actual}
                            </div>
                          </div>
                        )}

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Expected Output</div>
                          <div style={{ color: 'var(--text-primary)', padding: '6px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                            {activeExamples[selectedCaseIdx].output}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )} {/* end output pane */}

        {/* Collapsed console bar */}
        {outputCollapsed && (
          <div onClick={() => setOutputCollapsed(false)} style={{
            height: '32px',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            cursor: 'pointer',
            gap: '8px',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '10px' }}>▲</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Show Console Output</span>
          </div>
        )}
      </div> {/* end middle pane */}

      {/* Right drag handle */}
      {showAiFeedback && aiFeedback && !rightCollapsed && (
        <div
          onMouseDown={startDrag('right')}
          style={{
            width: '5px',
            background: 'transparent',
            cursor: 'col-resize',
            flexShrink: 0,
            position: 'relative',
            zIndex: 10,
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-primary)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        />
      )}

      {/* Collapsed right tab */}
      {showAiFeedback && aiFeedback && rightCollapsed && (
        <div style={{
          width: '28px',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '12px',
          cursor: 'pointer',
          flexShrink: 0,
        }} onClick={() => setRightCollapsed(false)} title="Expand AI Review">
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', writingMode: 'vertical-rl', letterSpacing: '1px', fontWeight: 700, textTransform: 'uppercase' }}>AI Review</span>
          <span style={{ marginTop: '8px', fontSize: '16px' }}>‹</span>
        </div>
      )}

      {/* Right Pane: AI Review */}
      {showAiFeedback && aiFeedback && !rightCollapsed && (
        <div className="card" style={{
          width: `${rightWidth}px`,
          minWidth: `${rightWidth}px`,
          maxWidth: `${rightWidth}px`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          borderRight: 'none',
          flexShrink: 0,

          animation: 'slideInLeft 0.3s ease',
          padding: '24px',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-primary)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <span>🤖</span> AI Review
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button onClick={() => setRightCollapsed(true)} title="Collapse panel" style={{ background: 'transparent', color: 'var(--text-tertiary)', fontSize: '1rem', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px' }}>›</button>
              <button onClick={() => setShowAiFeedback(false)} style={{ background: 'transparent', color: 'var(--text-tertiary)', fontSize: '1.25rem', border: 'none', cursor: 'pointer', padding: '4px' }}>×</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Test Results Banner */}
            {execOutput?.testResults && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: execOutput.testResults.passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${execOutput.testResults.passed ? 'var(--success)' : 'var(--danger)'}`,
              }}>
                <span style={{ fontSize: '1.5rem' }}>{execOutput.testResults.passed ? '✅' : '❌'}</span>
                <div>
                  <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: execOutput.testResults.passed ? 'var(--success)' : 'var(--danger)' }}>
                    {execOutput.testResults.passed ? 'Accepted' : 'Wrong Answer'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                    {execOutput.testResults.summary}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Stats */}
            {execOutput && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                background: 'var(--bg-tertiary)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)'
              }}>
                {[
                  { label: 'Runtime', value: `${execOutput.timeMs}ms` },
                  { label: 'Memory', value: execOutput.memory ? `${(execOutput.memory / 1024).toFixed(0)} KB` : 'N/A' },
                  { label: 'CPU Time', value: execOutput.cpuTime != null ? `${execOutput.cpuTime}ms` : 'N/A' },
                  { label: 'Exit Code', value: String(execOutput.exitCode) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* What you did well (positives from live AI) */}

            {aiFeedback.positives && aiFeedback.positives.length > 0 && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.06)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ What You Got Right</div>
                {aiFeedback.positives.map((p: string, idx: number) => (
                  <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#22c55e' }}>✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Hints to Solve */}
            {aiFeedback.suggestions && aiFeedback.suggestions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hints to Solve</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {aiFeedback.suggestions.map((suggestion: string, idx: number) => (
                    <div key={idx} style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        minWidth: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 700,
                        marginTop: '1px'
                      }}>{idx + 1}</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      )}
    </div>
  );
}

export default function CodingLab() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--border-primary)', borderTop: '3px solid var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Initializing editor...</p>
      </div>
    }>
      <CodingLabInner />
    </Suspense>
  );
}

