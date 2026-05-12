"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { generateTrainingBlock, type GenerateTrainingBlockOutput } from "@/ai/flows/generate-training-block";
import { AppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  Target, 
  Dumbbell, 
  Info, 
  CalendarDays,
  Zap,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TrainingPage() {
  const context = React.useContext(AppContext);
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const profile = context?.activeProfile;

  const handleGenerate = async () => {
    if (!profile) {
      toast({ variant: "destructive", title: "Perfil Incompleto", description: "Configure seus dados em 'Meus Dados' primeiro." });
      return;
    }

    setLoading(true);
    toast({ title: "🧠 Gemini Coach está analisando...", description: "Calculando zonas de intensidade e periodização de elite." });

    try {
      const result = await generateTrainingBlock({
        currentVDOT: profile.vo2Max,
        hrZone1End: Math.round(profile.thresholdHr * 0.8),
        hrZone2End: Math.round(profile.thresholdHr * 0.9),
        hrZone3End: Math.round(profile.thresholdHr * 0.95),
        hrZone4End: profile.thresholdHr,
        hrMax: profile.thresholdHr + 20,
        trainingBlockType: 'Construction',
        planGenerationType: profile.planGenerationType || 'blocks',
        raceDate: profile.raceDate,
        weeklyMileageGoal: 60,
        targetRaceDistance: profile.raceDistance,
        currentLongRunDistance: 15,
        weeklyAvailability: profile.trainingDays.join(', '),
        injuryHistory: 'Nenhuma reportada',
        preferredWorkoutDays: profile.trainingDays.slice(0, 2).join(', '),
        legDay: profile.strengthPreferences?.legDay
      });

      context?.setTrainingPlan(result as any);
      toast({ title: "✅ Ciclo Gerado!", description: `Plano de ${result.durationWeeks} semanas salvo.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro na Geração", description: "Verifique sua conexão e chave de API." });
    } finally {
      setLoading(false);
    }
  };

  const plan = context?.trainingPlan as unknown as GenerateTrainingBlockOutput;

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-black uppercase italic tracking-tight">
              <span className="text-white">Motor de</span> <span className="text-primary">Periodização</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Sua planilha inteligente baseada em ciência e performance.</p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !profile}
            className="bg-primary text-black hover:bg-primary/90 w-full md:min-w-[220px] md:w-auto h-12 font-black uppercase tracking-widest text-xs"
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
            {plan ? "Re-calibrar Ciclo" : "Gerar Meu Ciclo"}
          </Button>
        </header>

        {!profile && (
          <Card className="mx-2 border-primary/20 bg-primary/5 p-8 text-center rounded-2xl shadow-lg">
            <Zap className="size-10 text-primary mx-auto mb-4 animate-pulse" />
            <h3 className="font-headline text-lg font-bold mb-2 uppercase italic">Dados Faltantes</h3>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
              Precisamos do seu Pace de Limiar e data da prova para criar uma periodização segura.
            </p>
            <Button onClick={() => window.location.href = '/profile'} variant="outline" className="text-[10px] font-bold uppercase tracking-widest">Configurar Perfil</Button>
          </Card>
        )}

        {profile && !plan && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-2">
            <Card className="bg-card/50 border-border border-dashed">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-sm uppercase italic">
                  <Target className="size-4 text-primary" /> Estratégia Ativa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Modo:</span>
                  <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/30 text-primary italic">
                    {profile.planGenerationType === 'full' ? 'Ciclo Completo' : 'Blocos (4 Sem.)'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Pace T:</span>
                  <span className="text-xs font-black text-primary italic">{profile.thresholdPace} <small>min/km</small></span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border flex flex-col justify-center items-center p-6 text-center space-y-3">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Sparkles className="size-6 text-primary animate-pulse" />
              </div>
              <h3 className="font-headline text-sm font-bold uppercase italic">Inteligência Pronta</h3>
              <p className="text-[10px] text-muted-foreground max-w-[200px] leading-tight">
                O Gemini Coach usará a lógica VDOT para seus ritmos exatos de treino.
              </p>
            </Card>
          </div>
        )}

        {plan && !loading && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 px-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary text-black text-[9px] font-black uppercase py-0.5 px-3 tracking-widest italic">
                {plan.blockType || 'Ciclo Ativo'}
              </Badge>
              <div className="h-px flex-1 bg-border/50" />
              <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase italic tracking-tighter">
                <CalendarDays className="size-3" />
                {plan.durationWeeks} Semanas
              </div>
            </div>

            <div className="grid gap-8 md:gap-10">
              {plan.weeklyPlans.map((week) => (
                <div key={week.weekNumber} className="relative">
                  <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full md:-left-4" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-8 md:size-10 rounded-xl bg-primary flex items-center justify-center font-headline font-black text-black text-sm italic">
                      S{week.weekNumber}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg md:text-xl uppercase italic tracking-tighter text-white">{week.focus}</h3>
                    </div>
                  </div>

                  <Card className="bg-card/30 border-border overflow-hidden shadow-xl">
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        {week.runs.map((run, idx) => (
                          <div key={idx} className="p-4 flex flex-col sm:flex-row gap-3 md:gap-6 hover:bg-primary/5 transition-colors">
                            <div className="sm:w-32 shrink-0">
                              <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">{run.day}</div>
                              <div className="inline-block px-1.5 py-0.5 rounded bg-secondary text-[8px] font-black uppercase text-muted-foreground border border-border/50">
                                {run.type}
                              </div>
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-base md:text-xl font-headline font-black italic text-white">{run.distance}</span>
                                <ChevronRight className="size-3 text-muted-foreground" />
                                <span className="text-[9px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/20 italic tracking-tighter">
                                  {run.paceZone}
                                </span>
                              </div>
                              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed font-medium italic">
                                {run.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-3 bg-secondary/10 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border/50">
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-card/50 border border-border/30">
                          <Dumbbell className="size-3 text-primary mt-0.5" />
                          <div className="text-[9px]">
                            <span className="font-black uppercase text-[8px] text-muted-foreground block mb-0.5">Força</span>
                            <span className="text-white font-medium italic">{week.strength}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-card/50 border border-border/30">
                          <Info className="size-3 text-accent mt-0.5" />
                          <div className="text-[9px]">
                            <span className="font-black uppercase text-[8px] text-muted-foreground block mb-0.5">Nota</span>
                            <span className="text-white font-medium italic">{week.notes}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center pt-8">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary text-[10px] font-bold uppercase tracking-widest" onClick={handleGenerate}>
                <RefreshCw size={14} /> Re-gerar Ciclo
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}