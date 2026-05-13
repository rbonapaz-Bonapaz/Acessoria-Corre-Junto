
'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth, useFirestore, useUser } from '@/firebase';
import type { AthleteProfile, TrainingPlan, Workout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateTrainingBlock } from '@/ai/flows/generate-training-block';

type PlanGenerationStatus = 'idle' | 'pending' | 'success' | 'error';

interface TrainingContextType {
  isHydrated: boolean;
  activeProfile: AthleteProfile | null;
  trainingPlan: TrainingPlan | null;
  saveProfile: (data: Partial<AthleteProfile>) => Promise<void>;
  updateWorkout: (workoutId: string, updates: Partial<Workout>) => Promise<void>;
  generateRunningPlanAsync: (profile: AthleteProfile) => Promise<void>;
  planGenerationStatus: PlanGenerationStatus;
  apiKey: string | null;
  setApiKey: (key: string) => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const TrainingContext = createContext<TrainingContextType | null>(null);

const STORAGE_KEYS = {
  PROFILE: 'corre_junto_local_profile',
  PLAN: 'corre_junto_local_plan',
  API_KEY: 'corre_junto_local_api_key'
};

export function TrainingProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const [activeProfile, setActiveProfile] = useState<AthleteProfile | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [apiKey, setApiKeyInternal] = useState<string | null>(null);
  const [planGenerationStatus, setPlanGenerationStatus] = useState<PlanGenerationStatus>('idle');
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Hidratação Inicial (Local Storage)
  useEffect(() => {
    const localProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const localPlan = localStorage.getItem(STORAGE_KEYS.PLAN);
    const localKey = localStorage.getItem(STORAGE_KEYS.API_KEY);

    if (localProfile) setActiveProfile(JSON.parse(localProfile));
    if (localPlan) setTrainingPlan(JSON.parse(localPlan));
    if (localKey) setApiKeyInternal(localKey);
    
    setIsHydrated(true);
  }, []);

