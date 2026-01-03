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
    const { paragraph, fullPassage, passageTitle } = body;

    // Validate required inputs
    if (!paragraph || typeof paragraph !== "string") {
      return NextResponse.json(
        { error: "Invalid paragraph provided" },
        { status: 400 }
      );
    }

    // Sanitize inputs (trim whitespace, limit length)
    const sanitizedParagraph = paragraph.trim().slice(0, 5000);
    const sanitizedPassage = fullPassage?.trim().slice(0, 10000);
    const sanitizedTitle = passageTitle?.trim().slice(0, 200);

    // Check for API key configuration
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Generate question using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert educator creating reading comprehension questions for children.

Your task is to generate ONE high-quality comprehension question based on a specific section of a passage.

Guidelines:
- Focus on understanding and inference, NOT simple factual recall
- Ask questions that require thinking about meaning, implications, or connections
- Questions should test genuine comprehension, not memory
- Keep questions clear and appropriate for children
- The question should be answerable in 1-2 sentences
- Do NOT ask "What does X mean?" or "Define Y"
- DO ask about main ideas, author's purpose, cause and effect, comparisons, or inference

Return ONLY the question text, nothing else.`,
        },
        {
          role: "user",
          content: `Full Passage Title: ${sanitizedTitle || "Reading Passage"}

Full Passage Context:
${sanitizedPassage || sanitizedParagraph}

Current Section:
${sanitizedParagraph}

Generate ONE comprehension question for this specific section that tests understanding or inference.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const question = completion.choices[0]?.message?.content?.trim();

    if (!question) {
      throw new Error("Failed to generate question");
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error generating question:", error);

    // Handle JSON parsing errors
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
        { error: "Failed to generate question. Please try again." },
        { status: error.status || 500 }
      );
    }

    // Generic error fallback
    return NextResponse.json(
      { error: "Failed to generate question. Please try again." },
      { status: 500 }
    );
  }
}
