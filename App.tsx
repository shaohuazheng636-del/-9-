import React, { useState, useEffect, useRef } from 'react';
import { analyzeImagesForScene } from './services/geminiService';
import { SHOT_TYPES, DEFAULT_SHOT_ID, TEMPLATE_CN, TEMPLATE_EN } from './constants';
import { Lang, GridState, SceneAnalysis } from './types';

// Icons
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
);
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const App: React.FC = () => {
  // State
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sceneDescription, setSceneDescription] = useState<SceneAnalysis>({ cn: '', en: '' });
  const [gridState, setGridState] = useState<GridState>({});
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [outputLang, setOutputLang] = useState<Lang>('CN');
  const [copied, setCopied] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Grid Setup
  useEffect(() => {
    const initialGrid: GridState = {};
    for (let i = 0; i < 9; i++) {
      initialGrid[i] = DEFAULT_SHOT_ID;
    }
    setGridState(initialGrid);
  }, []);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as File[];
      setImages(newFiles);
      
      // Generate previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeImagesForScene(images);
      setSceneDescription(result);
    } catch (error) {
      alert("Failed to analyze images. Please check your API Key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCellClick = (index: number) => {
    setSelectedCell(index);
  };

  const handleShotSelect = (shotId: string) => {
    if (selectedCell !== null) {
      setGridState(prev => ({
        ...prev,
        [selectedCell]: shotId
      }));
    }
  };

  const generatePrompt = () => {
    const isCN = outputLang === 'CN';
    const template = isCN ? TEMPLATE_CN : TEMPLATE_EN;
    const desc = isCN ? sceneDescription.cn : sceneDescription.en;

    // Use a placeholder if analysis isn't done yet
    const sceneText = desc || (isCN ? "[场景描述]" : "[Scene Description]");

    let prompt = `${template.prefix}${sceneText}${template.suffix}\n`;
    
    for (let i = 0; i < 9; i++) {
      const shotId = gridState[i] || DEFAULT_SHOT_ID;
      const shotDef = SHOT_TYPES.find(s => s.id === shotId);
      const shotValue = isCN ? shotDef?.valueCN : shotDef?.valueEN;
      
      // Format: Shot 01: [Description]
      const num = (i + 1).toString().padStart(2, '0');
      prompt += `${template.shotPrefix}${num}: ${shotValue}\n`;
    }

    return prompt;
  };

  const handleCopy = () => {
    const text = generatePrompt();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
      setImages([]);
      setPreviews([]);
      setSceneDescription({ cn: '', en: '' });
      // Reset grid to default
      const initialGrid: GridState = {};
      for (let i = 0; i < 9; i++) {
        initialGrid[i] = DEFAULT_SHOT_ID;
      }
      setGridState(initialGrid);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 flex flex-col items-center">
      <header className="mb-8 text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <CameraIcon />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Storyboard Matrix
          </h1>
        </div>
        <p className="text-slate-400">
          Upload reference images to generate a cohesive 3x3 storyboard grid prompt.
        </p>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input & Grid Configuration */}
        <div className="space-y-6">
          
          {/* 1. Image Upload */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-100">1. Reference Images</h2>
              {images.length > 0 && (
                 <button onClick={handleReset} className="text-xs text-slate-400 hover:text-red-400 transition-colors">Reset All</button>
              )}
            </div>
            
            {previews.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-700/30 transition-all group"
              >
                <UploadIcon />
                <span className="mt-2 text-slate-400 group-hover:text-indigo-300">Click to upload images</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-600">
                    <img src={src} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square flex items-center justify-center rounded-lg border border-dashed border-slate-600 text-slate-500 hover:text-indigo-400 hover:border-indigo-500 transition-colors"
                >
                  +
                </button>
                 <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || images.length === 0}
              className={`w-full mt-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                isAnalyzing || images.length === 0
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshIcon /> Analyzing...
                </>
              ) : (
                "Analyze & Extract Scene"
              )}
            </button>
          </div>

          {/* 2. Grid Configuration */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
             <h2 className="text-xl font-semibold text-slate-100 mb-4">2. Shot Configuration (3x3)</h2>
             
             <div className="grid grid-cols-3 gap-3 aspect-square max-w-md mx-auto">
               {[...Array(9)].map((_, index) => {
                 const currentShotId = gridState[index] || DEFAULT_SHOT_ID;
                 const shotDef = SHOT_TYPES.find(s => s.id === currentShotId);
                 const isSelected = selectedCell === index;

                 return (
                   <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    className={`relative rounded-lg p-2 flex flex-col items-center justify-center text-center transition-all border-2
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/50' 
                        : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700'
                      }
                    `}
                   >
                      <span className="absolute top-1 left-2 text-[10px] font-mono opacity-50">{(index + 1).toString().padStart(2, '0')}</span>
                      <span className="text-sm font-semibold mt-2">{outputLang === 'CN' ? shotDef?.labelCN : shotDef?.labelEN}</span>
                   </button>
                 )
               })}
             </div>
             
             {/* Selection Area for Active Cell */}
             <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700 min-h-[140px]">
               {selectedCell !== null ? (
                 <>
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-indigo-300 font-medium">
                        Editing Shot {(selectedCell + 1).toString().padStart(2, '0')}
                      </span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {SHOT_TYPES.map(shot => (
                       <button
                        key={shot.id}
                        onClick={() => handleShotSelect(shot.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                          ${gridState[selectedCell] === shot.id 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
                          }
                        `}
                       >
                         {outputLang === 'CN' ? shot.labelCN : shot.labelEN}
                       </button>
                     ))}
                   </div>
                 </>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                   Select a grid cell above to change its shot type.
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm sticky top-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-100">3. Final Prompt</h2>
              <div className="flex bg-slate-700 rounded-lg p-1">
                <button 
                  onClick={() => setOutputLang('CN')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${outputLang === 'CN' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  中文
                </button>
                <button 
                  onClick={() => setOutputLang('EN')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${outputLang === 'EN' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  English
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={generatePrompt()}
              className="w-full flex-grow min-h-[400px] bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
            />

            <div className="mt-4 flex gap-4">
              <button
                onClick={handleCopy}
                className="flex-1 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copied!" : "Copy Prompt"}
              </button>
            </div>
            
            {!sceneDescription.en && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-200/70">
                    * Upload images and click Analyze to automatically fill the scene description.
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;