import OpenAI from "openai";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  categories?: string[];
}

interface GeneratedSummary {
  summary: string;
  keyInsights: string[];
  quotes: string[];
  comparativeAnalysis: string;
}

export class AIService {
  private openai: OpenAI | null = null;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || "gpt-4";

    console.log(
      "OpenAI API Key status:",
      apiKey ? `Found (${apiKey.substring(0, 10)}...)` : "Missing",
    );

    if (
      !apiKey ||
      apiKey === "sk-demo-key-replace-with-real-key" ||
      apiKey === ""
    ) {
      console.warn(
        "OpenAI API key not configured. AI generation will use fallback content.",
      );
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  async generateSummary(
    topic: string,
    books: Book[],
    onProgress?: (progress: number, operation: string) => void,
  ): Promise<GeneratedSummary> {
    try {
      // If no OpenAI API key, return fallback content
      if (!this.openai) {
        return this.getFallbackSummary(topic, books);
      }

      if (onProgress) onProgress(10, "Analyzing books and topic...");

      // Generate comprehensive summary using OpenAI
      const summary = await this.generateComparativeSummary(topic, books);

      if (onProgress) onProgress(60, "Extracting key insights...");

      // Generate key insights
      const keyInsights = await this.generateKeyInsights(topic, books);

      if (onProgress) onProgress(80, "Finding relevant quotes...");

      // Generate relevant quotes
      const quotes = await this.generateQuotes(topic, books);

      if (onProgress) onProgress(100, "Finalizing summary...");

      return {
        summary,
        keyInsights,
        quotes,
        comparativeAnalysis: summary,
      };
    } catch (error) {
      console.error("Error generating AI summary:", error);
      return this.getFallbackSummary(topic, books);
    }
  }

  private async generateComparativeSummary(
    topic: string,
    books: Book[],
  ): Promise<string> {
    const prompt = `You are an expert book analyst and summarizer. Create a comprehensive comparative analysis for the topic "${topic}" based on these ${books.length} books:

${books
  .map(
    (book, index) =>
      `${index + 1}. "${book.title}" by ${book.author}\n   Description: ${book.description}`,
  )
  .join("\n\n")}

Please provide a detailed comparative analysis that:
1. Synthesizes the key concepts from all books related to "${topic}"
2. Identifies common themes and contrasting viewpoints
3. Shows how different authors approach the topic
4. Provides actionable insights that readers can apply
5. Maintains an academic yet accessible tone

Format the response as a well-structured analysis with clear paragraphs. Aim for 300-500 words.`;

    const completion = await this.openai!.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content ||
      this.getFallbackSummary(topic, books).summary
    );
  }

  private async generateKeyInsights(
    topic: string,
    books: Book[],
  ): Promise<string[]> {
    const prompt = `Based on the topic "${topic}" and these books:

${books
  .map((book, index) => `${index + 1}. "${book.title}" by ${book.author}`)
  .join("\n")}

Generate exactly 5 key insights that synthesize the most important takeaways. Each insight should be:
- Actionable and practical
- Backed by the collective wisdom of these books
- Relevant to someone interested in "${topic}"
- 1-2 sentences long

Format as a numbered list:
1. [First insight]
2. [Second insight]
3. [Third insight]
4. [Fourth insight]  
5. [Fifth insight]`;

    const completion = await this.openai!.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const insights = this.parseInsights(content);

    return insights.length >= 5
      ? insights.slice(0, 5)
      : this.getFallbackSummary(topic, books).keyInsights;
  }

  private async generateQuotes(
    topic: string,
    books: Book[],
  ): Promise<string[]> {
    const prompt = `Generate 3-5 inspirational and insightful quotes that would be relevant to someone studying "${topic}". These should be in the style of the authors:

${books
  .map((book, index) => `${index + 1}. "${book.title}" by ${book.author}`)
  .join("\n")}

Each quote should:
- Be profound and thought-provoking
- Relate to the topic of "${topic}"
- Sound authentic to the respective author's style
- Be practical wisdom that readers can apply

Format exactly as:
"Quote text here." - Author Name

Provide 3-5 quotes total.`;

    const completion = await this.openai!.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content || "";
    const quotes = this.parseQuotes(content);

    return quotes.length >= 3
      ? quotes
      : this.getFallbackSummary(topic, books).quotes;
  }

  private parseInsights(content: string): string[] {
    const lines = content
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\./));
    return lines.map((line) => line.replace(/^\d+\.\s*/, "").trim());
  }

  private parseQuotes(content: string): string[] {
    const quoteRegex = /"([^"]+)"\s*-\s*(.+)/g;
    const quotes: string[] = [];
    let match;

    while ((match = quoteRegex.exec(content)) !== null) {
      quotes.push(`"${match[1]}" - ${match[2]}`);
    }

    return quotes;
  }

  private getFallbackSummary(topic: string, books: Book[]): GeneratedSummary {
    return {
      summary: `**Comparative Analysis: ${topic}**

The concept of ${topic} emerges as a central theme across multiple thought-leadership works, each offering unique perspectives while building upon common foundational principles. ${books[0]?.author || "Leading authors"} emphasizes the importance of systematic approaches and evidence-based strategies, while ${books[1]?.author || "other experts"} focus on the psychological and behavioral aspects that drive sustainable change.

Through comparative analysis of these influential works, several key patterns emerge. First, successful ${topic.toLowerCase()} requires a combination of strategic thinking and practical implementation. Second, the human element - understanding motivation, resistance, and change psychology - proves crucial across all approaches. Third, measurement and continuous improvement form the backbone of any effective ${topic.toLowerCase()} initiative.

The synthesis of these perspectives suggests that ${topic.toLowerCase()} is not merely a set of techniques, but a comprehensive approach that integrates multiple disciplines. By understanding how different experts approach similar challenges, readers can develop a more nuanced and effective personal methodology for achieving their goals in this area.`,

      keyInsights: [
        `${topic} requires both strategic planning and tactical execution to achieve sustainable results.`,
        `Understanding psychological barriers and motivational drivers is crucial for long-term success.`,
        `Measurement and feedback loops enable continuous improvement and course correction.`,
        `Building systems and processes reduces dependency on motivation and willpower alone.`,
        `Learning from multiple perspectives creates a more robust and adaptable approach.`,
      ],

      quotes: [
        `"Excellence is not a skill, it's an attitude toward ${topic.toLowerCase()} and continuous improvement." - Inspired by ${books[0]?.author || "Great Thinkers"}`,
        `"The journey of ${topic.toLowerCase()} begins with a single step, but requires consistent daily actions to reach the destination." - Inspired by ${books[1]?.author || "Wise Leaders"}`,
        `"True mastery in ${topic.toLowerCase()} comes not from perfection, but from the willingness to learn and adapt continuously." - Inspired by ${books[2]?.author || "Expert Practitioners"}`,
      ],

      comparativeAnalysis: `The analysis reveals complementary approaches to ${topic} that, when combined, provide a comprehensive framework for success.`,
    };
  }
}

export const aiService = new AIService();
