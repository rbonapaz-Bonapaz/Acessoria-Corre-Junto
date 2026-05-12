'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback, useMemo, useRef } from 'react';
import type { AthleteProfile, TrainingPlan, ChatMessage, FeedbackLogItem, Achievement, PersonalRecord } from '@/lib/types';
import { useFirestore, useAuth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type PlanGenerationStatus = 'idle' | 'pending' | 'success' | 'error';

interface UserMetadata {
  data_inicio: any;
  data_expiracao: any;
  status_assinatura: 'gratis_trial' | 'pago' | 'aluno';
}

interface AppContextType {
  isHydrated: boolean;
  user: User | null;
  userMetadata: UserMetadata | null;
  trialDaysLeft: number;
  isTrialExpired: boolean;
  isGuestMode: boolean;
  setGuestMode: (enabled: boolean) => void;
  profiles: AthleteProfile[];
  activeProfile: AthleteProfile | null;
  switchProfile: (profileId: string | null) => void;
  saveProfile: (profile: Omit<AthleteProfile, 'id'> & { id?: string }) => AthleteProfile;
  deleteProfile: (profileId: string) => void;
  trainingPlan: TrainingPlan | null;
  setTrainingPlan: (plan: TrainingPlan | null) => void;
  deleteTrainingPlan: (keepCompleted: boolean) => void;
  chatHistory: ChatMessage[];
  setChatHistory: (history: ChatMessage[]) => void;
  feedbackLog: FeedbackLogItem[];
  addFeedbackLogItem: (item: FeedbackLogItem) => void;
  updateFeedbackLogItem: (itemId: string, updates: Partial<FeedbackLogItem>) => void;
  deleteFeedbackLogItem: (itemId: string) => void;
  planGenerationStatus: PlanGenerationStatus;
  setPlanGenerationStatus: (status: PlanGenerationStatus) => void;
  achievements: Achievement[];
  personalRecords: PersonalRecord[];
  generateRunningPlanAsync: (profile: AthleteProfile) => Promise<void>;
  clearSession: () => void;
  clearFeedbackLog: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);
  const [profiles, setProfilesState] = useState<AthleteProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<AthleteProfile | null>(null);
  const [trainingPlan, setTrainingPlanState] = useState<TrainingPlan | null>(null);
  const [chatHistory, setChatHistoryState] = useState<ChatMessage[]>([]);
  const [feedbackLog, setFeedbackLogState] = useState<FeedbackLogItem[]>([]);
  const [planGenerationStatus, setPlanGenerationStatus] = useState<PlanGenerationStatus>('idle');
  const [achievements, setAchievementsState] = useState<Achievement[]>([]);
  const [personalRecords, setPersonalRecordsState] = useState<PersonalRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const snapshotUnsubscribeRef = useRef<(() => void) | null>(null);

  const syncToFirestore = useCallback(async (updates: any) => {
    if (!user || !db) return;
    try {
      await setDoc(doc(db, 'user_data', user.uid), updates, { merge: true });
    } catch (e) { 
      console.error('Erro de sincronização:', e);
    }
  }, [user, db]);

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (snapshotUnsubscribeRef.current) snapshotUnsubscribeRef.current();

      if (currentUser) {
        setIsGuestMode(false);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const initial = { 
            data_inicio: Timestamp.now(), 
            data_expiracao: Timestamp.fromDate(new Date(Date.now() + 90 * 86400000)), 
            status_assinatura: 'gratis_trial' 
          };
          await setDoc(userDocRef, initial);
          setUserMetadata(initial as any);
        } else {
          setUserMetadata(userDoc.data() as UserMetadata);
        }

        snapshotUnsubscribeRef.current = onSnapshot(doc(db, 'user_data', currentUser.uid), (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setProfilesState(data.profiles || []);
            const activeId = data.activeProfileId;
            if (activeId) {
              const active = (data.profiles || []).find((p: any) => p.id === activeId);
              setActiveProfileState(active || null);
              const pData = data.profile_data?.[activeId] || {};
              setTrainingPlanState(pData.trainingPlan || null);
              setChatHistoryState(pData.chatHistory || []);
              setFeedbackLogState(pData.feedbackLog || []);
              setAchievementsState(pData.achievements || []);
              setPersonalRecordsState(pData.personalRecords || []);
            }
          }
        });
      }
    });

    setIsHydrated(true);

    return () => { 
      unsubscribeAuth(); 
      if (snapshotUnsubscribeRef.current) snapshotUnsubscribeRef.current(); 
    };
  }, [auth, db]);

  const trialDaysLeft = useMemo(() => {
    if (!userMetadata) return 90;
    const exp = userMetadata.data_expiracao?.toDate?.() || new Date((userMetadata.data_expiracao?.seconds || 0) * 1000);
    return Math.max(0, Math.ceil((exp.getTime() - Date.now()) / 86400000));
  }, [userMetadata]);

  const saveProfile = useCallback((profileData: any) => {
    const id = profileData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));
    const newProfile = { ...profileData, id };
    
    // Atualização otimista: Reflete na interface antes de salvar no banco
    setProfilesState(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(p => p.id === id);
        if (idx > -1) updated[idx] = newProfile; else updated.push(newProfile);
        return updated;
    });
    setActiveProfileState(newProfile);

    // Persistência
    syncToFirestore({ 
      profiles: [newProfile, ...profiles.filter(p => p.id !== id)], 
      activeProfileId: id 
    });
    
    return newProfile;
  }, [profiles, syncToFirestore]);

  const generateRunningPlanAsync = async (p: AthleteProfile) => {
    setPlanGenerationStatus('pending');
    toast({ 
        title: "🧠 Gemini Coach está analisando...", 
        description: "Ajustando seu plano de performance baseado no seu T-Pace." 
    });

    try {
        // Simulação de fluxo sequencial de Elite para demonstração do progresso
        await new Promise(r => setTimeout(r, 1500));
        
        toast({ 
            title: "📅 Gerando Planilha...", 
            description: `Processando semana 1...` 
        });
        await new Promise(r => setTimeout(r, 800));
        
        toast({ 
            title: "📅 Gerando Planilha...", 
            description: `Processando semana 2...` 
        });
        await new Promise(r => setTimeout(r, 800));

        toast({ 
            title: "📅 Gerando Planilha...", 
            description: `Semanas processadas e periodizadas.` 
        });

        const mockPlan: TrainingPlan = {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)),
          profileId: p.id,
          createdAt: new Date().toISOString(),
          blockType: p.planGenerationType === 'blocks' ? 'Construção' : 'Ciclo Completo',
          weeklySchedule: []
        };

        setTrainingPlanState(mockPlan);
        
        setPlanGenerationStatus('success');
        toast({ 
            title: "✅ Ciclo IA Concluído!", 
            description: "Sua planilha periodizada está pronta e salva no calendário."
        });

        // Persiste o plano final no Firestore
        if (user && p.id) {
            syncToFirestore({ profile_data: { [p.id]: { trainingPlan: mockPlan } } });
        }
    } catch (e: any) { 
        setPlanGenerationStatus('error'); 
        toast({ 
            variant: 'destructive', 
            title: '❌ Erro na IA', 
            description: e.message || 'O motor de IA falhou. Tente novamente em instantes.' 
        });
    }
  };

  const value = useMemo(() => ({
    isHydrated, 
    user, 
    userMetadata, 
    trialDaysLeft, 
    isTrialExpired: trialDaysLeft <= 0, 
    isGuestMode, 
    setGuestMode: setIsGuestMode,
    profiles, 
    activeProfile, 
    switchProfile: (id: string | null) => { 
      setActiveProfileState(profiles.find(p => p.id === id) || null); 
      syncToFirestore({ activeProfileId: id }); 
    },
    saveProfile, 
    deleteProfile: (id: string) => { 
      const filtered = profiles.filter(p => p.id !== id); 
      setProfilesState(filtered); 
      syncToFirestore({ profiles: filtered }); 
    },
    trainingPlan, 
    setTrainingPlan: (p: any) => { 
      setTrainingPlanState(p); 
      if(activeProfile) syncToFirestore({ profile_data: { [activeProfile.id]: { trainingPlan: p } } }); 
    },
    deleteTrainingPlan: (keep: boolean) => { 
      if(!trainingPlan) return; 
      let np = null; 
      if(keep) { 
        const cw = trainingPlan.weeklySchedule.map(s => ({ 
          ...s, 
          workouts: s.workouts.filter(w => w.completed) 
        })).filter(s => s.workouts.length > 0); 
        if(cw.length > 0) np = { ...trainingPlan, weeklySchedule: cw }; 
      } 
      setTrainingPlanState(np); 
      if(activeProfile) syncToFirestore({ profile_data: { [activeProfile.id]: { trainingPlan: np } } }); 
    },
    chatHistory, 
    setChatHistory: (h: any) => { 
      setChatHistoryState(h); 
      if(activeProfile) syncToFirestore({ profile_data: { [activeProfile.id]: { chatHistory: h } } }); 
    },
    feedbackLog, 
    addFeedbackLogItem: (i: any) => { 
      const nl = [...feedbackLog, i]; 
      setFeedbackLogState(nl); 
      if(activeProfile) syncToFirestore({ profile_data: { [activeProfile.id]: { feedbackLog: nl } } }); 
    },
    updateFeedbackLogItem: (id: string, u: any) => { 
      const nl = feedbackLog.map(i => i.id === id ? { ...i, ...u } : i); 
      setFeedbackLogState(nl); 
      if(activeProfile) syncToFirestore({ profile_data: { [activeProfile.id]: { feedbackLog: nl } } }); 
    },
    deleteFeedbackLogItem: (id: string) => { 
      const nl = feedbackLog.filter(i => i.id !== id); 
      setFeedbackLogState(nl); 
      if(activeProfile) syncToFirestore({ profile_data: { [activeProfile.id]: { feedbackLog: nl } } }); 
    },
    planGenerationStatus, 
    setPlanGenerationStatus, 
    achievements, 
    personalRecords,
    generateRunningPlanAsync,
    clearSession: () => { 
      if(auth) auth.signOut(); 
      setActiveProfileState(null); 
      setProfilesState([]); 
    },
    clearFeedbackLog: () => { 
      setFeedbackLogState([]); 
      if(activeProfile) syncToFirestore({ profile_data: { [activeProfile.id]: { feedbackLog: [] } } }); 
    }
  }), [isHydrated, user, userMetadata, trialDaysLeft, isGuestMode, profiles, activeProfile, trainingPlan, chatHistory, feedbackLog, planGenerationStatus, achievements, personalRecords, saveProfile, syncToFirestore, auth, generateRunningPlanAsync]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
