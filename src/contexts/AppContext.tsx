
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AthleteProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  activeProfile: AthleteProfile | null;
  isHydrated: boolean;
  saveProfile: (profile: AthleteProfile) => AthleteProfile;
  generateRunningPlanAsync: (profile: AthleteProfile) => Promise<void>;
  deleteTrainingPlan: (silent?: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'correjunto_athlete_data';

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<AthleteProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setActiveProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar perfil", e);
      }
    }
    setIsHydrated(true);
  }, []);

  const saveProfile = (profile: AthleteProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setActiveProfile(profile);
    return profile;
  };

  const generateRunningPlanAsync = async (profile: AthleteProfile) => {
    // Simulação da sequência de Toasts "Elite"
    toast({ title: "🧠 Gemini Coach está analisando...", description: "Cruzando dados de limiar e disponibilidade." });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({ 
      title: "📅 Gerando Planilha...", 
      description: profile.planGenerationType === 'blocks' 
        ? "Processando bloco de 4 semanas." 
        : "Processando ciclo completo até a prova." 
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({ title: "✅ Planilha Pronta!", description: "Seu novo ciclo foi calibrado com sucesso." });
  };

  const deleteTrainingPlan = (silent = false) => {
    if (!silent) {
        toast({ title: "Plano removido", description: "O ciclo foi deletado do seu perfil." });
    }
  };

  return (
    <AppContext.Provider value={{ activeProfile, isHydrated, saveProfile, generateRunningPlanAsync, deleteTrainingPlan }}>
      {children}
    </AppContext.Provider>
  );
}
