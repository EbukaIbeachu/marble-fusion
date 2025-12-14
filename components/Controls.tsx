import React from 'react';
import { Plus, Trash2, Wand2, RefreshCcw, Layers } from 'lucide-react';
import { ColorDef, FusionParams, MarbleStyle } from '../types';

interface ControlsProps {
  colors: ColorDef[];
  params: FusionParams;
  setColors: React.Dispatch<React.SetStateAction<ColorDef[]>>;
  setParams: React.Dispatch<React.SetStateAction<FusionParams>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  colors, 
  params, 
  setColors, 
  setParams, 
  onGenerate,
  isGenerating 
}) => {

  const handleColorChange = (id: string, field: keyof ColorDef, value: any) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeColor = (id: string) => {
    if (colors.length <= 2) return; // Minimum 2 colors
    setColors(prev => prev.filter(c => c.id !== id));
  };

  const addColor = () => {
    setColors(prev => [
      ...prev,
      { id: Date.now().toString(), hex: '#ffffff', weight: 50 }
    ]);
  };

  const handleParamChange = (field: keyof FusionParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 p-6 shadow-xl overflow-y-auto w-full md:w-96 border-l border-slate-700">
      
      {/* AI Section */}
      <div className="mb-8 p-4 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl border border-indigo-500/30">
        <div className="flex items-center gap-2 mb-2 text-indigo-100 font-semibold">
          <Wand2 className="w-4 h-4" />
          <span>AI Stylist</span>
        </div>
        <p className="text-xs text-indigo-200 mb-3">
          Describe a mood or theme (e.g. "Stormy Ocean", "Fire Dragon")
        </p>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-900/50"
        >
            {isGenerating ? (
                <>Thinking...</>
            ) : (
                <>Generate Fusion Recipe</>
            )}
        </button>
      </div>

      {/* Physics Controls */}
      <div className="mb-8 space-y-5">
        <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold">Base Physics</h3>
            <Layers className="w-3 h-3 text-slate-500" />
        </div>

        {/* Style Selector */}
        <div className="space-y-1">
            <label className="text-sm text-slate-300">Fusion Style</label>
            <select
                value={params.style}
                onChange={(e) => handleParamChange('style', e.target.value as MarbleStyle)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none"
            >
                <option value="classic">Classic Marble</option>
                <option value="nebula">Nebula (Cloudy)</option>
                <option value="agate">Agate (Banded)</option>
                <option value="fracture">Fracture (Sharp)</option>
            </select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-slate-300">Turbulence (Flow)</label>
            <span className="text-slate-500">{Math.round(params.turbulence)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.turbulence}
            onChange={(e) => handleParamChange('turbulence', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-slate-300">Swirl (Distortion)</label>
            <span className="text-slate-500">{Math.round(params.distortion)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.distortion}
            onChange={(e) => handleParamChange('distortion', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-slate-300">Complexity (Scale)</label>
            <span className="text-slate-500">{Math.round(params.scale)}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={params.scale}
            onChange={(e) => handleParamChange('scale', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-pink-400"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-slate-300">Texture (Roughness)</label>
            <span className="text-slate-500">{Math.round(params.roughness)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.roughness}
            onChange={(e) => handleParamChange('roughness', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-400"
          />
        </div>

        <button 
          onClick={() => handleParamChange('seed', Math.random() * 1000)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
        >
          <RefreshCcw className="w-3 h-3" />
          Randomize Pattern Seed
        </button>
      </div>

      {/* Colors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold">Color Palette</h3>
            <button 
                onClick={addColor}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-200 transition-colors"
                title="Add Color"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
        
        <div className="space-y-3">
          {colors.map((color) => (
            <div key={color.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                    <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => handleColorChange(color.id, 'hex', e.target.value)}
                    className="w-8 h-8 rounded-full border-0 p-0 overflow-hidden cursor-pointer"
                    />
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none"></div>
                </div>
                <div className="flex-1">
                    <div className="text-xs text-slate-500 font-mono mb-1">{color.hex}</div>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400" style={{ width: `${color.weight}%` }}></div>
                    </div>
                </div>
                <button 
                    onClick={() => removeColor(color.id)}
                    disabled={colors.length <= 2}
                    className="text-slate-600 hover:text-red-400 disabled:opacity-30 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-8">Mix %</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={color.weight}
                    onChange={(e) => handleColorChange(color.id, 'weight', parseInt(e.target.value))}
                    className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
                  />
                  <span className="text-[10px] text-slate-400 w-6 text-right">{color.weight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Controls;