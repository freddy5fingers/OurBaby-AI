import React, { useState } from 'react';
import { Heart, Sparkles, AlertCircle, RefreshCw, Share2, Facebook, Instagram, Twitter, Download } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { ResultCard } from './components/ResultCard';
import { ImageModal } from './components/ImageModal';
import { generateFutureBaby } from './services/geminiService';
import { ParentImage, PredictionResult, GenerationStatus } from './types';

// Helper to convert base64 to File for sharing
const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const App: React.FC = () => {
  const [parent1, setParent1] = useState<ParentImage>({ id: 'parent1', file: null, previewUrl: null, base64: null });
  const [parent2, setParent2] = useState<ParentImage>({ id: 'parent2', file: null, previewUrl: null, base64: null });
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleUpload = (parent: 'parent1' | 'parent2', file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError("Unsupported file format. Please upload a valid image file (JPEG, PNG, WebP, etc.).");
      return;
    }

    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image is too large. Please upload a photo smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const update = {
        id: parent,
        file: file,
        previewUrl: URL.createObjectURL(file),
        base64: reader.result as string
      };
      if (parent === 'parent1') setParent1(update);
      else setParent2(update);
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try uploading a different image.");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!parent1.base64 || !parent2.base64) {
      setError("Please upload photos of both parents first.");
      return;
    }

    setStatus('generating');
    setError(null);
    
    // Initialize with nulls immediately to show the grid
    setResult({
      analysis: '',
      infantBoy: null, infantGirl: null,
      toddlerBoy: null, toddlerGirl: null,
      childBoy: null, childGirl: null,
      teenBoy: null, teenGirl: null
    });

    try {
      await generateFutureBaby(parent1.base64, parent2.base64, (partial) => {
        setResult(prev => prev ? { ...prev, ...partial } : partial as PredictionResult);
      });
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate predictions. Please try again.");
      setStatus('error');
    }
  };

  const handleReset = () => {
    setParent1({ id: 'parent1', file: null, previewUrl: null, base64: null });
    setParent2({ id: 'parent2', file: null, previewUrl: null, base64: null });
    setResult(null);
    setStatus('idle');
    setError(null);
  };

  // --- Sharing Logic ---

  const getShareText = () => {
    if (!result) return 'Check out OurBaby AI!';
    return `Check out what our babies might look like! 🧬\n\nGenetic Analysis: ${result.analysis}\n\n#OurBabyAI`;
  };

  // 1. Native Share (Best for Mobile / Instagram)
  const handleNativeShare = async () => {
    if (!result) return;

    try {
      const files: File[] = [];
      const addFile = (data: string | null, name: string) => {
        if (data) files.push(base64ToFile(data, name));
      };

      // Add best images to share
      addFile(result.infantBoy, 'infant-boy.png');
      addFile(result.infantGirl, 'infant-girl.png');
      addFile(result.childBoy, 'child-boy.png');
      addFile(result.childGirl, 'child-girl.png');

      const shareData = {
        title: 'OurBaby AI Results',
        text: getShareText(),
        files: files
      };

      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share(shareData);
      } else {
        // Fallback if files aren't supported (Desktop usually)
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: window.location.href
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        alert('Sharing failed. Try downloading the images instead!');
      }
    }
  };

  // 2. Twitter / X Share (Text + Link)
  const handleTwitterShare = () => {
    const text = getShareText();
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  // 3. Facebook Share (Link)
  const handleFacebookShare = () => {
    const url = window.location.href;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank');
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <header className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <img 
            src="https://classical-aquamarine-csdjoomx9u-jrubkhx9og.edgeone.app/ourbaby_ai_logo.png" 
            alt="OurBaby AI Logo" 
            className="w-32 h-32 object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3 tracking-tight">
          OurBaby <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-pink-500">AI</span>
        </h1>
        <p className="text-slate-600 text-lg max-w-lg mx-auto leading-relaxed">
          Upload two parent photos to see your future son and daughter at different ages using realistic genetic blending.
        </p>
      </header>

      {/* Main Content */}
      <main className="space-y-12">
        
        {/* Input Section - Only show if no result or loading */}
        {status === 'idle' || status === 'error' ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-white max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative">
              
              <UploadZone 
                label="Parent 1" 
                data={parent1} 
                onUpload={(f) => handleUpload('parent1', f)} 
                onClear={() => setParent1({ ...parent1, file: null, previewUrl: null, base64: null })}
                colorClass="bg-blue-400"
              />

              <div className="hidden md:flex flex-col items-center justify-center z-10">
                <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-pink-500 animate-pulse">
                  <Heart fill="currentColor" size={24} />
                </div>
              </div>

              <UploadZone 
                label="Parent 2" 
                data={parent2} 
                onUpload={(f) => handleUpload('parent2', f)} 
                onClear={() => setParent2({ ...parent2, file: null, previewUrl: null, base64: null })}
                colorClass="bg-pink-400"
              />
            </div>

            {error && (
              <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 text-sm font-medium animate-pulse">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={!parent1.file || !parent2.file}
                className={`
                  relative px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105 active:scale-95
                  ${!parent1.file || !parent2.file 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-pink-200'}
                `}
              >
                See Our Baby
              </button>
            </div>
          </div>
        ) : null}

        {/* Results Section */}
        {(status === 'generating' || status === 'complete') && result && (
          <div className="animate-fade-in-up space-y-12 pb-20">
            
            {/* Analysis Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-purple-100 max-w-3xl mx-auto text-center min-h-[120px] flex flex-col justify-center">
               {!result.analysis ? (
                 <div className="flex justify-center items-center gap-2 text-slate-400">
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Analyzing DNA...</span>
                 </div>
               ) : (
                 <>
                  <div className="inline-block p-2 bg-purple-100 rounded-lg mb-3 mx-auto w-fit">
                    <Sparkles className="text-purple-600" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Genetic Trait Analysis</h3>
                  <p className="text-slate-600 leading-relaxed italic">
                    "{result.analysis}"
                  </p>
                 </>
               )}
            </div>

            {/* Boys Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-600 pl-4 border-l-4 border-blue-500">
                It's a Boy! 👦
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ResultCard 
                  imageSrc={result.infantBoy} 
                  label="Infant Boy" 
                  age="0-2 Years" 
                  onClick={() => result.infantBoy && setSelectedImage(result.infantBoy)}
                />
                <ResultCard 
                  imageSrc={result.toddlerBoy} 
                  label="Toddler Boy" 
                  age="3-5 Years" 
                  onClick={() => result.toddlerBoy && setSelectedImage(result.toddlerBoy)}
                />
                <ResultCard 
                  imageSrc={result.childBoy} 
                  label="Child Boy" 
                  age="6-9 Years" 
                  onClick={() => result.childBoy && setSelectedImage(result.childBoy)}
                />
                <ResultCard 
                  imageSrc={result.teenBoy} 
                  label="Teen Boy" 
                  age="18 Years" 
                  onClick={() => result.teenBoy && setSelectedImage(result.teenBoy)}
                />
              </div>
            </div>

            {/* Girls Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-pink-600 pl-4 border-l-4 border-pink-500">
                It's a Girl! 👧
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ResultCard 
                  imageSrc={result.infantGirl} 
                  label="Infant Girl" 
                  age="0-2 Years" 
                  onClick={() => result.infantGirl && setSelectedImage(result.infantGirl)}
                />
                <ResultCard 
                  imageSrc={result.toddlerGirl} 
                  label="Toddler Girl" 
                  age="3-5 Years" 
                  onClick={() => result.toddlerGirl && setSelectedImage(result.toddlerGirl)}
                />
                <ResultCard 
                  imageSrc={result.childGirl} 
                  label="Child Girl" 
                  age="6-9 Years" 
                  onClick={() => result.childGirl && setSelectedImage(result.childGirl)}
                />
                <ResultCard 
                  imageSrc={result.teenGirl} 
                  label="Teen Girl" 
                  age="18 Years" 
                  onClick={() => result.teenGirl && setSelectedImage(result.teenGirl)}
                />
              </div>
            </div>

            {/* Parents Comparison Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-700 pl-4 border-l-4 border-slate-500">
                The Parents 👨‍👩‍👧
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100">
                  <div 
                    className="aspect-square w-full rounded-xl overflow-hidden mb-2 cursor-pointer group relative"
                    onClick={() => parent1.previewUrl && setSelectedImage(parent1.previewUrl)}
                  >
                    <img src={parent1.previewUrl || ''} alt="Parent 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                       <Sparkles className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" size={32} />
                    </div>
                  </div>
                  <p className="text-center font-medium text-slate-600">Parent 1</p>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100">
                  <div 
                    className="aspect-square w-full rounded-xl overflow-hidden mb-2 cursor-pointer group relative"
                    onClick={() => parent2.previewUrl && setSelectedImage(parent2.previewUrl)}
                  >
                    <img src={parent2.previewUrl || ''} alt="Parent 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                       <Sparkles className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" size={32} />
                    </div>
                  </div>
                  <p className="text-center font-medium text-slate-600">Parent 2</p>
                </div>
              </div>
            </div>

            {/* Social Sharing & Actions */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-center text-slate-500 font-semibold mb-6 uppercase tracking-wider text-sm">Share Results</h3>
              
              <div className="flex flex-col items-center gap-6">
                
                {/* Primary Share Buttons Row */}
                <div className="flex flex-wrap justify-center gap-4">
                  {/* Native Share (Best for Mobile/Instagram) */}
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    title="Share photos to apps"
                  >
                    <Share2 size={20} />
                    <span>Share Photos</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={handleFacebookShare}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1877F2] text-white rounded-full font-bold hover:bg-[#166fe5] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    title="Share to Facebook"
                  >
                    <Facebook size={20} fill="currentColor" className="text-white" />
                    <span className="hidden sm:inline">Facebook</span>
                  </button>

                  {/* Instagram (Visual cue mostly, as web API is limited) */}
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    title="Open Instagram via Share Sheet"
                  >
                    <Instagram size={20} />
                    <span className="hidden sm:inline">Instagram</span>
                  </button>

                  {/* X / Twitter */}
                  <button
                    onClick={handleTwitterShare}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-slate-900 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    title="Post to X (Twitter)"
                  >
                    <Twitter size={20} fill="currentColor" />
                    <span className="hidden sm:inline">Post to X</span>
                  </button>
                </div>

                {/* Secondary Action: Start Over */}
                <button
                  onClick={handleReset}
                  className="mt-4 flex items-center justify-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
                >
                  <RefreshCw size={16} />
                  Start Over
                </button>
              </div>
            </div>
            
          </div>
        )}
      </main>

      {/* Fullscreen Image Modal */}
      <ImageModal 
        src={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
};

export default App;