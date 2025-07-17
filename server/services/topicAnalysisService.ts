interface TopicAnalysis {
  isBroad: boolean;
  broadnessScore: number; // 0-100, higher = more broad
  suggestedRefinements: string[];
  explanation: string;
}

interface TopicRefinement {
  label: string;
  value: string;
  description: string;
}

export class TopicAnalysisService {
  // Common broad topics that need refinement
  private static BROAD_TOPICS = [
    "leadership",
    "management",
    "business",
    "productivity",
    "success",
    "marketing",
    "finance",
    "communication",
    "strategy",
    "innovation",
    "entrepreneurship",
    "sales",
    "psychology",
    "relationships",
    "growth",
    "development",
    "performance",
    "motivation",
    "planning",
    "organization",
    "efficiency",
    "improvement",
    "skills",
    "learning",
    "thinking",
    "decision making",
    "problem solving",
    "creativity",
  ];

  // Refined topic suggestions for common broad topics
  private static TOPIC_REFINEMENTS: Record<string, TopicRefinement[]> = {
    leadership: [
      {
        label: "Team Leadership",
        value: "team leadership and team building",
        description: "Leading and managing teams effectively",
      },
      {
        label: "Executive Leadership",
        value: "executive leadership and corporate strategy",
        description: "C-level leadership and organizational strategy",
      },
      {
        label: "Transformational Leadership",
        value: "transformational leadership and change management",
        description: "Leading organizational change and transformation",
      },
      {
        label: "Servant Leadership",
        value: "servant leadership and employee empowerment",
        description: "Leading by serving others and empowering teams",
      },
      {
        label: "Crisis Leadership",
        value: "crisis leadership and decision making under pressure",
        description: "Leading during difficult times and uncertainty",
      },
    ],
    management: [
      {
        label: "Project Management",
        value: "project management and execution",
        description: "Managing projects from start to finish",
      },
      {
        label: "People Management",
        value: "people management and employee development",
        description: "Managing and developing people effectively",
      },
      {
        label: "Performance Management",
        value: "performance management and goal setting",
        description: "Setting goals and managing performance",
      },
      {
        label: "Time Management",
        value: "time management and productivity optimization",
        description: "Managing time and increasing productivity",
      },
      {
        label: "Change Management",
        value: "change management and organizational transformation",
        description: "Managing organizational change effectively",
      },
    ],
    productivity: [
      {
        label: "Personal Productivity",
        value: "personal productivity and time optimization",
        description: "Individual productivity techniques and habits",
      },
      {
        label: "Team Productivity",
        value: "team productivity and collaboration",
        description: "Improving team efficiency and collaboration",
      },
      {
        label: "Workflow Optimization",
        value: "workflow optimization and process improvement",
        description: "Streamlining processes and workflows",
      },
      {
        label: "Focus and Deep Work",
        value: "focus management and deep work techniques",
        description: "Maintaining focus and doing meaningful work",
      },
      {
        label: "Digital Productivity",
        value: "digital productivity and technology tools",
        description: "Using technology to boost productivity",
      },
    ],
    marketing: [
      {
        label: "Digital Marketing",
        value: "digital marketing and online presence",
        description: "Online marketing strategies and tactics",
      },
      {
        label: "Content Marketing",
        value: "content marketing and storytelling",
        description: "Creating compelling content that engages",
      },
      {
        label: "Brand Marketing",
        value: "brand building and brand strategy",
        description: "Building and managing strong brands",
      },
      {
        label: "Social Media Marketing",
        value: "social media marketing and community building",
        description: "Leveraging social platforms for growth",
      },
      {
        label: "Growth Marketing",
        value: "growth hacking and customer acquisition",
        description: "Rapid growth and customer acquisition strategies",
      },
    ],
    communication: [
      {
        label: "Business Communication",
        value: "business communication and professional writing",
        description: "Professional communication in business settings",
      },
      {
        label: "Public Speaking",
        value: "public speaking and presentation skills",
        description: "Speaking confidently in front of audiences",
      },
      {
        label: "Difficult Conversations",
        value: "difficult conversations and conflict resolution",
        description: "Handling challenging conversations effectively",
      },
      {
        label: "Persuasion",
        value: "persuasion and influence techniques",
        description: "Influencing others and getting buy-in",
      },
      {
        label: "Listening Skills",
        value: "active listening and empathy",
        description: "Listening effectively and understanding others",
      },
    ],
    finance: [
      {
        label: "Personal Finance",
        value: "personal finance and wealth building",
        description: "Managing personal money and building wealth",
      },
      {
        label: "Business Finance",
        value: "business finance and financial management",
        description: "Managing business finances and cash flow",
      },
      {
        label: "Investing",
        value: "investing and portfolio management",
        description: "Investment strategies and portfolio building",
      },
      {
        label: "Financial Planning",
        value: "financial planning and budgeting",
        description: "Planning finances and creating budgets",
      },
      {
        label: "Corporate Finance",
        value: "corporate finance and business valuation",
        description: "Corporate financial strategy and valuation",
      },
    ],
    sales: [
      {
        label: "B2B Sales",
        value: "B2B sales and enterprise selling",
        description: "Selling to businesses and large organizations",
      },
      {
        label: "Consultative Selling",
        value: "consultative selling and solution-based sales",
        description: "Selling by understanding customer needs",
      },
      {
        label: "Sales Management",
        value: "sales management and team leadership",
        description: "Managing and leading sales teams",
      },
      {
        label: "Negotiation",
        value: "negotiation skills and deal closing",
        description: "Negotiating effectively and closing deals",
      },
      {
        label: "Customer Relationships",
        value: "customer relationship management and retention",
        description: "Building and maintaining customer relationships",
      },
    ],
    psychology: [
      {
        label: "Behavioral Psychology",
        value: "behavioral psychology and habit formation",
        description: "Understanding behavior and building good habits",
      },
      {
        label: "Cognitive Psychology",
        value: "cognitive psychology and decision making",
        description: "How we think and make decisions",
      },
      {
        label: "Social Psychology",
        value: "social psychology and group dynamics",
        description: "Human behavior in social situations",
      },
      {
        label: "Positive Psychology",
        value: "positive psychology and well-being",
        description: "Happiness, resilience, and mental well-being",
      },
      {
        label: "Organizational Psychology",
        value: "organizational psychology and workplace behavior",
        description: "Psychology applied to workplace settings",
      },
    ],
  };

