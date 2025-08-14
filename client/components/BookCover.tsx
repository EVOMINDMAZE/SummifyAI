import React, { useState } from "react";

interface BookCoverProps {
  src?: string | null;
  title: string;
  author?: string;
  width?: string;
  height?: string;
  className?: string;
  showFallback?: boolean;
}

export default function BookCover({
  src,
  title,
  author,
  width = "w-full",
  height = "h-48",
  className = "",
  showFallback = true,
}: BookCoverProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate fallback URL with proper encoding
  const generateFallbackUrl = () => {
    const truncatedTitle = (title || "Book").slice(0, 10);
    const encodedTitle = encodeURIComponent(truncatedTitle);
    return `https://via.placeholder.com/150x200/FFFD63/0A0B1E?text=${encodedTitle}`;
  };

  // Generate default cover with gradient and title
  const DefaultCover = () => (
    <div
      className={`${width} ${height} bg-gradient-to-br from-[#FFFD63] to-amber-400 rounded-lg flex flex-col items-center justify-center p-4 text-center ${className}`}
    >
      <div className="mb-2">
        <svg
          className="w-8 h-8 text-[#0A0B1E]/70"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      </div>
      <h4 className="text-xs font-bold text-[#0A0B1E] leading-tight line-clamp-2">
        {title}
      </h4>
      {author && (
        <p className="text-xs text-[#0A0B1E]/70 mt-1 line-clamp-1">{author}</p>
      )}
    </div>
  );

  // If no src provided or error occurred, show fallback
  if (!src || imageError) {
    return showFallback ? <DefaultCover /> : null;
  }

  return (
    <div className={`${width} ${height} relative ${className}`}>
      <img
        src={src}
        alt={`Cover of ${title}`}
        className={`${width} ${height} object-cover rounded-lg ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <div
          className={`absolute inset-0 ${width} ${height} bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center`}
        >
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#FFFD63] border-t-transparent"></div>
        </div>
      )}
      {isLoading && showFallback && (
        <div className="absolute inset-0">
          <DefaultCover />
        </div>
      )}
    </div>
  );
}
