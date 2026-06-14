export interface User {
  id: string;
  name: string;
  cInvestRating: number | null;
  currentRating: number | null;
  rating: number | null;
  gradeName: string | null;
  gradeShort: string | null;
  investableProducts: string | null;
  surveyVector: number | null;
  dynamicVector: number | null;
  dissonance: number;
  cCurrentAffairs: string[];
  dailyDone: number;
  streakDays: number;
  mainBank: string | null;
}

export interface SurveyOption { label: string; stability: number }
export interface SurveyQuestion {
  id: number; order: number; title: string; helper: string; animation: string; options: SurveyOption[];
}

export interface Sector {
  id: number; slug: string; name: string; emoji: string;
  description: string; hotScore: number; returnRate: number; weight: number;
}

export interface Article {
  id: string; title: string; source: string; staFinNote: string;
  summary: string; content: string; isHot: boolean; publishedAt: string;
  required?: boolean;
  sector: { id: number; slug: string; name: string; emoji: string } | null;
}

export interface FinTip { id: string; name: string; summary: string; detail: string }

export interface Quest { done: number; total: number; streak: number; completed: boolean }

export interface Feed { quest: Quest; required: Article[]; fintip: FinTip | null; unlimited: Article[] }

export interface Popup {
  kind: "soft" | "hard"; title: string; message: string; suggestRating?: number;
}

export interface Propensity {
  surveyVector: number; dynamicVector: number; dissonance: number;
  baseRating: number; currentRating: number;
  baseGradeName: string; currentGradeName: string;
  gradeDelta: number; level: "normal" | "caution" | "alert";
  pipeline: string[]; trigger: boolean; popup: Popup | null;
  behaviorBias: number; dwellLevel: number;
  topAffairs: { slug: string; name: string; emoji: string; weight: number }[];
}

export interface Product {
  id: string; name: string; type: string; riskLevel: number;
  returnRate: number; popularity: number; description: string;
  sector: { slug: string; name: string; emoji: string }; eligible: boolean;
}

export interface CompItem { asset: string; percent: number; sectorSlug: string }
export interface Portfolio {
  id: string; name: string; tagline: string; description: string;
  stability: number; expectedReturn: number; riskGrade: number;
  composition: CompItem[]; backtest: { year: number; value: number }[];
}
