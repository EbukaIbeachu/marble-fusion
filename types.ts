export type MarbleStyle = 'classic' | 'nebula' | 'agate' | 'fracture';

export interface ColorDef {
  id: string;
  hex: string;
  weight: number; // 0 to 100
}

export interface FusionParams {
  turbulence: number; // How much the colors mix (0-100)
  scale: number; // The size of the marble pattern (zoom)
  distortion: number; // Swirl intensity
  seed: number; // Random seed offset
  roughness: number; // Texture grain/noise detail (0-100)
  style: MarbleStyle; // The algorithm used for generation
}

export interface BeadRecipe {
  name: string;
  colors: ColorDef[];
  params: FusionParams;
}

export enum GeneratorStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}