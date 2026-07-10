export interface LogicalError {
  line: string;
  issue: string;
  explanation: string;
  hint: string;
  guidingQuestion: string;
}

export interface Inefficiency {
  area: string;
  reason: string;
  hint: string;
}

export interface NextStep {
  step: string;
  concept: string;
  hint: string;
}

export interface BuggyCodeAnalysis {
  codeIntent: string;
  syntaxErrors: string[];
  logicalErrors: LogicalError[];
  inefficiencies: Inefficiency[];
  positives: string[];
  nextSteps: NextStep[];
  primaryHint: string;
  secondaryHint: string;
  educationalTips: string;
}

/**
 * Helper to query the Groq API using standard fetch (no external openai package required).
 */
async function queryGroq(messages: { role: string; content: string }[], responseFormat?: { type: string }, temperature = 0.2): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined. Please configure it in your env.");
  }
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: responseFormat,
      temperature,
      max_tokens: responseFormat ? 2000 : 1000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * Analyzes buggy code submitted by a student.
 */
export async function analyzeBuggyCode(
  code: string,
  language: string,
  challengeTitle = 'Coding Challenge'
): Promise<BuggyCodeAnalysis> {
  const systemPrompt = `You are an expert code analysis tutor. Your role is to help students learn by:
1. READING their code and understanding what they're trying to do
2. IDENTIFYING any logical errors, syntax issues, or inefficiencies
3. EXPLAINING what's wrong WITHOUT giving the complete solution
4. PROVIDING HINTS that guide them toward the correct approach

IMPORTANT CONSTRAINTS:
- Keep all explanations, issues, hints, and tips extremely simple, straightforward, direct, and brief.
- Avoid wordy, conversational, or redundant text. Get straight to the point.
- Never provide the direct solution or complete working code. Instead, point out the problematic section, explain why it fails, and provide a clear hint/guiding question.

You must respond in valid JSON format with the following structure:
{
  "codeIntent": "What the student is trying to accomplish",
  "syntaxErrors": ["Array of syntax issues found, if any"],
  "logicalErrors": [
    {
      "line": "Approximate line or section",
      "issue": "What's wrong",
      "explanation": "Why this is a problem",
      "hint": "Guidance without the solution",
      "guidingQuestion": "Question to make them think"
    }
  ],
  "inefficiencies": [
    {
      "area": "What's inefficient",
      "reason": "Why it's not ideal",
      "hint": "Direction to improve it"
    }
  ],
  "positives": ["What they did well"],
  "nextSteps": [
    {
      "step": "What to focus on next",
      "concept": "Related concept to review",
      "hint": "Guidance for this step"
    }
  ],
  "primaryHint": "A high-level conceptual hint pointing the student to the problematic section and explaining why it fails conceptually. Under NO circumstances should you state the direct solution, values, or code. For example, say 'Check the step parameter of your slice expression' instead of 'The slice step should be -1'.",
  "secondaryHint": "A slightly more detailed follow-up hint to guide them if they still don't understand the first hint. This should still NOT give the direct final solution, values, or code, but can provide a specific conceptual rule of thumb, relationship, or reference behavior (e.g. explain how slicing parameters index items).",
  "educationalTips": "Additional learning advice tailored to this code"
}`;

  const prompt = `Challenge: "${challengeTitle}"
Language: ${language}
Student Code:
\`\`\`${language}
${code}
\`\`\`

Remember: Do NOT provide the solution. Provide guidance, hints, and questions.`;

  try {
    const responseText = await queryGroq(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      { type: "json_object" },
      0.2
    );

    return JSON.parse(responseText) as BuggyCodeAnalysis;
  } catch (error) {
    console.error("Socratic Tutor Analysis Error (Groq):", error);
    throw error;
  }
}

/**
 * Handles Socratic chat follow-ups with the student.
 */
export async function chatWithSocraticTutor(
  studentMessage: string,
  history: { role: string; content: string }[] = [],
  code: string,
  language: string,
  initialAnalysis: BuggyCodeAnalysis
): Promise<string> {
  const chatSystemPrompt = `You are an expert code analysis tutor. You are helping a student debug their code interactively.
Guidelines:
1. Answer the student's questions about their code or your analysis.
2. Under no circumstances should you provide the complete solution or full working code.
3. Keep your advice strictly Socratic: guide the student via hints, guiding questions, and conceptual explanations.
4. Keep responses supportive, expert, and encouraging.

Student Context:
- Language: ${language}
- Buggy Code:
\`\`\`${language}
${code}
\`\`\`
- Initial Analysis Summary:
${JSON.stringify({
    codeIntent: initialAnalysis?.codeIntent,
    errorsCount: (initialAnalysis?.syntaxErrors?.length || 0) + (initialAnalysis?.logicalErrors?.length || 0),
    logicalErrorsSummary: initialAnalysis?.logicalErrors?.map(e => e.issue)
  }, null, 2)}
`;

  const messages = [
    { role: 'system', content: chatSystemPrompt }
  ];

  history.forEach(h => {
    messages.push({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    });
  });

  messages.push({ role: 'user', content: studentMessage });

  try {
    return await queryGroq(messages, undefined, 0.5);
  } catch (error) {
    console.error("Socratic Tutor Chat Error (Groq):", error);
    throw error;
  }
}
