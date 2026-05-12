
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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

const STORAGE_KEY = 'correJunto_local_data_v5';

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
  const firstCloudSyncDone = useRef(false);

  // 1. Carregamento inicial do LocalStorage (Sempre ocorre primeiro)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey) setApiKeyInternal(parsed.apiKey);
        if (parsed.profiles) setProfiles(parsed.profiles);
        if (parsed.activeProfileId) setActiveProfileId(parsed.activeProfileId);
        if (parsed.profileData) setProfileData(parsed.profileData);
      } catch (e) {
        console.error('Erro ao restaurar dados locais:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // 2. Sincronização de ENTRADA (Nuvem -> App)
  useEffect(() => {
    if (!user || !db || !isHydrated) return;

    const userDocRef = doc(db, 'user_data', user.uid);
    
    // Listener em tempo real para mudanças na nuvem
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        
        // Ativa flag para evitar que o efeito de saída dispare de volta e crie loop
        isSyncingFromCloud.current = true;
        
        // Se houver perfis na nuvem, eles são a verdade absoluta para o usuário logado
        if (cloudData.profiles) {
          setProfiles(cloudData.profiles);
        }
        if (cloudData.apiKey) {
          setApiKeyInternal(cloudData.apiKey);
        }
        if (cloudData.activeProfileId !== undefined) {
          setActiveProfileId(cloudData.activeProfileId);
        }
        if (cloudData.profileData) {
          setProfileData(cloudData.profileData);
        }
        
        // Atualiza o cache local com o que veio da nuvem
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
        
        // Marca que o primeiro download foi feito com sucesso
        firstCloudSyncDone.current = true;
        
        // Pequeno atraso para liberar a flag de sync e permitir novas gravações
        setTimeout(() => { 
          isSyncingFromCloud.current = false; 
        }, 1000);
      } else {
        // Se o documento não existe na nuvem ainda, marcamos como sincronizado
        // para permitir que o primeiro upload aconteça
        firstCloudSyncDone.current = true;
      }
    });

    return () => unsubscribe();
  }, [user, db, isHydrated]);

  // 3. Sincronização de SAÍDA (App -> Nuvem + LocalStorage)
  useEffect(() => {
    // Só sincroniza para fora se:
    // 1. O app estiver hidratado
    // 2. Não estivermos no meio de um processo de recebimento da nuvem
    // 3. Já tivermos tentado baixar os dados da nuvem pelo menos uma vez (para não apagar o que já existe lá)
    if (!isHydrated || isSyncingFromCloud.current) return;

    const fullState = { 
      apiKey, 
      profiles, 
      activeProfileId, 
      profileData, 
      updatedAt: new Date().toISOString() 
    };
    
    // Salva sempre no LocalStorage para garantir persistência offline
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));

    // Só sobe para o Firebase se o usuário estiver logado e o sync inicial de entrada terminou
    if (user && db && firstCloudSyncDone.current) {
      const timeoutId = setTimeout(async () => {
        const userDocRef = doc(db, 'user_data', user.uid);
        try {
          // Usamos setDoc com merge para garantir persistência total
          await setDoc(userDocRef, fullState, { merge: true });
        } catch (e) {
          console.error("Erro ao sincronizar com Firestore:", e);
        }
      }, 2000); // Debounce de 2 segundos para não sobrecarregar a rede

      return () => clearTimeout(timeoutId);
    }
  }, [apiKey, profiles, activeProfileId, profileData, user, db, isHydrated]);

  const setApiKey = (key: string | null) => setApiKeyInternal(key);

  const switchProfile = (id: string | null) => setActiveProfileId(id);

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
    
    // Atualiza a lista de perfis mantendo a ordem (mais recente primeiro)
    const updatedProfiles = [newProfile, ...profiles.filter(p => p.id !== id)];
    setProfiles(updatedProfiles);
    setActiveProfileId(id);
    
    toast({ 
      title: `✅ Perfil ${newProfile.name} Salvo`, 
      description: 'Sincronizando com seus outros dispositivos...' 
    });
    
    return newProfile;
  };

  const updateWorkout = (workoutId: string, updates: Partial<Workout>) => {
    if (!activeProfileId || !profileData[activeProfileId]?.trainingPlan) return;
    
    const currentPlan = profileData[activeProfileId].trainingPlan;
    const newWeeklyPlans = currentPlan.weeklyPlans.map((week: any) => ({
      ...week,
      runs: week.runs.map((run: any) => run.id === workoutId ? { ...run, ...updates } : run)
    }));

    setProfileData({
      ...profileData,
      [activeProfileId]: {
        ...profileData[activeProfileId],
        trainingPlan: { ...currentPlan, weeklyPlans: newWeeklyPlans }
      }
    });
  };

  const setTrainingPlan = (plan: TrainingPlan | null) => {
    if (!activeProfileId) return;
    setProfileData({
      ...profileData,
      [activeProfileId]: { ...profileData[activeProfileId], trainingPlan: plan }
    });
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

      // Garantir IDs únicos para cada treino para evitar problemas de key no React
      result.weeklyPlans.forEach(week => {
        week.runs.forEach(run => { if (!run.id) run.id = crypto.randomUUID(); });
      });

      setTrainingPlan(result);
      setPlanGenerationStatus('success');
      toast({ title: "✅ Ciclo Gerado", description: "Disponível em todos os seus aparelhos." });
    } catch (error: any) {
      setPlanGenerationStatus('error');
      toast({ variant: "destructive", title: "Falha na IA", description: error.message || "Verifique sua chave de API." });
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
        setProfiles(prev => prev.filter(p => p.id !== id));
        if (activeProfileId === id) setActiveProfileId(null);
        toast({ title: 'Perfil removido' });
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
        const a = document.createElement('a'); a.href = url; a.download = `correJunto_backup.json`; a.click();
      },
      importData: (json: string) => {
        try {
            const p = JSON.parse(json);
            if (p.apiKey) setApiKeyInternal(p.apiKey);
            if (p.profiles) setProfiles(p.profiles);
            if (p.activeProfileId) setActiveProfileId(p.activeProfileId);
            if (p.profileData) setProfileData(p.profileData);
            toast({ title: 'Importação Concluída' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erro ao importar' });
        }
      },
      toggleIntegration
    }}>
      {children}
    </AppContext.Provider>
  );
}
