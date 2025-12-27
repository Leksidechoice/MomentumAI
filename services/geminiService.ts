
import { GoogleGenAI, Type } from "@google/genai";
import { Slide, VisualStyle, AspectRatio, ImageQuality } from "../types";

export const generateScript = async (topic: string, slideCount: number, style: VisualStyle): Promise<{ slides: Partial<Slide>[], hashtags: string[], hookAnalysis: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const wordCountTarget = "under 300";
  
  const prompt = `
    Generate a high-retention social media narrative for: "${topic}".
    Total segments/slides: ${slideCount}.
    Visual Style: ${style}.

    STRICT RULES FOR RETENTION ENGINEERING:
    1. SOUTH PARK RULE: Never use "And then". Use "BUT" (conflict) or "THEREFORE/SO" (consequence) to drive causal momentum. 
    2. NARRATIVE DEPTH: The total script MUST be ${wordCountTarget} words.
    3. FACEBOOK OPTIMIZATION:
       - Start with a STRONG HOOK sentence (first line) that stops the scroll.
       - Use frequent line breaks.
       - Use bullet points if listing facts.
       - End with a specific, compelling "Engagement Question".
    4. MOMENTUM BRIDGES: For each slide (except the first), identify if it connects via "BUT" or "THEREFORE".
    5. IMAGE PROMPTS: Provide detailed, high-quality image prompts reflecting the style: "${style}".
    6. HOOK ANALYSIS: Provide a brief (1-sentence) explanation of why the first line will stop a scroll.

    Return ONLY a JSON object:
    {
      "slides": [
        { "slideNumber": 1, "text": "...", "imagePrompt": "...", "momentumBridge": "HOOK/BUT/THEREFORE" }
      ],
      "hashtags": ["tag1", ..., "tag15"],
      "hookAnalysis": "..."
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                slideNumber: { type: Type.NUMBER },
                text: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                momentumBridge: { type: Type.STRING, enum: ["HOOK", "BUT", "THEREFORE", "SO"] }
              },
              required: ["slideNumber", "text", "imagePrompt", "momentumBridge"]
            }
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          hookAnalysis: { type: Type.STRING }
        },
        required: ["slides", "hashtags", "hookAnalysis"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateSlideImage = async (prompt: string, style: VisualStyle, aspectRatio: AspectRatio, quality: ImageQuality): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const model = quality === ImageQuality.ULTRA ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const stylePrefix = {
    [VisualStyle.NEWS]: "Photojournalism, sharp focus, vibrant, realistic, 8k resolution, documentary style. ",
    [VisualStyle.CINEMATIC]: "Cinematic movie scene, anamorphic lighting, moody atmosphere, highly detailed, film grain. ",
    [VisualStyle.MINIMALIST]: "Minimalist aesthetic, soft natural lighting, white space, clean composition, muted colors. "
  }[style];

  const fullPrompt = `${stylePrefix} Subject: ${prompt}. High quality, professional photography.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [{ text: fullPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: quality === ImageQuality.ULTRA ? "2K" : undefined
      }
    }
  });

  let imageUrl = '';
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  if (!imageUrl) throw new Error("Image generation failed");
  return imageUrl;
};
