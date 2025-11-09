import jsPDF from "jspdf";

export interface SearchResult {
  id: string;
  topic: string;
  searchDate: string;
  books: Array<{
    title: string;
    author: string;
    image: string;
    affiliateLink: string;
    rating: number;
  }>;
  summary: string;
  keyInsights: string[];
  saved?: boolean;
  shared?: boolean;
}

// Share functionality
export const shareResult = async (result: SearchResult): Promise<boolean> => {
  try {
    if (navigator.share) {
      // Use native sharing if available
      try {
        await navigator.share({
          title: `${result.topic} - Book Summary`,
          text: result.summary,
          url: `${window.location.origin}/results/${result.id}`,
        });
        return true;
      } catch (shareError: any) {
        // Handle NotAllowedError or other share failures
        if (shareError.name === "NotAllowedError") {
          console.warn("Share was cancelled or denied, falling back to clipboard");
          // Fall through to clipboard fallback
        } else if (shareError.name === "AbortError") {
          console.warn("Share was aborted by user");
          return false;
        } else {
          console.warn("Share failed, falling back to clipboard:", shareError);
          // Fall through to clipboard fallback
        }
      }
    }

    // Fallback to copying link to clipboard
    const shareUrl = `${window.location.origin}/results/${result.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      console.log("Link copied to clipboard");
      return true;
    } catch (clipboardError) {
      console.error("Failed to copy to clipboard:", clipboardError);
      // Last resort: try old execCommand method
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        document.body.removeChild(textArea);
        console.log("Link copied to clipboard using execCommand");
        return true;
      } catch (execError) {
        document.body.removeChild(textArea);
        console.error("All sharing methods failed:", execError);
        return false;
      }
    }
  } catch (error) {
    console.error("Unexpected error in shareResult:", error);
    return false;
  }
};

// Export to PDF functionality
export const exportToPDF = (result: SearchResult): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const pdf = new jsPDF();

      // Set up the document
      pdf.setFontSize(24);
      pdf.text(result.topic, 20, 30);

      pdf.setFontSize(12);
      pdf.text(
        `Generated on: ${new Date(result.searchDate).toLocaleDateString()}`,
        20,
        45,
      );

      // Books section
      pdf.setFontSize(16);
      pdf.text("Books Analyzed:", 20, 65);

      let yPosition = 80;
      pdf.setFontSize(12);

      result.books.forEach((book, index) => {
        pdf.text(
          `${index + 1}. ${book.title} by ${book.author}`,
          25,
          yPosition,
        );
        pdf.text(`   Rating: ${book.rating}/5`, 25, yPosition + 7);
        yPosition += 20;
      });

      // Summary section
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.text("Summary:", 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      const summaryLines = pdf.splitTextToSize(result.summary, 170);
      pdf.text(summaryLines, 20, yPosition);
      yPosition += summaryLines.length * 7 + 15;

      // Key insights section
      pdf.setFontSize(16);
      pdf.text("Key Insights:", 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      result.keyInsights.forEach((insight, index) => {
        const insightLines = pdf.splitTextToSize(`• ${insight}`, 170);
        pdf.text(insightLines, 20, yPosition);
        yPosition += insightLines.length * 7 + 5;
      });

      // Save the PDF
      pdf.save(
        `${result.topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_summary.pdf`,
      );
      resolve(true);
    } catch (error) {
      console.error("Error creating PDF:", error);
      resolve(false);
    }
  });
};

// Save/unsave functionality
export const toggleSaveResult = async (
  resultId: string,
  currentSavedState: boolean,
): Promise<boolean> => {
  try {
    // This would typically make an API call to save/unsave
    // For now, we'll simulate it with localStorage
    const savedResults = JSON.parse(
      localStorage.getItem("savedResults") || "[]",
    );

    if (currentSavedState) {
      // Remove from saved
      const updatedSaved = savedResults.filter((id: string) => id !== resultId);
      localStorage.setItem("savedResults", JSON.stringify(updatedSaved));
    } else {
      // Add to saved
      if (!savedResults.includes(resultId)) {
        savedResults.push(resultId);
        localStorage.setItem("savedResults", JSON.stringify(savedResults));
      }
    }

    return !currentSavedState; // Return new saved state
  } catch (error) {
    console.error("Error saving result:", error);
    return currentSavedState; // Return original state on error
  }
};

// Copy to clipboard functionality
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      console.error("Error copying to clipboard:", err);
      return false;
    }
  }
};

// Social sharing functions
export const shareOnTwitter = (result: SearchResult) => {
  const text = `Check out this book summary on ${result.topic}: ${result.summary.substring(0, 100)}...`;
  const url = `${window.location.origin}/results/${result.id}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, "_blank");
};

export const shareOnLinkedIn = (result: SearchResult) => {
  const url = `${window.location.origin}/results/${result.id}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, "_blank");
};

export const shareOnFacebook = (result: SearchResult) => {
  const url = `${window.location.origin}/results/${result.id}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, "_blank");
};

// Notification/Toast functionality (you might want to integrate with a toast library)
export const showNotification = (
  message: string,
  type: "success" | "error" | "info" = "info",
) => {
  // This is a simple implementation - you might want to use a library like react-hot-toast
  console.log(`${type.toUpperCase()}: ${message}`);

  // You could also create a simple toast notification here
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500"
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
};
