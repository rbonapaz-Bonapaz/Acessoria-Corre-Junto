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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Loader2, 
    Zap, 
    Camera, 
    Dumbbell, 
    CheckCircle2,
    ShieldCheck,
    Utensils,
    Trophy,
    CalendarCheck,
    Info,
    FileText,
    Upload,
    Activity,
    User
} from 'lucide-react';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from '@/components/ui/skeleton';
import type { AthleteProfile } from '@/lib/types';

// Domingo como primeiro dia do sistema
const weekDays = [
  { id: 'Domingo', label: 'DOM' },
  { id: 'Segunda', label: 'SEG' },
  { id: 'Terça', label: 'TER' },
  { id: 'Quarta', label: 'QUA' },
  { id: 'Quinta', label: 'QUI' },
  { id: 'Sexta', label: 'SEX' },
  { id: 'Sábado', label: 'SÁB' },
] as const;

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  avatarUrl: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  currentWeight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  restingHr: z.coerce.number().optional(),
  vo2Max: z.coerce.number().optional(),
  thresholdPace: z.string().optional(),
  thresholdHr: z.coerce.number().optional(),
  raceName: z.string().optional(),
  raceDistance: z.string().optional(),
  raceDate: z.string().optional(),
  raceGoalType: z.enum(['pace', 'time']).default('pace'),
  targetPace: z.string().optional(),
  targetTime: z.string().optional(),
  trainingDays: z.array(z.string()).default([]),
  longRunDay: z.string().optional(),
  planGenerationType: z.enum(['full', 'blocks']).default('blocks'),
  experienceLevel: z.enum(['run_walk', 'beginner', 'intermediate', 'advanced']).optional(),
  trainingHistory: z.string().optional(),
  referenceDocumentUri: z.string().optional(),
  // Dieta
  aestheticGoal: z.enum(['performance', 'cutting', 'bulking', 'recomp']).optional(),
  trainingTiming: z.enum(['jejum', 'manha', 'meio-dia', 'tarde', 'noite']).optional(),
  mealCount: z.coerce.number().optional(),
  supplements: z.string().optional(),
  allergies: z.string().optional(),
  // Força
  legDay: z.string().optional(),
  strengthSplit: z.enum(['full_body', 'upper_lower', 'ppl']).optional(),
  strengthObjective: z.enum(['strength', 'hypertrophy', 'performance', 'endurance']).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const context = useContext(TrainingContext);
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
      trainingDays: ['Segunda', 'Quarta', 'Sexta'],
      raceGoalType: 'pace',
      planGenerationType: 'blocks',
      experienceLevel: 'beginner',
      raceDistance: '10k',
    }
  });

  const { reset, watch, setValue } = form;

  useEffect(() => {
    if (context?.isHydrated && context.activeProfile) {
      const p = context.activeProfile;
      reset({
        ...p,
        raceGoalType: p.targetTime ? 'time' : 'pace',
        aestheticGoal: p.dietPreferences?.aestheticGoal,
        trainingTiming: p.dietPreferences?.trainingTiming,
        mealCount: p.dietPreferences?.mealCount,
        supplements: p.dietPreferences?.supplements,
        allergies: p.dietPreferences?.allergies,
        legDay: p.strengthPreferences?.legDay,
        strengthSplit: p.strengthPreferences?.splitPreference,
        strengthObjective: p.strengthPreferences?.objective,
      } as any);
    }
  }, [context?.isHydrated, context?.activeProfile, reset]);

  const watchAvatarUrl = watch('avatarUrl');
  const watchGoalType = watch('raceGoalType');
  const watchReferenceDoc = watch('referenceDocumentUri');
  const watchTrainingDays = watch('trainingDays');

  const availableLongRunDays = useMemo(() => {
    return weekDays.filter(day => watchTrainingDays.includes(day.id));
  }, [watchTrainingDays]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const uri = await fileToDataURI(e.target.files[0]);
      setValue('avatarUrl', uri);
    }
  };

  const handleRefDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const uri = await fileToDataURI(e.target.files[0]);
      setValue('referenceDocumentUri', uri);
      toast({ title: "Documento Carregado", description: "O Coach lerá este guia na próxima geração." });
    }
  };

  const onSave = async (data: ProfileFormValues) => {
    if (!context) return;
    setIsSaving(true);
    
    try {
      const profileData: Partial<AthleteProfile> = {
        ...data,
        dietPreferences: {
          aestheticGoal: data.aestheticGoal,
          trainingTiming: data.trainingTiming,
          mealCount: data.mealCount,
          supplements: data.supplements,
          allergies: data.allergies,
        },
        strengthPreferences: {
          splitPreference: data.strengthSplit,
          objective: data.strengthObjective,
          legDay: data.legDay,
        }
      };
      
      await context.saveProfile(profileData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!context || !context.activeProfile) return;
    setIsProcessing(true);
    await context.generateRunningPlanAsync(context.activeProfile as AthleteProfile);
    setIsProcessing(false);
  };

  if (!context?.isHydrated) return <DashboardLayout><Skeleton className="h-96 w-full bg-secondary/20 rounded-3xl"/></DashboardLayout>;

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-8 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                <ShieldCheck size={32}/>
              </div>
              <div>
                <h1 className="font-headline text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                  <span className="text-white">MEU</span> <span className="text-primary">PERFIL</span>
                </h1>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] italic mt-1">Sincronização Cloud-First Ativa</p>
              </div>
            </div>
          </header>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
              <Tabs defaultValue="perfil" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto bg-secondary/20 p-1.5 rounded-2xl gap-2 shadow-inner">
                  <TabsTrigger value="perfil" className="py-4 font-headline font-black text-[10px] md:text-xs uppercase italic tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl">GERAL</TabsTrigger>
                  <TabsTrigger value="corrida" className="py-4 font-headline font-black text-[10px] md:text-xs uppercase italic tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl">CORRIDA</TabsTrigger>
                  <TabsTrigger value="alimentacao" className="py-4 font-headline font-black text-[10px] md:text-xs uppercase italic tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl">DIETA</TabsTrigger>
                  <TabsTrigger value="musculacao" className="py-4 font-headline font-black text-[10px] md:text-xs uppercase italic tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl">FORÇA</TabsTrigger>
                </TabsList>

                {/* --- ABA GERAL --- */}
                <TabsContent value="perfil" className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-secondary/10 border-b border-border/10 py-8 px-8">
                      <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="relative group">
                          <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary/20 rounded-[2.5rem] shadow-2xl transition-transform group-hover:scale-105 duration-300">
                            <AvatarImage src={watchAvatarUrl} className="object-cover" />
                            <AvatarFallback className="text-4xl font-black italic bg-secondary">{watch('name')?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <input type="file" ref={avatarFileRef} className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                          <Button type="button" variant="secondary" size="icon" className="absolute -bottom-2 -right-2 rounded-2xl h-12 w-12 bg-primary text-black hover:bg-white shadow-xl transition-all" onClick={() => avatarFileRef.current?.click()}>
                            <Camera size={20}/>
                          </Button>
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                          <CardTitle className="font-headline text-3xl md:text-4xl uppercase italic font-black tracking-tighter text-white">BIOMETRIA DE ELITE</CardTitle>
                          <CardDescription className="text-[11px] uppercase font-bold tracking-[0.2em] text-muted-foreground italic">Dados biométricos para calibração do motor de IA.</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
                      <FormField control={form.control} name="name" render={({field}) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic flex items-center gap-2">
                            <User className="size-3" /> Nome do Atleta
                          </FormLabel>
                          <FormControl><Input {...field} className="bg-black/30 h-16 font-black text-lg md:text-xl rounded-2xl border-border/40 focus:border-primary px-6" /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="birthDate" render={({field}) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Data de Nascimento</FormLabel>
                          <FormControl><Input type="date" {...field} className="bg-black/30 h-16 font-black text-lg md:text-xl rounded-2xl border-border/40 focus:border-primary px-6" /></FormControl>
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="currentWeight" render={({field}) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Peso (kg)</FormLabel>
                            <FormControl><Input type="number" step="0.1" {...field} className="bg-black/30 h-16 text-center font-black text-2xl rounded-2xl border-border/40 focus:border-primary" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="height" render={({field}) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Altura (cm)</FormLabel>
                            <FormControl><Input type="number" {...field} className="bg-black/30 h-16 text-center font-black text-2xl rounded-2xl border-border/40 focus:border-primary" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* --- ABA CORRIDA --- */}
                <TabsContent value="corrida" className="mt-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Bloco Fisiologia */}
                  <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-primary/5 border-b border-border/10 py-6 px-8">
                      <div className="flex items-center gap-4">
                        <Activity size={28} className="text-primary" />
                        <CardTitle className="font-headline text-2xl uppercase italic text-white font-black tracking-tighter">FISIOLOGIA DO ATLETA</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 md:p-10">
                      <FormField control={form.control} name="vo2Max" render={({field}) => (
                        <FormItem className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">VDOT (IA)</FormLabel>
                            <Tooltip><TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="text-[10px]">Padrão Jack Daniels de performance.</p></TooltipContent></Tooltip>
                          </div>
                          <FormControl><Input type="number" step="0.1" {...field} className="bg-primary/10 border-primary/40 h-16 text-2xl font-black text-primary text-center rounded-2xl" /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="thresholdPace" render={({field}) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Pace Limiar</FormLabel>
                          <FormControl><Input placeholder="4:20" {...field} className="bg-black/40 h-16 text-2xl font-black text-center rounded-2xl border-border/40" /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="thresholdHr" render={({field}) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">FC Limiar (L2)</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-black/40 h-16 text-2xl font-black text-center rounded-2xl border-border/40" /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="restingHr" render={({field}) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">FC Repouso</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-black/40 h-16 text-2xl font-black text-center rounded-2xl border-border/40" /></FormControl>
                        </FormItem>
                      )} />
                    </CardContent>
                    <CardFooter className="bg-secondary/10 py-4 border-t border-border/20 px-8">
                        <FormField control={form.control} name="experienceLevel" render={({field}) => (
                          <FormItem className="w-full">
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="bg-transparent border-none h-10 font-black text-[11px] uppercase italic tracking-widest text-muted-foreground hover:text-white transition-colors"><SelectValue placeholder="DEFINIR NÍVEL DE EXPERIÊNCIA" /></SelectTrigger></FormControl>
                              <SelectContent className="bg-card border-border">
                                <SelectItem value="run_walk">CORRIDA & CAMINHADA</SelectItem>
                                <SelectItem value="beginner">INICIANTE</SelectItem>
                                <SelectItem value="intermediate">INTERMEDIÁRIO</SelectItem>
                                <SelectItem value="advanced">AVANÇADO</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                    </CardFooter>
                  </Card>

                  {/* Bloco Prova Alvo */}
                  <Card className="bg-primary/5 border-primary/20 rounded-3xl overflow-hidden shadow-2xl border-2 animate-in zoom-in-95 duration-700">
                    <CardHeader className="bg-primary/10 border-b border-primary/20 py-8 px-10">
                      <div className="flex items-center gap-4">
                        <Trophy className="text-primary size-9 animate-pulse" />
                        <CardTitle className="font-headline text-3xl md:text-4xl uppercase italic font-black text-white tracking-tighter">INFORMAÇÕES DA PROVA ALVO</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-10 p-10 md:p-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="raceName" render={({field}) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">NOME DA PROVA</FormLabel>
                            <FormControl><Input placeholder="Ex: Maratona de Porto Alegre" {...field} className="bg-black/40 h-16 font-black text-xl rounded-2xl border-border/40 px-6 focus:border-primary" /></FormControl>
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-6">
                          <FormField control={form.control} name="raceDistance" render={({field}) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">DISTÂNCIA</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="bg-black/40 h-16 font-black text-xl rounded-2xl border-border/40 text-center"><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="5k">5 KM</SelectItem>
                                  <SelectItem value="10k">10 KM</SelectItem>
                                  <SelectItem value="21k">21.1 KM</SelectItem>
                                  <SelectItem value="42k">42.2 KM</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="raceDate" render={({field}) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">DATA DA PROVA</FormLabel>
                              <FormControl><Input type="date" {...field} className="bg-black/40 h-16 font-black text-xl rounded-2xl border-border/40 px-4" /></FormControl>
                            </FormItem>
                          )} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end border-t border-primary/10 pt-10">
                        <FormField control={form.control} name="raceGoalType" render={({field}) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground italic text-center block">ESTRATÉGIA DE META</FormLabel>
                            <div className="flex gap-4">
                              <Button type="button" variant={watchGoalType === 'pace' ? 'default' : 'secondary'} className={cn("flex-1 h-14 font-black uppercase italic tracking-widest transition-all rounded-2xl", watchGoalType === 'pace' && "bg-primary text-black")} onClick={() => setValue('raceGoalType', 'pace')}>PACE MÉDIO</Button>
                              <Button type="button" variant={watchGoalType === 'time' ? 'default' : 'secondary'} className={cn("flex-1 h-14 font-black uppercase italic tracking-widest transition-all rounded-2xl", watchGoalType === 'time' && "bg-primary text-black")} onClick={() => setValue('raceGoalType', 'time')}>TEMPO FINAL</Button>
                            </div>
                          </FormItem>
                        )} />
                        {watchGoalType === 'pace' ? (
                          <FormField control={form.control} name="targetPace" render={({field}) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Pace Alvo (min/km)</FormLabel>
                              <FormControl><Input placeholder="4:30" {...field} className="bg-primary/20 border-primary/40 h-16 font-black text-center text-3xl rounded-2xl text-primary" /></FormControl>
                            </FormItem>
                          )} />
                        ) : (
                          <FormField control={form.control} name="targetTime" render={({field}) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Tempo Alvo (HH:MM:SS)</FormLabel>
                              <FormControl><Input placeholder="03:30:00" {...field} className="bg-primary/20 border-primary/40 h-16 font-black text-center text-3xl rounded-2xl text-primary" /></FormControl>
                            </FormItem>
                          )} />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bloco Disponibilidade */}
                  <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-secondary/20 border-b border-border/10 py-6 px-8">
                       <div className="flex items-center gap-4"><CalendarCheck className="text-primary size-6"/><h3 className="text-sm font-black uppercase italic tracking-[0.2em]">LOGÍSTICA SEMANAL</h3></div>
                    </CardHeader>
                    <CardContent className="p-8 md:p-10 space-y-10">
                      <div className="space-y-6">
                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Dias de Treinamento</FormLabel>
                        <div className="flex flex-wrap gap-4">
                          {weekDays.map((day) => (
                            <FormField key={day.id} control={form.control} name="trainingDays" render={({ field }) => (
                              <FormItem key={day.id} className="flex flex-row items-center space-x-3 space-y-0 p-4 md:p-5 rounded-2xl border border-border/40 bg-black/20 hover:bg-primary/5 transition-all cursor-pointer">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.id)}
                                    onCheckedChange={(checked) => {
                                      const newVal = checked
                                        ? [...field.value, day.id]
                                        : field.value?.filter((value) => value !== day.id);
                                      field.onChange(newVal);
                                      if (!checked && form.getValues('longRunDay') === day.id) {
                                        setValue('longRunDay', '');
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-xs md:text-sm font-black italic cursor-pointer uppercase tracking-widest">{day.label}</FormLabel>
                              </FormItem>
                            )} />
                          ))}
                        </div>
                      </div>

                      <FormField control={form.control} name="longRunDay" render={({field}) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">Dia do Longão (LSD)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="bg-black/30 h-16 font-black text-xl rounded-2xl border-border/40 px-6"><SelectValue placeholder="Escolha um dos dias de treino..." /></SelectTrigger></FormControl>
                            <SelectContent className="bg-card border-border">
                              {availableLongRunDays.length > 0 ? (
                                availableLongRunDays.map(d => <SelectItem key={d.id} value={d.id} className="font-black italic uppercase">{d.id}</SelectItem>)
                              ) : (
                                <p className="p-4 text-xs italic text-muted-foreground text-center">Selecione seus dias de treino primeiro.</p>
                              )}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-muted-foreground italic uppercase tracking-wider">Apenas dias selecionados no calendário acima estão disponíveis.</p>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>

                  {/* Bloco Documentos IA */}
                  <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-secondary/20 border-b border-border/10 py-6 px-8">
                       <div className="flex items-center gap-4"><FileText className="text-primary size-6"/><h3 className="text-sm font-black uppercase italic tracking-[0.2em]">REFERÊNCIA TÉCNICA (IA CONTEXT)</h3></div>
                    </CardHeader>
                    <CardContent className="p-8 md:p-10">
                       <div 
                         className={cn(
                           "border-3 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300",
                           watchReferenceDoc ? "border-primary bg-primary/10 shadow-inner" : "border-border/40 hover:border-primary/50 hover:bg-primary/5"
                         )}
                         onClick={() => refDocFileRef.current?.click()}
                       >
                         <input type="file" ref={refDocFileRef} className="sr-only" onChange={handleRefDocChange} accept=".pdf,image/*" />
                         {watchReferenceDoc ? (
                           <div className="flex flex-col items-center gap-4 animate-in zoom-in-95">
                             <CheckCircle2 className="size-16 text-primary" />
                             <p className="text-lg font-black uppercase italic text-primary tracking-tighter">DIRETRIZ SINCRONIZADA</p>
                             <p className="text-[10px] text-muted-foreground uppercase italic tracking-widest">O Coach Gemini usará este arquivo como base para seu próximo ciclo.</p>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                             <Upload className="size-16 text-muted-foreground" />
                             <div className="space-y-1">
                               <p className="text-xs font-black uppercase italic tracking-[0.2em] text-white">Upload de Plano ou Orientações</p>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Arraste seu PDF ou Print do Treinador anterior</p>
                             </div>
                           </div>
                         )}
                       </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* --- ABA ALIMENTAÇÃO --- */}
                <TabsContent value="alimentacao" className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-orange-500/10 border-b border-border/10 py-8 px-8">
                      <CardTitle className="font-headline text-3xl md:text-4xl uppercase italic text-orange-500 font-black flex items-center gap-4 tracking-tighter">
                        <Utensils size={32}/> ESTRATÉGIA NUTRICIONAL
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8 md:p-12">
                       <FormField control={form.control} name="aestheticGoal" render={({field}) => (
                         <FormItem className="space-y-3">
                           <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">OBJETIVO CORPORAL PRINCIPAL</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl><SelectTrigger className="bg-black/30 h-16 font-black text-xl rounded-2xl border-border/40 px-6"><SelectValue placeholder="Selecione sua meta..." /></SelectTrigger></FormControl>
                             <SelectContent className="bg-card border-border">
                               <SelectItem value="performance" className="font-black italic uppercase">PERFORMANCE PURA</SelectItem>
                               <SelectItem value="cutting" className="font-black italic uppercase">DEFINIÇÃO (CUTTING)</SelectItem>
                               <SelectItem value="bulking" className="font-black italic uppercase">GANHO DE MASSA (BULKING)</SelectItem>
                               <SelectItem value="recomp" className="font-black italic uppercase">RECOMPOSIÇÃO CORPORAL</SelectItem>
                             </SelectContent>
                           </Select>
                         </FormItem>
                       )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* --- ABA MUSCULAÇÃO --- */}
                <TabsContent value="musculacao" className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-purple-500/10 border-b border-border/10 py-8 px-8">
                      <CardTitle className="font-headline text-3xl md:text-4xl uppercase italic text-purple-500 font-black flex items-center gap-4 tracking-tighter">
                        <Dumbbell size={32}/> SUPORTE MECÂNICO (FORÇA)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-10 p-8 md:p-12">
                      <FormField control={form.control} name="legDay" render={({field}) => (
                        <FormItem className="space-y-4">
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">DIA DE TREINO DE PERNA (LEG DAY)</FormLabel>
                            <Tooltip><TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="text-[10px]">A IA evitará tiros ou longões no dia seguinte ao seu Leg Day.</p></TooltipContent></Tooltip>
                          </div>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="bg-black/30 h-16 font-black text-xl rounded-2xl border-border/40 px-6"><SelectValue placeholder="Escolha o dia da musculação de perna..." /></SelectTrigger></FormControl>
                            <SelectContent className="bg-card border-border">
                              {weekDays.map(d => <SelectItem key={d.id} value={d.id} className="font-black italic uppercase">{d.id}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Botões de Ação Final */}
              <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-border/20 px-2 pb-20">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSaving} 
                  className="flex-1 h-20 font-black uppercase tracking-[0.3em] italic bg-white text-black hover:bg-primary transition-all duration-300 rounded-[2rem] shadow-2xl hover:scale-[1.02]"
                >
                  {isSaving ? <Loader2 className="animate-spin mr-3 size-7" /> : <CheckCircle2 className="mr-3 size-7" />}
                  SALVAR PERFIL
                </Button>
                
                <Button 
                  type="button" 
                  size="lg" 
                  className="flex-1 h-20 font-black uppercase tracking-[0.3em] italic bg-primary text-black shadow-2xl rounded-[2rem] transition-all hover:scale-[1.02] hover:bg-white"
                  onClick={handleGenerate}
                  disabled={isProcessing || !context.activeProfile}
                >
                  {isProcessing ? <Loader2 className="animate-spin mr-3 size-7" /> : <Zap className="mr-3 size-7" />} 
                  GERAR CICLO IA
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
