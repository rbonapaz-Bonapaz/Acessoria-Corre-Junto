
'use client';

import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AppContext } from '@/contexts/AppContext';
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
    Download,
    CheckCircle2,
    ShieldCheck,
    Utensils,
    Target,
    Activity,
    Trophy,
    History as HistoryIcon,
    CalendarCheck,
    Users,
    Info,
    Trash2,
    AlertTriangle
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
  athleteEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
  avatarUrl: z.string().optional(),
  location: z.string().optional(),
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
  const context = useContext(AppContext);
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("perfil");
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: '', 
        athleteEmail: '',
        trainingDays: ['Domingo', 'Terça', 'Quinta', 'Sábado'], 
        raceGoalType: 'pace',
        planGenerationType: 'blocks',
        experienceLevel: 'beginner'
    }
  });

  const { reset, watch, setValue, getValues } = form;
  const trainingDays = watch('trainingDays') || [];
  
  const availableLongRunDays = useMemo(() => {
    return weekDays.filter(day => trainingDays.includes(day.id));
  }, [trainingDays]);

  useEffect(() => {
    if (context?.isHydrated && context.activeProfile) {
        const p = context.activeProfile;
        reset({
            ...p,
            name: p.name || '',
            athleteEmail: p.athleteEmail || '',
            raceGoalType: p.targetTime ? 'time' : 'pace',
            targetPace: p.targetPace || '',
            targetTime: p.targetTime || '',
            raceName: p.raceName || '',
            raceDistance: p.raceDistance || '10k',
            raceDate: p.raceDate || '',
            experienceLevel: p.experienceLevel || 'beginner',
            planGenerationType: p.planGenerationType || 'blocks',
            trainingHistory: p.trainingHistory || '',
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
  }, [context?.isHydrated, context?.activeProfile, reset]);

  const watchAvatarUrl = watch('avatarUrl');
  const watchGoalType = watch('raceGoalType');

  const isOwner = context?.activeProfile?.ownerUid === user?.uid || context?.activeProfile?.ownerUid === 'local-user';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const dataUri = await fileToDataURI(e.target.files[0]);
        setValue('avatarUrl', dataUri);
        toast({ title: "Foto atualizada!" });
      } catch (err) { toast({ variant: 'destructive', title: 'Erro na imagem' }); }
    }
  };

  const handleSaveActiveTab = async () => {
    if (!context) return;
    setIsSaving(true);
    const data = getValues();
    try {
        await context.saveProfile({
            ...context.activeProfile,
            ...data,
            dietPreferences: {
                ...context.activeProfile?.dietPreferences,
                aestheticGoal: data.aestheticGoal,
                trainingTiming: data.trainingTiming,
                mealCount: data.mealCount,
                supplements: data.supplements,
                allergies: data.allergies,
                preferredFoods: data.preferredFoods,
                excludedFoods: data.excludedFoods
            },
            strengthPreferences: {
                ...context.activeProfile?.strengthPreferences,
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
        } as any);
        toast({ title: `Aba ${activeTab.toUpperCase()} Salva!` });
    } finally {
        setTimeout(() => setIsSaving(false), 300);
    }
  };

  const handleDeleteProfile = async () => {
    if (!context?.activeProfile?.id) return;
    setIsDeleting(true);
    try {
      await context.deleteProfile(context.activeProfile.id);
    } finally {
      setIsDeleting(false);
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
                    {isOwner ? <ShieldCheck size={28}/> : <Users size={28}/>}
                  </div>
                  <div>
                      <h1 className="font-headline text-2xl md:text-3xl tracking-wide uppercase font-black italic">
                          <span className="text-white">{isOwner ? "Gestão do" : "Meu"}</span> <span className="text-primary">Atleta</span>
                      </h1>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                          {isOwner ? "Você é o treinador responsável" : "Visualização de Perfil Vinculado"}
                      </p>
                  </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => context.exportData()} className="flex-1 sm:flex-none gap-2 text-[10px] font-bold h-10 uppercase italic">
                  <Download size={14}/> Backup JSON
                </Button>
                {isOwner && context.activeProfile && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1 sm:flex-none gap-2 text-[10px] font-bold h-10 uppercase italic">
                        <Trash2 size={14}/> Excluir Atleta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline font-black uppercase italic text-destructive flex items-center gap-2">
                          <AlertTriangle size={20}/> Atenção Total
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                          Esta ação excluirá permanentemente o perfil de <strong>{context.activeProfile.name}</strong> e todo o seu histórico de treinos. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-bold uppercase italic">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteProfile}
                          className="bg-destructive text-white font-bold uppercase italic"
                        >
                          Confirmar Exclusão
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
          </header>

          <Form {...form}>
              <div className="space-y-8">
                  <Tabs defaultValue="perfil" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-5 h-auto bg-secondary/20 p-1 rounded-xl">
                          <TabsTrigger value="perfil" className="py-2.5 font-bold text-[10px] uppercase italic">Perfil</TabsTrigger>
                          <TabsTrigger value="corrida" className="py-2.5 font-bold text-[10px] uppercase italic">Corrida</TabsTrigger>
                          <TabsTrigger value="alimentacao" className="py-2.5 font-bold text-[10px] uppercase italic">Dieta</TabsTrigger>
                          <TabsTrigger value="musculacao" className="py-2.5 font-bold text-[10px] uppercase italic">Força</TabsTrigger>
                          <TabsTrigger value="compartilhamento" className="py-2.5 font-bold text-[10px] uppercase italic">Vínculo</TabsTrigger>
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
                                          <Button type="button" variant="secondary" size="icon" className="absolute -bottom-2 -right-2 rounded-xl h-10 w-10 shadow-xl bg-white text-black hover:bg-white/90" onClick={() => avatarFileRef.current?.click()}>
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
                                          <FormControl><Input {...field} value={field.value ?? ''} className="bg-black/30 h-14 text-lg font-bold border-border/40 focus:border-primary" /></FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )} />
                                  <FormField control={form.control} name="birthDate" render={({field}) => (
                                      <FormItem>
                                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Nascimento</FormLabel>
                                          <FormControl><Input type="date" {...field} value={field.value ?? ''} className="bg-black/30 h-14 text-lg font-bold border-border/40 focus:border-primary" /></FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )} />
                                  <FormField control={form.control} name="gender" render={({field}) => (
                                      <FormItem>
                                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Gênero</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl><SelectTrigger className="bg-black/30 h-14 text-lg font-bold border-border/40 focus:border-primary"><SelectValue/></SelectTrigger></FormControl>
                                              <SelectContent className="bg-card border-border">
                                                  <SelectItem value="male">Masculino</SelectItem>
                                                  <SelectItem value="female">Feminino</SelectItem>
                                                  <SelectItem value="other">Outro</SelectItem>
                                              </SelectContent>
                                          </Select>
                                      </FormItem>
                                  )} />
                                  <div className="grid grid-cols-2 gap-4">
                                      <FormField control={form.control} name="currentWeight" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Peso (kg)</FormLabel>
                                              <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} className="bg-black/30 h-14 text-xl font-black text-center border-border/40 focus:border-primary" /></FormControl>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="height" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Altura (cm)</FormLabel>
                                              <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-black/30 h-14 text-xl font-black text-center border-border/40 focus:border-primary" /></FormControl>
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
                                      <FormField control={form.control} name="restingHr" render={({field}) => (
                                          <FormItem>
                                              <div className="flex items-center gap-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">FC Repouso</FormLabel>
                                                <Tooltip>
                                                  <TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                                                  <TooltipContent><p className="max-w-xs text-[10px]">Frequência Cardíaca em repouso absoluto. Indica nível de condicionamento.</p></TooltipContent>
                                                </Tooltip>
                                              </div>
                                              <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-black/40 h-16 text-2xl font-black text-center rounded-2xl border-border/40" /></FormControl>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="vo2Max" render={({field}) => (
                                          <FormItem>
                                              <div className="flex items-center gap-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">VDOT (Jack Daniels)</FormLabel>
                                                <Tooltip>
                                                  <TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                                                  <TooltipContent><p className="max-w-xs text-[10px]">Índice que define seu potencial de performance baseado em resultados reais de prova.</p></TooltipContent>
                                                </Tooltip>
                                              </div>
                                              <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} className="bg-primary/5 border-primary/30 h-16 text-2xl font-black text-primary text-center rounded-2xl" /></FormControl>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="thresholdPace" render={({field}) => (
                                          <FormItem>
                                              <div className="flex items-center gap-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pace Limiar (T)</FormLabel>
                                                <Tooltip>
                                                  <TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                                                  <TooltipContent><p className="max-w-xs text-[10px]">Ritmo máximo sustentável por cerca de 60 minutos (Limiar de Lactato).</p></TooltipContent>
                                                </Tooltip>
                                              </div>
                                              <FormControl><Input placeholder="05:00" {...field} value={field.value ?? ''} className="bg-black/40 h-16 text-2xl font-black text-center rounded-2xl border-border/40" /></FormControl>
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
                                              <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-black/40 h-16 text-2xl font-black text-center rounded-2xl border-border/40" /></FormControl>
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
                                                  <FormControl><Input placeholder="Ex: Maratona de Porto Alegre" {...field} value={field.value ?? ''} className="bg-black/30 h-14 font-black text-white rounded-xl" /></FormControl>
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
                                                              <SelectItem value="ultra">Ultra / Trail</SelectItem>
                                                          </SelectContent>
                                                      </Select>
                                                  </FormItem>
                                              )} />
                                              <FormField control={form.control} name="raceDate" render={({field}) => (
                                                  <FormItem>
                                                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data da Prova</FormLabel>
                                                      <FormControl><Input type="date" {...field} value={field.value ?? ''} className="bg-black/30 h-14 font-black rounded-xl" /></FormControl>
                                                  </FormItem>
                                              )} />
                                          </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <FormField control={form.control} name="raceGoalType" render={({field}) => (
                                              <FormItem>
                                                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo de Meta IA</FormLabel>
                                                  <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-border/40">
                                                      <Button type="button" variant={watchGoalType === 'pace' ? 'default' : 'ghost'} className="flex-1 h-12 text-[10px] uppercase font-black italic rounded-xl" onClick={() => setValue('raceGoalType', 'pace')}>Pace Alvo</Button>
                                                      <Button type="button" variant={watchGoalType === 'time' ? 'default' : 'ghost'} className="flex-1 h-12 text-[10px] uppercase font-black italic rounded-xl" onClick={() => setValue('raceGoalType', 'time')}>Tempo Alvo</Button>
                                                  </div>
                                              </FormItem>
                                          )} />
                                          {watchGoalType === 'pace' ? (
                                              <FormField control={form.control} name="targetPace" render={({field}) => (
                                                  <FormItem>
                                                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Ritmo Alvo (min/km)</FormLabel>
                                                      <FormControl><Input placeholder="04:15" {...field} value={field.value ?? ''} className="bg-primary/5 border-primary/40 h-14 text-2xl font-black text-center rounded-xl" /></FormControl>
                                                  </FormItem>
                                              )} />
                                          ) : (
                                              <FormField control={form.control} name="targetTime" render={({field}) => (
                                                  <FormItem>
                                                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Tempo Alvo (HH:MM:SS)</FormLabel>
                                                      <FormControl><Input placeholder="03:30:00" {...field} value={field.value ?? ''} className="bg-primary/5 border-primary/40 h-14 text-2xl font-black text-center rounded-xl" /></FormControl>
                                                  </FormItem>
                                              )} />
                                          )}
                                      </div>
                                  </div>

                                  <div className="space-y-8 border-t border-border/20 pt-10">
                                      <div className="flex items-center gap-3">
                                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Target size={18}/></div>
                                          <h4 className="text-xs font-black uppercase italic tracking-[0.2em]">Disponibilidade Semanal</h4>
                                      </div>
                                      <div className="space-y-4">
                                          <FormLabel className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Dias de Corrida Permitidos</FormLabel>
                                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                                              {weekDays.map(day => (
                                                  <div 
                                                      key={day.id}
                                                      onClick={() => {
                                                          const current = watch('trainingDays') || [];
                                                          let next;
                                                          if (current.includes(day.id)) next = current.filter(d => d !== day.id);
                                                          else next = [...current, day.id];
                                                          setValue('trainingDays', next);
                                                          if (current.includes(day.id) && getValues('longRunDay') === day.id) setValue('longRunDay', '');
                                                      }}
                                                      className={cn(
                                                          "h-16 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-lg",
                                                          watch('trainingDays')?.includes(day.id) 
                                                              ? "border-primary bg-primary/20 text-primary shadow-primary/20 scale-[1.02]" 
                                                              : "border-border/30 bg-black/30 text-muted-foreground hover:border-primary/40"
                                                      )}
                                                  >
                                                      <span className="text-[10px] font-black italic uppercase tracking-tighter">{day.label}</span>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <FormField control={form.control} name="longRunDay" render={({field}) => (
                                              <FormItem>
                                                  <FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                                                      <CalendarCheck size={14}/> DIA DO LONGÃO
                                                  </FormLabel>
                                                  <Select onValueChange={field.onChange} value={field.value}>
                                                      <FormControl>
                                                          <SelectTrigger className="bg-black/30 h-14 font-black rounded-xl border-primary/20">
                                                              <SelectValue placeholder={availableLongRunDays.length > 0 ? "Escolha um dia de corrida" : "Selecione dias de corrida primeiro"} />
                                                          </SelectTrigger>
                                                      </FormControl>
                                                      <SelectContent className="bg-card border-border">
                                                          {availableLongRunDays.length > 0 ? (
                                                              availableLongRunDays.map(d => <SelectItem key={d.id} value={d.id} className="font-bold uppercase italic">{d.id}</SelectItem>)
                                                          ) : (
                                                              <div className="p-4 text-[10px] text-muted-foreground italic font-medium">Selecione dias de corrida acima primeiro.</div>
                                                          )}
                                                      </SelectContent>
                                                  </Select>
                                              </FormItem>
                                          )} />
                                          <FormField control={form.control} name="experienceLevel" render={({field}) => (
                                              <FormItem>
                                                  <div className="flex items-center gap-2">
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Experiência Técnica</FormLabel>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                                                      <TooltipContent><p className="max-w-xs text-[10px]">Baseada no seu volume semanal atual (km/semana).</p></TooltipContent>
                                                    </Tooltip>
                                                  </div>
                                                  <Select onValueChange={field.onChange} value={field.value}>
                                                      <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                                      <SelectContent className="bg-card border-border">
                                                          <SelectItem value="run_walk">Corrida & Caminhada</SelectItem>
                                                          <SelectItem value="beginner">Iniciante (Até 25km/semana)</SelectItem>
                                                          <SelectItem value="intermediate">Intermediário (25-50km/semana)</SelectItem>
                                                          <SelectItem value="advanced">Avançado (+50km/semana)</SelectItem>
                                                      </SelectContent>
                                                  </Select>
                                              </FormItem>
                                          )} />
                                      </div>
                                  </div>

                                  <div className="space-y-4 border-t border-border/20 pt-10">
                                      <div className="flex items-center gap-3">
                                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><HistoryIcon size={18}/></div>
                                          <h4 className="text-xs font-black uppercase italic tracking-[0.2em]">Histórico para IA</h4>
                                      </div>
                                      <FormField control={form.control} name="trainingHistory" render={({field}) => (
                                          <FormItem>
                                              <FormControl>
                                                  <Textarea 
                                                      placeholder="Descreva seu histórico, lesões ou qualquer detalhe para o Coach Gemini..." 
                                                      className="bg-black/30 min-h-[140px] rounded-2xl font-medium italic p-5 border-border/40 focus:border-primary" 
                                                      {...field} 
                                                  />
                                              </FormControl>
                                          </FormItem>
                                      )} />
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
                                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta de Composição</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value}>
                                                  <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                                  <SelectContent className="bg-card border-border">
                                                      <SelectItem value="performance">Performance Pura</SelectItem>
                                                      <SelectItem value="cutting">Cutting</SelectItem>
                                                      <SelectItem value="bulking">Bulking</SelectItem>
                                                      <SelectItem value="recomp">Recomp</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="trainingTiming" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Janela de Treino</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value}>
                                                  <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                                  <SelectContent className="bg-card border-border">
                                                      <SelectItem value="jejum">Jejum</SelectItem>
                                                      <SelectItem value="manha">Manhã</SelectItem>
                                                      <SelectItem value="meio-dia">Almoço</SelectItem>
                                                      <SelectItem value="tarde">Tarde</SelectItem>
                                                      <SelectItem value="noite">Noite</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="mealCount" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Número de Refeições</FormLabel>
                                              <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-black/30 h-14 text-center font-black text-xl rounded-xl" /></FormControl>
                                          </FormItem>
                                      )} />
                                  </div>
                                  <FormField control={form.control} name="supplements" render={({field}) => (
                                      <FormItem>
                                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suplementação</FormLabel>
                                          <FormControl><Input placeholder="Whey, Creatina, Géis..." {...field} value={field.value ?? ''} className="bg-black/30 h-14 font-medium italic px-6 rounded-xl" /></FormControl>
                                      </FormItem>
                                  )} />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/20 pt-10">
                                      <FormField control={form.control} name="preferredFoods" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alimentos Preferidos</FormLabel>
                                              <FormControl><Textarea className="bg-black/30 min-h-[140px] rounded-2xl p-5 font-medium italic" {...field} value={field.value ?? ''} /></FormControl>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="excludedFoods" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">O que evitar / Alergias</FormLabel>
                                              <FormControl><Textarea className="bg-black/30 min-h-[140px] rounded-2xl p-5 font-medium italic" {...field} value={field.value ?? ''} /></FormControl>
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
                                      <FormField control={form.control} name="strengthSplit" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Divisão de Treino</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value}>
                                                  <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                                  <SelectContent className="bg-card border-border">
                                                      <SelectItem value="full_body">Full Body</SelectItem>
                                                      <SelectItem value="upper_lower">Upper/Lower</SelectItem>
                                                      <SelectItem value="ppl">PPL</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="strengthObjective" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Objetivo</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value}>
                                                  <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                                  <SelectContent className="bg-card border-border">
                                                      <SelectItem value="performance">Performance</SelectItem>
                                                      <SelectItem value="strength">Força</SelectItem>
                                                      <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                                                      <SelectItem value="endurance">Resistência</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </FormItem>
                                      )} />
                                      <FormField control={form.control} name="legDay" render={({field}) => (
                                          <FormItem>
                                              <div className="flex items-center gap-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-purple-400">Dia de Perna</FormLabel>
                                                <Tooltip>
                                                  <TooltipTrigger asChild><Info className="size-3 text-purple-400 cursor-help" /></TooltipTrigger>
                                                  <TooltipContent><p className="max-w-xs text-[10px]">A IA evitará treinos de alta intensidade no dia seguinte ao treino de perna.</p></TooltipContent>
                                                </Tooltip>
                                              </div>
                                              <Select onValueChange={field.onChange} value={field.value}>
                                                  <FormControl><SelectTrigger className="bg-purple-500/10 border-purple-500/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                                  <SelectContent className="bg-card border-border">
                                                      {weekDays.map(d => <SelectItem key={d.id} value={d.id} className="font-bold uppercase italic">{d.id}</SelectItem>)}
                                                  </SelectContent>
                                              </Select>
                                          </FormItem>
                                      )} />
                                  </div>

                                  <div className="space-y-6 border-t border-border/20 pt-10">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Equipamentos</FormLabel>
                                      <div className="flex flex-wrap gap-3">
                                          {equipmentOptions.map(opt => (
                                              <div 
                                                  key={opt}
                                                  onClick={() => {
                                                      const current = getValues('strengthEquipment') || [];
                                                      if (current.includes(opt)) setValue('strengthEquipment', current.filter(o => o !== opt));
                                                      else setValue('strengthEquipment', [...current, opt]);
                                                  }}
                                                  className={cn(
                                                      "px-6 py-3 rounded-2xl border-2 text-[10px] font-black uppercase italic cursor-pointer transition-all duration-300",
                                                      watch('strengthEquipment')?.includes(opt) 
                                                          ? "bg-purple-500 border-purple-500 text-white shadow-purple-500/20" 
                                                          : "border-border/40 bg-black/30 text-muted-foreground"
                                                  )}
                                              >
                                                  {opt}
                                              </div>
                                          ))}
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-border/20 pt-10">
                                      <FormField control={form.control} name="limitations" render={({field}) => (
                                          <FormItem>
                                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Limitações / Lesões</FormLabel>
                                              <FormControl><Textarea className="bg-black/30 min-h-[140px] rounded-2xl p-5 font-medium italic" {...field} value={field.value ?? ''} /></FormControl>
                                          </FormItem>
                                      )} />
                                      <div className="space-y-6">
                                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recordes de Força (PRs)</FormLabel>
                                          <div className="grid grid-cols-3 gap-4">
                                              <FormField control={form.control} name="prBench" render={({field}) => (
                                                  <FormItem>
                                                      <FormLabel className="text-[9px] font-black text-center block">Supino (kg)</FormLabel>
                                                      <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-black/30 h-14 text-center font-black rounded-xl" /></FormControl>
                                                  </FormItem>
                                              )} />
                                              <FormField control={form.control} name="prSquat" render={({field}) => (
                                                  <FormItem>
                                                      <FormLabel className="text-[9px] font-black text-center block">Agach. (kg)</FormLabel>
                                                      <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-black/30 h-14 text-center font-black rounded-xl" /></FormControl>
                                                  </FormItem>
                                              )} />
                                              <FormField control={form.control} name="prDeadlift" render={({field}) => (
                                                  <FormItem>
                                                      <FormLabel className="text-[9px] font-black text-center block">Terra (kg)</FormLabel>
                                                      <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-black/30 h-14 text-center font-black rounded-xl" /></FormControl>
                                                  </FormItem>
                                              )} />
                                          </div>
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                      </TabsContent>

                      <TabsContent value="compartilhamento" className="mt-6 space-y-6 animate-in fade-in">
                          <Card className="bg-card/50 border-primary/20 shadow-2xl">
                              <CardHeader className="bg-primary/5 border-b border-border/50 py-8">
                                  <div className="flex items-center gap-3">
                                      <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><ShieldCheck size={28}/></div>
                                      <div>
                                          <CardTitle className="font-headline text-2xl uppercase italic font-black">Vínculo de Assessoria</CardTitle>
                                          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Gestão de acessos entre Treinador e Atleta.</CardDescription>
                                      </div>
                                  </div>
                              </CardHeader>
                              <CardContent className="space-y-10 pt-10">
                                  <div className="p-8 rounded-[2rem] bg-secondary/30 border border-primary/10 space-y-6">
                                      <div className="space-y-2">
                                          <h4 className="text-xs font-black uppercase italic flex items-center gap-2 text-white">
                                              E-mail do Atleta (Login Google)
                                          </h4>
                                      </div>
                                      <FormField control={form.control} name="athleteEmail" render={({field}) => (
                                          <FormItem>
                                              <FormControl>
                                                  <Input 
                                                      placeholder="aluno@gmail.com" 
                                                      {...field} 
                                                      value={field.value ?? ''}
                                                      disabled={!isOwner}
                                                      className="bg-black/40 h-16 border-border/50 focus:border-primary font-black text-lg px-8 rounded-2xl" 
                                                  />
                                              </FormControl>
                                              <FormDescription className="text-[10px] font-medium italic mt-4">
                                                  {isOwner 
                                                      ? "Insira o e-mail Google do seu aluno para que ele visualize este perfil ao logar."
                                                      : "Apenas o treinador (dono deste perfil) pode alterar o vínculo."}
                                              </FormDescription>
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
                          SALVAR {activeTab.toUpperCase()}
                      </Button>
                      
                      {isOwner && (
                          <Button 
                              type="button" 
                              size="lg" 
                              className="flex-1 h-16 font-black uppercase tracking-[0.2em] italic bg-primary text-black shadow-2xl rounded-2xl"
                              onClick={handleGenerate}
                              disabled={isProcessing}
                          >
                              {isProcessing ? <Loader2 className="animate-spin mr-3 size-6" /> : <Zap className="mr-3 size-6" />} 
                              GERAR PLANILHA IA
                          </Button>
                      )}
                  </div>
              </div>
          </Form>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
