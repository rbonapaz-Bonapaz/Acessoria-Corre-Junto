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
import { Skeleton } from "@/components/ui/skeleton";

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
        currentVDOT: profile.vo2Max, // Usando vo2max como proxy de VDOT simplificado
        hrZone1End: Math.round(profile.thresholdHr * 0.8),
        hrZone2End: Math.round(profile.thresholdHr * 0.9),
        hrZone3End: Math.round(profile.thresholdHr * 0.95),
        hrZone4End: profile.thresholdHr,
        hrMax: profile.thresholdHr + 20, // Estimação simples
        trainingBlockType: 'Construction',
        planGenerationType: profile.planGenerationType || 'blocks',
        raceDate: profile.raceDate,
        weeklyMileageGoal: 60, // Padrão
        targetRaceDistance: profile.raceDistance,
        currentLongRunDistance: 15,
        weeklyAvailability: profile.trainingDays.join(', '),
        injuryHistory: 'Nenhuma reportada',
        preferredWorkoutDays: profile.trainingDays.slice(0, 2).join(', '),
        legDay: profile.strengthPreferences?.legDay
      });

      context?.setTrainingPlan(result as any);
      toast({ title: "✅ Ciclo Gerado!", description: `Plano de ${result.durationWeeks} semanas salvo com sucesso.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro na Geração", description: "Não foi possível gerar o plano. Verifique sua conexão e chave de API." });
    } finally {
      setLoading(false);
    }
  };

  const plan = context?.trainingPlan as unknown as GenerateTrainingBlockOutput;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-black uppercase italic tracking-tight">
              <span className="text-white">Motor de</span> <span className="text-primary">Periodização</span>
            </h1>
            <p className="text-muted-foreground mt-1">Sua planilha inteligente baseada em ciência e performance.</p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !profile}
            className="bg-primary text-black hover:bg-primary/90 min-w-[220px] h-12 font-black uppercase tracking-widest"
          >
            {loading ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Sparkles className="mr-2 size-5" />}
            {plan ? "Re-calibrar Ciclo" : "Gerar Meu Ciclo"}
          </Button>
        </header>

        {!profile && (
          <Card className="border-accent/20 bg-accent/5 p-8 text-center">
            <Zap className="size-12 text-accent mx-auto mb-4 animate-pulse" />
            <h3 className="font-headline text-xl font-bold mb-2">Dados Faltantes</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Precisamos do seu Pace de Limiar e data da prova para criar uma periodização segura.
            </p>
            <Button onClick={() => window.location.href = '/profile'} variant="outline">Configurar Perfil</Button>
          </Card>
        )}

        {profile && !plan && !loading && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border border-dashed">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Target className="size-5 text-primary" /> Estratégia Ativa
                </CardTitle>
                <CardDescription>Configurado em seu perfil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                  <span className="text-sm font-medium">Modo de Geração:</span>
                  <Badge variant="outline" className="uppercase font-bold border-primary/50 text-primary">
                    {profile.planGenerationType === 'full' ? 'Ciclo Completo' : 'Blocos de 4 Semanas'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                  <span className="text-sm font-medium">Data da Prova:</span>
                  <span className="text-sm font-bold text-white">{new Date(profile.raceDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                  <span className="text-sm font-medium">Pace de Limiar (T):</span>
                  <span className="text-sm font-bold text-primary">{profile.thresholdPace} min/km</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border flex flex-col justify-center items-center p-8 text-center space-y-4">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <Sparkles className="size-10 text-primary animate-pulse" />
              </div>
              <h3 className="font-headline text-xl font-bold uppercase italic">Inteligência Pronta</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                O Gemini Coach usará a lógica VDOT para calcular seus ritmos exatos de Intervalado, Tempo e Rodagem.
              </p>
            </Card>
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            <div className="h-10 w-48 bg-secondary/50 rounded-lg animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 w-full shimmer rounded-2xl border border-border" />
            ))}
          </div>
        )}

        {plan && !loading && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex items-center gap-4">
              <Badge className="bg-primary text-black text-xs font-black uppercase py-1 px-4 tracking-widest italic">
                {plan.blockType || 'Ciclo Ativo'}
              </Badge>
              <div className="h-px flex-1 bg-border/50" />
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                <CalendarDays className="size-4" />
                {plan.durationWeeks} Semanas de Treino
              </div>
            </div>

            <div className="grid gap-10">
              {plan.weeklyPlans.map((week) => (
                <div key={week.weekNumber} className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center font-headline font-black text-black italic">
                      S{week.weekNumber}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-2xl uppercase italic tracking-tight">{week.focus}</h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fase: Periodização Específica</p>
                    </div>
                  </div>

                  <Card className="bg-card/50 border-border overflow-hidden hover:border-primary/30 transition-all group shadow-xl">
                    <CardContent className="p-0">
                      <div className="divide-y divide-border">
                        {week.runs.map((run, idx) => (
                          <div key={idx} className="p-5 flex flex-col md:flex-row gap-6 hover:bg-primary/5 transition-colors">
                            <div className="md:w-40 shrink-0">
                              <div className="text-xs font-black text-primary uppercase tracking-widest mb-1">{run.day}</div>
                              <div className="inline-block px-2 py-0.5 rounded bg-secondary text-[10px] font-bold uppercase text-muted-foreground border border-border">
                                {run.type}
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-xl font-headline font-black italic text-white">{run.distance}</span>
                                <ChevronRight className="size-4 text-muted-foreground" />
                                <span className="text-xs font-mono font-bold bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">
                                  {run.paceZone}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                {run.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-5 bg-secondary/10 grid md:grid-cols-2 gap-6 border-t border-border/50">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-sm">
                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Dumbbell className="size-4 text-primary" />
                          </div>
                          <div className="text-sm">
                            <span className="font-black uppercase text-[10px] text-muted-foreground block mb-1">Força & Mobilidade</span>
                            <span className="text-white font-medium">{week.strength}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-sm">
                          <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Info className="size-4 text-accent" />
                          </div>
                          <div className="text-sm">
                            <span className="font-black uppercase text-[10px] text-muted-foreground block mb-1">Nota Estratégica</span>
                            <span className="text-white font-medium">{week.notes}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center pt-10">
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary" onClick={handleGenerate}>
                <RefreshCw size={16} /> Re-gerar planilha inteira
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}