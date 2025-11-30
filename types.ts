export interface Language {
  code: string;
  name: string;
  flag: string;
  ttsVoiceName?: string; 
}

export interface BroadcastSegment {
  id: string;
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface StudentQuestion {
  id: string;
  originalText: string;
  translatedText: string;
  studentName: string; // Anonymous or generated
  language: string;
  timestamp: number;
}

export enum AppState {
  HOME = 'HOME',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸', ttsVoiceName: 'Puck' },
  { code: 'fr', name: 'French', flag: '🇫🇷', ttsVoiceName: 'Charon' },
  { code: 'de', name: 'German', flag: '🇩🇪', ttsVoiceName: 'Kore' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', ttsVoiceName: 'Fenrir' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', ttsVoiceName: 'Zephyr' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', ttsVoiceName: 'Puck' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', ttsVoiceName: 'Kore' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', ttsVoiceName: 'Zephyr' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', ttsVoiceName: 'Zephyr' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', ttsVoiceName: 'Charon' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', ttsVoiceName: 'Puck' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', ttsVoiceName: 'Fenrir' },
];