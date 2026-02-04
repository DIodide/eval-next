import "server-only";

/**
 * Gemini AI service for generating embeddings and player analysis
 */

import { GoogleGenerativeAI, type EmbedContentResponse } from "@google/generative-ai";
import { env } from "@/env";
import type {
  PlayerEmbeddingData,
  PlayerAnalysis,
  CoachContext,
} from "@/types/talent-search";

// Singleton pattern for Gemini client
let genAI: GoogleGenerativeAI | null = null;

/**
 * Get or create the Gemini AI client
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!env.GOOGLE_GEMINI_API_KEY) {
    throw new Error(
      "GOOGLE_GEMINI_API_KEY is not configured. Please add it to your environment variables.",
    );
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);
  }

  return genAI;
}

/**
 * Build a text representation of a player for embedding
 * This creates a searchable text that captures the player's key attributes
 */
export function buildPlayerEmbeddingText(player: PlayerEmbeddingData): string {
  const parts: string[] = [];

  // Basic info
  parts.push(`Player: ${player.firstName} ${player.lastName}`);
  if (player.username) {
    parts.push(`Username: ${player.username}`);
  }

  // Location
  if (player.location) {
    parts.push(`Location: ${player.location}`);
  }

  // Academic info
  if (player.school) {
    parts.push(`School: ${player.school}`);
  }
  if (player.schoolType) {
    const typeLabel =
      player.schoolType === "HIGH_SCHOOL"
        ? "High School"
        : player.schoolType === "COLLEGE"
          ? "College"
          : "University";
    parts.push(`School Type: ${typeLabel}`);
  }
  if (player.classYear) {
    parts.push(`Class Year: ${player.classYear}`);
  }
  if (player.gpa !== null && player.gpa !== undefined) {
    parts.push(`GPA: ${player.gpa}`);
  }
  if (player.intendedMajor) {
    parts.push(`Intended Major: ${player.intendedMajor}`);
  }

  // Bio
  if (player.bio) {
    parts.push(`Bio: ${player.bio}`);
  }

  // Main game
  if (player.mainGame) {
    parts.push(`Main Game: ${player.mainGame}`);
  }

  // Game profiles
  if (player.gameProfiles.length > 0) {
    const gameDetails = player.gameProfiles
      .map((profile) => {
        const details: string[] = [profile.game];
        if (profile.rank) details.push(`Rank: ${profile.rank}`);
        if (profile.role) details.push(`Role: ${profile.role}`);
        if (profile.agents.length > 0)
          details.push(`Plays: ${profile.agents.join(", ")}`);
        if (profile.playStyle) details.push(`Style: ${profile.playStyle}`);
        return details.join(", ");
      })
      .join("; ");
    parts.push(`Games: ${gameDetails}`);
  }

  return parts.join(". ");
}

/**
 * Generate embedding vector for a search query
 * Uses Gemini's text-embedding-004 model
 */
export async function generateQueryEmbedding(
  query: string,
): Promise<number[]> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: "text-embedding-004" });

  try {
    const result: EmbedContentResponse = await model.embedContent(query);
    const embedding = result.embedding;

    if (!embedding?.values || embedding.values.length === 0) {
      throw new Error("Empty embedding returned from Gemini");
    }

    return embedding.values;
  } catch (error) {
    console.error("Error generating query embedding:", error);
    throw new Error(
      `Failed to generate query embedding: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Generate embedding vector for a player profile
 * Uses Gemini's text-embedding-004 model
 */
export async function generatePlayerEmbedding(
  player: PlayerEmbeddingData,
): Promise<{ embedding: number[]; embeddingText: string }> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: "text-embedding-004" });

  const embeddingText = buildPlayerEmbeddingText(player);

  try {
    const result: EmbedContentResponse = await model.embedContent(embeddingText);
    const embedding = result.embedding;

    if (!embedding?.values || embedding.values.length === 0) {
      throw new Error("Empty embedding returned from Gemini");
    }

    return {
      embedding: embedding.values,
      embeddingText,
    };
  } catch (error) {
    console.error("Error generating player embedding:", error);
    throw new Error(
      `Failed to generate player embedding: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Generate a complete AI analysis of a player for a coach
 * Returns overview, pros, and cons
 */
export async function generateCompleteAnalysis(
  player: PlayerEmbeddingData,
  coachContext: CoachContext,
): Promise<PlayerAnalysis> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = buildAnalysisPrompt(player, coachContext);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the structured response
    return parseAnalysisResponse(text);
  } catch (error) {
    console.error("Error generating player analysis:", error);
    throw new Error(
      `Failed to generate player analysis: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Build the prompt for player analysis
 */
function buildAnalysisPrompt(
  player: PlayerEmbeddingData,
  coachContext: CoachContext,
): string {
  const playerInfo = buildPlayerEmbeddingText(player);

  let coachInfo = "a coach";
  if (coachContext.schoolName) {
    coachInfo = `a coach at ${coachContext.schoolName}`;
    if (coachContext.schoolType) {
      const typeLabel =
        coachContext.schoolType === "HIGH_SCHOOL"
          ? "high school"
          : coachContext.schoolType === "COLLEGE"
            ? "college"
            : "university";
      coachInfo += ` (${typeLabel})`;
    }
  }

  const gamesContext =
    coachContext.games.length > 0
      ? `The coach's team competes in: ${coachContext.games.join(", ")}.`
      : "";

  return `You are an esports recruiting assistant helping ${coachInfo} evaluate a potential player.
${gamesContext}

Analyze the following player profile and provide a structured assessment:

${playerInfo}

Please provide your analysis in the following JSON format (no markdown, just pure JSON):
{
  "overview": "A 2-3 sentence overview of the player highlighting their key attributes and potential fit for collegiate/scholastic esports.",
  "pros": ["strength 1", "strength 2", "strength 3"],
  "cons": ["area for improvement 1", "area for improvement 2"]
}

Focus on:
- Competitive gaming experience and achievements
- Academic standing and potential
- Game-specific skills and versatility
- Team fit and coachability indicators
- Be balanced and constructive in the cons section - frame them as growth areas rather than weaknesses

Important: Return ONLY the JSON object, no additional text or formatting.`;
}

/**
 * Parse the AI response into structured analysis
 */
function parseAnalysisResponse(text: string): PlayerAnalysis {
  try {
    // Clean up the response - remove any markdown formatting
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.slice(7);
    }
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();

    const parsed = JSON.parse(cleanText) as {
      overview?: string;
      pros?: string[];
      cons?: string[];
    };

    return {
      overview:
        parsed.overview ?? "Unable to generate overview for this player.",
      pros: parsed.pros ?? [],
      cons: parsed.cons ?? [],
      generatedAt: new Date(),
      isCached: false,
    };
  } catch (error) {
    console.error("Error parsing analysis response:", error, "Raw text:", text);
    // Return a fallback analysis if parsing fails
    return {
      overview:
        "Unable to generate detailed analysis at this time. Please try again later.",
      pros: [],
      cons: [],
      generatedAt: new Date(),
      isCached: false,
    };
  }
}

/**
 * Check if the Gemini API is configured and available
 */
export function isGeminiConfigured(): boolean {
  return !!env.GOOGLE_GEMINI_API_KEY;
}

/**
 * Format embedding array for PostgreSQL vector type
 * Converts number[] to the format expected by pgvector: '[0.1,0.2,...]'
 */
export function formatEmbeddingForPostgres(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
