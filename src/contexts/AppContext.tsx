
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import type { AthleteProfile, TrainingPlan, Workout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateTrainingBlock } from '@/ai/flows/generate-training-block';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

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
  
  // Ref para evitar loops de atualização entre onSnapshot e persistChanges
  const isSyncingFromCloud = useRef(false);

  // 1. Hidratação inicial do LocalStorage
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

  // 2. Sincronização com Firestore
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
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            apiKey: cloudData.apiKey,
            profiles: cloudData.profiles,
            activeProfileId: cloudData.activeProfileId,
            profileData: cloudData.profileData
          }));
          
          setTimeout(() => {
            isSyncingFromCloud.current = false;
          }, 100);
        } else {
          // Se o documento na nuvem não existe mas temos dados locais, fazemos o upload inicial
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData) {
            const parsed = JSON.parse(localData);
            setDoc(userDocRef, parsed, { merge: true });
          }
        }
      });
      return () => unsubscribe();
    }
  }, [user, db, isHydrated]);

  // Função centralizada para persistir mudanças (Nuvem + Local)
  const persistChanges = useCallback(async (data: { 
    apiKey?: string | null, 
    profiles?: AthleteProfile[], 
    activeProfileId?: string | null, 
    profileData?: Record<string, any> 
  }) => {
    if (isSyncingFromCloud.current) return;

    // Obtém o estado mais atual para garantir persistência completa
    const currentData = {
      apiKey: data.apiKey !== undefined ? data.apiKey : apiKey,
      profiles: data.profiles !== undefined ? data.profiles : profiles,
      activeProfileId: data.activeProfileId !== undefined ? data.activeProfileId : activeProfileId,
      profileData: data.profileData !== undefined ? data.profileData : profileData
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

    if (user && db) {
      const userDocRef = doc(db, 'user_data', user.uid);
      try {
        await setDoc(userDocRef, currentData, { merge: true });
      } catch (error) {
        console.error("Erro ao sincronizar com o Firestore:", error);
      }
    }
  }, [user, db, apiKey, profiles, activeProfileId, profileData]);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === activeProfileId) || null
  , [profiles, activeProfileId]);

  const currentProfileData = useMemo(() => 
    activeProfileId ? (profileData[activeProfileId] || {}) : {}
  , [activeProfileId, profileData]);

  const setApiKey = useCallback((key: string | null) => {
    setApiKeyInternal(key);
    persistChanges({ apiKey: key });
  }, [persistChanges]);

  const switchProfile = useCallback((id: string | null) => {
    setActiveProfileId(id);
    persistChanges({ activeProfileId: id });
  }, [persistChanges]);

  const saveProfile = useCallback((data: any) => {
    const id = data.id || crypto.randomUUID();
    const newProfile = { 
        ...data, 
        id,
        integrations: data.integrations || {
            strava: { connected: false, autoSync: false, ...STRAVA_OFFICIAL_CONFIG },
            coros: { connected: false, autoSync: false }
        }
    };
    
    setProfiles(prev => {
      const updated = [newProfile, ...prev.filter(p => p.id !== id)];
      persistChanges({ profiles: updated, activeProfileId: id });
      return updated;
    });
    
    setActiveProfileId(id);
    toast({ title: '✅ Perfil Salvo!', description: 'Sincronizado em todos os seus dispositivos.' });
    return newProfile;
  }, [persistChanges, toast]);

  const updateWorkout = useCallback((workoutId: string, updates: Partial<Workout>) => {
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
    persistChanges({ profileData: newProfileData });
  }, [activeProfileId, profileData, persistChanges]);

  const setTrainingPlan = useCallback((plan: TrainingPlan | null) => {
    if (!activeProfileId) return;
    const newProfileData = {
      ...profileData,
      [activeProfileId]: { ...profileData[activeProfileId], trainingPlan: plan }
    };
    setProfileData(newProfileData);
    persistChanges({ profileData: newProfileData });
  }, [activeProfileId, profileData, persistChanges]);

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
        week.runs.forEach(run => {
          if (!run.id) run.id = crypto.randomUUID();
        });
      });

      setTrainingPlan(result);
      setPlanGenerationStatus('success');
      toast({ title: "✅ Ciclo IA Concluído!", description: "Sua planilha está pronta e sincronizada." });
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
      switchProfile,
      saveProfile,
      deleteProfile: (id: string) => {
        setProfiles(prev => {
          const updated = prev.filter(p => p.id !== id);
          persistChanges({ profiles: updated, activeProfileId: null });
          return updated;
        });
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
