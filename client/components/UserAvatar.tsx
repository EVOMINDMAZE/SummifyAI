import React, { useState } from "react";
import { User } from "@/contexts/AuthContext";

interface UserAvatarProps {
  user?: User | null;
  size?: "small" | "medium" | "large";
  className?: string;
  showName?: boolean;
}

export default function UserAvatar({
  user,
  size = "medium",
  className = "",
  showName = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get the user's initials
  const getInitials = () => {
    if (!user) return "U";

    const firstName = user.firstName?.trim();
    const lastName = user.lastName?.trim();

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (user.email) {
      return user.email[0].toUpperCase();
    }

    return "U";
  };

  // Get the user's full name
  const getFullName = () => {
    if (!user) return "Unknown User";

    const firstName = user.firstName?.trim();
    const lastName = user.lastName?.trim();

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (user.email) {
      return user.email.split("@")[0];
    }

    return "Unknown User";
  };

  // Size variants
  const sizeClasses = {
    small: "w-6 h-6 text-xs",
    medium: "w-8 h-8 text-sm",
    large: "w-12 h-12 text-lg",
  };

  const photoUrl = user?.profilePhotoUrl;
  const hasValidPhoto = photoUrl && !imageError;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-[#FFFD63] to-amber-400 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden`}
      >
        {hasValidPhoto ? (
          <img
            src={photoUrl}
            alt={getFullName()}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-[#0A0B1E] font-bold">{getInitials()}</span>
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {getFullName()}
        </span>
      )}
    </div>
  );
}
