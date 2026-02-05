import React, { useEffect } from 'react';

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, onClose }) => {
  useEffect(() => {
    if (!src) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt={alt || 'Preview'}
        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
