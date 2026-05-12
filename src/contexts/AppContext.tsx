
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import type { AthleteProfile, TrainingPlan, Workout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateTrainingBlock } from '@/ai/flows/generate-training-block';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

type PlanGenerationStatus = 'idle' | 'pending' | 'success' | 'error';

const STRAVA_OFFICIAL_CONFIG = {
  clientId: "202859",
  clientSecret: "7b421fb5979780cb527dcbd9da8509c5d796f5dc",
  accessToken: "a95830ee1a54f9c5adb34d63037565dde1599f2f",
  refreshToken: "6fb60eb1a148933d463c68627542e570d987acb6"
};

interface AppContextType {
  isHydrated: boolean;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  profiles: AthleteProfile[];
  activeProfile: AthleteProfile | null;
  switchProfile: (profileId: string | null) => void;
  saveProfile: (profile: Omit<AthleteProfile, 'id'> & { id?: string }) => AthleteProfile;
  deleteProfile: (profileId: string) => void;
  trainingPlan: TrainingPlan | null;
  setTrainingPlan: (plan: TrainingPlan | null) => void;
  updateWorkout: (workoutId: string, updates: Partial<Workout>) => void;
  deleteTrainingPlan: (keepCompleted: boolean) => void;
  planGenerationStatus: PlanGenerationStatus;
  setPlanGenerationStatus: (status: PlanGenerationStatus) => void;
  generateRunningPlanAsync: (profile: AthleteProfile) => Promise<void>;
  exportData: () => void;
  importData: (jsonData: string) => void;
  toggleIntegration: (service: 'strava' | 'coros', connected: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'correJunto_local_data_v3';

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isHydrated, setIsHydrated] = useState(false);
  const [apiKey, setApiKeyInternal] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<AthleteProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Record<string, any>>({});
  const [planGenerationStatus, setPlanGenerationStatus] = useState<PlanGenerationStatus>('idle');
  
  const isSyncingFromCloud = useRef(false);

