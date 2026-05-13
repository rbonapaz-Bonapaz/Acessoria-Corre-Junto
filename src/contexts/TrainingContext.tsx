
'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setActiveProfile(null);
      setTrainingPlan(null);
      setApiKeyInternal(null);
      setIsHydrated(true);
      return;
    }

    // Tentar recuperar chave local para agilidade
    const cachedKey = localStorage.getItem(`corre_junto_api_key_${user.uid}`);
    if (cachedKey) setApiKeyInternal(cachedKey);

    const docRef = doc(firestore, 'user_data', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveProfile(data.profile || null);
        setTrainingPlan(data.trainingPlan || null);
        
        if (data.apiKey) {
          setApiKeyInternal(data.apiKey);
          localStorage.setItem(`corre_junto_api_key_${user.uid}`, data.apiKey);
        }
      } else {
        // Documento novo, inicializar se necessário ou apenas marcar como hidratado
        setActiveProfile(null);
        setTrainingPlan(null);
      }
      setIsHydrated(true);
    }, (error) => {
      console.error("Erro no Sync Firestore:", error);
      setIsHydrated(true);
    });

    return () => unsubscribe();
  }, [user, authLoading, firestore]);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Bem-vindo ao Laboratório!", description: "Sincronizando seus dados..." });
    } catch (e) {
      toast({ variant: 'destructive', title: "Erro no Login", description: "Não foi possível autenticar com o Google." });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Sessão encerrada", description: "Até a próxima corrida!" });
    } catch (e) {
      toast({ variant: 'destructive', title: "Erro ao sair" });
    }
  };

  const saveProfile = useCallback(async (data: Partial<AthleteProfile>) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Não autenticado', description: 'Faça login para salvar seus dados.' });
      return;
    }
    const docRef = doc(firestore, 'user_data', user.uid);
    
    try {
      await setDoc(docRef, { profile: data }, { merge: true });
      toast({ title: '✅ Sincronizado', description: 'Dados salvos na nuvem com sucesso.' });
    } catch (e) {
      console.error(e);
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
    const cleanKey = key.trim();
    const docRef = doc(firestore, 'user_data', user.uid);
    
    setApiKeyInternal(cleanKey);
    localStorage.setItem(`corre_junto_api_key_${user.uid}`, cleanKey);
    
    try {
      await setDoc(docRef, { apiKey: cleanKey }, { merge: true });
      toast({ title: "Chave Configurada", description: "Sua IA está pronta para uso." });
    } catch (e) {
      console.error(e);
    }
  };

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    const currentKey = apiKey || (user ? localStorage.getItem(`corre_junto_api_key_${user.uid}`) : null);

    if (!currentKey) {
      toast({ 
        variant: "destructive", 
        title: "IA Desativada", 
        description: "Configure sua Gemini API Key no menu lateral." 
      });
      return;
    }

    setPlanGenerationStatus('pending');
    toast({ title: "🧠 Gemini Coach está analisando...", description: "Planejando seu ciclo de elite..." });

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
        raceDate: profile.raceDate || new Date().toISOString(),
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

      if (!user || !firestore) return;
      const docRef = doc(firestore, 'user_data', user.uid);
      await setDoc(docRef, { trainingPlan: result }, { merge: true });
      
      setPlanGenerationStatus('success');
      toast({ title: "✅ Ciclo IA Concluído!", description: "Planilha sincronizada na nuvem." });
    } catch (error: any) {
      setPlanGenerationStatus('error');
      toast({ variant: "destructive", title: "Erro na IA", description: error.message || "Falha ao gerar plano." });
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
    setApiKey,
    login,
    logout
  };

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}
