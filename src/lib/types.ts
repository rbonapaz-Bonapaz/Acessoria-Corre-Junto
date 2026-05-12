
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

export interface IntegrationData {
  connected: boolean;
  lastSync?: string;
  username?: string;
  autoSync: boolean;
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
  integrations?: {
    strava: IntegrationData;
    coros: IntegrationData;
  };
}

export interface Workout {
  id: string;
  type: string;
  title: string;
  description: string;
  distance?: string;
  duration?: string;
  paceZone?: string;
  completed: boolean;
  feedback?: string;
}

export interface WeeklySchedule {
  weekNumber: number;
  focus: string;
  workouts: Workout[];
}

export interface TrainingPlan {
  id: string;
  profileId: string;
  createdAt: string;
  blockType: string;
  weeklySchedule: WeeklySchedule[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface FeedbackLogItem {
  id: string;
  date: string;
  workoutId: string;
  perceivedEffort: number;
  notes: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface PersonalRecord {
  id: string;
  distance: string;
  time: string;
  date: string;
}
