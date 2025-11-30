import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
// In a real app, strict error handling for missing API key should be here.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Translates text from English (assumed source) to target language.
 */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text.trim()) return "";
  
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Translate the following text into ${targetLanguage}. Return ONLY the translated text, no markdown, no explanations. Text to translate: "${text}"`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original
  }
};

/**
 * Translates student question to English.
 */
export const translateToEnglish = async (text: string, sourceLanguageName: string): Promise<string> => {
    if (!text.trim()) return "";
    try {
      const model = 'gemini-2.5-flash';
      const prompt = `Translate the following text from ${sourceLanguageName} to English. Return ONLY the translated text. Text: "${text}"`;
      
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      
      return response.text?.trim() || "";
    } catch (error) {
      console.error("Translation error:", error);
      return "[Translation Failed]"; 
    }
};

/**
 * Generates speech from text for a specific language.
 * Note: We use the TTS model. We attempt to select a voice, but the model is multilingual.
 */
export const generateSpeech = async (text: string, voiceName: string = 'Puck'): Promise<AudioBuffer | null> => {
  if (!text.trim()) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    // Decode audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext);
    return audioBuffer;

  } catch (error) {
    console.error("TTS error:", error);
    return null;
  }
};

// --- Audio Helper Functions (from Guidelines) ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
    // The Gemini API returns raw PCM or specific format? 
    // Actually the new TTS model usually returns a format that requires context decoding 
    // or standard decodeAudioData if it has headers. 
    // However, the Live API returns PCM. The generateContent TTS output usually has a container if not specified otherwise, 
    // but the guide implies we might need raw decoding or standard decoding.
    // Let's try standard decodeAudioData first as it supports various formats (WAV/MP3) if headers are present.
    // If it fails, we fallback to PCM.
    // NOTE: The example in the system prompt for TTS uses `decodeAudioData` with a custom implementation for PCM?
    // Wait, the prompt's TTS example uses:
    // `const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1);`
    // This implies it is raw PCM 24kHz mono.
    
    // Let's implement the PCM decoder as per the prompt's `decodeAudioData` signature just in case.
    
    const sampleRate = 24000;
    const numChannels = 1;
    
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert Int16 to Float32 [-1.0, 1.0]
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}
