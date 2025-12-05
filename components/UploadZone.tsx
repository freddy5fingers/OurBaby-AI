import React, { useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { ParentImage } from '../types';

interface UploadZoneProps {
  label: string;
  data: ParentImage;
  onUpload: (file: File) => void;
  onClear: () => void;
  colorClass: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ label, data, onUpload, onClear, colorClass }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
      // Reset the input value so the same file can be selected again if needed
      // (e.g., if the user got an error and wants to retry with the same file name but corrected content, 
      // or if they just want to trigger the onChange again).
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Upload photo for ${label}`}
        className={`relative w-full aspect-square max-w-[280px] rounded-2xl border-4 border-dashed ${data.previewUrl ? 'border-transparent shadow-lg' : 'border-white/50 bg-white/30'} cursor-pointer hover:bg-white/40 transition-all flex flex-col items-center justify-center overflow-hidden group focus:outline-none focus:ring-4 focus:ring-blue-300`}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />

        {data.previewUrl ? (
          <>
            <img 
              src={data.previewUrl} 
              alt={label} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full">Change Photo</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"
              aria-label={`Clear photo for ${label}`}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-500 p-4 text-center">
            <div className={`p-4 rounded-full ${colorClass} mb-3`}>
              <User size={32} className="text-white opacity-80" />
            </div>
            <span className="font-semibold text-slate-600">{label}</span>
            <span className="text-xs mt-1 text-slate-400">Tap to upload</span>
          </div>
        )}
      </div>
    </div>
  );
};