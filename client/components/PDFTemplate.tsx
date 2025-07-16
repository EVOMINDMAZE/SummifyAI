import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  Link,
} from "@react-pdf/renderer";

// Register fonts
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: 700,
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Open Sans",
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#FFFD63",
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0A0B1E",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0A0B1E",
    marginBottom: 10,
    marginTop: 20,
  },
  topic: {
    fontSize: 16,
    color: "#0A0B1E",
    marginBottom: 15,
    fontWeight: 600,
  },
  date: {
    fontSize: 10,
    color: "#888888",
    marginBottom: 20,
  },
  booksSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0A0B1E",
    marginBottom: 12,
    marginTop: 20,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  bookItem: {
    width: "50%",
    paddingRight: 10,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#0A0B1E",
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 3,
  },
  bookLink: {
    fontSize: 9,
    color: "#4361EE",
    textDecoration: "underline",
  },
  summarySection: {
    marginBottom: 25,
  },
  summaryText: {
    fontSize: 12,
    color: "#333333",
    textAlign: "justify",
    lineHeight: 1.6,
    marginBottom: 15,
  },
  quotesSection: {
    marginBottom: 25,
  },
  quote: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderLeftWidth: 3,
    borderLeftColor: "#4361EE",
  },
  quoteText: {
    fontSize: 11,
    color: "#333333",
    fontStyle: "italic",
    lineHeight: 1.5,
  },
  actionItem: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#888888",
  },
  footerLink: {
    fontSize: 9,
    color: "#4361EE",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: "#888888",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 60,
    color: "#f0f0f0",
    zIndex: -1,
  },
  upgradeSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#FFFD63",
    borderRadius: 8,
  },
  upgradeText: {
    fontSize: 12,
    color: "#0A0B1E",
    textAlign: "center",
    fontWeight: 600,
  },
});

interface PDFTemplateProps {
  summary: {
    topic: string;
    books: Array<{
      title: string;
      author: string;
      amazonLink: string;
    }>;
    summary: string;
    quotes: string[];
    generatedAt: string;
  };
  userEmail: string;
  isPremium: boolean;
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({
  summary,
  userEmail,
  isPremium,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>SummifyAI</Text>
          <Text style={styles.subtitle}>
            Chapter Discovery Report - {isPremium ? "Premium" : "Free"} Plan
          </Text>
        </View>

        {/* Title Section */}
        <Text style={styles.title}>Chapter Analysis Report</Text>
        <Text style={styles.topic}>Topic: {summary.topic}</Text>
        <Text style={styles.date}>
          Generated on {formatDate(summary.generatedAt)} for {userEmail}
        </Text>

        {/* Books Analyzed */}
        <View style={styles.booksSection}>
          <Text style={styles.sectionTitle}>
            📚 Books Analyzed ({summary.books.length})
          </Text>
          <View style={styles.bookGrid}>
            {summary.books.map((book, index) => (
              <View key={index} style={styles.bookItem}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>by {book.author}</Text>
                <Link src={book.amazonLink} style={styles.bookLink}>
                  View on Amazon
                </Link>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>🧠 Comparative Analysis</Text>
          <Text style={styles.summaryText}>{summary.summary}</Text>
        </View>

        {/* Key Quotes */}
        <View style={styles.quotesSection}>
          <Text style={styles.sectionTitle}>
            💬 Key Insights & Quotes (
            {isPremium
              ? summary.quotes.length
              : Math.min(3, summary.quotes.length)}
            )
          </Text>
          {summary.quotes
            .slice(0, isPremium ? summary.quotes.length : 3)
            .map((quote, index) => (
              <View key={index} style={styles.quote}>
                <Text style={styles.quoteText}>"{quote}"</Text>
              </View>
            ))}
          {!isPremium && summary.quotes.length > 3 && (
            <View style={styles.upgradeSection}>
              <Text style={styles.upgradeText}>
                💎 Upgrade to Premium to see all {summary.quotes.length}{" "}
                insights and quotes
              </Text>
            </View>
          )}
        </View>

        {/* Premium Features */}
        {isPremium && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>⭐ Premium Analysis</Text>
            <Text style={styles.summaryText}>
              This report includes advanced insights powered by our premium AI
              engine. You have access to:
            </Text>
            <View style={styles.actionItem}>
              <Text style={styles.summaryText}>
                • Full chapter discoveries from all {summary.books.length} books
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.summaryText}>
                • Complete quote collection ({summary.quotes.length} insights)
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.summaryText}>
                • Cross-referenced analysis and connections
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.summaryText}>
                • Export capabilities (PDF, DOCX, TXT)
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.summaryText}>
                • Priority generation (10x faster processing)
              </Text>
            </View>
          </View>
        )}

        {/* Action Items for Premium Users */}
        {isPremium && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>🎯 Recommended Actions</Text>
            <Text style={styles.summaryText}>
              Based on this analysis, we recommend:
            </Text>
            <View style={styles.actionItem}>
              <Text style={styles.summaryText}>
                1. Start with chapters 3-5 of "{summary.books[0]?.title}" for
                foundational understanding
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.summaryText}>
                2. Cross-reference insights from multiple authors for
                comprehensive knowledge
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.summaryText}>
                3. Focus on practical applications mentioned in the key quotes
                section
              </Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.summaryText}>
                4. Bookmark chapters with high relevance scores for future
                reference
              </Text>
            </View>
          </View>
        )}

        {/* Free User Watermark */}
        {!isPremium && (
          <View style={styles.watermark}>
            <Text>FREE PLAN</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by SummifyAI • Discover exactly what chapters to read, not
            entire books
          </Text>
          <Link src="https://summifyai.com" style={styles.footerLink}>
            www.summifyai.com
          </Link>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 1</Text>
      </Page>
    </Document>
  );
};

export default PDFTemplate;
