import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';
import { Post } from '../types';

export const Upload: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size too large (Limit: 5MB)");
        return;
      }
      
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !imagePreview) return;

    setIsSubmitting(true);
    
    try {
      let finalImageUrl = imagePreview; // Default to base64 (local fallback)

      // 1. Upload Image to Supabase Storage if file exists
      if (imageFile) {
        const uploadedUrl = await dbService.uploadImage(imageFile);
        if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
        }
      }

      const newPost: Post = {
        id: `p${Date.now()}`,
        userId: user.id,
        username: user.username,
        userAvatar: user.avatarUrl,
        imageUrl: finalImageUrl,
        caption: caption.trim(),
        likes: [],
        comments: [],
        createdAt: Date.now()
      };

      // 2. Save Post Metadata
      const savedToDb = await dbService.createPost(newPost);
      
      if (!savedToDb) {
         throw new Error("Failed to save post to database (Strict Mode)");
      }

      // 3. Fallback/Sync to local storage only if DB succeeded
      storageService.createPost(newPost);

      navigate('/');
    } catch (err) {
      console.error(err);
      setError("Failed to share post. Ensure you are online and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSelection = () => {
    setImagePreview(null);
    setImageFile(null);
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-black sm:rounded-lg sm:border sm:border-gray-200 dark:border-gray-800 sm:shadow-sm sm:mt-8 overflow-hidden min-h-[calc(100vh-140px)] sm:min-h-0 transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h1 className="font-semibold text-lg dark:text-white">New Post</h1>
        {imagePreview && (
          <button onClick={clearSelection} className="text-red-500 text-sm font-semibold">
            Cancel
          </button>
        )}
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md">
            {error}
          </div>
        )}

        {!imagePreview ? (
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
              <ImagePlus className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Select photo to share</p>
            <p className="text-xs text-gray-400 mt-1">JPEG or PNG (Max 5MB)</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              <button 
                onClick={clearSelection}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Caption</label>
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Write a caption..."
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              fullWidth
              className="mt-2 flex justify-center items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                'Share'
              )}
            </Button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
