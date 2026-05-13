
'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import { doc, onSnapshot, setDoc, collection, query, orderBy, limit, Firestore } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import type { AthleteProfile, TrainingPlan, ChatMessage, Workout } from '@/lib/types';
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
}

export const TrainingContext = createContext<TrainingContextType | null>(null);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const { auth, firestore } = { auth: useAuth(), firestore: useFirestore() };
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const [activeProfile, setActiveProfile] = useState<AthleteProfile | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [apiKey, setApiKeyInternal] = useState<string | null>(null);
  const [planGenerationStatus, setPlanGenerationStatus] = useState<PlanGenerationStatus>('idle');
  const [isHydrated, setIsHydrated] = useState(false);

  // Listener em tempo real para os dados do usuário
  useEffect(() => {
    if (authLoading || !user || !firestore) {
      if (!authLoading && !user) setIsHydrated(true);
      return;
    }

    const docRef = doc(firestore, 'user_data', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveProfile(data.profile || null);
        setTrainingPlan(data.trainingPlan || null);
        setApiKeyInternal(data.apiKey || null);
      }
      setIsHydrated(true);
    }, (error) => {
      console.error("Erro no Sync Real-time:", error);
      toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível conectar ao banco de dados.' });
    });

    return () => unsubscribe();
  }, [user, authLoading, firestore, toast]);

  const saveProfile = useCallback(async (data: Partial<AthleteProfile>) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'user_data', user.uid);
    
    try {
      await setDoc(docRef, { profile: data }, { merge: true });
      toast({ title: '✅ Sincronizado', description: 'Perfil atualizado em todos os seus dispositivos.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Verifique sua conexão.' });
    }
  }, [user, firestore, toast]);

  const updateWorkout = useCallback(async (workoutId: string, updates: Partial<Workout>) => {
    if (!user || !firestore || !trainingPlan) return;
    
    const newWeeklyPlans = trainingPlan.weeklyPlans.map((week) => ({
      ...week,
      runs: week.runs.map((run) => run.id === workoutId ? { ...run, ...updates } : run)
    }));

    const docRef = doc(firestore, 'user_data', user.uid);
    try {
      await setDoc(docRef, { 
        trainingPlan: { ...trainingPlan, weeklyPlans: newWeeklyPlans } 
      }, { merge: true });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao Atualizar Treino' });
    }
  }, [user, firestore, trainingPlan, toast]);

  const setApiKey = async (key: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'user_data', user.uid);
    await setDoc(docRef, { apiKey: key }, { merge: true });
    setApiKeyInternal(key);
  };

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    if (!apiKey) {
      toast({ variant: "destructive", title: "IA Desativada", description: "Configure sua Gemini API Key no menu lateral." });
      return;
    }

    setPlanGenerationStatus('pending');
    toast({ title: "🧠 Gemini Coach está analisando...", description: "Planejando seu ciclo de elite..." });

    try {
      const result = await generateTrainingBlock({
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

      if (!user || !firestore) return;
      const docRef = doc(firestore, 'user_data', user.uid);
      await setDoc(docRef, { trainingPlan: result }, { merge: true });
      
      setPlanGenerationStatus('success');
      toast({ title: "✅ Ciclo IA Concluído!", description: "Planilha sincronizada na nuvem." });
    } catch (error) {
      setPlanGenerationStatus('error');
      toast({ variant: "destructive", title: "Erro na IA", description: "Falha ao gerar plano." });
    }
  };

  const value = {
    isHydrated,
    activeProfile,
    trainingPlan,
    saveProfile,
    updateWorkout,
    generateRunningPlanAsync,
    planGenerationStatus,
    apiKey,
    setApiKey
  };

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}
