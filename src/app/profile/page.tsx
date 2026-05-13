'use client';

import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { TrainingContext } from '@/contexts/TrainingContext';
import { useToast } from '@/hooks/use-toast';
import { fileToDataURI, cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage, 
    FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
    Loader2, 
    Zap, 
    Camera, 
    Dumbbell, 
    CheckCircle2,
    ShieldCheck,
    Utensils,
    Target,
    Activity,
    Trophy,
    History as HistoryIcon,
    CalendarCheck,
    Info,
    Trash2,
    AlertTriangle,
    FileText,
    Upload
} from 'lucide-react';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';
import type { AthleteProfile } from '@/lib/types';

const weekDays = [
  { id: 'Domingo', label: 'DOM' },
  { id: 'Segunda', label: 'SEG' },
  { id: 'Terça', label: 'TER' },
  { id: 'Quarta', label: 'QUA' },
  { id: 'Quinta', label: 'QUI' },
  { id: 'Sexta', label: 'SEX' },
  { id: 'Sábado', label: 'SÁB' },
] as const;

const equipmentOptions = [
  'Academia Completa',
  'Halteres / Kettlebells',
  'Elásticos / Mini-bands',
  'Peso do Corpo (Calistenia)',
  'Barra Fixa / Paralelas',
];

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.').optional().or(z.literal('')),
  avatarUrl: z.string().optional(),
  birthDate: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional(),
  currentWeight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  restingHr: z.coerce.number().optional(),
  vo2Max: z.coerce.number().optional(),
  thresholdPace: z.string().optional().or(z.literal('')),
  thresholdHr: z.coerce.number().optional(),
  raceName: z.string().optional().or(z.literal('')),
  raceDistance: z.string().optional().or(z.literal('')),
  raceDate: z.string().optional().or(z.literal('')),
  raceGoalType: z.enum(['pace', 'time']).default('pace'),
  targetPace: z.string().optional().or(z.literal('')),
  targetTime: z.string().optional().or(z.literal('')),
  trainingDays: z.array(z.string()).default([]),
  longRunDay: z.string().optional().or(z.literal('')),
  planGenerationType: z.enum(['full', 'blocks']).default('blocks'),
  experienceLevel: z.enum(['run_walk', 'beginner', 'intermediate', 'advanced']).optional(),
  trainingHistory: z.string().optional().or(z.literal('')),
  referenceDocumentUri: z.string().optional().or(z.literal('')),
  aestheticGoal: z.enum(['cutting', 'bulking', 'recomp', 'performance']).optional(),
  trainingTiming: z.enum(['jejum', 'manha', 'meio-dia', 'tarde', 'noite']).optional(),
  mealCount: z.coerce.number().optional(),
  supplements: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  preferredFoods: z.string().optional().or(z.literal('')),
  excludedFoods: z.string().optional().or(z.literal('')),
  strengthSplit: z.enum(['full_body', 'upper_lower', 'ppl']).optional(),
  strengthObjective: z.enum(['strength', 'hypertrophy', 'performance', 'endurance']).optional(),
  strengthFrequency: z.coerce.number().optional(),
  strengthDays: z.array(z.string()).optional(),
  strengthEquipment: z.array(z.string()).optional(),
  strengthFocus: z.array(z.string()).optional(),
  legDay: z.string().optional().or(z.literal('')),
  limitations: z.string().optional().or(z.literal('')),
  prBench: z.coerce.number().optional(),
  prSquat: z.coerce.number().optional(),
  prDeadlift: z.coerce.number().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const context = useContext(TrainingContext);
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("perfil");
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const refDocFileRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: '', 
        trainingDays: ['Domingo', 'Terça', 'Quinta', 'Sábado'], 
        raceGoalType: 'pace',
        planGenerationType: 'blocks',
        experienceLevel: 'beginner',
        referenceDocumentUri: ''
    }
  });

  const { reset, watch, setValue, getValues } = form;
  const trainingDays = watch('trainingDays') || [];
  
  const availableLongRunDays = useMemo(() => {
    return weekDays.filter(day => trainingDays.includes(day.id));
  }, [trainingDays]);

  useEffect(() => {
    if (context?.isHydrated) {
        if (context.activeProfile) {
            const p = context.activeProfile;
            reset({
                ...p,
                name: p.name || '',
                raceGoalType: p.targetTime ? 'time' : 'pace',
                targetPace: p.targetPace || '',
                targetTime: p.targetTime || '',
                raceName: p.raceName || '',
                raceDistance: p.raceDistance || '10k',
                raceDate: p.raceDate || '',
                experienceLevel: p.experienceLevel || 'beginner',
                planGenerationType: p.planGenerationType || 'blocks',
                trainingHistory: p.trainingHistory || '',
                referenceDocumentUri: p.referenceDocumentUri || '',
                aestheticGoal: p.dietPreferences?.aestheticGoal || 'performance',
                strengthSplit: p.strengthPreferences?.splitPreference || 'full_body',
                strengthObjective: p.strengthPreferences?.objective || 'performance',
                strengthFrequency: p.strengthPreferences?.frequency || 3,
                strengthDays: p.strengthPreferences?.trainingDays || [],
                strengthEquipment: p.strengthPreferences?.equipment || [],
                strengthFocus: p.strengthPreferences?.focusAreas || [],
                legDay: p.strengthPreferences?.legDay || '',
            } as any);
        }
    }
  }, [context?.isHydrated, context?.activeProfile, reset]);

  const watchAvatarUrl = watch('avatarUrl');
  const watchGoalType = watch('raceGoalType');
  const watchReferenceDoc = watch('referenceDocumentUri');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const dataUri = await fileToDataURI(e.target.files[0]);
        setValue('avatarUrl', dataUri);
        toast({ title: "Foto atualizada!" });
      } catch (err) { toast({ variant: 'destructive', title: 'Erro na imagem' }); }
    }
  };

  const handleRefDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const dataUri = await fileToDataURI(e.target.files[0]);
        setValue('referenceDocumentUri', dataUri);
        toast({ title: "Documento carregado!", description: "A IA usará este PDF como referência na próxima geração." });
      } catch (err) { toast({ variant: 'destructive', title: 'Erro no documento' }); }
    }
  };

  const handleSaveActiveTab = async () => {
    if (!context) return;
    setIsSaving(true);
    const data = getValues();
    
    const profileToUpdate: Partial<AthleteProfile> = {
      ...data,
      dietPreferences: {
        aestheticGoal: data.aestheticGoal,
        trainingTiming: data.trainingTiming,
        mealCount: data.mealCount,
        supplements: data.supplements,
        allergies: data.allergies,
        preferredFoods: data.preferredFoods,
        excludedFoods: data.excludedFoods
      },
      strengthPreferences: {
        splitPreference: data.strengthSplit,
        objective: data.strengthObjective,
        frequency: data.strengthFrequency,
        trainingDays: data.strengthDays,
        equipment: data.strengthEquipment,
        focusAreas: data.strengthFocus,
        legDay: data.legDay,
        limitations: data.limitations,
        prBench: data.prBench,
        prSquat: data.prSquat,
        prDeadlift: data.prDeadlift
      }
    };

    try {
        await context.saveProfile(profileToUpdate);
        toast({ title: "Sincronizado!", description: "Dados salvos na nuvem." });
    } catch (err) {
        toast({ variant: 'destructive', title: "Erro ao salvar" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!context || !context.activeProfile) return;
    setIsProcessing(true);
    try {
        await context.generateRunningPlanAsync(context.activeProfile);
    } finally {
        setIsProcessing(false);
    }
  };

  if (!context?.isHydrated) return <DashboardLayout><Skeleton className="h-96 w-full"/></DashboardLayout>;

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-8 pb-12 max-w-5xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
              <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck size={28}/>
                  </div>
                  <div>
                      <h1 className="font-headline text-2xl md:text-3xl tracking-wide uppercase font-black italic">
                          <span className="text-white">MEU</span> <span className="text-primary">PERFIL</span>
                      </h1>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest italic">
                          Sincronização em Tempo Real
                      </p>
                  </div>
              </div>
          </header>

          <Form {...form}>
              <div className="space-y-8">
                  <Tabs defaultValue="perfil" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4 h-auto bg-secondary/20 p-1 rounded-xl">
                          <TabsTrigger value="perfil" className="py-2.5 font-bold text-[10px] uppercase italic">Geral</TabsTrigger>
                          <TabsTrigger value="corrida" className="py-2.5 font-bold text-[10px] uppercase italic">Corrida</TabsTrigger>
                          <TabsTrigger value="alimentacao" className="py-2.5 font-bold text-[10px] uppercase italic">Dieta</TabsTrigger>
                          <TabsTrigger value="musculacao" className="py-2.5 font-bold text-[10px] uppercase italic">Força</TabsTrigger>
                      </TabsList>

                      <TabsContent value="perfil" className="mt-6 space-y-6 animate-in fade-in">
                          <Card className="bg-card/50 border-border/50 shadow-2xl">
                              <CardHeader>
                                  <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                      <div className="relative">
                                          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-primary/20 shadow-2xl rounded-3xl">
                                              <AvatarImage src={watchAvatarUrl} className="object-cover" />
                                              <AvatarFallback className="text-3xl font-black italic">{watch('name')?.[0] || '?'}</AvatarFallback>
                                          </Avatar>
                                          <input type="file" ref={avatarFileRef} className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                                          <Button type="button" variant="secondary" size="icon" className="absolute -bottom-2 -right-2 rounded-xl h-10 w-10 shadow-xl bg-white text-black" onClick={() => avatarFileRef.current?.click()}>
                                              <Camera size={16}/>
                                          </Button>
                                      </div>
                                      <div className="space-y-1">
                                          <CardTitle className="font-headline text-2xl md:text-3xl uppercase italic font-black">Biometria Elite</CardTitle>
                                          <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground italic">Dados essenciais para carga metabólica.</CardDescription>
                                      </div>
                                  </div>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/50">
                                  <FormField control={form.control} name="name" render={({field}) => (
                                      <FormItem>
                                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Nome Completo</FormLabel>
                                          <FormControl><Input {...field} className="bg-black/30 h-14 text-lg font-bold border-border/40 focus:border-primary" /></FormControl>
                                      </FormItem>
                                  )} />
                                  <FormField control={form.control} name="birthDate" render={({field}) => (
                                      <FormItem>
                                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Nascimento</FormLabel>
                                          <FormControl><Input type="date" {...field} className="bg-black/30 h-14 text-lg font-bold border-border/40 focus:border-primary" /></FormControl>
                                      </FormItem>
                                  )} />
                                  <div className="grid grid-cols-2 gap-4">
                                      <FormField control={form.control} name="currentWeight" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Peso (kg)</FormLabel>
                                              <FormControl><Input type="number" step="0.1" {...field} className="bg-black/30 h-14 text-xl font-black text-center border-border/40 focus:border-primary" /></FormControl>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="height" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Altura (cm)</FormLabel>
                                              <FormControl><Input type="number" {...field} className="bg-black/30 h-14 text-xl font-black text-center border-border/40 focus:border-primary" /></FormControl>
                                          </FormItem>
                                      )} />
                                  </div>
                              </CardContent>
                          </Card>
                      </TabsContent>

                      <TabsContent value="corrida" className="mt-6 space-y-6 animate-in fade-in">
                          <Card className="bg-card/50 border-border/50 shadow-2xl">
                              <CardHeader className="bg-primary/5 border-b border-border/50 py-8">
                                  <CardTitle className="font-headline text-2xl uppercase italic text-primary font-black flex items-center gap-3 tracking-tighter">
                                      <Activity size={28}/> Fisiologia & Prova Alvo
                                  </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-12 pt-10">
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                      <FormField control={form.control} name="vo2Max" render={({field}) => (
                                          <FormItem>
                                              <div className="flex items-center gap-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">VDOT (Jack Daniels)</FormLabel>
                                                <Tooltip>
                                                  <TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                                                  <TooltipContent><p className="max-w-xs text-[10px]">Índice que define seu potencial de performance baseado em resultados reais de prova.</p></TooltipContent>
                                                </Tooltip>
                                              </div>
                                              <FormControl><Input type="number" step="0.1" {...field} className="bg-primary/5 border-primary/30 h-16 text-2xl font-black text-primary text-center rounded-2xl" /></FormControl>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="thresholdHr" render={({field}) => (
                                          <FormItem>
                                              <div className="flex items-center gap-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">FC Limiar (L2)</FormLabel>
                                                <Tooltip>
                                                  <TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                                                  <TooltipContent><p className="max-w-xs text-[10px]">Sua frequência cardíaca no ponto de transição aeróbica-anaeróbica.</p></TooltipContent>
                                                </Tooltip>
                                              </div>
                                              <FormControl><Input type="number" {...field} className="bg-black/40 h-16 text-2xl font-black text-center rounded-2xl border-border/40" /></FormControl>
                                          </FormItem>
                                      )} />
                                  </div>

                                  <div className="space-y-8 border-t border-border/20 pt-10">
                                      <div className="flex items-center gap-3">
                                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Trophy size={18}/></div>
                                          <h4 className="text-xs font-black uppercase italic tracking-[0.2em]">Objetivo do Ciclo</h4>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <FormField control={form.control} name="raceName" render={({field}) => (
                                              <FormItem>
                                                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome do Evento</FormLabel>
                                                  <FormControl><Input placeholder="Ex: Maratona de Porto Alegre" {...field} className="bg-black/30 h-14 font-black text-white rounded-xl" /></FormControl>
                                              </FormItem>
                                          )} />
                                          <div className="grid grid-cols-2 gap-4">
                                              <FormField control={form.control} name="raceDistance" render={({field}) => (
                                                  <FormItem>
                                                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Distância</FormLabel>
                                                      <Select onValueChange={field.onChange} value={field.value}>
                                                          <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                                          <SelectContent className="bg-card border-border">
                                                              <SelectItem value="5k">5 km</SelectItem>
                                                              <SelectItem value="10k">10 km</SelectItem>
                                                              <SelectItem value="21k">Meia Maratona</SelectItem>
                                                              <SelectItem value="42k">Maratona</SelectItem>
                                                          </SelectContent>
                                                      </Select>
                                                  </FormItem>
                                              )} />
                                              <FormField control={form.control} name="raceDate" render={({field}) => (
                                                  <FormItem>
                                                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data da Prova</FormLabel>
                                                      <FormControl><Input type="date" {...field} className="bg-black/30 h-14 font-black rounded-xl" /></FormControl>
                                                  </FormItem>
                                              )} />
                                          </div>
                                      </div>
                                  </div>

                                  <div className="space-y-4 border-t border-border/20 pt-10">
                                      <div className="flex items-center gap-3">
                                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><FileText size={18}/></div>
                                          <h4 className="text-xs font-black uppercase italic tracking-[0.2em]">Referência (PDF / Print)</h4>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <div 
                                              className={cn(
                                                "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all",
                                                watchReferenceDoc ? "border-primary bg-primary/10" : "border-border/40 hover:bg-primary/5"
                                              )}
                                              onClick={() => refDocFileRef.current?.click()}
                                          >
                                              <input type="file" ref={refDocFileRef} className="sr-only" onChange={handleRefDocChange} accept=".pdf,image/*" />
                                              {watchReferenceDoc ? (
                                                  <div className="flex flex-col items-center gap-2">
                                                      <CheckCircle2 className="size-8 text-primary" />
                                                      <p className="text-[10px] font-black uppercase italic text-primary">Carregado</p>
                                                  </div>
                                              ) : (
                                                  <div className="flex flex-col items-center gap-2">
                                                      <Upload className="size-8 text-muted-foreground opacity-50" />
                                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Upload de Guia</p>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                      </TabsContent>

                      <TabsContent value="alimentacao" className="mt-6 space-y-6 animate-in fade-in">
                          <Card className="bg-card/50 border-border/50 shadow-2xl">
                              <CardHeader className="bg-orange-500/5 border-b border-border/50 py-8">
                                  <CardTitle className="font-headline text-2xl uppercase italic text-orange-500 font-black flex items-center gap-3 tracking-tighter">
                                      <Utensils size={28}/> Nutrição Esportiva
                                  </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-10 pt-10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                      <FormField control={form.control} name="aestheticGoal" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta IA</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value}>
                                                  <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                                  <SelectContent className="bg-card border-border">
                                                      <SelectItem value="performance">Performance</SelectItem>
                                                      <SelectItem value="cutting">Secar (Cutting)</SelectItem>
                                                      <SelectItem value="bulking">Ganho (Bulking)</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </FormItem>
                                      )} />
                                  </div>
                              </CardContent>
                          </Card>
                      </TabsContent>

                      <TabsContent value="musculacao" className="mt-6 space-y-6 animate-in fade-in">
                          <Card className="bg-card/50 border-border/50 shadow-2xl">
                              <CardHeader className="bg-purple-500/5 border-b border-border/50 py-8">
                                  <CardTitle className="font-headline text-2xl uppercase italic text-purple-500 font-black flex items-center gap-3 tracking-tighter">
                                      <Dumbbell size={28}/> Força & Estabilidade
                                  </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-12 pt-10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                      <FormField control={form.control} name="legDay" render={({field}) => (
                                          <FormItem>
                                              <div className="flex items-center gap-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-purple-400">Dia de Perna</FormLabel>
                                              </div>
                                              <Select onValueChange={field.onChange} value={field.value}>
                                                  <FormControl><SelectTrigger className="bg-purple-500/10 border-purple-500/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                                  <SelectContent className="bg-card border-border">
                                                      {weekDays.map(d => <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>)}
                                                  </SelectContent>
                                              </Select>
                                          </FormItem>
                                      )} />
                                  </div>
                              </CardContent>
                          </Card>
                      </TabsContent>
                  </Tabs>

                  <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-border/50 px-2 pb-10">
                      <Button 
                          type="button" 
                          size="lg" 
                          disabled={isSaving} 
                          className="flex-1 h-16 font-black uppercase tracking-[0.2em] italic bg-white text-black hover:bg-white/90 shadow-2xl rounded-2xl"
                          onClick={handleSaveActiveTab}
                      >
                          {isSaving ? <Loader2 className="animate-spin mr-3 size-6" /> : <CheckCircle2 className="mr-3 size-6" />}
                          SALVAR PERFIL
                      </Button>
                      
                      <Button 
                          type="button" 
                          size="lg" 
                          className="flex-1 h-16 font-black uppercase tracking-[0.2em] italic bg-primary text-black shadow-2xl rounded-2xl"
                          onClick={handleGenerate}
                          disabled={isProcessing || !context.activeProfile}
                      >
                          {isProcessing ? <Loader2 className="animate-spin mr-3 size-6" /> : <Zap className="mr-3 size-6" />} 
                          GERAR PLANILHA IA
                      </Button>
                  </div>
              </div>
          </Form>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
