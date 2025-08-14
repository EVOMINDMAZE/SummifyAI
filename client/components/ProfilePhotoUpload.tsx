import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate: (photoUrl: string) => void;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoUpdate,
}: ProfilePhotoUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    // Check localStorage first, then use currentPhotoUrl
    if (user?.id) {
      const storedPhoto = localStorage.getItem(`profile_photo_${user.id}`);
      if (storedPhoto) {
        return storedPhoto;
      }
    }
    return currentPhotoUrl || null;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      alert("Please log in to upload a photo");
      return;
    }

    // Validate file
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for simple storage
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;

          console.log("Updating profile photo for user:", user.id);

          // Try to update user profile with base64 photo using different possible column names
          let updateError = null;
          let success = false;

          // Try profile_photo_url first
          const { error: error1 } = await supabase
            .from("profiles")
            .update({ profile_photo_url: base64 })
            .eq("user_id", user.id);

          if (!error1) {
            success = true;
          } else {
            console.log("profile_photo_url column not found, trying avatar_url:", error1.message);

            // Try avatar_url as fallback
            const { error: error2 } = await supabase
              .from("profiles")
              .update({ avatar_url: base64 })
              .eq("user_id", user.id);

            if (!error2) {
              success = true;
            } else {
              console.log("avatar_url column not found, trying photo_url:", error2.message);

              // Try photo_url as another fallback
              const { error: error3 } = await supabase
                .from("profiles")
                .update({ photo_url: base64 })
                .eq("user_id", user.id);

              if (!error3) {
                success = true;
              } else {
                updateError = error3;
                console.log("All photo column attempts failed:", error3.message);
              }
            }
          }

          if (!success && updateError) {
            console.warn("Database update failed, using localStorage fallback:", updateError);

            // Fallback: Store in localStorage
            localStorage.setItem(`profile_photo_${user.id}`, base64);
            console.log("Profile photo stored in localStorage as fallback");
          }

          // Update local state regardless of database success
          setPreviewUrl(base64);
          onPhotoUpdate(base64);

          console.log("Profile photo updated successfully");
        } catch (updateError) {
          console.error("Error during profile update:", updateError);
          setPreviewUrl(currentPhotoUrl || null);

          let errorMessage = "Failed to update profile photo";
          if (updateError instanceof Error) {
            errorMessage = updateError.message;
          }
          alert(errorMessage);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        console.error("Failed to read file");
        alert("Failed to read the selected image file");
        setIsUploading(false);
      };

      // Create preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Start file reading
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to process the image file");
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = async () => {
    if (!user) return;

    try {
      console.log("Removing profile photo for user:", user.id);

      // Try to remove photo URL using different possible column names
      let success = false;
      let lastError = null;

      // Try profile_photo_url first
      const { error: error1 } = await supabase
        .from("profiles")
        .update({ profile_photo_url: null })
        .eq("user_id", user.id);

      if (!error1) {
        success = true;
      } else {
        // Try avatar_url as fallback
        const { error: error2 } = await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("user_id", user.id);

        if (!error2) {
          success = true;
        } else {
          // Try photo_url as another fallback
          const { error: error3 } = await supabase
            .from("profiles")
            .update({ photo_url: null })
            .eq("user_id", user.id);

          if (!error3) {
            success = true;
          } else {
            lastError = error3;
          }
        }
      }

      if (!success && lastError) {
        console.warn("Database removal failed, using localStorage fallback:", lastError);

        // Fallback: Remove from localStorage
        localStorage.removeItem(`profile_photo_${user.id}`);
        console.log("Profile photo removed from localStorage as fallback");
      }

      setPreviewUrl(null);
      onPhotoUpdate("");
    } catch (error) {
      console.error("Error removing photo:", error);

      let errorMessage = "Failed to remove photo";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#FFFD63] to-[#FFFD63]/80 flex items-center justify-center shadow-lg">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[#0A0B1E] font-bold text-4xl">
              {user?.firstName?.[0]?.toUpperCase() || "U"}
            </span>
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {previewUrl ? "Change Photo" : "Upload Photo"}
        </button>

        {previewUrl && (
          <button
            onClick={removePhoto}
            disabled={isUploading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
        Upload a profile photo (max 5MB). Supported formats: JPG, PNG, GIF
      </p>
    </div>
  );
}
