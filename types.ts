
export enum VisualStyle {
  NEWS = 'News-Style',
  CINEMATIC = 'Cinematic',
  MINIMALIST = 'Minimalist'
}

export enum ImageQuality {
  STANDARD = 'Standard',
  ULTRA = 'Ultra (High Res)'
}

export type AspectRatio = '1:1' | '9:16';

export interface Slide {
  id: string;
  slideNumber: number;
  imagePrompt: string;
  text: string;
  imageUrl?: string;
  generatingImage?: boolean;
  momentumBridge?: 'BUT' | 'THEREFORE' | 'SO' | 'HOOK';
}

export interface Feed {
  id: string;
  topic: string;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  slides: Slide[];
  hashtags: string[];
  totalWords: number;
  hookAnalysis: string;
}

export interface GenerationStatus {
  step: 'idle' | 'scripting' | 'visualizing' | 'completed' | 'error';
  message: string;
  progress: number;
}
