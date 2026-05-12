
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
  objective?: 'strength' | 'hypertrophy' | 'performance' | 'endurance';
  frequency?: number;
  trainingDays?: string[];
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
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
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

export interface AiAnalysis {
  actualMetrics: {
    averagePace: string;
    averageCadence: string;
    strideRatio: number;
    groundContactTime?: string;
    verticalOscillation?: string;
  };
  analysisSummary: string;
  recommendations: string;
  areasOfImprovement: string[];
}

export interface Workout {
  id: string;
  day: string;
  date: string;
  type: string;
  distance: string;
  paceZone: string;
  description: string;
  objective?: string;
  phases: Array<{
    name: string;
    distance: string;
    pace?: string;
    duration?: string;
    description: string;
  }>;
  completed?: boolean;
  analysis?: AiAnalysis;
}

export interface WeeklyPlan {
  weekNumber: number;
  focus: string;
  runs: Workout[];
  strength: string;
  notes: string;
}

export interface TrainingPlan {
  blockType: string;
  durationWeeks: number;
  weeklyPlans: WeeklyPlan[];
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
