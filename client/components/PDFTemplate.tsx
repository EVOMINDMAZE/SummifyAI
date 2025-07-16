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
}) => {\n  const formatDate = (dateString: string) => {\n    return new Date(dateString).toLocaleDateString(\"en-US\", {\n      year: \"numeric\",\n      month: \"long\",\n      day: \"numeric\",\n      hour: \"2-digit\",\n      minute: \"2-digit\",\n    });\n  };\n\n  return (\n    <Document>\n      <Page size=\"A4\" style={styles.page}>\n        {/* Header */}\n        <View style={styles.header}>\n          <Text style={styles.logo}>SummifyAI</Text>\n          <Text style={styles.subtitle}>\n            Chapter Discovery Report - {isPremium ? \"Premium\" : \"Free\"} Plan\n          </Text>\n        </View>\n\n        {/* Title Section */}\n        <Text style={styles.title}>Chapter Analysis Report</Text>\n        <Text style={styles.topic}>Topic: {summary.topic}</Text>\n        <Text style={styles.date}>\n          Generated on {formatDate(summary.generatedAt)} for {userEmail}\n        </Text>\n\n        {/* Books Analyzed */}\n        <View style={styles.booksSection}>\n          <Text style={styles.sectionTitle}>\n            📚 Books Analyzed ({summary.books.length})\n          </Text>\n          <View style={styles.bookGrid}>\n            {summary.books.map((book, index) => (\n              <View key={index} style={styles.bookItem}>\n                <Text style={styles.bookTitle}>{book.title}</Text>\n                <Text style={styles.bookAuthor}>by {book.author}</Text>\n                <Link src={book.amazonLink} style={styles.bookLink}>\n                  View on Amazon\n                </Link>\n              </View>\n            ))}\n          </View>\n        </View>\n\n        {/* Summary */}\n        <View style={styles.summarySection}>\n          <Text style={styles.sectionTitle}>🧠 Comparative Analysis</Text>\n          <Text style={styles.summaryText}>{summary.summary}</Text>\n        </View>\n\n        {/* Key Quotes */}\n        <View style={styles.quotesSection}>\n          <Text style={styles.sectionTitle}>\n            💬 Key Insights & Quotes ({summary.quotes.length})\n          </Text>\n          {summary.quotes.slice(0, 3).map((quote, index) => (\n            <View key={index} style={styles.quote}>\n              <Text style={styles.quoteText}>{quote}</Text>\n            </View>\n          ))}\n          {summary.quotes.length > 3 && (\n            <Text style={{ fontSize: 10, color: \"#666666\", marginTop: 10 }}>\n              {isPremium\n                ? `+ ${summary.quotes.length - 3} more quotes available in your dashboard`\n                : \"Upgrade to Premium to see all quotes and detailed analysis\"}\n            </Text>\n          )}\n        </View>\n\n        {/* Watermark for free users */}\n        {!isPremium && (\n          <Text style={styles.watermark}>SummifyAI FREE</Text>\n        )}\n\n        {/* Footer */}\n        <View style={styles.footer}>\n          <Text style={styles.footerText}>\n            Generated by SummifyAI - Chapter Discovery Platform\n          </Text>\n          <Link src=\"https://summifyai.com\" style={styles.footerLink}>\n            summifyai.com\n          </Link>\n        </View>\n\n        <Text\n          style={styles.pageNumber}\n          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}\n          fixed\n        />\n      </Page>\n\n      {/* Second page for premium users with extended content */}\n      {isPremium && summary.quotes.length > 3 && (\n        <Page size=\"A4\" style={styles.page}>\n          <View style={styles.header}>\n            <Text style={styles.logo}>SummifyAI Premium</Text>\n            <Text style={styles.subtitle}>Extended Analysis & Quotes</Text>\n          </View>\n\n          <Text style={styles.title}>Additional Insights</Text>\n          <Text style={styles.topic}>Topic: {summary.topic}</Text>\n\n          {/* Remaining Quotes */}\n          <View style={styles.quotesSection}>\n            <Text style={styles.sectionTitle}>\n              💬 Additional Key Quotes\n            </Text>\n            {summary.quotes.slice(3).map((quote, index) => (\n              <View key={index + 3} style={styles.quote}>\n                <Text style={styles.quoteText}>{quote}</Text>\n              </View>\n            ))}\n          </View>\n\n          {/* Premium-only content */}\n          <View style={styles.summarySection}>\n            <Text style={styles.sectionTitle}>🎯 Action Items</Text>\n            <Text style={styles.summaryText}>\n              Based on this analysis, here are recommended next steps:\n              {\"\\n\\n\"}\n              1. Deep dive into the most relevant chapters identified above\n              {\"\\n\"}\n              2. Create a reading schedule focusing on these specific sections\n              {\"\\n\"}\n              3. Take notes on how these insights apply to your specific situation\n              {\"\\n\"}\n              4. Consider purchasing the books that resonated most with your goals\n              {\"\\n\\n\"}\n              This premium analysis provides targeted guidance to maximize your\n              learning efficiency and help you achieve your objectives faster.\n            </Text>\n          </View>\n\n          <View style={styles.footer}>\n            <Text style={styles.footerText}>\n              Premium Report - Generated by SummifyAI\n            </Text>\n            <Text style={styles.footerText}>\n              Thank you for being a Premium member!\n            </Text>\n          </View>\n\n          <Text\n            style={styles.pageNumber}\n            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}\n            fixed\n          />\n        </Page>\n      )}\n    </Document>\n  );\n};\n\nexport default PDFTemplate;