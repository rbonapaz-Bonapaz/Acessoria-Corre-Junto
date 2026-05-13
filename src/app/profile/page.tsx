
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
    User,
    Calendar
} from 'lucide-react';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from '@/components/ui/skeleton';
import type { AthleteProfile } from '@/lib/types';

const weekDays = [
  { id: 'Segunda', label: 'SEG' },
  { id: 'Terça', label: 'TER' },
  { id: 'Quarta', label: 'QUA' },
  { id: 'Quinta', label: 'QUI' },
  { id: 'Sexta', label: 'SEX' },
  { id: 'Sábado', label: 'SÁB' },
  { id: 'Domingo', label: 'DOM' },
] as const;

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  avatarUrl: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  currentWeight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  restingHr: z.coerce.number().optional().default(50),
  vo2Max: z.coerce.number().optional().default(45),
  thresholdPace: z.string().optional().default('4:50'),
  thresholdHr: z.coerce.number().optional().default(165),
  weeklyMileageGoal: z.coerce.number().optional().default(60),
  raceName: z.string().optional(),
  raceDistance: z.string().optional().default('10k'),
  raceDate: z.string().optional(),
  raceGoalType: z.enum(['pace', 'time']).default('pace'),
  targetPace: z.string().optional(),
  targetTime: z.string().optional(),
  trainingDays: z.array(z.string()).default(['Segunda', 'Quarta', 'Sexta']),
  longRunDay: z.string().optional().default('Sexta'),
  planGenerationType: z.enum(['full', 'blocks']).default('blocks'),
  experienceLevel: z.enum(['run_walk', 'beginner', 'intermediate', 'advanced']).optional().default('beginner'),
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
      weeklyMileageGoal: 60,
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

                {/* ABA GERAL */}
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

                {/* ABA CORRIDA - LAYOUT IMAGE 2 REPLICADO */}
                <TabsContent value="corrida" className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="py-6 px-8 space-y-1">
                      <h2 className="text-2xl md:text-3xl font-headline font-black uppercase italic text-primary leading-none">INTELIGÊNCIA DE CORRIDA</h2>
                      <p className="text-muted-foreground text-xs font-medium">Configure seus dados fisiológicos para a periodização.</p>
                    </CardHeader>
                    
                    <CardContent className="p-8 md:p-10 space-y-12">
                      {/* Grid Fisiologia */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <FormField control={form.control} name="restingHr" render={({field}) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-[11px] font-black uppercase text-white italic">FC REPOUSO</FormLabel>
                              <Tooltip><TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="text-[10px]">Batimentos por minuto ao acordar.</p></TooltipContent></Tooltip>
                            </div>
                            <FormControl><Input type="number" {...field} className="bg-black/40 border-border/40 h-12 text-center font-black rounded-xl" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="vo2Max" render={({field}) => (
                          <FormItem className="space-y-2">
                             <div className="flex items-center gap-2">
                              <FormLabel className="text-[11px] font-black uppercase text-white italic">VO2 MÁX</FormLabel>
                              <Tooltip><TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="text-[10px]">Seu índice VDOT de performance.</p></TooltipContent></Tooltip>
                            </div>
                            <FormControl><Input type="number" step="0.1" {...field} className="bg-black/40 border-border/40 h-12 text-center font-black rounded-xl" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="thresholdPace" render={({field}) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-[11px] font-black uppercase text-white italic">PACE LIMIAR</FormLabel>
                              <Tooltip><TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="text-[10px]">Ritmo sustentável em esforço de limiar.</p></TooltipContent></Tooltip>
                            </div>
                            <FormControl><Input {...field} className="bg-black/40 border-border/40 h-12 text-center font-black rounded-xl" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="thresholdHr" render={({field}) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-[11px] font-black uppercase text-white italic">FC LIMIAR (L2)</FormLabel>
                              <Tooltip><TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="text-[10px]">Ponto de transição aeróbica-anaeróbica.</p></TooltipContent></Tooltip>
                            </div>
                            <FormControl><Input type="number" {...field} className="bg-black/40 border-border/40 h-12 text-center font-black rounded-xl" /></FormControl>
                          </FormItem>
                        )} />
                      </div>

                      {/* Disponibilidade Semanal */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Calendar className="size-4 text-primary" />
                             <span className="text-[11px] font-black uppercase text-white italic">DISPONIBILIDADE SEMANAL CORRIDA</span>
                          </div>
                          <span className="text-[9px] font-black uppercase text-primary italic tracking-widest">
                            {watchTrainingDays.length} DIAS / SEMANA
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {weekDays.map((day) => (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => {
                                const newVal = watchTrainingDays.includes(day.id)
                                  ? watchTrainingDays.filter((d) => d !== day.id)
                                  : [...watchTrainingDays, day.id];
                                setValue('trainingDays', newVal);
                                // Limpa o dia do longão se ele não estiver mais disponível
                                if (watch('longRunDay') === day.id && !newVal.includes(day.id)) {
                                  setValue('longRunDay', '');
                                }
                              }}
                              className={cn(
                                "flex-1 min-w-[80px] h-12 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group",
                                watchTrainingDays.includes(day.id)
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border/40 bg-black/20 text-muted-foreground hover:border-primary/50"
                              )}
                            >
                              <span className="text-[10px] font-black italic">{day.label}</span>
                              {watchTrainingDays.includes(day.id) && <Activity className="size-3 animate-pulse" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Seletores de Plano */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="longRunDay" render={({field}) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[11px] font-black uppercase text-white italic">DIA DE LONGÃO</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="bg-black/40 border-border/40 h-12 font-black italic rounded-xl px-4"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                              <SelectContent className="bg-card border-border">
                                {availableLongRunDays.length > 0 ? (
                                  availableLongRunDays.map(d => <SelectItem key={d.id} value={d.id} className="font-black italic uppercase">{d.id}</SelectItem>)
                                ) : (
                                  <p className="p-4 text-[10px] italic text-muted-foreground text-center">Marque disponibilidade acima.</p>
                                )}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="planGenerationType" render={({field}) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-[11px] font-black uppercase text-white italic">ESTRATÉGIA CICLO</FormLabel>
                              <Tooltip><TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="text-[10px]">Escolha como o plano será gerado.</p></TooltipContent></Tooltip>
                            </div>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="bg-black/40 border-border/40 h-12 font-black italic rounded-xl px-4"><SelectValue/></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="blocks" className="font-black italic uppercase">Blocos (4 Semanas)</SelectItem>
                                <SelectItem value="full" className="font-black italic uppercase">Ciclo Até a Prova</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="experienceLevel" render={({field}) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-[11px] font-black uppercase text-white italic">NÍVEL DE EXPERIÊNCIA</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="bg-black/40 border-border/40 h-12 font-black italic rounded-xl px-4"><SelectValue/></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="run_walk" className="font-black italic uppercase">Começando (Até 20km/sem)</SelectItem>
                                <SelectItem value="beginner" className="font-black italic uppercase">Intermediário (30-45km/sem)</SelectItem>
                                <SelectItem value="intermediate" className="font-black italic uppercase">Avançado (50-65km/sem)</SelectItem>
                                <SelectItem value="advanced" className="font-black italic uppercase">Elite (Acima 70km/sem)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                      </div>

                      {/* Bloco de Prova Alvo */}
                      <div className="pt-8 border-t border-border/20 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <FormField control={form.control} name="raceName" render={({field}) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[11px] font-black uppercase text-white italic">NOME DA PROVA</FormLabel>
                              <FormControl><Input placeholder="Ex: Maratona de Porto Alegre" {...field} className="bg-black/40 border-border/40 h-12 font-black italic rounded-xl px-4" /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="raceDate" render={({field}) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-[11px] font-black uppercase text-white italic">DATA DA PROVA</FormLabel>
                              <FormControl><Input type="date" {...field} className="bg-black/40 border-border/40 h-12 font-black italic rounded-xl px-4" /></FormControl>
                            </FormItem>
                          )} />
                        </div>
                        <p className="text-[11px] font-medium italic text-muted-foreground text-center">Atleta em evolução buscando performance.</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documento de Referência */}
                  <Card className="bg-card/40 border-border/50 rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="bg-secondary/20 border-b border-border/10 py-6 px-8">
                       <div className="flex items-center gap-4"><FileText className="text-primary size-6"/><h3 className="text-sm font-black uppercase italic tracking-[0.2em]">IA CONTEXT (ORIENTAÇÕES ANTERIORES)</h3></div>
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
                           </div>
                         ) : (
                           <div className="flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                             <Upload className="size-16 text-muted-foreground" />
                             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Clique para anexar Plano Anterior ou PDF de Treinador</p>
                           </div>
                         )}
                       </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ABA ALIMENTAÇÃO */}
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

                {/* ABA MUSCULAÇÃO */}
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

              {/* Botões de Ação */}
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
