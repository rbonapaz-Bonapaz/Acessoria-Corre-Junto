
"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { generateTrainingBlock, type GenerateTrainingBlockOutput } from "@/ai/flows/generate-training-block";
import { analyzeWorkout } from "@/ai/flows/analyze-workout-flow";
import { AppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  RefreshCw,
  CheckCircle2,
  Upload,
  FileText,
  Image as ImageIcon,
  BrainCircuit,
  MessageSquare,
  Route,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn, fileToDataURI } from '@/lib/utils';
import type { Workout } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrainingPage() {
  const context = React.useContext(AppContext);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [selectedWorkout, setSelectedWorkout] = React.useState<Workout | null>(null);
  const [athleteFeedback, setAthleteFeedback] = React.useState("");
  const [uploadedFileUri, setUploadedFileUri] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const profile = context?.activeProfile;
  const plan = context?.trainingPlan;

  const handleGenerate = async () => {
    if (!profile) {
      toast({ variant: "destructive", title: "Perfil Incompleto", description: "Configure seus dados em 'Meus Dados' primeiro." });
      return;
    }
    setLoading(true);
    await context?.generateRunningPlanAsync(profile);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uri = await fileToDataURI(file);
      setUploadedFileUri(uri);
      toast({ title: "Arquivo anexado!", description: `${file.name} pronto para análise.` });
    } catch (err) {
      toast({ variant: 'destructive', title: "Erro no upload" });
    }
  };

  const handleFinalizeAnalysis = async () => {
    if (!selectedWorkout || !profile || !context) return;
    
    setAnalyzing(true);
    toast({ title: "🧠 Gemini Coach está analisando...", description: "Comparando biomecânica e esforço." });

    try {
      const result = await analyzeWorkout({
        prescribedWorkout: JSON.stringify(selectedWorkout),
        athleteFeedback,
        athleteProfile: JSON.stringify(profile),
        fileDataUri: uploadedFileUri || undefined
      });

      const updatedWorkout = { 
        ...selectedWorkout, 
        completed: true, 
        analysis: {
          actualMetrics: result.actualMetrics,
          analysisSummary: result.analysisSummary.summary + "\n\n" + result.analysisSummary.technicalReview,
          recommendations: result.recommendations,
          areasOfImprovement: result.areasOfImprovement
        }
      };
      
      context.updateWorkout(selectedWorkout.id, updatedWorkout);
      setSelectedWorkout(updatedWorkout as any);
      toast({ title: "✅ Treino Registrado!", description: "Sua análise de elite está pronta." });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Erro na análise", description: "Verifique sua conexão e chave de API." });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-black uppercase italic tracking-tight">
              <span className="text-white">Meu</span> <span className="text-primary">Plano</span>
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

        {!plan && !loading && (
          <Card className="mx-2 border-primary/20 bg-primary/5 p-20 text-center rounded-3xl shadow-lg border-2 border-dashed">
            <CardContent className="flex flex-col items-center space-y-6">
                <div className="p-6 rounded-full bg-primary/10 animate-pulse">
                    <CalendarDays className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase italic">Sem Plano Ativo</h2>
                    <p className="text-muted-foreground max-w-xs mx-auto">Gere sua planilha personalizada no seu perfil para começar os treinos.</p>
                </div>
                <Button asChild size="lg" className="h-14 px-8 font-black uppercase tracking-widest bg-primary text-black">
                    <Link href="/profile">CONFIGURAR MEU CICLO</Link>
                </Button>
            </CardContent>
          </Card>
        )}

        {plan && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500 px-2">
            {plan.weeklyPlans.flatMap(week => week.runs).map((w: any) => (
              <Card 
                key={w.id} 
                className={cn(
                    "group cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden rounded-2xl",
                    w.completed ? "bg-secondary/20 opacity-80" : "bg-card border-primary/10 shadow-lg"
                )}
                onClick={() => setSelectedWorkout(w)}
              >
                {w.completed && (
                    <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                )}
                <CardHeader className="pb-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{w.day}</p>
                    <CardTitle className="font-headline text-xl italic uppercase font-black truncate">{w.type}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">"{w.description}"</p>
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">{w.distance}</Badge>
                        <Badge variant="outline" className="font-bold border-border/50">{w.paceZone}</Badge>
                    </div>
                </CardContent>
                <CardFooter className="pt-0 border-t border-border/10 mt-2 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase py-3">Ver Detalhes</span>
                    <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedWorkout} onOpenChange={(open) => !open && setSelectedWorkout(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar border-primary/20 bg-card rounded-3xl">
                {selectedWorkout && (
                    <div className="space-y-6">
                        <DialogHeader>
                            <div className="flex justify-between items-start pr-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">{selectedWorkout.day}</p>
                                    <DialogTitle className="font-headline text-3xl font-black uppercase italic">{selectedWorkout.type}</DialogTitle>
                                </div>
                                {selectedWorkout.completed && <Badge className="bg-emerald-500 text-white font-black">REALIZADO</Badge>}
                            </div>
                        </DialogHeader>

                        <Tabs defaultValue={selectedWorkout.completed ? "feedback" : "prescrito"} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-secondary/30 h-12 p-1 rounded-xl">
                                <TabsTrigger value="prescrito" className="font-bold text-xs uppercase italic data-[state=active]:bg-primary data-[state=active]:text-black">Prescrição</TabsTrigger>
                                <TabsTrigger value="feedback" className="font-bold text-xs uppercase italic data-[state=active]:bg-primary data-[state=active]:text-black">
                                    {selectedWorkout.completed ? 'Análise do Coach' : 'Registrar'}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="prescrito" className="space-y-6 pt-4">
                                <div className="p-4 rounded-xl bg-secondary/20 border-l-4 border-primary space-y-2">
                                    <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Objetivo Técnico</h4>
                                    <p className="text-sm italic leading-relaxed">"{selectedWorkout.description}"</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-background/50 border p-3 rounded-xl flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-primary/10 text-primary"><Route size={18}/></div>
                                        <div><p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Distância</p><p className="text-lg font-black">{selectedWorkout.distance}</p></div>
                                    </div>
                                    <div className="bg-background/50 border p-3 rounded-xl flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-primary/10 text-primary"><Clock size={18}/></div>
                                        <div><p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Zona</p><p className="text-lg font-black uppercase">{selectedWorkout.paceZone}</p></div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="feedback" className="pt-4 space-y-6">
                                {selectedWorkout.completed && selectedWorkout.analysis ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 gap-2">
                                            <MetricBox label="Pace Médio" value={selectedWorkout.analysis.actualMetrics?.averagePace || '--'} unit="min/km" />
                                            <MetricBox label="Cadência" value={selectedWorkout.analysis.actualMetrics?.averageCadence || '--'} unit="ppm" />
                                            <MetricBox 
                                                label="Razão Passada" 
                                                value={selectedWorkout.analysis.actualMetrics?.strideRatio ? `${selectedWorkout.analysis.actualMetrics.strideRatio}%` : '--'} 
                                                highlight={Number(selectedWorkout.analysis.actualMetrics?.strideRatio) > 11 ? 'destructive' : 'primary'}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                                                <div className="flex items-center gap-2 text-primary"><BrainCircuit size={16}/><h4 className="text-xs font-black uppercase italic">Análise do Coach IA</h4></div>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap italic text-muted-foreground">{selectedWorkout.analysis.analysisSummary}</p>
                                            </div>
                                            
                                            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-2">
                                                <div className="flex items-center gap-2 text-accent"><Zap size={16}/><h4 className="text-xs font-black uppercase italic">Próximos Passos</h4></div>
                                                <p className="text-sm leading-relaxed text-white font-medium italic">"{selectedWorkout.analysis.recommendations}"</p>
                                            </div>
                                        </div>

                                        <Button className="w-full bg-primary text-black font-black uppercase h-12 gap-2 rounded-xl" onClick={() => router.push('/coach')}>
                                            <MessageSquare size={18}/> CONVERSAR COM O COACH
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground">Como você se sentiu? (Feedback Subjetivo)</label>
                                            <Textarea 
                                                placeholder="Ex: Treino forte, senti um pouco de cansaço no final. Ritmo encaixou bem." 
                                                className="bg-secondary/10 min-h-[100px] font-medium rounded-xl border-border/50"
                                                value={athleteFeedback}
                                                onChange={(e) => setAthleteFeedback(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground">Anexar Evidência (Opcional)</label>
                                            <div 
                                                className="border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center space-y-4 cursor-pointer hover:bg-primary/5 transition-all"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <input type="file" ref={fileInputRef} className="sr-only" onChange={handleFileUpload} accept=".fit,.csv,image/*" />
                                                <div className="flex justify-center gap-4">
                                                    <div className="p-3 rounded-full bg-secondary/50 text-muted-foreground"><FileText size={24}/></div>
                                                    <div className="p-3 rounded-full bg-primary/10 text-primary"><Upload size={24}/></div>
                                                    <div className="p-3 rounded-full bg-secondary/50 text-muted-foreground"><ImageIcon size={24}/></div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase italic">Importar .FIT, .CSV ou Print</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Essencial para extração de biomecânica</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button 
                                            className="w-full bg-primary text-black font-black uppercase h-14 tracking-widest text-lg shadow-xl shadow-primary/20 rounded-xl"
                                            disabled={analyzing || !athleteFeedback.trim()}
                                            onClick={handleFinalizeAnalysis}
                                        >
                                            {analyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> ANALISANDO...</> : 'FINALIZAR E ANALISAR'}
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function MetricBox({ label, value, unit, highlight = 'default' }: { label: string, value: string, unit?: string, highlight?: 'default' | 'primary' | 'destructive' }) {
    return (
        <div className="bg-secondary/10 border p-3 rounded-xl text-center space-y-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">{label}</p>
            <p className={cn(
                "text-sm md:text-base font-black italic uppercase",
                highlight === 'primary' ? 'text-primary' : highlight === 'destructive' ? 'text-rose-500' : 'text-foreground'
            )}>
                {value} {unit && <span className="text-[9px] font-normal opacity-50">{unit}</span>}
            </p>
        </div>
    );
}
