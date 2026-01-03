import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client (SERVER-SIDE ONLY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { question, answer, paragraph, fullPassage } = body;

    // Validate required inputs
    if (!question || !answer || !paragraph) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate input types
    if (
      typeof question !== "string" ||
      typeof answer !== "string" ||
      typeof paragraph !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid input types" },
        { status: 400 }
      );
    }

    // Sanitize inputs (trim whitespace, limit length)
    const sanitizedQuestion = question.trim().slice(0, 500);
    const sanitizedAnswer = answer.trim().slice(0, 2000);
    const sanitizedParagraph = paragraph.trim().slice(0, 5000);
    const sanitizedPassage = fullPassage?.trim().slice(0, 10000);

    // Check for API key configuration
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Evaluate answer using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert educator evaluating reading comprehension answers from children.

Your task is to determine if the student's answer demonstrates genuine understanding of the text.

Guidelines:
- Focus on whether they understood the main idea or concept, not exact wording
- Accept answers that are correct even if phrased differently
- Be encouraging but honest
- Consider the child's perspective and age-appropriate language
- Look for evidence of comprehension, not perfect recall
- ALWAYS reference specific parts of the passage in your explanation
- Explain WHY the answer is correct or incorrect by citing the text

You must respond with a JSON object in this exact format:
{
  "correct": true or false,
  "explanation": "A brief, encouraging explanation (2-3 sentences) that references the passage"
}

Be constructive in your explanation. If incorrect, gently explain what they missed by referencing the passage. If correct, affirm their understanding by connecting it to the text.`,
        },
        {
          role: "user",
          content: `Full Passage Context:
${sanitizedPassage || sanitizedParagraph}

Specific Section:
${sanitizedParagraph}

Question Asked:
${sanitizedQuestion}

Student's Answer:
${sanitizedAnswer}

Evaluate if this answer demonstrates comprehension. Respond with JSON only.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error("Failed to evaluate answer - empty response");
    }

    // Parse and validate AI response
    let evaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      throw new Error("Invalid AI response format");
    }

    // Validate response structure
    if (
      typeof evaluation.correct !== "boolean" ||
      typeof evaluation.explanation !== "string"
    ) {
      console.error("Invalid evaluation structure:", evaluation);
      throw new Error("Invalid evaluation format");
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error evaluating answer:", error);

    // Handle request JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Handle specific OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API Error:", {
        status: error.status,
        message: error.message,
        type: error.type,
      });

      return NextResponse.json(
        { error: "Failed to evaluate answer. Please try again." },
        { status: error.status || 500 }
      );
    }

    // Generic error fallback
    return NextResponse.json(
      { error: "Failed to evaluate answer. Please try again." },
      { status: 500 }
    );
  }
}
