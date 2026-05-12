"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { generateTrainingBlock, type GenerateTrainingBlockOutput } from "@/ai/flows/generate-training-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Sparkles, Loader2, Calendar, Target, Ruler, Dumbbell, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TrainingPage() {
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState<GenerateTrainingBlockOutput | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateTrainingBlock({
        currentVDOT: 54.2,
        hrZone1End: 135,
        hrZone2End: 152,
        hrZone3End: 168,
        hrZone4End: 180,
        hrMax: 188,
        trainingBlockType: 'Construction',
        weeklyMileageGoal: 85,
        targetRaceDistance: 'Maratona',
        currentLongRunDistance: 28,
        currentLongRunPace: '5:10/km',
        weeklyAvailability: '5 dias por semana, manhãs',
        injuryHistory: 'Nenhuma',
        preferredWorkoutDays: 'Terça, Quinta'
      });
      setPlan(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Motor de Periodização IA</h1>
            <p className="text-muted-foreground">Gere ciclos de treinamento de alta performance de 4 semanas.</p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px]"
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
            Gerar Novo Bloco
          </Button>
        </header>

        {!plan && !loading && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border border-dashed">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Target className="size-5 text-accent" /> Configurar Ciclo
                </CardTitle>
                <CardDescription>Defina seu foco e disponibilidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Bloco</Label>
                  <Select defaultValue="Construction">
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Base">Base (Aeróbico)</SelectItem>
                      <SelectItem value="Construction">Construção (Específico)</SelectItem>
                      <SelectItem value="Polishing">Polimento (Taper)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Meta Semanal (km)</Label>
                  <Input defaultValue="85" type="number" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Dias de Treino Intenso</Label>
                  <Input defaultValue="Ter, Qui" className="bg-secondary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border flex flex-col justify-center items-center p-8 text-center space-y-4">
              <div className="size-16 rounded-full bg-secondary flex items-center justify-center">
                <Sparkles className="size-8 text-accent animate-pulse" />
              </div>
              <h3 className="font-headline text-xl font-bold">Pronto para Calibrar?</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Nossa IA usa a lógica VDOT para calcular seus ritmos exatos e otimizar a progressão de volume.
              </p>
            </Card>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 w-full shimmer rounded-2xl" />
            ))}
          </div>
        )}

        {plan && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3">
              <Badge className="bg-accent text-accent-foreground text-sm py-1 px-4">
                Ciclo de {plan.blockType} Ativo
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">{plan.durationWeeks} Semanas Geradas</span>
            </div>

            <div className="grid gap-8">
              {plan.weeklyPlans.map((week) => (
                <Card key={week.weekNumber} className="bg-card border-border overflow-hidden">
                  <div className="bg-secondary/50 p-4 border-b flex items-center justify-between">
                    <h3 className="font-headline font-bold text-xl">Semana {week.weekNumber}</h3>
                    <Badge variant="outline" className="border-accent/30 text-accent">{week.focus}</Badge>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {week.runs.map((run, idx) => (
                        <div key={idx} className="p-4 flex flex-col md:flex-row gap-4 hover:bg-secondary/30 transition-colors">
                          <div className="md:w-32 shrink-0">
                            <div className="text-sm font-bold text-accent">{run.day}</div>
                            <div className="text-xs text-muted-foreground">{run.type}</div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{run.distance}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">{run.paceZone}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {run.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-secondary/20 grid md:grid-cols-2 gap-4 border-t">
                      <div className="flex items-start gap-3">
                        <Dumbbell className="size-4 text-accent mt-1" />
                        <div className="text-sm">
                          <span className="font-bold block mb-1">Força</span>
                          <span className="text-muted-foreground">{week.strength}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Info className="size-4 text-accent mt-1" />
                        <div className="text-sm">
                          <span className="font-bold block mb-1">Notas</span>
                          <span className="text-muted-foreground">{week.notes}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