  static analyzeTopic(topic: string): TopicAnalysis {
    const normalizedTopic = topic.toLowerCase().trim();

    // Check if topic is too short or generic
    if (normalizedTopic.length < 3) {
      return {
        isBroad: true,
        broadnessScore: 100,
        suggestedRefinements: [],
        explanation:
          "Topic is too short. Please provide more specific details.",
      };
    }

    // Check against broad topics list
    let broadnessScore = 0;
    let matchedBroadTopic = "";

    for (const broadTopic of this.BROAD_TOPICS) {
      if (
        normalizedTopic.includes(broadTopic) ||
        broadTopic.includes(normalizedTopic)
      ) {
        broadnessScore = Math.max(
          broadnessScore,
          this.calculateBroadnessScore(normalizedTopic, broadTopic),
        );
        if (broadnessScore > 60) {
          matchedBroadTopic = broadTopic;
          break;
        }
      }
    }

    // Additional heuristics for broadness
    const wordCount = normalizedTopic.split(/\s+/).length;
    if (wordCount === 1) {
      broadnessScore = Math.max(broadnessScore, 80);
    } else if (wordCount === 2 && !this.hasSpecificModifiers(normalizedTopic)) {
      broadnessScore = Math.max(broadnessScore, 60);
    }

    const isBroad = broadnessScore > 50;

    // Get refinement suggestions
    let suggestedRefinements: string[] = [];
    if (
      isBroad &&
      matchedBroadTopic &&
      this.TOPIC_REFINEMENTS[matchedBroadTopic]
    ) {
      suggestedRefinements = this.TOPIC_REFINEMENTS[matchedBroadTopic].map(
        (r) => r.value,
      );
    }

    // Generate explanation
    const explanation = this.generateExplanation(
      normalizedTopic,
      broadnessScore,
      matchedBroadTopic,
    );

    return {
      isBroad,
      broadnessScore,
      suggestedRefinements,
      explanation,
    };
  }

  static getTopicRefinements(topic: string): TopicRefinement[] {
    const normalizedTopic = topic.toLowerCase().trim();

    for (const broadTopic of this.BROAD_TOPICS) {
      if (
        normalizedTopic.includes(broadTopic) &&
        this.TOPIC_REFINEMENTS[broadTopic]
      ) {
        return this.TOPIC_REFINEMENTS[broadTopic];
      }
    }

    // Return generic refinements if no specific match
    return [
      {
        label: "Be More Specific",
        value: `${topic} best practices and strategies`,
        description: "Focus on specific practices and strategies",
      },
      {
        label: "Industry Focus",
        value: `${topic} in technology industry`,
        description: "Apply to a specific industry context",
      },
      {
        label: "Level Focus",
        value: `${topic} for beginners`,
        description: "Target a specific experience level",
      },
      {
        label: "Practical Application",
        value: `practical ${topic} techniques and tools`,
        description: "Focus on actionable techniques and tools",
      },
    ];
  }

  private static calculateBroadnessScore(
    topic: string,
    broadTopic: string,
  ): number {
    // Exact match = very broad
    if (topic === broadTopic) return 90;

    // Topic is just the broad topic with common modifiers
    const commonModifiers = [
      "good",
      "great",
      "effective",
      "successful",
      "better",
      "best",
      "improving",
      "developing",
    ];
    const topicWords = topic.split(/\s+/);
    const broadTopicWords = broadTopic.split(/\s+/);

    if (topicWords.length <= broadTopicWords.length + 1) {
      const hasOnlyCommonModifiers = topicWords.every(
        (word) =>
          broadTopicWords.includes(word) || commonModifiers.includes(word),
      );
      if (hasOnlyCommonModifiers) return 80;
    }

    // Partial match
    if (topic.includes(broadTopic) || broadTopic.includes(topic)) return 70;

    return 30;
  }

  private static hasSpecificModifiers(topic: string): boolean {
    const specificModifiers = [
      "remote",
      "startup",
      "enterprise",
      "agile",
      "digital",
      "virtual",
      "international",
      "crisis",
      "rapid",
      "strategic",
      "tactical",
      "operational",
      "executive",
      "junior",
      "senior",
      "technical",
      "creative",
      "analytical",
      "data-driven",
      "customer-focused",
    ];

    return specificModifiers.some((modifier) => topic.includes(modifier));
  }

  private static generateExplanation(
    topic: string,
    broadnessScore: number,
    matchedBroadTopic: string,
  ): string {
    if (broadnessScore > 80) {
      return `"${topic}" is quite broad. To help you find the most relevant chapters, could you be more specific about what aspect interests you most?`;
    } else if (broadnessScore > 60) {
      return `"${topic}" covers a wide range of concepts. Narrowing down your focus will help us find more targeted and actionable chapters.`;
    } else if (broadnessScore > 50) {
      return `"${topic}" could benefit from more specificity to ensure we find the most relevant chapters for your needs.`;
    } else {
      return `"${topic}" looks good! This should help us find specific and relevant chapters.`;
    }
  }
}
