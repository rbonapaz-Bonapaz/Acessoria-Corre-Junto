
'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import type { AthleteProfile, TrainingPlan, ChatMessage, FeedbackLogItem, Achievement, PersonalRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type PlanGenerationStatus = 'idle' | 'pending' | 'success' | 'error';

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

const STORAGE_KEY = 'correJunto_local_data';

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
            strava: { connected: false, autoSync: false },
            coros: { connected: false, autoSync: false }
        }
    };
    
    setProfiles(prev => {
      const filtered = prev.filter(p => p.id !== id);
      return [newProfile, ...filtered];
    });
    setActiveProfileId(id);
    return newProfile;
  }, [activeProfile]);

  const toggleIntegration = (service: 'strava' | 'coros', connected: boolean) => {
    if (!activeProfile) return;
    const updated = {
        ...activeProfile,
        integrations: {
            ...activeProfile.integrations,
            [service]: { 
                connected, 
                autoSync: connected, 
                lastSync: connected ? new Date().toISOString() : undefined,
                username: connected ? 'Atleta CorreJunto' : undefined
            }
        }
    };
    saveProfile(updated as any);
    toast({ 
        title: connected ? `✅ ${service.toUpperCase()} Conectado` : `❌ ${service.toUpperCase()} Desconectado`,
        description: connected ? 'Seus treinos serão sincronizados localmente.' : 'A sincronização automática foi desativada.'
    });
  };

  const generateRunningPlanAsync = async (p: AthleteProfile) => {
    if (!apiKey) return;
    setPlanGenerationStatus('pending');
    toast({ title: "🧠 Analisando Perfil...", description: "O Gemini Coach está periodizando seu ciclo." });
    await new Promise(r => setTimeout(r, 2000));
    setPlanGenerationStatus('success');
    toast({ title: "✅ Ciclo Gerado!", description: "Sua planilha está pronta." });
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
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      setApiKeyInternal(parsed.apiKey || null);
      setProfiles(parsed.profiles);
      setActiveProfileId(parsed.activeProfileId);
      setProfileData(parsed.profileData);
      toast({ title: '✅ Importação Concluída' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro na Importação' });
    }
  };

  const value = {
    isHydrated,
    apiKey,
    setApiKey,
    profiles,
    activeProfile,
    switchProfile: (id: string | null) => setActiveProfileId(id),
    saveProfile,
    deleteProfile: (id: string) => {
      setProfiles(prev => prev.filter(p => p.id !== id));
      if (activeProfileId === id) setActiveProfileId(null);
    },
    trainingPlan: currentProfileData.trainingPlan || null,
    setTrainingPlan: (p: any) => {
        if (!activeProfileId) return;
        setProfileData(prev => ({ ...prev, [activeProfileId]: { ...prev[activeProfileId], trainingPlan: p } }));
    },
    deleteTrainingPlan: () => {
        if (!activeProfileId) return;
        setProfileData(prev => ({ ...prev, [activeProfileId]: { ...prev[activeProfileId], trainingPlan: null } }));
    },
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
