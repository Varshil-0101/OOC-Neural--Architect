
import { GoogleGenAI, Modality, GenerateContentResponse, Type, LiveServerMessage } from "@google/genai";
import { Course, Note, Task, Insight } from "../types";

const getTuningConfig = () => ({
  modelId: localStorage.getItem('gemini_custom_model_id') || 'gemini-3-flash-preview',
  systemInstruction: localStorage.getItem('gemini_custom_instruction') || '',
  useCustom: localStorage.getItem('use_gemini_tuning') === 'true'
});

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Helper Functions as per guidelines
export const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const encodeAudio = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const geminiService = {
  getBrainInsights: async (notes: Note[], tasks: Task[]): Promise<Insight[]> => {
    const ai = getAI();
    const context = `
      Notes: ${notes.map(n => n.title + " (Last seen: " + new Date(n.updatedAt).toLocaleDateString() + ")").join(', ')}
      Active Tasks: ${tasks.filter(t => !t.completed).map(t => t.title + " (Due: " + t.dueDate + ")").join(', ')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this student data, identify the 3 most critical "Forgotten Topics" or "Overloaded Deadlines". Return ONLY a JSON array of objects with keys: id, type (FORGOTTEN, OVERLOAD, RECOMMENDATION), title, description, actionLabel.\n\nDATA:\n${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              actionLabel: { type: Type.STRING }
            },
            propertyOrdering: ["id", "type", "title", "description", "actionLabel"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch {
      return [];
    }
  },

  generatePracticeQuestions: async (note: Note): Promise<string> => {
    const ai = getAI();
    const prompt = `Generate 5 challenging practice questions based on this note content:\n\nTitle: ${note.title}\nContent: ${note.content}\n\nInclude answers at the bottom.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Failed to synthesize questions.";
  },

  // Fix: Added missing 'chat' method for synchronous AI interaction in components like AIChat
  chat: async (course: Course | null, notes: Note[], message: string): Promise<string> => {
    const ai = getAI();
    const config = getTuningConfig();
    const context = notes.map(n => `[Source: ${n.title}]\n${n.content}`).join('\n\n');

    const systemInstruction = `
      You are the Neural Architect. Help the user study using their notes.
      DATA: ${context}
      Cite sources like [Source: Title]. Be academic, precise, and encouraging.
    `;

    const response = await ai.models.generateContent({
      model: config.useCustom ? config.modelId : 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction }
    });

    return response.text || "No response content generated.";
  },

  chatStream: async function* (course: Course | null, notes: Note[], message: string) {
    const ai = getAI();
    const config = getTuningConfig();
    const context = notes.map(n => `[Source: ${n.title}]\n${n.content}`).join('\n\n');

    const systemInstruction = `
      You are the Neural Architect. Help the user study using their notes.
      DATA: ${context}
      Cite sources like [Source: Title]. Be academic, precise, and encouraging.
    `;

    const responseStream = await ai.models.generateContentStream({
      model: config.useCustom ? config.modelId : 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction }
    });

    for await (const chunk of responseStream) {
      yield (chunk as GenerateContentResponse).text || "";
    }
  },

  // Fix: Explicitly defined required callbacks to satisfy the SDK's 'LiveCallbacks' interface
  connectLive: async (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
  }, systemInstruction: string) => {
    const ai = getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction,
      },
    });
  },

  speakText: async (text: string): Promise<void> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const buffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }
};
