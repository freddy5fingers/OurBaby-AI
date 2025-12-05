import React from 'react';
import { Download, Maximize2 } from 'lucide-react';

interface ResultCardProps {
  imageSrc: string | null;
  label: string;
  age: string;
  onClick?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ imageSrc, label, age, onClick }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-white/50 flex flex-col group hover:shadow-2xl transition-all duration-300">
      <div 
        className={`relative aspect-square w-full bg-slate-100 overflow-hidden ${imageSrc ? 'cursor-pointer' : ''}`}
        onClick={() => imageSrc && onClick?.()}
      >
        {imageSrc ? (
          <>
            <img 
              src={imageSrc} 
              alt={label} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Hover overlay with maximize icon */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
               <div className="bg-white/30 backdrop-blur-md p-3 rounded-full text-white shadow-sm transform scale-75 group-hover:scale-100 transition-transform">
                  <Maximize2 size={24} />
               </div>
            </div>

            <a 
              href={imageSrc} 
              download={`future-baby-${label}.png`}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full shadow-lg text-slate-700 hover:text-blue-600 hover:bg-white transition-all transform translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300 delay-75"
              title="Download"
            >
              <Download size={18} />
            </a>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="animate-pulse">Generating...</span>
          </div>
        )}
      </div>
      <div className="p-4 bg-white/80 backdrop-blur-sm relative z-10">
        <h3 className="font-bold text-slate-800 text-lg">{label}</h3>
        <p className="text-sm text-slate-500 font-medium">{age}</p>
      </div>
    </div>
  );
};