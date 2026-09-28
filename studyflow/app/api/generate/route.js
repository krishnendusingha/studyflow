import { GoogleGenerativeAI } from "@google/generative-ai";

// Using gemini-3.1-flash-lite — fastest, cheapest model, ideal for structured
// study note generation. ~$0.01 per 1M tokens vs $1.25+ for Pro models.
const MODEL_ID = "gemini-3.1-flash-lite";

export async function POST(request) {
  try {
    const { topic, description } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Server is not configured. Please contact the site owner." },
        { status: 500 }
      );
    }

    if (!topic || !description) {
      return Response.json(
        { error: "Both topic and description are required." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelInstance = genAI.getGenerativeModel({ model: MODEL_ID });

    const prompt = `You are an expert educator and study assistant. A student needs help understanding a topic. Analyze the topic and description below, then produce TWO things:

1. **KEY POINTS**: Extract the most important concepts, facts, and ideas that a student MUST understand. Each key point should have:
   - A short bold title (3-6 words)
   - A clear 1-2 sentence explanation in simple language

2. **FLOWCHART**: Create a Mermaid.js flowchart diagram that visually shows how the concepts connect, the process flow, or the logical structure of the topic. Use the 'graph TD' (top-down) syntax. Keep node labels short (under 30 chars). Use descriptive edge labels where helpful.

TOPIC: ${topic}

DESCRIPTION: ${description}

RESPOND IN THIS EXACT JSON FORMAT (no markdown code fences, just raw JSON):
{
  "summary": "A 2-3 sentence overview of the topic in simple terms.",
  "keyPoints": [
    {
      "title": "Short Title Here",
      "description": "Clear explanation in simple language."
    }
  ],
  "flowchart": "graph TD\\n    A[Start] --> B[Step 1]\\n    B --> C[Step 2]\\n    C --> D[End]"
}

RULES:
- Produce 5-10 key points depending on the complexity of the topic.
- The flowchart MUST be valid Mermaid.js syntax using 'graph TD'.
- Use square brackets [] for regular nodes, rounded brackets () for decisions/processes, and curly braces {} for conditions where appropriate.
- Keep flowchart node text short and readable.
- Make explanations student-friendly — avoid jargon unless defining it.
- The JSON must be parseable — escape special characters properly.
- Do NOT wrap the response in markdown code fences.`;

    // Retry logic for temporary 503 errors (model overload)
    let result;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        result = await modelInstance.generateContent(prompt);
        break;
      } catch (retryErr) {
        const errMsg = retryErr.message || "";
        const isRetryable =
          retryErr.status === 503 ||
          errMsg.includes("503") ||
          errMsg.includes("Service Unavailable") ||
          errMsg.includes("overloaded") ||
          errMsg.includes("high demand");
        if (isRetryable && attempt < 4) {
          await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        throw retryErr;
      }
    }

    const responseText = result.response.text();

    // Parse the JSON response
    let parsed;
    try {
      const cleanedText = responseText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(cleanedText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return Response.json(
            { error: "Failed to parse AI response. Please try again." },
            { status: 500 }
          );
        }
      } else {
        return Response.json(
          { error: "Failed to parse AI response. Please try again." },
          { status: 500 }
        );
      }
    }

    if (!parsed.keyPoints || !Array.isArray(parsed.keyPoints)) {
      return Response.json(
        { error: "Invalid AI response structure. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({
      summary: parsed.summary || "",
      keyPoints: parsed.keyPoints,
      flowchart: parsed.flowchart || "",
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      {
        error:
          error.message || "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
