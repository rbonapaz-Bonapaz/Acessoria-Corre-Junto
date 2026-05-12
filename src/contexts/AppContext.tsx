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

  // Carregamento inicial do localStorage
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

  // Sincronização automática com localStorage
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
    const newProfile = { ...data, id };
    
    setProfiles(prev => {
      const filtered = prev.filter(p => p.id !== id);
      return [newProfile, ...filtered];
    });
    setActiveProfileId(id);
    return newProfile;
  }, []);

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) setActiveProfileId(null);
  };

  const updateActiveProfileData = useCallback((key: string, value: any) => {
    if (!activeProfileId) return;
    setProfileData(prev => ({
      ...prev,
      [activeProfileId]: {
        ...(prev[activeProfileId] || {}),
        [key]: value
      }
    }));
  }, [activeProfileId]);

  const generateRunningPlanAsync = async (p: AthleteProfile) => {
    if (!apiKey) {
      toast({ variant: 'destructive', title: 'Chave de API Ausente', description: 'Configure sua Gemini API Key para usar a IA.' });
      return;
    }

    setPlanGenerationStatus('pending');
    toast({ title: "🧠 Analisando Perfil...", description: "O Gemini Coach está periodizando seu ciclo." });

    try {
      // Simulação de chamada direta ao Gemini API no cliente
      // Em uma implementação real, usaríamos fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey)
      await new Promise(r => setTimeout(r, 2000));
      
      const mockPlan: TrainingPlan = {
        id: crypto.randomUUID(),
        profileId: p.id,
        createdAt: new Date().toISOString(),
        blockType: p.planGenerationType === 'blocks' ? 'Construção' : 'Ciclo Completo',
        weeklySchedule: [] 
      };

      updateActiveProfileData('trainingPlan', mockPlan);
      setPlanGenerationStatus('success');
      toast({ title: "✅ Ciclo Gerado!", description: "Sua planilha está pronta." });
    } catch (e) {
      setPlanGenerationStatus('error');
      toast({ variant: 'destructive', title: 'Erro na Geração', description: 'Verifique sua chave de API ou conexão.' });
    }
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
      if (!parsed.profiles) throw new Error('Formato inválido');
      setApiKeyInternal(parsed.apiKey || null);
      setProfiles(parsed.profiles);
      setActiveProfileId(parsed.activeProfileId);
      setProfileData(parsed.profileData);
      toast({ title: '✅ Importação Concluída', description: 'Seus dados foram carregados com sucesso.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro na Importação', description: 'O arquivo JSON fornecido é inválido.' });
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
    deleteProfile,
    trainingPlan: currentProfileData.trainingPlan || null,
    setTrainingPlan: (p: any) => updateActiveProfileData('trainingPlan', p),
    deleteTrainingPlan: () => updateActiveProfileData('trainingPlan', null),
    chatHistory: currentProfileData.chatHistory || [],
    setChatHistory: (h: any) => updateActiveProfileData('chatHistory', h),
    feedbackLog: currentProfileData.feedbackLog || [],
    addFeedbackLogItem: (item: any) => updateActiveProfileData('feedbackLog', [...(currentProfileData.feedbackLog || []), item]),
    updateFeedbackLogItem: (id: string, u: any) => updateActiveProfileData('feedbackLog', (currentProfileData.feedbackLog || []).map((i: any) => i.id === id ? { ...i, ...u } : i)),
    deleteFeedbackLogItem: (id: string) => updateActiveProfileData('feedbackLog', (currentProfileData.feedbackLog || []).filter((i: any) => i.id !== id)),
    planGenerationStatus,
    setPlanGenerationStatus,
    achievements: currentProfileData.achievements || [],
    personalRecords: currentProfileData.personalRecords || [],
    generateRunningPlanAsync,
    exportData,
    importData
  };

  return <AppContext.Provider value={value as any}>{children}</AppContext.Provider>;
}
