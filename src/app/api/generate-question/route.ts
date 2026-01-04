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
    const { paragraph, fullPassage, passageTitle, prioritizeSkills } = body;

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

    // Build adaptive learning guidance
    let skillGuidance = "";
    if (prioritizeSkills && prioritizeSkills.length > 0) {
      skillGuidance = `\n\nADAPTIVE LEARNING: The student needs practice with these skills: ${prioritizeSkills.join(", ")}. Strongly prefer generating a question for one of these skills if the content allows.`;
    }

    // Generate question using OpenAI with skill classification
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert educator creating reading comprehension questions for children.

Your task is to generate ONE high-quality comprehension question based on a specific section of a passage.

Skill Categories:
1. Understanding - Questions about main ideas, vocabulary in context, literal comprehension
2. Reasoning - Questions about inference, cause and effect, author's purpose, comparisons
3. Application - Questions about applying concepts, making predictions, connecting to real world

Guidelines:
- Focus on understanding and inference, NOT simple factual recall
- Ask questions that require thinking about meaning, implications, or connections
- Questions should test genuine comprehension, not memory
- Keep questions clear and appropriate for children
- The question should be answerable in 1-2 sentences
- Vary the skill type to ensure balanced assessment${skillGuidance}

Return a JSON object with:
{
  "question": "the question text",
  "skill": "Understanding" | "Reasoning" | "Application"
}`,
        },
        {
          role: "user",
          content: `Full Passage Title: ${sanitizedTitle || "Reading Passage"}

Full Passage Context:
${sanitizedPassage || sanitizedParagraph}

Current Section:
${sanitizedParagraph}

Generate ONE comprehension question for this specific section that tests understanding, reasoning, or application.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error("Failed to generate question");
    }

    // Parse the JSON response
    const parsed = JSON.parse(responseText);
    const question = parsed.question;
    const skill = parsed.skill as "Understanding" | "Reasoning" | "Application";

    // Map skill to soft prompt
    const softPromptMap = {
      Understanding: "Reflect",
      Reasoning: "Think Deeper",
      Application: "Apply What You've Read",
    };

    const softPrompt = softPromptMap[skill];

    if (!question || !skill) {
      throw new Error("Invalid question format");
    }

    return NextResponse.json({ question, skill, softPrompt });
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
