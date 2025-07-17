import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Twitter, Linkedin, Facebook } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  relevantChapters?: Array<{
    chapter: string;
    title: string;
    relevanceScore: number;
  }>;
}

interface ResultsShareButtonProps {
  topic: string;
  books: Book[];
  totalChapters: number;
}

export default function ResultsShareButton({
  topic,
  books,
  totalChapters,
}: ResultsShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareableUrl = () => {
    const currentUrl = window.location.href;
    // In a real app, you'd generate a shareable URL with the search results
    // For now, we'll use the current URL with the topic
    const url = new URL(currentUrl);
    url.searchParams.set("topic", topic);
    return url.toString();
  };

  const generateShareText = () => {
    const topBooks = books.slice(0, 3);
    const bookList = topBooks
      .map((book) => `📖 ${book.title} by ${book.author}`)
      .join("\n");

    return `🔍 Just discovered ${totalChapters} relevant chapters for "${topic}"!\n\n${bookList}${books.length > 3 ? `\n...and ${books.length - 3} more books` : ""}\n\nFound these insights using Chapter Discovery 📚`;
  };

  const copyToClipboard = async () => {
    const shareText = `${generateShareText()}\n\n${generateShareableUrl()}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareOnPlatform = (platform: string) => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent(generateShareableUrl());

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    };

    window.open(
      urls[platform as keyof typeof urls],
      "_blank",
      "width=600,height=400",
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/70 dark:bg-gray-800/70 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-blue-600" />
            Share Your Discovery
          </DialogTitle>
          <DialogDescription>
            Share your chapter discovery results with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Preview:
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {generateShareText()}
            </p>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Link:
            </label>
            <div className="flex space-x-2">
              <Input
                value={generateShareableUrl()}
                readOnly
                className="text-sm"
              />
              <Button
                size="sm"
                onClick={copyToClipboard}
                variant={copied ? "default" : "outline"}
                className={copied ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share on:
            </label>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => shareOnPlatform("twitter")}
                className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                size="sm"
                onClick={() => shareOnPlatform("linkedin")}
                className="bg-blue-700 hover:bg-blue-800 text-white flex-1"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                size="sm"
                onClick={() => shareOnPlatform("facebook")}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
