'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import type { AthleteProfile, TrainingPlan, Workout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateTrainingBlock } from '@/ai/flows/generate-training-block';

type PlanGenerationStatus = 'idle' | 'pending' | 'success' | 'error';

interface AppContextType {
  isHydrated: boolean;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  profiles: AthleteProfile[];
  activeProfile: AthleteProfile | null;
  switchProfile: (profileId: string | null) => void;
  saveProfile: (profile: Partial<AthleteProfile>) => Promise<AthleteProfile>;
  deleteProfile: (profileId: string) => Promise<void>;
  trainingPlan: TrainingPlan | null;
  updateWorkout: (workoutId: string, updates: Partial<Workout>) => void;
  planGenerationStatus: PlanGenerationStatus;
  generateRunningPlanAsync: (profile: AthleteProfile) => Promise<void>;
  exportData: () => void;
  importData: (jsonData: string) => void;
  toggleIntegration: (service: 'strava' | 'coros', connected: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_PROFILES = 'corre_junto_profiles';
const STORAGE_KEY_API_KEY = 'corre_junto_api_key';
const STORAGE_KEY_ACTIVE_ID = 'corre_junto_active_id';

export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isHydrated, setIsHydrated] = useState(false);
  const [apiKey, setApiKeyInternal] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<AthleteProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [planGenerationStatus, setPlanGenerationStatus] = useState<PlanGenerationStatus>('idle');

  // Carregamento inicial (Local-First)
  useEffect(() => {
    const savedProfiles = localStorage.getItem(STORAGE_KEY_PROFILES);
    const savedApiKey = localStorage.getItem(STORAGE_KEY_API_KEY);
    const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);

    if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
    if (savedApiKey) setApiKeyInternal(savedApiKey);
    if (savedActiveId) setActiveProfileId(savedActiveId);

    setIsHydrated(true);
  }, []);

  // Persistência automática
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
      if (apiKey) localStorage.setItem(STORAGE_KEY_API_KEY, apiKey);
      if (activeProfileId) localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeProfileId);
    }
  }, [profiles, apiKey, activeProfileId, isHydrated]);

  const setApiKey = (key: string | null) => setApiKeyInternal(key);

  const switchProfile = (id: string | null) => setActiveProfileId(id);

  const saveProfile = async (data: Partial<AthleteProfile>) => {
    const id = data.id || crypto.randomUUID();
    const newProfile = {
      ...data,
      id,
      ownerUid: 'local-user', // No modo local, o UID é fixo
    } as AthleteProfile;

    setProfiles(prev => {
      const exists = prev.find(p => p.id === id);
      if (exists) {
        return prev.map(p => p.id === id ? { ...p, ...newProfile } : p);
      }
      return [...prev, newProfile];
    });

    return newProfile;
  };

  const deleteProfile = async (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) setActiveProfileId(null);
    toast({ title: "Atleta removido localmente" });
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const updateWorkout = (workoutId: string, updates: Partial<Workout>) => {
    if (!activeProfile) return;
    
    const currentPlan = activeProfile.trainingPlan;
    if (!currentPlan) return;

    const newWeeklyPlans = currentPlan.weeklyPlans.map((week) => ({
      ...week,
      runs: week.runs.map((run) => run.id === workoutId ? { ...run, ...updates } : run)
    }));

    const updatedProfile = {
      ...activeProfile,
      trainingPlan: { ...currentPlan, weeklyPlans: newWeeklyPlans }
    };

    saveProfile(updatedProfile);
  };

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    if (!apiKey || apiKey.trim() === "") {
      toast({ variant: "destructive", title: "Configuração Pendente", description: "Insira sua Gemini API Key no menu lateral." });
      return;
    }

    setPlanGenerationStatus('pending');
    try {
      const result = await generateTrainingBlock({
        apiKey,
        raceName: profile.raceName,
        currentVDOT: profile.vo2Max,
        hrZone1End: Math.round(profile.thresholdHr * 0.8),
        hrZone2End: Math.round(profile.thresholdHr * 0.9),
        hrZone3End: Math.round(profile.thresholdHr * 0.95),
        hrZone4End: profile.thresholdHr,
        hrMax: profile.thresholdHr + 20,
        trainingBlockType: 'Construction',
        planGenerationType: profile.planGenerationType,
        raceDate: profile.raceDate,
        weeklyMileageGoal: profile.experienceLevel === 'beginner' ? 30 : profile.experienceLevel === 'intermediate' ? 50 : 80,
        targetRaceDistance: profile.raceDistance,
        targetPace: profile.targetPace,
        targetTime: profile.targetTime,
        currentLongRunDistance: 10,
        weeklyAvailability: profile.trainingDays.join(', '),
        injuryHistory: 'Nenhuma reportada',
        preferredWorkoutDays: profile.trainingDays.slice(0, 2).join(', '),
        legDay: profile.strengthPreferences?.legDay
      });

      result.weeklyPlans.forEach(week => {
        week.runs.forEach(run => { if (!run.id) run.id = crypto.randomUUID(); });
      });

      const updatedProfile = { ...profile, trainingPlan: result };
      await saveProfile(updatedProfile);
      
      setPlanGenerationStatus('success');
      toast({ title: "Ciclo Calibrado!", description: "Os novos treinos já estão disponíveis localmente." });
    } catch (error: any) {
      setPlanGenerationStatus('error');
      toast({ variant: "destructive", title: "Erro no Motor de IA", description: error.message });
    }
  };

  return (
    <AppContext.Provider value={{
      isHydrated, apiKey, setApiKey, profiles,
      activeProfile,
      switchProfile, saveProfile, deleteProfile,
      trainingPlan: activeProfile?.trainingPlan || null,
      updateWorkout,
      planGenerationStatus,
      generateRunningPlanAsync,
      exportData: () => {
        const data = JSON.stringify({ profiles, apiKey });
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const a = document.createElement('a'); a.href = url; a.download = `corre_junto_local_backup.json`; a.click();
      },
      importData: (json: string) => {
        try {
            const data = JSON.parse(json);
            if (data.profiles) setProfiles(data.profiles);
            if (data.apiKey) setApiKeyInternal(data.apiKey);
            toast({ title: 'Dados Importados com Sucesso' });
        } catch (e) { toast({ variant: 'destructive', title: 'Erro na importação' }); }
      },
      toggleIntegration: (service, connected) => {
        if (!activeProfile) return;
        saveProfile({ 
          ...activeProfile, 
          integrations: { 
            ...activeProfile.integrations, 
            [service]: { ...activeProfile.integrations?.[service], connected, autoSync: connected } 
          } 
        } as any);
      }
    }}>
      {children}
    </AppContext.Provider>
  );
}
