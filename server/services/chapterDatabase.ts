import { ChapterMatch, Book } from "./bookSearchService";

// Comprehensive database of books with detailed chapter mappings
// This includes books that may not be primarily about a topic but contain relevant chapters
export const CHAPTER_DATABASE: Book[] = [
  // BUSINESS & LEADERSHIP BOOKS
  {
    id: "five-dysfunctions-team",
    title: "The Five Dysfunctions of a Team",
    author: "Patrick Lencioni",
    cover:
      "https://m.media-amazon.com/images/I/51rJPGr3cqL._SX327_BO1,204,203,200_.jpg",
    description:
      "A leadership fable about the fundamental causes of organizational politics and team failure.",
    amazonLink: "https://amazon.com/dp/0787960756",
    rating: 4.6,
    categories: ["Leadership", "Team Building"],
    relevantChapters: [
      {
        chapter: "Chapter 1",
        title: "Absence of Trust",
        pages: "15-32",
        relevance: "Foundation of team building, creating psychological safety",
        relevanceScore: 98,
        keyTopics: [
          "team building",
          "trust",
          "psychological safety",
          "team dynamics",
          "vulnerability",
        ],
        why: "Essential foundation for building effective teams through trust and vulnerability",
      },
      {
        chapter: "Chapter 2",
        title: "Fear of Conflict",
        pages: "33-52",
        relevance:
          "Healthy conflict management, productive disagreement in teams",
        relevanceScore: 96,
        keyTopics: [
          "team building",
          "conflict resolution",
          "healthy debate",
          "team communication",
          "productive conflict",
        ],
        why: "Framework for enabling productive conflict and debate within teams",
      },
      {
        chapter: "Chapter 3",
        title: "Lack of Commitment",
        pages: "53-72",
        relevance: "Team alignment, collective decision making, buy-in",
        relevanceScore: 94,
        keyTopics: [
          "team building",
          "commitment",
          "team alignment",
          "decision making",
          "buy-in",
        ],
        why: "Creating genuine commitment and alignment within team decisions",
      },
      {
        chapter: "Chapter 4",
        title: "Avoidance of Accountability",
        pages: "73-92",
        relevance: "Peer-to-peer accountability, team performance standards",
        relevanceScore: 92,
        keyTopics: [
          "team building",
          "accountability",
          "peer feedback",
          "performance standards",
          "team responsibility",
        ],
        why: "Building systems for mutual accountability and high performance standards",
      },
      {
        chapter: "Chapter 5",
        title: "Inattention to Results",
        pages: "93-110",
        relevance: "Team focus on collective outcomes, shared goals",
        relevanceScore: 90,
        keyTopics: [
          "team building",
          "results orientation",
          "collective goals",
          "team performance",
          "shared outcomes",
        ],
        why: "Focusing teams on collective results rather than individual agendas",
      },
    ],
  },
  {
    id: "good-to-great",
    title: "Good to Great",
    author: "Jim Collins",
    cover:
      "https://m.media-amazon.com/images/I/51-vOqJOVXL._SX334_BO1,204,203,200_.jpg",
    description:
      "Research-based analysis of companies that made the leap from good to great performance.",
    amazonLink: "https://amazon.com/dp/0066620996",
    rating: 4.5,
    categories: ["Business", "Leadership"],
    relevantChapters: [
      {
        chapter: "Chapter 3",
        title: "First Who... Then What",
        pages: "41-64",
        relevance: "Team building, hiring practices, organizational structure",
        relevanceScore: 95,
        keyTopics: [
          "leadership",
          "team building",
          "hiring",
          "management",
          "organizational culture",
        ],
        why: "Detailed framework for building effective teams and leadership structures",
      },
      {
        chapter: "Chapter 5",
        title: "The Hedgehog Concept",
        pages: "90-119",
        relevance: "Strategic focus, competitive advantage, business strategy",
        relevanceScore: 88,
        keyTopics: [
          "strategy",
          "focus",
          "competitive advantage",
          "business planning",
          "decision making",
        ],
        why: "Three-circle framework for strategic clarity and focused execution",
      },
      {
        chapter: "Chapter 4",
        title: "Confront the Brutal Facts",
        pages: "65-89",
        relevance: "Decision making, problem solving, facing reality",
        relevanceScore: 82,
        keyTopics: [
          "problem solving",
          "decision making",
          "reality check",
          "data analysis",
          "truth",
        ],
        why: "Framework for honest assessment and evidence-based decision making",
      },
    ],
  },

  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    cover:
      "https://m.media-amazon.com/images/I/51B7kuFwWeL._SX329_BO1,204,203,200_.jpg",
    description:
      "An easy and proven way to build good habits and break bad ones.",
    amazonLink: "https://amazon.com/dp/0735211299",
    rating: 4.8,
    categories: ["Self-Help", "Productivity"],
    relevantChapters: [
      {
        chapter: "Chapter 2",
        title: "How Your Habits Shape Your Identity",
        pages: "29-43",
        relevance: "Identity formation, behavior change, personal development",
        relevanceScore: 92,
        keyTopics: [
          "habits",
          "identity",
          "behavior change",
          "personal development",
          "mindset",
        ],
        why: "Core principles of identity-based habit formation and lasting change",
      },
      {
        chapter: "Chapter 12",
        title: "The Law of Least Effort",
        pages: "149-162",
        relevance: "Environment design, productivity, reducing friction",
        relevanceScore: 85,
        keyTopics: [
          "productivity",
          "environment design",
          "efficiency",
          "simplification",
          "systems",
        ],
        why: "Practical strategies for making good behaviors easier and bad behaviors harder",
      },
      {
        chapter: "Chapter 16",
        title: "How to Stick with Good Habits",
        pages: "193-208",
        relevance: "Consistency, habit maintenance, long-term success",
        relevanceScore: 88,
        keyTopics: [
          "consistency",
          "habit maintenance",
          "motivation",
          "persistence",
          "accountability",
        ],
        why: "Advanced techniques for maintaining habits and avoiding common pitfalls",
      },
    ],
  },

  // PSYCHOLOGY & THINKING BOOKS (with chapters relevant to business topics)
  {
    id: "thinking-fast-slow",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    cover:
      "https://m.media-amazon.com/images/I/41shZGS-G%2BL._SX324_BO1,204,203,200_.jpg",
    description:
      "Groundbreaking insights into how we make decisions and form judgments.",
    amazonLink: "https://amazon.com/dp/0374533555",
    rating: 4.4,
    categories: ["Psychology", "Decision Making"],
    relevantChapters: [
      {
        chapter: "Chapter 12",
        title: "The Science of Availability",
        pages: "129-140",
        relevance: "Decision making under uncertainty, risk assessment",
        relevanceScore: 90,
        keyTopics: [
          "decision making",
          "risk management",
          "cognitive bias",
          "business judgment",
          "analytics",
        ],
        why: "Critical insights into how availability bias affects business decisions and risk assessment",
      },
      {
        chapter: "Chapter 25",
        title: "Bernoulli's Errors",
        pages: "271-284",
        relevance: "Economic decision making, value assessment, pricing",
        relevanceScore: 85,
        keyTopics: [
          "economics",
          "pricing",
          "value assessment",
          "financial decisions",
          "business strategy",
        ],
        why: "Understanding how people actually make economic decisions vs. theoretical models",
      },
    ],
  },

  // INNOVATION & CREATIVITY BOOKS
  {
    id: "innovators-dilemma",
    title: "The Innovator's Dilemma",
    author: "Clayton Christensen",
    cover:
      "https://m.media-amazon.com/images/I/41OwL2Jac2L._SX327_BO1,204,203,200_.jpg",
    description: "Why new technologies cause great firms to fail.",
    amazonLink: "https://amazon.com/dp/0062060244",
    rating: 4.2,
    categories: ["Innovation", "Business Strategy"],
    relevantChapters: [
      {
        chapter: "Chapter 1",
        title: "How Can Great Firms Fail?",
        pages: "3-28",
        relevance:
          "Disruptive innovation, business failure analysis, strategic planning",
        relevanceScore: 93,
        keyTopics: [
          "innovation",
          "disruption",
          "business strategy",
          "competitive analysis",
          "technology",
        ],
        why: "Framework for understanding why successful companies fail to innovate",
      },
      {
        chapter: "Chapter 4",
        title: "What Goes Up, Can't Go Down",
        pages: "77-98",
        relevance: "Market dynamics, customer needs, product development",
        relevanceScore: 87,
        keyTopics: [
          "market research",
          "customer needs",
          "product development",
          "market dynamics",
        ],
        why: "How customer preferences and market forces drive innovation cycles",
      },
    ],
  },

  // TEAM BUILDING & COLLABORATION BOOKS
  {
    id: "crucial-conversations",
    title: "Crucial Conversations",
    author: "Kerry Patterson, Joseph Grenny, Ron McMillan, Al Switzler",
    cover:
      "https://m.media-amazon.com/images/I/51OHJOhmQgL._SX327_BO1,204,203,200_.jpg",
    description: "Tools for talking when stakes are high and opinions vary.",
    amazonLink: "https://amazon.com/dp/1260474186",
    rating: 4.5,
    categories: ["Communication", "Team Building"],
    relevantChapters: [
      {
        chapter: "Chapter 3",
        title: "Start with Heart",
        pages: "27-40",
        relevance:
          "Team communication, creating safety for difficult conversations",
        relevanceScore: 95,
        keyTopics: [
          "team building",
          "communication",
          "difficult conversations",
          "psychological safety",
          "team dialogue",
        ],
        why: "Essential skills for fostering open and honest team communication",
      },
      {
        chapter: "Chapter 5",
        title: "Learn to Look",
        pages: "55-70",
        relevance:
          "Reading team dynamics, recognizing silence and violence in teams",
        relevanceScore: 88,
        keyTopics: [
          "team building",
          "team dynamics",
          "nonverbal communication",
          "team awareness",
          "group dynamics",
        ],
        why: "Developing awareness of team dynamics and communication patterns",
      },
    ],
  },
  {
    id: "team-of-teams",
    title: "Team of Teams",
    author: "General Stanley McChrystal",
    cover:
      "https://m.media-amazon.com/images/I/41B%2BjGr2w1L._SX327_BO1,204,203,200_.jpg",
    description:
      "New rules of engagement for a complex world - building adaptive teams.",
    amazonLink: "https://amazon.com/dp/1591847486",
    rating: 4.3,
    categories: ["Leadership", "Team Building", "Management"],
    relevantChapters: [
      {
        chapter: "Chapter 6",
        title: "Sharing Consciousness",
        pages: "95-118",
        relevance:
          "Information sharing, team transparency, collective intelligence",
        relevanceScore: 93,
        keyTopics: [
          "team building",
          "information sharing",
          "transparency",
          "collective intelligence",
          "team coordination",
        ],
        why: "Creating transparent information flow and shared understanding across teams",
      },
      {
        chapter: "Chapter 8",
        title: "Empowered Execution",
        pages: "139-162",
        relevance:
          "Team empowerment, distributed decision making, autonomous teams",
        relevanceScore: 89,
        keyTopics: [
          "team building",
          "empowerment",
          "decision making",
          "autonomy",
          "distributed leadership",
        ],
        why: "Building empowered teams capable of rapid, autonomous decision making",
      },
    ],
  },

  // COMMUNICATION & INFLUENCE BOOKS
  {
    id: "influence",
    title: "Influence: The Psychology of Persuasion",
    author: "Robert Cialdini",
    cover:
      "https://m.media-amazon.com/images/I/512bX1FiVbL._SX331_BO1,204,203,200_.jpg",
    description:
      "The psychology of why people say 'yes' and how to apply these insights.",
    amazonLink: "https://amazon.com/dp/006124189X",
    rating: 4.6,
    categories: ["Psychology", "Communication"],
    relevantChapters: [
      {
        chapter: "Chapter 2",
        title: "Reciprocation",
        pages: "19-56",
        relevance: "Relationship building, negotiation, customer relations",
        relevanceScore: 88,
        keyTopics: [
          "relationship building",
          "negotiation",
          "customer relations",
          "sales",
          "networking",
        ],
        why: "Fundamental principle of reciprocity in business relationships and negotiations",
      },
      {
        chapter: "Chapter 4",
        title: "Social Proof",
        pages: "87-126",
        relevance: "Marketing, social influence, customer behavior",
        relevanceScore: 91,
        keyTopics: [
          "marketing",
          "social influence",
          "customer behavior",
          "social media",
          "branding",
        ],
        why: "How social proof drives customer behavior and can be leveraged in marketing",
      },
      {
        chapter: "Chapter 6",
        title: "Authority",
        pages: "165-200",
        relevance: "Leadership, credibility, organizational influence",
        relevanceScore: 84,
        keyTopics: [
          "leadership",
          "authority",
          "credibility",
          "influence",
          "organizational behavior",
        ],
        why: "Building and leveraging authority for effective leadership and influence",
      },
    ],
  },

  // FINANCE & ECONOMICS (chapters relevant to general business)
  {
    id: "freakonomics",
    title: "Freakonomics",
    author: "Steven Levitt & Stephen Dubner",
    cover:
      "https://m.media-amazon.com/images/I/51OGfnGea3L._SX326_BO1,204,203,200_.jpg",
    description: "A rogue economist explores the hidden side of everything.",
    amazonLink: "https://amazon.com/dp/0060731338",
    rating: 4.0,
    categories: ["Economics", "Analysis"],
    relevantChapters: [
      {
        chapter: "Chapter 1",
        title: "What Do Schoolteachers and Sumo Wrestlers Have in Common?",
        pages: "15-46",
        relevance:
          "Incentive systems, behavior analysis, organizational design",
        relevanceScore: 86,
        keyTopics: [
          "incentives",
          "behavior analysis",
          "organizational design",
          "motivation",
          "systems thinking",
        ],
        why: "Understanding how incentives drive behavior in organizations and markets",
      },
      {
        chapter: "Chapter 5",
        title: "What Makes a Perfect Parent?",
        pages: "149-174",
        relevance:
          "Data analysis, correlation vs causation, research methodology",
        relevanceScore: 78,
        keyTopics: [
          "data analysis",
          "research methodology",
          "correlation",
          "evidence-based decisions",
        ],
        why: "Critical thinking about data interpretation and avoiding common analytical errors",
      },
    ],
  },

  // PRODUCTIVITY & TIME MANAGEMENT
  {
    id: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    cover:
      "https://m.media-amazon.com/images/I/41DPSB4EE2L._SX327_BO1,204,203,200_.jpg",
    description: "Rules for focused success in a distracted world.",
    amazonLink: "https://amazon.com/dp/1455586692",
    rating: 4.5,
    categories: ["Productivity", "Focus"],
    relevantChapters: [
      {
        chapter: "Chapter 1",
        title: "Deep Work Is Valuable",
        pages: "19-44",
        relevance: "Productivity, focus, knowledge work, competitive advantage",
        relevanceScore: 94,
        keyTopics: [
          "productivity",
          "focus",
          "knowledge work",
          "competitive advantage",
          "skill development",
        ],
        why: "Why deep work is becoming increasingly valuable in the modern economy",
      },
      {
        chapter: "Rule 2",
        title: "Embrace Boredom",
        pages: "155-184",
        relevance: "Attention training, concentration, mental discipline",
        relevanceScore: 82,
        keyTopics: [
          "attention training",
          "concentration",
          "mental discipline",
          "mindfulness",
          "cognitive control",
        ],
        why: "Practical techniques for developing sustained attention and focus",
      },
    ],
  },

  // TECHNOLOGY & DIGITAL TRANSFORMATION
  {
    id: "crossing-chasm",
    title: "Crossing the Chasm",
    author: "Geoffrey Moore",
    cover:
      "https://m.media-amazon.com/images/I/51IIIGAhIaL._SX326_BO1,204,203,200_.jpg",
    description:
      "Marketing and selling high-tech products to mainstream customers.",
    amazonLink: "https://amazon.com/dp/0062292986",
    rating: 4.1,
    categories: ["Technology", "Marketing"],
    relevantChapters: [
      {
        chapter: "Chapter 3",
        title: "The High-Tech Marketing Model",
        pages: "45-68",
        relevance:
          "Technology adoption, market segmentation, customer personas",
        relevanceScore: 89,
        keyTopics: [
          "technology adoption",
          "market segmentation",
          "customer personas",
          "innovation diffusion",
        ],
        why: "Framework for understanding how different customer segments adopt new technologies",
      },
      {
        chapter: "Chapter 6",
        title: "Define the Battle",
        pages: "125-148",
        relevance: "Competitive positioning, market strategy, differentiation",
        relevanceScore: 85,
        keyTopics: [
          "competitive positioning",
          "market strategy",
          "differentiation",
          "competitive analysis",
        ],
        why: "Strategic approach to positioning technology products in competitive markets",
      },
    ],
  },
];

