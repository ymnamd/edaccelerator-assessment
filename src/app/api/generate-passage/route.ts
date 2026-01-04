import { NextResponse } from "next/server";
import OpenAI from "openai";
import type {
  GeneratePassageRequest,
  GeneratePassageResponse,
} from "@/types/api";
import { API_CONFIG } from "@/config/api";
import { LEARNING_THRESHOLDS, DIFFICULTY_METADATA } from "@/config/constants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GeneratePassageRequest;
    const { difficulty, referenceLength = 1000, skillStats } = body;

    if (!difficulty || !["beginner", "intermediate", "advanced"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    // Define difficulty-specific prompts using centralized metadata
    const difficultyGuidelines = {
      beginner: {
        vocabulary: "Use simple, common vocabulary suitable for ages 8-10. Avoid complex or technical terms.",
        sentences: "Use shorter sentences (10-15 words average) with simple structure.",
        concepts: "Focus on concrete, familiar concepts with straightforward explanations.",
        gradeLevel: DIFFICULTY_METADATA.beginner.readingLevel,
      },
      intermediate: {
        vocabulary: "Use age-appropriate vocabulary for ages 10-12. Include some challenging words with context clues.",
        sentences: "Use varied sentence structures with moderate complexity (15-20 words average).",
        concepts: "Include both concrete and some abstract concepts with clear explanations.",
        gradeLevel: DIFFICULTY_METADATA.intermediate.readingLevel,
      },
      advanced: {
        vocabulary: "Use advanced vocabulary suitable for ages 12-14. Include technical or domain-specific terms.",
        sentences: "Use complex sentences with varied structures (20+ words average).",
        concepts: "Explore abstract concepts, cause-and-effect relationships, and nuanced ideas.",
        gradeLevel: DIFFICULTY_METADATA.advanced.readingLevel,
      },
    };

    const guidelines = difficultyGuidelines[difficulty];
    const targetWordCount = Math.floor(referenceLength / 5); // rough word count estimate

    // Build adaptive learning guidance based on skill stats
    let adaptiveGuidance = "";
    if (skillStats) {
      const weakSkills: string[] = [];
      const untestedSkills: string[] = [];

      (Object.keys(skillStats) as Array<keyof typeof skillStats>).forEach((skill) => {
        const stats = skillStats[skill];
        if (stats.tested === 0) {
          untestedSkills.push(skill);
        } else {
          const percentage = (stats.correct / stats.tested) * 100;
          if (percentage < LEARNING_THRESHOLDS.skillWeaknessPercentage * 100) {
            weakSkills.push(skill);
          }
        }
      });

      if (weakSkills.length > 0 || untestedSkills.length > 0) {
        adaptiveGuidance = "\n\nADAPTIVE LEARNING FOCUS:\n";
        if (weakSkills.length > 0) {
          adaptiveGuidance += `- Student needs practice with: ${weakSkills.join(", ")}\n`;
        }
        if (untestedSkills.length > 0) {
          adaptiveGuidance += `- Not yet tested: ${untestedSkills.join(", ")}\n`;
        }
        adaptiveGuidance += "- Create a passage that naturally supports generating questions for these skills.";
      }
    }

    const systemPrompt = `You are an expert educational content creator specializing in creating engaging, factual reading passages for children.

Create a reading comprehension passage that meets these criteria:

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
- ${guidelines.vocabulary}
- ${guidelines.sentences}
- ${guidelines.concepts}
- Target: ${guidelines.gradeLevel}

CONTENT REQUIREMENTS:
- Topic: Choose an interesting, educational topic appropriate for children (nature, science, history, culture, etc.)
- Length: Approximately ${targetWordCount} words
- Structure: 4-6 natural paragraphs that flow logically
- Tone: Engaging, informative, and age-appropriate
- Accuracy: All facts must be accurate and educational
- Engagement: Include interesting details that spark curiosity

FORMATTING:
- Return a JSON object with exactly this structure:
  {
    "title": "Engaging Title (3-6 words)",
    "content": "Paragraph 1\\n\\nParagraph 2\\n\\nParagraph 3..."
  }
- Separate paragraphs with \\n\\n
- Do not include any markdown formatting
- Do not number the paragraphs

The passage should be factual, educational, and appropriate for comprehension question generation.${adaptiveGuidance}`;

    const completion = await openai.chat.completions.create({
      model: API_CONFIG.openai.model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Generate a ${difficulty} reading comprehension passage.`,
        },
      ],
      temperature: 0.8, // Higher creativity for varied passages
      max_tokens: API_CONFIG.openai.maxTokens.passage,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No content received from OpenAI");
    }

    const parsedResponse = JSON.parse(responseContent);

    if (!parsedResponse.title || !parsedResponse.content) {
      throw new Error("Invalid response format from OpenAI");
    }

    const response: GeneratePassageResponse = {
      title: parsedResponse.title.trim(),
      content: parsedResponse.content.trim(),
      difficulty,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating passage:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate passage. Please try again.",
      },
      { status: 500 }
    );
  }
}