  // 2. Sincronização Cloud
  useEffect(() => {
    if (authLoading || !isHydrated || !user) return;

    const docRef = doc(firestore, 'user_data', user.uid);
    
    const syncData = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.profile) setActiveProfile(data.profile);
          if (data.trainingPlan) setTrainingPlan(data.trainingPlan);
          if (data.apiKey) setApiKeyInternal(data.apiKey);
        } else {
          // Migração Local -> Cloud
          const migrationData: any = {};
          if (activeProfile) migrationData.profile = activeProfile;
          if (trainingPlan) migrationData.trainingPlan = trainingPlan;
          if (apiKey) migrationData.apiKey = apiKey;

          if (Object.keys(migrationData).length > 0) {
            await setDoc(docRef, migrationData, { merge: true });
            toast({ title: "Dados Sincronizados", description: "Seu progresso local foi salvo na nuvem." });
          }
        }
      } catch (e) {
        console.error("Erro ao sincronizar Firestore:", e);
      }
    };

    syncData();

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.profile) setActiveProfile(data.profile);
        if (data.trainingPlan) setTrainingPlan(data.trainingPlan);
        if (data.apiKey) setApiKeyInternal(data.apiKey);
      }
    });

    return () => unsubscribe();
  }, [user, authLoading, isHydrated, firestore, toast]);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      toast({ variant: 'destructive', title: "Erro no Login" });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Limpa dados locais ao deslogar se desejado, ou mantém para modo convidado
      toast({ title: "Sessão encerrada" });
    } catch (e) {
      toast({ variant: 'destructive', title: "Erro ao sair" });
    }
  };

  const saveProfile = useCallback(async (data: Partial<AthleteProfile>) => {
    const updatedProfile = { ...(activeProfile || {}), ...data } as AthleteProfile;
    
    setActiveProfile(updatedProfile);
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));

    if (user && firestore) {
      const docRef = doc(firestore, 'user_data', user.uid);
      await setDoc(docRef, { profile: updatedProfile }, { merge: true });
    }
    toast({ title: 'Dados Salvos', description: 'Suas informações foram sincronizadas com sucesso.' });
  }, [user, firestore, activeProfile, toast]);

  const updateWorkout = useCallback(async (workoutId: string, updates: Partial<Workout>) => {
    if (!trainingPlan) return;
    
    const newWeeklyPlans = trainingPlan.weeklyPlans.map((week) => ({
      ...week,
      runs: week.runs.map((run) => run.id === workoutId ? { ...run, ...updates } : run)
    }));

    const updatedPlan = { ...trainingPlan, weeklyPlans: newWeeklyPlans };
    setTrainingPlan(updatedPlan);
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(updatedPlan));

    if (user && firestore) {
      const docRef = doc(firestore, 'user_data', user.uid);
      await setDoc(docRef, { trainingPlan: updatedPlan }, { merge: true });
    }
  }, [user, firestore, trainingPlan]);

  const setApiKey = async (key: string) => {
    const cleanKey = key.trim();
    setApiKeyInternal(cleanKey);
    localStorage.setItem(STORAGE_KEYS.API_KEY, cleanKey);
    
    if (user && firestore) {
      const docRef = doc(firestore, 'user_data', user.uid);
      await setDoc(docRef, { apiKey: cleanKey }, { merge: true });
    }
    toast({ title: "Chave Configurada", description: "O Coach IA agora está ativo." });
  };

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    // Busca a chave mais atualizada (estado ou storage)
    const currentKey = apiKey || localStorage.getItem(STORAGE_KEYS.API_KEY);
    
    if (!currentKey || currentKey.trim() === "") {
      toast({ variant: "destructive", title: "IA Desativada", description: "Configure sua Gemini API Key para gerar o ciclo." });
      return;
    }

    setPlanGenerationStatus('pending');
    toast({ title: "Gerando Ciclo IA...", description: "Analisando seu perfil biométrico e prova alvo." });

    try {
      const result = await generateTrainingBlock({
        apiKey: currentKey,
        raceName: profile.raceName,
        currentVDOT: profile.vo2Max || 40,
        hrZone1End: Math.round((profile.thresholdHr || 160) * 0.8),
        hrZone2End: Math.round((profile.thresholdHr || 160) * 0.9),
        hrZone3End: Math.round((profile.thresholdHr || 160) * 0.95),
        hrZone4End: profile.thresholdHr || 160,
        hrMax: (profile.thresholdHr || 160) + 20,
        trainingBlockType: 'Construction',
        planGenerationType: profile.planGenerationType || 'blocks',
        raceDate: profile.raceDate || new Date().toISOString().split('T')[0],
        weeklyMileageGoal: profile.weeklyMileageGoal || 60,
        targetRaceDistance: profile.raceDistance || '10k',
        targetPace: profile.targetPace,
        targetTime: profile.targetTime,
        currentLongRunDistance: 15,
        weeklyAvailability: profile.trainingDays.join(', '),
        injuryHistory: profile.trainingHistory || 'Nenhuma reportada',
        preferredWorkoutDays: profile.trainingDays.slice(0, 2).join(', '),
        legDay: profile.strengthPreferences?.legDay,
        referenceFileDataUri: profile.referenceDocumentUri
      });

      setTrainingPlan(result);
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(result));

      if (user && firestore) {
        const docRef = doc(firestore, 'user_data', user.uid);
        await setDoc(docRef, { trainingPlan: result }, { merge: true });
      }
      
      setPlanGenerationStatus('success');
      toast({ title: "Plano Gerado!", description: "Sua planilha técnica está pronta para visualização." });
    } catch (error: any) {
      setPlanGenerationStatus('error');
      console.error(error);
      toast({ variant: "destructive", title: "Erro na IA", description: error.message || "Falha na comunicação com o Gemini." });
    }
  };

  return (
    <TrainingContext.Provider value={{
      isHydrated, activeProfile, trainingPlan, saveProfile, updateWorkout,
      generateRunningPlanAsync, planGenerationStatus, apiKey, setApiKey, login, logout
    }}>
      {children}
    </TrainingContext.Provider>
  );
}