  // Carrega dados locais no início (Apenas no Cliente)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setApiKeyInternal(parsed.apiKey || null);
        setProfiles(parsed.profiles || []);
        setActiveProfileId(parsed.activeProfileId || null);
        setProfileData(parsed.profileData || {});
      } catch (e) {
        console.error('Erro ao carregar dados locais:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Sincronização em tempo real com Firestore
  useEffect(() => {
    if (user && db && isHydrated) {
      const userDocRef = doc(db, 'user_data', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          isSyncingFromCloud.current = true;
          
          setApiKeyInternal(cloudData.apiKey || null);
          setProfiles(cloudData.profiles || []);
          setActiveProfileId(cloudData.activeProfileId || null);
          setProfileData(cloudData.profileData || {});
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
          
          setTimeout(() => { isSyncingFromCloud.current = false; }, 100);
        } else {
          // Upload inicial se a nuvem estiver vazia
          const currentLocal = { apiKey, profiles, activeProfileId, profileData };
          setDoc(userDocRef, currentLocal, { merge: true });
        }
      });
      return () => unsubscribe();
    }
  }, [user, db, isHydrated, apiKey, profiles, activeProfileId, profileData]);

  const persist = useCallback(async (newApiKey: string | null, newProfiles: AthleteProfile[], newActiveId: string | null, newData: Record<string, any>) => {
    const fullState = { apiKey: newApiKey, profiles: newProfiles, activeProfileId: newActiveId, profileData: newData };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));

    if (user && db && !isSyncingFromCloud.current) {
      const userDocRef = doc(db, 'user_data', user.uid);
      try {
        await setDoc(userDocRef, fullState, { merge: true });
      } catch (e) {
        console.error("Erro Sync Cloud:", e);
      }
    }
  }, [user, db]);

  const setApiKey = (key: string | null) => {
    setApiKeyInternal(key);
    persist(key, profiles, activeProfileId, profileData);
  };

  const switchProfile = (id: string | null) => {
    setActiveProfileId(id);
    persist(apiKey, profiles, id, profileData);
  };

  const saveProfile = (data: any) => {
    const id = data.id || crypto.randomUUID();
    const newProfile = { 
        ...data, 
        id,
        integrations: data.integrations || {
            strava: { connected: false, autoSync: false, ...STRAVA_OFFICIAL_CONFIG },
            coros: { connected: false, autoSync: false }
        }
    };
    
    const updatedProfiles = [newProfile, ...profiles.filter(p => p.id !== id)];
    setProfiles(updatedProfiles);
    setActiveProfileId(id);
    persist(apiKey, updatedProfiles, id, profileData);
    
    toast({ title: '✅ Perfil Salvo!', description: 'Sincronizado na nuvem.' });
    return newProfile;
  };

  const updateWorkout = (workoutId: string, updates: Partial<Workout>) => {
    if (!activeProfileId || !profileData[activeProfileId]?.trainingPlan) return;
    
    const newWeeklyPlans = profileData[activeProfileId].trainingPlan.weeklyPlans.map((week: any) => ({
      ...week,
      runs: week.runs.map((run: any) => run.id === workoutId ? { ...run, ...updates } : run)
    }));

    const newProfileData = {
      ...profileData,
      [activeProfileId]: {
        ...profileData[activeProfileId],
        trainingPlan: { ...profileData[activeProfileId].trainingPlan, weeklyPlans: newWeeklyPlans }
      }
    };

    setProfileData(newProfileData);
    persist(apiKey, profiles, activeProfileId, newProfileData);
  };

  const setTrainingPlan = (plan: TrainingPlan | null) => {
    if (!activeProfileId) return;
    const newProfileData = {
      ...profileData,
      [activeProfileId]: { ...profileData[activeProfileId], trainingPlan: plan }
    };
    setProfileData(newProfileData);
    persist(apiKey, profiles, activeProfileId, newProfileData);
  };

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    if (!apiKey) {
      toast({ variant: "destructive", title: "IA Desativada", description: "Configure sua API Key no menu lateral." });
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

      setTrainingPlan(result);
      setPlanGenerationStatus('success');
      toast({ title: "✅ Ciclo IA Pronto!", description: "Sua planilha foi gerada com sucesso." });
    } catch (error: any) {
      setPlanGenerationStatus('error');
      toast({ variant: "destructive", title: "Erro no Motor IA", description: error.message || "Verifique sua chave." });
    }
  };

  const toggleIntegration = (service: 'strava' | 'coros', connected: boolean) => {
    const current = profiles.find(p => p.id === activeProfileId);
    if (!current) return;

    const updated = {
        ...current,
        integrations: {
            ...current.integrations,
            [service]: { 
                ...(current.integrations?.[service] || {}),
                connected, 
                autoSync: connected, 
                ...(service === 'strava' ? STRAVA_OFFICIAL_CONFIG : {})
            }
        }
    };
    saveProfile(updated);
  };

  return (
    <AppContext.Provider value={{
      isHydrated,
      apiKey,
      setApiKey,
      profiles,
      activeProfile: profiles.find(p => p.id === activeProfileId) || null,
      switchProfile,
      saveProfile,
      deleteProfile: (id: string) => {
        const updated = profiles.filter(p => p.id !== id);
        setProfiles(updated);
        persist(apiKey, updated, null, profileData);
      },
      trainingPlan: activeProfileId ? profileData[activeProfileId]?.trainingPlan || null : null,
      setTrainingPlan,
      updateWorkout,
      deleteTrainingPlan: () => setTrainingPlan(null),
      planGenerationStatus,
      setPlanGenerationStatus,
      generateRunningPlanAsync,
      exportData: () => {
        const data = JSON.stringify({ apiKey, profiles, activeProfileId, profileData });
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const a = document.createElement('a'); a.href = url; a.download = `backup_correJunto.json`; a.click();
      },
      importData: (json: string) => {
        const p = JSON.parse(json);
        setApiKeyInternal(p.apiKey); setProfiles(p.profiles); setActiveProfileId(p.activeProfileId); setProfileData(p.profileData);
        persist(p.apiKey, p.profiles, p.activeProfileId, p.profileData);
      },
      toggleIntegration
    }}>
      {children}
    </AppContext.Provider>
  );
}
