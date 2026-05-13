
'use client';

import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import type { AthleteProfile, TrainingPlan, Workout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateTrainingBlock } from '@/ai/flows/generate-training-block';
import { useUser, useFirestore } from '@/firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';

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

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isHydrated, setIsHydrated] = useState(false);
  const [apiKey, setApiKeyInternal] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<AthleteProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [planGenerationStatus, setPlanGenerationStatus] = useState<PlanGenerationStatus>('idle');
  
  // 1. Carregamento de Configurações do Usuário (API Key, etc)
  useEffect(() => {
    if (!user || !db) {
      setIsHydrated(true);
      return;
    }

    const userDocRef = doc(db, 'user_data', user.uid);
    return onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setApiKeyInternal(data.apiKey || null);
      }
      setIsHydrated(true);
    });
  }, [user, db]);

  // 2. Carregamento de Atletas (Onde sou dono OU e-mail vinculado)
  useEffect(() => {
    if (!user || !db) {
      setProfiles([]);
      return;
    }

    const trainerQuery = query(collection(db, 'athletes'), where('ownerUid', '==', user.uid));
    const unsubscribeTrainer = onSnapshot(trainerQuery, (snapshot) => {
      const trainerProfiles = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AthleteProfile));
      
      const athleteQuery = query(collection(db, 'athletes'), where('athleteEmail', '==', user.email));
      onSnapshot(athleteQuery, (athleteSnapshot) => {
        const athleteProfiles = athleteSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AthleteProfile));
        
        const allProfilesMap = new Map();
        [...trainerProfiles, ...athleteProfiles].forEach(p => allProfilesMap.set(p.id, p));
        setProfiles(Array.from(allProfilesMap.values()));
      });
    });

    return () => unsubscribeTrainer();
  }, [user, db]);

  const setApiKey = async (key: string | null) => {
    setApiKeyInternal(key);
    if (user && db) {
      await setDoc(doc(db, 'user_data', user.uid), { apiKey: key }, { merge: true });
    }
  };

  const switchProfile = (id: string | null) => setActiveProfileId(id);

  const saveProfile = async (data: Partial<AthleteProfile>) => {
    if (!user || !db) throw new Error("Usuário não autenticado");
    
    const id = data.id || crypto.randomUUID();
    const profileToSave = {
      ...data,
      id,
      ownerUid: data.ownerUid || user.uid,
    };

    await setDoc(doc(db, 'athletes', id), profileToSave, { merge: true });
    toast({ title: "Perfil Sincronizado" });
    return profileToSave as AthleteProfile;
  };

  const deleteProfile = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'athletes', id));
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) setActiveProfileId(null);
    toast({ title: "Atleta removido" });
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const updateWorkout = async (workoutId: string, updates: Partial<Workout>) => {
    if (!activeProfile || !db) return;
    
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

    await setDoc(doc(db, 'athletes', activeProfile.id), updatedProfile, { merge: true });
  };

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    // 1. Tentar usar a chave do próprio usuário logado (Atleta ou Treinador)
    let effectiveApiKey = apiKey;
    
    // 2. Se o usuário logado NÃO tem chave e NÃO é o dono do perfil, tenta a chave do treinador
    if (!effectiveApiKey && profile.ownerUid !== user?.uid) {
      const trainerData = await getDoc(doc(db, 'user_data', profile.ownerUid));
      effectiveApiKey = trainerData.data()?.apiKey || null;
      if (effectiveApiKey) {
        toast({ title: "Usando chave da Assessoria", description: "Sua chave individual não foi detectada." });
      }
    }

    if (!effectiveApiKey) {
      toast({ variant: "destructive", title: "IA Indisponível", description: "Configure sua Gemini API Key no menu lateral." });
      return;
    }

    setPlanGenerationStatus('pending');
    try {
      const result = await generateTrainingBlock({
        apiKey: effectiveApiKey,
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

      await setDoc(doc(db, 'athletes', profile.id), { trainingPlan: result }, { merge: true });
      setPlanGenerationStatus('success');
      toast({ title: "Planilha Gerada com Sucesso!" });
    } catch (error: any) {
      setPlanGenerationStatus('error');
      toast({ variant: "destructive", title: "Erro na IA", description: error.message });
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
        const data = JSON.stringify({ profiles });
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const a = document.createElement('a'); a.href = url; a.download = `assessoria_backup.json`; a.click();
      },
      importData: (json: string) => {
        try {
            const p = JSON.parse(json);
            if (p.profiles) p.profiles.forEach((profile: any) => saveProfile(profile));
            toast({ title: 'Dados Importados' });
        } catch (e) { toast({ variant: 'destructive', title: 'Erro na importação' }); }
      },
      toggleIntegration: (service, connected) => {
        if (!activeProfile) return;
        saveProfile({ ...activeProfile, integrations: { ...activeProfile.integrations, [service]: { ...activeProfile.integrations?.[service], connected, autoSync: connected } } } as any);
      }
    }}>
      {children}
    </AppContext.Provider>
  );
}
