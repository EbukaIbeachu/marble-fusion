import React, { useRef, useEffect, useState } from 'react';
import { ColorDef, FusionParams } from '../types';
import { marble, pseudoRandom } from '../utils/noise';

interface BeadCanvasProps {
  colors: ColorDef[];
  params: FusionParams;
  width?: number;
  height?: number;
}

const BeadCanvas: React.FC<BeadCanvasProps> = ({ colors, params, width = 500, height = 500 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper: Create a gradient look-up table based on color weights
    const createGradientMap = (size: number) => {
      const totalWeight = colors.reduce((sum, c) => sum + c.weight, 0);
      let currentPos = 0;
      
      const map: { r: number, g: number, b: number }[] = [];
      
      const offCanvas = document.createElement('canvas');
      offCanvas.width = size;
      offCanvas.height = 1;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return [];

      const gradient = offCtx.createLinearGradient(0, 0, size, 0);
      
      colors.forEach((color) => {
        const weightPct = color.weight / totalWeight;
        const endPos = currentPos + weightPct;
        gradient.addColorStop(Math.min(currentPos, 1), color.hex);
        gradient.addColorStop(Math.min(endPos, 1), color.hex);
        currentPos = endPos;
      });

      offCtx.fillStyle = gradient;
      offCtx.fillRect(0, 0, size, 1);
      
      const imgData = offCtx.getImageData(0, 0, size, 1).data;
      for (let i = 0; i < size; i++) {
        map.push({
          r: imgData[i * 4],
          g: imgData[i * 4 + 1],
          b: imgData[i * 4 + 2]
        });
      }
      return map;
    };

    const drawBead = () => {
      const startTime = performance.now();
      const w = canvas.width;
      const h = canvas.height;
      
      // Create image data
      const imgData = ctx.createImageData(w, h);
      const data = imgData.data;
      
      const gradientMap = createGradientMap(256);
      if (gradientMap.length === 0) return;

      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(w, h) / 2 - 10; // Padding
      
      // Pre-calculate style multipliers
      const roughnessAmt = params.roughness / 100;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const index = (y * w + x) * 4;

          // 1. Masking: Check if inside circle
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > radius) {
            data[index + 3] = 0; // Transparent
            continue;
          }

          // 2. Sphere Mapping (Fake 3D)
          const z = Math.sqrt(radius * radius - dist * dist);
          const nx = dx / radius;
          const ny = dy / radius;
          const nz = z / radius;

          const u = x / w;
          const v = y / h;

          // 3. Generate Marble Noise Value
          const noiseVal = marble(u, v, params);

          // 4. Texture/Grain for extra shades
          // We use pseudoRandom on the pixel coordinates for per-pixel grain
          // This breaks up the smooth gradients into textured stone
          const grain = (pseudoRandom(x, y, params.seed) - 0.5) * 0.2; 
          
          // Apply roughness to the mapping index
          // Higher roughness = more noise influence on color selection
          let mapValue = noiseVal + (grain * roughnessAmt);
          
          // Clamp
          mapValue = Math.max(0, Math.min(1, mapValue));
          
          // Map to color
          const mapIndex = Math.floor(mapValue * 255);
          const color = gradientMap[mapIndex];

          // 5. Lighting / Shading
          let r = color.r;
          let g = color.g;
          let b = color.b;

          // Diffuse shading
          const lightX = -0.5;
          const lightY = -0.5;
          const lightZ = 0.7;
          const lightLen = Math.sqrt(lightX**2 + lightY**2 + lightZ**2);
          const lx = lightX / lightLen;
          const ly = lightY / lightLen;
          const lz = lightZ / lightLen;

          const dot = nx * lx + ny * ly + nz * lz;
          const diffuse = Math.max(0, dot);
          
          // Specular highlight
          const reflectX = 2 * dot * nx - lx;
          const reflectY = 2 * dot * ny - ly;
          const reflectZ = 2 * dot * nz - lz;
          const spec = Math.pow(Math.max(0, reflectZ), 20 + (1 - roughnessAmt) * 10); // Roughness affects shininess

          // Edge darkening
          const edgeDarkening = Math.pow(nz, 0.4); 

          r = r * edgeDarkening * (0.8 + 0.4 * diffuse) + spec * 200;
          g = g * edgeDarkening * (0.8 + 0.4 * diffuse) + spec * 200;
          b = b * edgeDarkening * (0.8 + 0.4 * diffuse) + spec * 200;

          data[index] = Math.min(255, r);
          data[index + 1] = Math.min(255, g);
          data[index + 2] = Math.min(255, b);
          data[index + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setRenderTime(performance.now() - startTime);
    };

    let animationId: number;
    const renderLoop = () => {
      drawBead();
    };
    animationId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(animationId);
  }, [colors, params, width, height]);

  return (
    <div className="relative flex justify-center items-center p-4 bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
        <canvas 
            ref={canvasRef} 
            width={width} 
            height={height}
            className="w-full h-auto max-w-[500px] max-h-[500px] transition-all duration-200"
        />
        <div className="absolute bottom-2 right-2 text-xs text-slate-500 font-mono pointer-events-none">
            {renderTime.toFixed(1)}ms
        </div>
    </div>
  );
};

export default BeadCanvas;