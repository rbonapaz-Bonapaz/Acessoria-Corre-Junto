
export type ExperienceLevel = 'run_walk' | 'beginner' | 'intermediate' | 'advanced';
export type PlanGenerationType = 'full' | 'blocks';
export type Gender = 'male' | 'female' | 'other';

export interface DietPreferences {
  aestheticGoal?: 'cutting' | 'bulking' | 'recomp' | 'performance';
  trainingTiming?: 'jejum' | 'manha' | 'meio-dia' | 'tarde' | 'noite';
  mealCount?: number;
  supplements?: string;
  allergies?: string;
  preferredFoods?: string;
  excludedFoods?: string;
}

export interface StrengthPreferences {
  splitPreference?: 'full_body' | 'upper_lower' | 'ppl';
  frequency?: number;
  equipment?: string[];
  focusAreas?: string[];
  legDay?: string;
  limitations?: string;
  prBench?: number;
  prSquat?: number;
  prDeadlift?: number;
}

export interface AthleteProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
  birthDate: string;
  gender: Gender;
  currentWeight: number;
  height: number;
  restingHr: number;
  vo2Max: number;
  thresholdPace: string;
  thresholdHr: number;
  raceName?: string;
  raceDistance: string;
  raceDate: string;
  raceGoal?: string;
  trainingDays: string[];
  longRunDay: string;
  planGenerationType: PlanGenerationType;
  experienceLevel: ExperienceLevel;
  trainingHistory: string;
  dietPreferences?: DietPreferences;
  strengthPreferences?: StrengthPreferences;
}
