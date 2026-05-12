
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
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

const STORAGE_KEY = 'correJunto_local_data_v2';

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

  // 1. Carregamento Inicial (Local Storage) - Fallback
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

  // 2. Sincronização em Tempo Real com Firestore (Nuvem)
  useEffect(() => {
    if (user && db) {
      const userDocRef = doc(db, 'user_data', user.uid);
      
      // Escuta mudanças no Firestore e atualiza o estado local instantaneamente
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setApiKeyInternal(data.apiKey || null);
          setProfiles(data.profiles || []);
          setActiveProfileId(data.activeProfileId || null);
          setProfileData(data.profileData || {});
          
          // Mantém o localStorage atualizado como cache offline
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      });
      
      return () => unsubscribe();
    }
  }, [user, db]);

  // 3. Persistência de Alterações (Escrita para Local + Firestore)
  const persistChanges = useCallback(async (newData: any) => {
    // Sempre atualiza o local para resposta imediata da UI
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

    // Se estiver logado, sincroniza com a nuvem
    if (user && db) {
      const userDocRef = doc(db, 'user_data', user.uid);
      await setDoc(userDocRef, newData, { merge: true });
    }
  }, [user, db]);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === activeProfileId) || null
  , [profiles, activeProfileId]);

  const currentProfileData = useMemo(() => 
    activeProfileId ? (profileData[activeProfileId] || {}) : {}
  , [activeProfileId, profileData]);

  const setApiKey = useCallback((key: string | null) => {
    setApiKeyInternal(key);
    persistChanges({ apiKey: key, profiles, activeProfileId, profileData });
  }, [profiles, activeProfileId, profileData, persistChanges]);

  const saveProfile = useCallback((data: any) => {
    const id = data.id || crypto.randomUUID();
    const newProfile = { 
        ...data, 
        id,
        integrations: data.integrations || activeProfile?.integrations || {
            strava: { connected: false, autoSync: false, ...STRAVA_OFFICIAL_CONFIG },
            coros: { connected: false, autoSync: false }
        }
    };
    
    const updatedProfiles = [newProfile, ...profiles.filter(p => p.id !== id)];
    setProfiles(updatedProfiles);
    setActiveProfileId(id);

    persistChanges({ 
      apiKey, 
      profiles: updatedProfiles, 
      activeProfileId: id, 
      profileData 
    });

    toast({ title: '✅ Perfil Salvo!', description: 'Dados sincronizados entre seus dispositivos.' });
    return newProfile;
  }, [activeProfile, profiles, apiKey, profileData, persistChanges, toast]);

  const updateWorkout = useCallback((workoutId: string, updates: Partial<Workout>) => {
    if (!activeProfileId || !currentProfileData.trainingPlan) return;
    
    const newWeeklyPlans = currentProfileData.trainingPlan.weeklyPlans.map((week: any) => ({
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
    persistChanges({ apiKey, profiles, activeProfileId, profileData: newProfileData });
  }, [activeProfileId, currentProfileData, profileData, apiKey, profiles, persistChanges]);

  const setTrainingPlan = useCallback((plan: TrainingPlan | null) => {
    if (!activeProfileId) return;
    const newProfileData = {
      ...profileData,
      [activeProfileId]: { ...profileData[activeProfileId], trainingPlan: plan }
    };
    setProfileData(newProfileData);
    persistChanges({ apiKey, profiles, activeProfileId, profileData: newProfileData });
  }, [activeProfileId, profileData, apiKey, profiles, persistChanges]);

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    if (!apiKey) {
      toast({ variant: "destructive", title: "IA Desativada", description: "Configure sua Gemini API Key no menu lateral." });
      return;
    }

    setPlanGenerationStatus('pending');
    try {
      const result = await generateTrainingBlock({
        apiKey: apiKey,
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
        weeklyMileageGoal: 60,
        targetRaceDistance: profile.raceDistance,
        targetPace: profile.targetPace,
        targetTime: profile.targetTime,
        currentLongRunDistance: 15,
        weeklyAvailability: profile.trainingDays.join(', '),
        injuryHistory: 'Nenhuma reportada',
        preferredWorkoutDays: profile.trainingDays.slice(0, 2).join(', '),
        legDay: profile.strengthPreferences?.legDay
      });

      // Garantir IDs únicos para os treinos
      result.weeklyPlans.forEach(week => {
        week.runs.forEach(run => {
          if (!run.id) run.id = crypto.randomUUID();
        });
      });

      setTrainingPlan(result);
      setPlanGenerationStatus('success');
      toast({ title: "✅ Ciclo IA Concluído!", description: "Sua planilha periodizada está pronta." });
    } catch (error) {
      setPlanGenerationStatus('error');
      console.error('IA Error:', error);
      toast({ variant: "destructive", title: "Erro na IA", description: "O motor falhou. Verifique sua chave de API." });
    }
  };

  const toggleIntegration = (service: 'strava' | 'coros', connected: boolean) => {
    if (!activeProfile) return;

    const updatedProfile = {
        ...activeProfile,
        integrations: {
            ...activeProfile.integrations,
            [service]: { 
                ...(activeProfile.integrations?.[service] || {}),
                connected, 
                autoSync: connected, 
                lastSync: connected ? new Date().toISOString() : undefined,
                ...(service === 'strava' ? STRAVA_OFFICIAL_CONFIG : {})
            }
        }
    };
    
    saveProfile(updatedProfile);
  };

  const exportData = () => {
    const data = JSON.stringify({ apiKey, profiles, activeProfileId, profileData });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `correJunto_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast({ title: '📥 Backup Exportado', description: 'Arquivo JSON salvo.' });
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      setApiKeyInternal(parsed.apiKey || null);
      setProfiles(parsed.profiles);
      setActiveProfileId(parsed.activeProfileId);
      setProfileData(parsed.profileData);
      persistChanges(parsed);
      toast({ title: '📤 Importação Concluída', description: 'Dados restaurados e sincronizados.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro na Importação', description: 'Arquivo inválido.' });
    }
  };

  return (
    <AppContext.Provider value={{
      isHydrated,
      apiKey,
      setApiKey,
      profiles,
      activeProfile,
      switchProfile: (id: string | null) => {
        setActiveProfileId(id);
        persistChanges({ apiKey, profiles, activeProfileId: id, profileData });
      },
      saveProfile,
      deleteProfile: (id: string) => {
        const updated = profiles.filter(p => p.id !== id);
        setProfiles(updated);
        persistChanges({ apiKey, profiles: updated, activeProfileId, profileData });
      },
      trainingPlan: currentProfileData.trainingPlan || null,
      setTrainingPlan,
      updateWorkout,
      deleteTrainingPlan: (keepCompleted: boolean) => {
        setTrainingPlan(null);
      },
      planGenerationStatus,
      setPlanGenerationStatus,
      generateRunningPlanAsync,
      exportData,
      importData,
      toggleIntegration
    }}>
      {children}
    </AppContext.Provider>
  );
}
