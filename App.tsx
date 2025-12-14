import React, { useState } from 'react';
import BeadCanvas from './components/BeadCanvas';
import Controls from './components/Controls';
import { ColorDef, FusionParams } from './types';
import { generateBeadRecipe } from './services/geminiService';
import { Download, Sparkles } from 'lucide-react';

// Default initial state
const INITIAL_COLORS: ColorDef[] = [
  { id: '1', hex: '#0f172a', weight: 80 }, // Slate 900
  { id: '2', hex: '#38bdf8', weight: 40 }, // Sky 400
  { id: '3', hex: '#e879f9', weight: 30 }, // Fuschia 400
];

const INITIAL_PARAMS: FusionParams = {
  turbulence: 45,
  scale: 25,
  distortion: 30,
  seed: 1234,
  roughness: 20,
  style: 'classic'
};

const App: React.FC = () => {
  const [colors, setColors] = useState<ColorDef[]>(INITIAL_COLORS);
  const [params, setParams] = useState<FusionParams>(INITIAL_PARAMS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [currentRecipeName, setCurrentRecipeName] = useState("Cosmic Drift");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setShowPromptInput(false);
    
    const recipe = await generateBeadRecipe(prompt);
    
    if (recipe) {
      setColors(recipe.colors);
      setParams(recipe.params);
      setCurrentRecipeName(recipe.name);
    } else {
        alert("Failed to generate recipe. Please try again or check API Key.");
    }
    
    setIsGenerating(false);
    setPrompt('');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative">
        <header className="p-6 flex justify-between items-center z-10">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                    MarbleFusion
                </h1>
                <p className="text-slate-500 text-sm">Fashion Bead Studio</p>
            </div>
            
            <div className="flex gap-4">
               <div className="px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-sm text-slate-300 shadow-sm flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-yellow-500" />
                 <span>Current Recipe: <strong className="text-white">{currentRecipeName}</strong></span>
               </div>
            </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
          <BeadCanvas 
            colors={colors} 
            params={params} 
            width={600} 
            height={600} 
          />
        </div>

        {/* Floating Action for Prompt (when active) */}
        {showPromptInput && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                    <h3 className="text-lg font-semibold text-white mb-2">Describe your Vision</h3>
                    <p className="text-slate-400 text-sm mb-4">E.g., "A moody forest with golden veins" or "Cyberpunk neon city"</p>
                    <textarea 
                        autoFocus
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-4 resize-none h-24"
                        placeholder="Enter description..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleGenerate();
                            }
                        }}
                    />
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setShowPromptInput(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isGenerating}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                        >
                            {isGenerating ? 'Designing...' : 'Generate'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Sidebar Controls */}
      <Controls 
        colors={colors}
        params={params}
        setColors={setColors}
        setParams={setParams}
        isGenerating={isGenerating}
        onGenerate={() => setShowPromptInput(true)}
      />

    </div>
  );
};

export default App;