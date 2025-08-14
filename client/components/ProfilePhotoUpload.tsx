import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate: (photoUrl: string) => void;
}

export default function ProfilePhotoUpload({ currentPhotoUrl, onPhotoUpdate }: ProfilePhotoUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update user profile with new photo URL
      await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('user_id', user.id);

      onPhotoUpdate(publicUrl);
      
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
      
    } catch (error) {
      console.error('Error uploading photo:', error);

      let errorMessage = 'Failed to upload photo. Please try again.';

      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = `Upload failed: ${error.message}`;
        } else if (error.error) {
          errorMessage = `Upload failed: ${error.error}`;
        } else {
          errorMessage = `Upload failed: ${JSON.stringify(error)}`;
        }
      }

      alert(errorMessage);
      setPreviewUrl(currentPhotoUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = async () => {
    if (!user) return;
    
    try {
      // Update user profile to remove photo URL
      await supabase
        .from('profiles')
        .update({ profile_photo_url: null })
        .eq('user_id', user.id);

      setPreviewUrl(null);
      onPhotoUpdate('');
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('Failed to remove photo. Please try again.');
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
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
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
          {previewUrl ? 'Change Photo' : 'Upload Photo'}
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
