import { FusionParams } from "../types";

// A simplified implementation of noise algorithms for visual texture generation
// We use a value noise approach combined with fractal brownian motion (fBm)

// Pseudo-random number generator based on seed
export function pseudoRandom(x: number, y: number, seed: number) {
  const dot = x * 12.9898 + y * 78.233 + seed * 37.719;
  const sin = Math.sin(dot) * 43758.5453;
  return sin - Math.floor(sin);
}

// Linear interpolation
function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}

// Smoothstep for smoother noise transitions
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

// 2D Value Noise
function noise2D(x: number, y: number, seed: number) {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const f = x - i;
  const g = y - j;

  const u = smoothstep(f);
  const v = smoothstep(g);

  return lerp(
    lerp(pseudoRandom(i, j, seed), pseudoRandom(i + 1, j, seed), u),
    lerp(pseudoRandom(i, j + 1, seed), pseudoRandom(i + 1, j + 1, seed), u),
    v
  );
}

// Fractal Brownian Motion
export function fbm(x: number, y: number, octaves: number, persistence: number, lacunarity: number, seed: number) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise2D(x * frequency, y * frequency, seed) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return total / maxValue;
}

// Domain Warping / Marble function
export function marble(x: number, y: number, params: FusionParams) {
  const { turbulence, distortion, scale, seed, style } = params;
  
  // Base coordinates scaled
  // Adjust scale factor based on style to normalize appearance
  const baseScale = scale / 20; 
  const nx = x * baseScale;
  const ny = y * baseScale;

  // Normalized parameters 0-1
  const pTurb = turbulence / 20; // Lower divisor = stronger effect
  const pDist = distortion / 10;

  // Domain warping step 1
  const qx = fbm(nx + seed, ny + seed, 4, 0.5, 2, seed);
  const qy = fbm(nx + 5.2 + seed, ny + 1.3 + seed, 4, 0.5, 2, seed);

  // Domain warping step 2 (Feedback)
  const rx = fbm(nx + 4.0 * qx + 1.7, ny + 4.0 * qy + 9.2, 4, 0.5, 2, seed);
  const ry = fbm(nx + 4.0 * qx + 8.3, ny + 4.0 * qy + 2.8, 4, 0.5, 2, seed);

  // Generate pattern based on Style
  let finalValue = 0;

  if (style === 'nebula') {
    // Nebula: Soft, cloudy, relies purely on the warped field without sine stripping
    // We map the warped FBM directly
    const f = fbm(nx + pDist * rx, ny + pDist * ry, 6, 0.5, 2, seed);
    // Smooth mix
    finalValue = f; 
    // Contrast boost
    finalValue = smoothstep(finalValue);
  } 
  else if (style === 'agate') {
    // Agate: Tight, frequent banding
    const f = fbm(nx + pDist * rx, ny + pDist * ry, 6, 0.6, 2, seed);
    // High frequency sine wave for rings
    const mix = (nx + ny) * 0.1 + f * pTurb;
    finalValue = Math.sin(mix * Math.PI * 12) * 0.5 + 0.5;
  }
  else if (style === 'fracture') {
     // Fracture: Sharp edges using absolute sine or rigid noise look
     const f = fbm(nx + pDist * rx, ny + pDist * ry, 5, 0.5, 2, seed);
     const mix = (nx + ny) * 0.2 + f * pTurb;
     // Abs creates sharp creases
     finalValue = Math.abs(Math.sin(mix * Math.PI * 3));
     // Invert to make veins dark or light depending on map
     finalValue = 1 - finalValue; 
  }
  else {
    // Classic (Default)
    const f = fbm(nx + pDist * rx, ny + pDist * ry, 6, 0.6, 2, seed);
    const mix = (nx + ny) * 0.1 + f * pTurb;
    finalValue = Math.sin(mix * Math.PI * 2) * 0.5 + 0.5;
  }

  return finalValue; 
}

// Helper to convert hex to RGB
export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}