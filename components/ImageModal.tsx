import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ src, onClose }) => {
  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (src) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      <div 
        className="relative max-w-full max-h-full flex flex-col items-center" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image content
      >
        <img 
          src={src} 
          alt="Enlarged view" 
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
        
        <a 
          href={src}
          download="ourbaby-ai-image.png"
          className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Download size={18} />
          Download Image
        </a>
      </div>
    </div>
  );
};