// Chapter discovery algorithm
export class ChapterDiscoveryService {
  static findRelevantChapters(query: string, maxResults: number = 5): Book[] {
    const queryTerms = this.extractKeyTerms(query.toLowerCase());
    const scoredBooks: Array<Book & { totalScore: number }> = [];

    for (const book of CHAPTER_DATABASE) {
      let totalScore = 0;
      const relevantChapters: ChapterMatch[] = [];

      if (book.relevantChapters) {
        for (const chapter of book.relevantChapters) {
          const chapterScore = this.calculateChapterRelevance(
            queryTerms,
            chapter,
          );
          if (chapterScore > 30) {
            // Threshold for relevance
            relevantChapters.push({
              ...chapter,
              relevanceScore: chapterScore,
            });
            totalScore += chapterScore;
          }
        }
      }

      if (relevantChapters.length > 0) {
        scoredBooks.push({
          ...book,
          relevantChapters: relevantChapters.sort(
            (a, b) => b.relevanceScore - a.relevanceScore,
          ),
          chapterRelevanceScore: totalScore,
          totalScore,
        });
      }
    }

    // Sort by total relevance score and return top results
    return scoredBooks
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, maxResults)
      .map(({ totalScore, ...book }) => book);
  }

  private static extractKeyTerms(query: string): string[] {
    // Extract meaningful terms from the query
    const stopWords = new Set([
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "how",
      "what",
      "why",
      "when",
      "where",
    ]);
    return query
      .split(/\s+/)
      .filter((term) => term.length > 2 && !stopWords.has(term))
      .map((term) => term.replace(/[^\w]/g, ""));
  }

  private static calculateChapterRelevance(
    queryTerms: string[],
    chapter: ChapterMatch,
  ): number {
    let score = 0;
    const allText =
      `${chapter.title} ${chapter.relevance} ${chapter.why} ${chapter.keyTopics.join(" ")}`.toLowerCase();

    // Exact phrase matching (highest priority)
    const queryPhrase = queryTerms.join(" ");
    if (allText.includes(queryPhrase)) {
      score += 50;
    }

    // Direct keyword matches in key topics (high priority)
    let keyTopicMatches = 0;
    for (const topic of chapter.keyTopics) {
      for (const term of queryTerms) {
        if (topic.toLowerCase() === term.toLowerCase()) {
          score += 30;
          keyTopicMatches++;
        } else if (
          topic.toLowerCase().includes(term.toLowerCase()) ||
          term.toLowerCase().includes(topic.toLowerCase())
        ) {
          score += 20;
          keyTopicMatches++;
        }
      }
    }

    // Require at least one key topic match for relevance
    if (keyTopicMatches === 0) {
      // Check for semantic matches in title and relevance text
      let hasSemanticMatch = false;
      for (const term of queryTerms) {
        if (
          chapter.title.toLowerCase().includes(term) ||
          chapter.relevance.toLowerCase().includes(term)
        ) {
          hasSemanticMatch = true;
          score += 15;
        }
      }

      // If no semantic match either, heavily penalize
      if (!hasSemanticMatch) {
        score = Math.max(score - 40, 0);
      }
    }

    // Direct keyword matches in other text
    for (const term of queryTerms) {
      if (allText.includes(term)) {
        score += 10;
      }
      // Partial matches (reduced weight)
      if (
        term.length > 4 &&
        allText.includes(term.substring(0, Math.max(4, term.length - 2)))
      ) {
        score += 5;
      }
    }

    // Base relevance score bonus (reduced influence)
    score += chapter.relevanceScore * 0.1;

    return Math.min(score, 100); // Cap at 100
  }
}
