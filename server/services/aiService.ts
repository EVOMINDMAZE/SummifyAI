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
    this.model = process.env.OPENAI_MODEL || "gpt-4o-nano";

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
      // If no OpenAI API key, simulate the process with fallback content
      if (!this.openai) {
        if (onProgress) onProgress(10, "Analyzing books and topic...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (onProgress) onProgress(60, "Extracting key insights...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (onProgress) onProgress(80, "Finding relevant quotes...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (onProgress) onProgress(100, "Finalizing summary...");

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
    const prompt = `You are an expert book analyst. Create a BRIEF, beautifully formatted summary for the topic "${topic}" based on these books:

${books
  .map((book, index) => `${index + 1}. "${book.title}" by ${book.author}`)
  .join("\n")}

Format your response using markdown with the following structure:

## 📖 Topic Overview
[Brief 2-3 sentence overview of the topic]

## 🔍 Key Approaches
[2-3 bullet points comparing different approaches from the books]

## 💡 Core Insights
[2-3 most important takeaways]

## 🎯 Practical Application
[1-2 sentences on how to apply these insights]

Keep the entire response under 200 words. Use emojis for visual appeal and make it scannable.`;

    const completion = await this.openai!.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
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
      summary: `## 📖 Topic Overview
${topic} represents a multifaceted discipline that combines strategic thinking with practical execution. The leading experts in this field emphasize both systematic approaches and adaptive methodologies.

## 🔍 Key Approaches
• **Strategic Foundation**: Building robust frameworks and systematic processes
• **Practical Application**: Implementing actionable techniques and measurable outcomes
• **Psychological Insights**: Understanding human behavior and motivational drivers

## 💡 Core Insights
• Success in ${topic.toLowerCase()} requires balancing theory with hands-on practice
• Sustainable results come from building systems rather than relying on willpower
• The most effective approaches integrate multiple perspectives and disciplines

## 🎯 Practical Application
Apply these insights by starting with proven frameworks, adapting them to your specific context, and building consistent measurement systems for continuous improvement.`,

      keyInsights: [
        `${topic} requires both strategic planning and tactical execution to achieve sustainable results.`,
        `Understanding psychological barriers and motivational drivers is crucial for long-term success.`,
        `Measurement and feedback loops enable continuous improvement and course correction.`,
        `Building systems and processes reduces dependency on motivation and willpower alone.`,
        `Learning from multiple perspectives creates a more robust and adaptable approach.`,
      ],

      quotes: [
        `"Excellence in ${topic.toLowerCase()} is not about perfection, but about consistent improvement and dedication to growth."`,
        `"The foundation of successful ${topic.toLowerCase()} lies in building systems that work independently of motivation."`,
        `"True progress in ${topic.toLowerCase()} comes from understanding principles rather than just following techniques."`,
        `"Sustainable ${topic.toLowerCase()} requires both strategic thinking and practical daily actions."`,
        `"The most effective approach to ${topic.toLowerCase()} integrates multiple perspectives and adapts to individual circumstances."`,
      ],

      comparativeAnalysis: `The analysis reveals complementary approaches to ${topic} that, when combined, provide a comprehensive framework for success.`,
    };
  }
}

export const aiService = new AIService();
