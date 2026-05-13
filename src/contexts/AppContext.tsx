
'use client';

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { AthleteProfile, TrainingPlan, Workout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateTrainingBlock } from '@/ai/flows/generate-training-block';
import { 
  useFirestore, 
  useUser, 
  useCollection, 
  useDoc 
} from '@/firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [planGenerationStatus, setPlanGenerationStatus] = useState<PlanGenerationStatus>('idle');

  // 1. Chave de API do usuário logado
  const userConfigRef = useMemo(() => user ? doc(db, 'user_data', user.uid) : null, [db, user]);
  const { data: userConfig, loading: loadingConfig } = useDoc<any>(userConfigRef);
  const userApiKey = userConfig?.apiKey || null;

  // 2. Fallback: Chave de API do Treinador (se o logado for atleta e não tiver chave)
  const [trainerApiKey, setTrainerApiKey] = useState<string | null>(null);

  const coachProfilesQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'athletes'), where('ownerUid', '==', user.uid));
  }, [db, user]);
  const { data: coachProfiles } = useCollection<AthleteProfile>(coachProfilesQuery);

  const athleteProfilesQuery = useMemo(() => {
    if (!user?.email) return null;
    return query(collection(db, 'athletes'), where('athleteEmail', '==', user.email));
  }, [db, user]);
  const { data: athleteProfiles } = useCollection<AthleteProfile>(athleteProfilesQuery);

  const profiles = useMemo(() => {
    const map = new Map<string, AthleteProfile>();
    (coachProfiles || []).forEach(p => map.set(p.id, p));
    (athleteProfiles || []).forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  }, [coachProfiles, athleteProfiles]);

  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId) || null, [profiles, activeProfileId]);

  useEffect(() => {
    if (activeProfile && user && activeProfile.ownerUid !== user.uid && !userApiKey) {
      const trainerRef = doc(db, 'user_data', activeProfile.ownerUid);
      const unsubscribe = onSnapshot(trainerRef, (snap) => {
        if (snap.exists()) {
          setTrainerApiKey(snap.data().apiKey || null);
        } else {
          setTrainerApiKey(null);
        }
      }, (err) => {
        console.error("Erro ao buscar chave do treinador:", err);
        setTrainerApiKey(null);
      });
      return () => unsubscribe();
    } else {
      setTrainerApiKey(null);
    }
  }, [activeProfile, user, userApiKey, db]);

  const effectiveApiKey = userApiKey || trainerApiKey;

  const setApiKey = (key: string | null) => {
    if (!user || !userConfigRef) {
      toast({ variant: "destructive", title: "Erro", description: "Faça login para salvar sua chave." });
      return;
    }
    setDoc(userConfigRef, { apiKey: key }, { merge: true }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userConfigRef.path,
        operation: 'write',
        requestResourceData: { apiKey: key }
      }));
    });
  };

  const switchProfile = (id: string | null) => setActiveProfileId(id);

  const saveProfile = async (data: Partial<AthleteProfile>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Ação Negada", description: "Faça login para sincronizar dados." });
      throw new Error("No user");
    }

    const id = data.id || crypto.randomUUID();
    const docRef = doc(db, 'athletes', id);
    const newProfile = {
      ...data,
      id,
      ownerUid: data.ownerUid || user.uid,
    } as AthleteProfile;

    setDoc(docRef, newProfile, { merge: true }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: newProfile
      }));
    });

    return newProfile;
  };

  const deleteProfile = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'athletes', id);
    deleteDoc(docRef).then(() => {
      if (activeProfileId === id) setActiveProfileId(null);
      toast({ title: "Perfil removido do sistema." });
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }));
    });
  };

  const updateWorkout = (workoutId: string, updates: Partial<Workout>) => {
    if (!activeProfile) return;
    
    const currentPlan = activeProfile.trainingPlan;
    if (!currentPlan) return;

    const newWeeklyPlans = currentPlan.weeklyPlans.map((week) => ({
      ...week,
      runs: week.runs.map((run) => run.id === workoutId ? { ...run, ...updates } : run)
    }));

    const docRef = doc(db, 'athletes', activeProfile.id);
    updateDoc(docRef, {
      trainingPlan: { ...currentPlan, weeklyPlans: newWeeklyPlans }
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update'
      }));
    });
  };

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    if (!effectiveApiKey) {
      toast({ variant: "destructive", title: "IA Desconectada", description: "Configure sua API Key ou peça ao seu treinador para configurar a dele." });
      return;
    }

    setPlanGenerationStatus('pending');
    try {
      let weeklyMileageGoal = 30;
      if (profile.experienceLevel === 'beginner') weeklyMileageGoal = 25;
      else if (profile.experienceLevel === 'intermediate') weeklyMileageGoal = 45;
      else if (profile.experienceLevel === 'advanced') weeklyMileageGoal = 75;

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
        weeklyMileageGoal,
        targetRaceDistance: profile.raceDistance,
        targetPace: profile.targetPace,
        targetTime: profile.targetTime,
        currentLongRunDistance: 10,
        weeklyAvailability: profile.trainingDays.join(', '),
        injuryHistory: profile.trainingHistory || 'Nenhuma reportada',
        preferredWorkoutDays: profile.trainingDays.slice(0, 2).join(', '),
        legDay: profile.strengthPreferences?.legDay
      });

      result.weeklyPlans.forEach(week => {
        week.runs.forEach(run => { if (!run.id) run.id = crypto.randomUUID(); });
      });

      await saveProfile({ ...profile, trainingPlan: result });
      setPlanGenerationStatus('success');
      toast({ title: "Ciclo Sincronizado!", description: "Sua planilha de elite foi atualizada na nuvem." });
    } catch (error: any) {
      setPlanGenerationStatus('error');
      toast({ variant: "destructive", title: "Erro na IA", description: error.message });
    }
  };

  return (
    <AppContext.Provider value={{
      isHydrated: !loadingConfig, apiKey: effectiveApiKey, setApiKey, profiles,
      activeProfile,
      switchProfile, saveProfile, deleteProfile,
      trainingPlan: activeProfile?.trainingPlan || null,
      updateWorkout,
      planGenerationStatus,
      generateRunningPlanAsync,
      exportData: () => {
        const data = JSON.stringify({ profiles, userApiKey });
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const a = document.createElement('a'); a.href = url; a.download = `corre_junto_backup.json`; a.click();
      },
      importData: async (json: string) => {
        try {
            const data = JSON.parse(json);
            if (data.profiles) {
              for (const p of data.profiles) { await saveProfile(p); }
            }
            toast({ title: 'Dados Importados' });
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
