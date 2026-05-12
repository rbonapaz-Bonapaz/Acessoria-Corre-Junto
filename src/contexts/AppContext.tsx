
'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import type { AthleteProfile, TrainingPlan, ChatMessage, FeedbackLogItem, Achievement, PersonalRecord, Workout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateTrainingBlock } from '@/ai/flows/generate-training-block';

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
  exportData: () => void;
  importData: (jsonData: string) => void;
  toggleIntegration: (service: 'strava' | 'coros', connected: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'correJunto_local_data_v2';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [apiKey, setApiKeyInternal] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<AthleteProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Record<string, any>>({});
  const [planGenerationStatus, setPlanGenerationStatus] = useState<PlanGenerationStatus>('idle');
  const { toast } = useToast();

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

  useEffect(() => {
    if (isHydrated) {
      const dataToSave = {
        apiKey,
        profiles,
        activeProfileId,
        profileData,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [isHydrated, apiKey, profiles, activeProfileId, profileData]);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === activeProfileId) || null
  , [profiles, activeProfileId]);

  const currentProfileData = useMemo(() => 
    activeProfileId ? (profileData[activeProfileId] || {}) : {}
  , [activeProfileId, profileData]);

  const setApiKey = (key: string | null) => setApiKeyInternal(key);

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
    
    setProfiles(prev => {
      const filtered = prev.filter(p => p.id !== id);
      return [newProfile, ...filtered];
    });
    setActiveProfileId(id);

    toast({ 
      title: '✅ Perfil Atualizado!', 
      description: 'Seus dados técnicos foram salvos com segurança.' 
    });

    return newProfile;
  }, [activeProfile, toast]);

  const updateWorkout = useCallback((workoutId: string, updates: Partial<Workout>) => {
    if (!activeProfileId || !currentProfileData.trainingPlan) return;
    
    const newWeeklyPlans = currentProfileData.trainingPlan.weeklyPlans.map((week: any) => ({
      ...week,
      runs: week.runs.map((run: any) => run.id === workoutId ? { ...run, ...updates } : run)
    }));

    setProfileData(prev => ({
      ...prev,
      [activeProfileId]: {
        ...prev[activeProfileId],
        trainingPlan: { ...prev[activeProfileId].trainingPlan, weeklyPlans: newWeeklyPlans }
      }
    }));
  }, [activeProfileId, currentProfileData]);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) setActiveProfileId(null);
    toast({ 
      title: '🗑️ Perfil Removido', 
      description: 'O perfil e todos os dados associados foram excluídos.' 
    });
  }, [activeProfileId, toast]);

  const deleteTrainingPlan = useCallback((keepCompleted: boolean) => {
    if (!activeProfileId) return;
    setProfileData(prev => ({ 
      ...prev, 
      [activeProfileId]: { ...prev[activeProfileId], trainingPlan: null } 
    }));
    toast({ 
      title: '🗑️ Plano Excluído', 
      description: keepCompleted ? 'Plano removido, histórico preservado.' : 'Todo o planejamento foi removido.' 
    });
  }, [activeProfileId, toast]);

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    if (!apiKey) {
      toast({ variant: "destructive", title: "IA Desativada", description: "Configure sua Gemini API Key no menu lateral." });
      return;
    }

    setPlanGenerationStatus('pending');
    toast({ title: "🧠 Gemini Coach está analisando...", description: "Ajustando seu plano de performance baseado no seu T-Pace e Leg Day." });

    try {
      const result = await generateTrainingBlock({
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
        currentLongRunDistance: 15,
        weeklyAvailability: profile.trainingDays.join(', '),
        injuryHistory: 'Nenhuma reportada',
        preferredWorkoutDays: profile.trainingDays.slice(0, 2).join(', '),
        legDay: profile.strengthPreferences?.legDay
      });

      // Atribui IDs aos treinos se não existirem
      result.weeklyPlans.forEach(week => {
        week.runs.forEach(run => {
          if (!run.id) run.id = crypto.randomUUID();
        });
      });

      for (let i = 1; i <= result.weeklyPlans.length; i++) {
        await new Promise(r => setTimeout(r, 300));
        if (i % 2 === 0 || i === result.weeklyPlans.length) {
          toast({ title: "📅 Gerando Planilha...", description: `Bloco atual: ${i} semanas processadas.` });
        }
      }

      setProfileData(prev => ({ 
        ...prev, 
        [activeProfileId!]: { ...prev[activeProfileId!], trainingPlan: result } 
      }));
      
      setPlanGenerationStatus('success');
      toast({ title: "✅ Ciclo IA Concluído!", description: "Sua planilha periodizada está pronta." });
    } catch (error) {
      setPlanGenerationStatus('error');
      toast({ variant: "destructive", title: "Erro na IA", description: "O motor falhou. Verifique sua chave de API." });
    }
  };

  const toggleIntegration = (service: 'strava' | 'coros', connected: boolean) => {
    if (!activeProfile) return;

    if (service === 'strava' && connected) {
      toast({ title: "🚴 Conectando ao Strava...", description: "Validando Client ID 202859..." });
    }

    const updated = {
        ...activeProfile,
        integrations: {
            ...activeProfile.integrations,
            [service]: { 
                ...(activeProfile.integrations?.[service] || {}),
                connected, 
                autoSync: connected, 
                lastSync: connected ? new Date().toISOString() : undefined,
                username: connected ? 'Atleta CorreJunto' : undefined,
                ...(service === 'strava' ? STRAVA_OFFICIAL_CONFIG : {})
            }
        }
    };
    
    setProfiles(prev => {
      const filtered = prev.filter(p => p.id !== activeProfile.id);
      return [updated as any, ...filtered];
    });

    toast({ 
        title: connected ? `✅ ${service.toUpperCase()} Conectado` : `❌ ${service.toUpperCase()} Desconectado`,
        description: connected ? 'Sincronização de atividades de elite ativada.' : 'A sincronização automática foi desativada.'
    });
  };

  const exportData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `correJunto_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '📥 Backup Exportado', description: 'Arquivo JSON salvo com sucesso.' });
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      setApiKeyInternal(parsed.apiKey || null);
      setProfiles(parsed.profiles);
      setActiveProfileId(parsed.activeProfileId);
      setProfileData(parsed.profileData);
      toast({ title: '📤 Importação Concluída', description: 'Seu perfil e planos foram restaurados.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro na Importação', description: 'O arquivo JSON parece inválido.' });
    }
  };

  const value = {
    isHydrated,
    apiKey,
    setApiKey: setApiKeyInternal,
    profiles,
    activeProfile,
    switchProfile: (id: string | null) => setActiveProfileId(id),
    saveProfile,
    deleteProfile,
    trainingPlan: currentProfileData.trainingPlan || null,
    setTrainingPlan: (p: any) => {
        if (!activeProfileId) return;
        setProfileData(prev => ({ ...prev, [activeProfileId]: { ...prev[activeProfileId], trainingPlan: p } }));
    },
    updateWorkout,
    deleteTrainingPlan,
    chatHistory: currentProfileData.chatHistory || [],
    setChatHistory: (h: any) => {
        if (!activeProfileId) return;
        setProfileData(prev => ({ ...prev, [activeProfileId]: { ...prev[activeProfileId], chatHistory: h } }));
    },
    feedbackLog: currentProfileData.feedbackLog || [],
    addFeedbackLogItem: (item: any) => {
        if (!activeProfileId) return;
        const nl = [...(currentProfileData.feedbackLog || []), item];
        setProfileData(prev => ({ ...prev, [activeProfileId]: { ...prev[activeProfileId], feedbackLog: nl } }));
    },
    updateFeedbackLogItem: (id: string, u: any) => {
        if (!activeProfileId) return;
        const nl = (currentProfileData.feedbackLog || []).map((i: any) => i.id === id ? { ...i, ...u } : i);
        setProfileData(prev => ({ ...prev, [activeProfileId]: { ...prev[activeProfileId], feedbackLog: nl } }));
    },
    deleteFeedbackLogItem: (id: string) => {
        if (!activeProfileId) return;
        const nl = (currentProfileData.feedbackLog || []).filter((i: any) => i.id !== id);
        setProfileData(prev => ({ ...prev, [activeProfileId]: { ...prev[activeProfileId], feedbackLog: nl } }));
    },
    planGenerationStatus,
    setPlanGenerationStatus,
    achievements: currentProfileData.achievements || [],
    personalRecords: currentProfileData.personalRecords || [],
    generateRunningPlanAsync,
    exportData,
    importData,
    toggleIntegration
  };

  return <AppContext.Provider value={value as any}>{children}</AppContext.Provider>;
}
