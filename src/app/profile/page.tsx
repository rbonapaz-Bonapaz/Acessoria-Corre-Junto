
'use client';

import { useContext, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { fileToDataURI, cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useUser } from '@/firebase';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
    Loader2, 
    Zap, 
    Camera, 
    Dumbbell, 
    Download,
    CalendarDays,
    Activity,
    CheckCircle2,
    Info,
    Clock,
    Target,
    Link2,
    ShieldCheck,
    Utensils,
    Flame
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const weekDays = [
  { id: 'Domingo', label: 'DOM' },
  { id: 'Segunda', label: 'SEG' },
  { id: 'Terça', label: 'TER' },
  { id: 'Quarta', label: 'QUA' },
  { id: 'Quinta', label: 'QUI' },
  { id: 'Sexta', label: 'SEX' },
  { id: 'Sábado', label: 'SÁB' },
] as const;

const focusAreasOptions = [
  'Mobilidade / Alongamento',
  'Core / Estabilidade',
  'Glúteos / Posteriores',
  'Quadríceps / Força',
  'Panturrilha / Tendões',
  'Bíceps / Braços',
  'Peitoral / Ombros',
  'Costas / Postura',
];

const equipmentOptions = [
  'Academia Completa',
  'Halteres / Kettlebells',
  'Elásticos / Mini-bands',
  'Peso do Corpo (Calistenia)',
  'Barra Fixa / Paralelas',
];

const profileSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  athleteEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
  avatarUrl: z.string().optional(),
  location: z.string().optional(),
  birthDate: z.string().min(1, "Data de nascimento obrigatória."),
  gender: z.enum(['male', 'female', 'other']),
  currentWeight: z.coerce.number().min(30, 'Insira um peso válido.'),
  height: z.coerce.number().min(100, 'Insira uma altura válida em cm.'),
  
  // Corrida
  restingHr: z.coerce.number().min(30),
  vo2Max: z.coerce.number().min(20),
  thresholdPace: z.string().regex(/^\d{1,2}:\d{2}$/, 'Formato MM:SS.'),
  thresholdHr: z.coerce.number().min(100),
  raceName: z.string().optional(),
  raceDistance: z.string().min(1, "Selecione a distância."),
  raceDate: z.string().min(1, "Data da prova obrigatória."),
  raceGoalType: z.enum(['pace', 'time']).default('pace'),
  targetPace: z.string().optional(),
  targetTime: z.string().optional(),
  trainingDays: z.array(z.string()).min(1, "Selecione pelo menos um dia."),
  longRunDay: z.string().min(1, "Selecione o dia do longão"),
  planGenerationType: z.enum(['full', 'blocks']).default('blocks'),
  experienceLevel: z.enum(['run_walk', 'beginner', 'intermediate', 'advanced']),
  trainingHistory: z.string().min(5, 'Descreva seu histórico de forma técnica.'),
  
  // Dieta
  aestheticGoal: z.enum(['cutting', 'bulking', 'recomp', 'performance']).optional(),
  trainingTiming: z.enum(['jejum', 'manha', 'meio-dia', 'tarde', 'noite']).optional(),
  mealCount: z.coerce.number().optional(),
  supplements: z.string().optional(),
  allergies: z.string().optional(),
  preferredFoods: z.string().optional(),
  excludedFoods: z.string().optional(),
  
  // Força
  strengthSplit: z.enum(['full_body', 'upper_lower', 'ppl']).optional(),
  strengthObjective: z.enum(['strength', 'hypertrophy', 'performance', 'endurance']).optional(),
  strengthFrequency: z.coerce.number().optional(),
  strengthDays: z.array(z.string()).optional(),
  strengthEquipment: z.array(z.string()).optional(),
  strengthFocus: z.array(z.string()).optional(),
  legDay: z.string().optional(),
  limitations: z.string().optional(),
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: '', 
        athleteEmail: '',
        currentWeight: 70, 
        height: 170, 
        restingHr: 50, 
        vo2Max: 45, 
        thresholdPace: '05:00', 
        thresholdHr: 165,
        trainingDays: ['Segunda', 'Quarta', 'Sexta'], 
        longRunDay: 'Sexta', 
        planGenerationType: 'blocks',
        experienceLevel: 'beginner',
        raceName: '',
        raceDistance: '10k',
        raceGoalType: 'pace',
        targetPace: '',
        targetTime: '',
        gender: 'male',
        strengthFrequency: 3,
        strengthDays: ['Terça', 'Quinta', 'Sábado'],
        strengthObjective: 'performance',
        strengthEquipment: ['Academia Completa'],
        strengthFocus: ['Core / Estabilidade'],
        trainingHistory: 'Atleta em evolução buscando performance.'
    }
  });

  const { reset, watch, setValue, getValues } = form;

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
            aestheticGoal: p.dietPreferences?.aestheticGoal || 'performance',
            trainingTiming: p.dietPreferences?.trainingTiming || 'manha',
            mealCount: p.dietPreferences?.mealCount || 4,
            supplements: p.dietPreferences?.supplements || '',
            allergies: p.dietPreferences?.allergies || '',
            preferredFoods: p.dietPreferences?.preferredFoods || '',
            excludedFoods: p.dietPreferences?.excludedFoods || '',
            strengthSplit: p.strengthPreferences?.splitPreference || 'full_body',
            strengthObjective: p.strengthPreferences?.objective || 'performance',
            strengthFrequency: p.strengthPreferences?.frequency || 3,
            strengthDays: p.strengthPreferences?.trainingDays || ['Terça', 'Quinta', 'Sábado'],
            strengthEquipment: p.strengthPreferences?.equipment || ['Academia Completa'],
            strengthFocus: p.strengthPreferences?.focusAreas || ['Core / Estabilidade'],
            legDay: p.strengthPreferences?.legDay || '',
            limitations: p.strengthPreferences?.limitations || '',
            prBench: p.strengthPreferences?.prBench || 0,
            prSquat: p.strengthPreferences?.prSquat || 0,
            prDeadlift: p.strengthPreferences?.prDeadlift || 0,
        } as any);
    }
  }, [context?.isHydrated, context?.activeProfile, reset]);

  const watchAvatarUrl = watch('avatarUrl');
  const isOwner = context?.activeProfile?.ownerUid === user?.uid;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const dataUri = await fileToDataURI(e.target.files[0]);
        setValue('avatarUrl', dataUri, { shouldDirty: true });
        toast({ title: "Foto atualizada!" });
      } catch (err) { 
        toast({ variant: 'destructive', title: 'Erro na imagem' }); 
      }
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
        
        toast({ title: `✅ Dados Salvos` });
    } catch (err) {
        toast({ variant: 'destructive', title: 'Erro ao salvar' });
    } finally {
        setTimeout(() => setIsSaving(false), 300);
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
      <div className="space-y-8 pb-12 max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
            <div>
                <h1 className="font-headline text-2xl md:text-4xl tracking-wide uppercase font-black italic">
                    <span className="text-white">DADOS DO</span> <span className="text-primary">ATLETA</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {isOwner ? "Você é o gestor deste perfil." : "Você está visualizando seu perfil vinculado."}
                </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => context.exportData()} className="flex-1 sm:flex-none gap-2 text-[10px] font-bold h-10">
                <Download size={14}/> Backup JSON
              </Button>
            </div>
        </header>

        <div className="max-w-4xl">
            <Form {...form}>
                <div className="space-y-8">
                    <Tabs defaultValue="perfil" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5 h-auto bg-secondary/20 p-1 rounded-xl">
                            <TabsTrigger value="perfil" className="py-2.5 font-bold text-[10px] uppercase">Perfil</TabsTrigger>
                            <TabsTrigger value="corrida" className="py-2.5 font-bold text-[10px] uppercase">Corrida</TabsTrigger>
                            <TabsTrigger value="alimentacao" className="py-2.5 font-bold text-[10px] uppercase">Dieta</TabsTrigger>
                            <TabsTrigger value="musculacao" className="py-2.5 font-bold text-[10px] uppercase">Força</TabsTrigger>
                            <TabsTrigger value="compartilhamento" className="py-2.5 font-bold text-[10px] uppercase">Vínculo</TabsTrigger>
                        </TabsList>

                        <TabsContent value="perfil" className="mt-6 space-y-6 animate-in fade-in">
                            <Card className="bg-card/50">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                        <div className="relative">
                                            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-primary/20">
                                                <AvatarImage src={watchAvatarUrl} />
                                                <AvatarFallback className="text-2xl font-black">{watch('name')?.[0] || '?'}</AvatarFallback>
                                            </Avatar>
                                            <input type="file" ref={avatarFileRef} className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                                            <Button type="button" variant="secondary" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-lg" onClick={() => avatarFileRef.current?.click()}>
                                                <Camera size={14}/>
                                            </Button>
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="font-headline text-xl md:text-2xl uppercase italic">Identidade & Biometria</CardTitle>
                                            <CardDescription className="text-xs">Dados essenciais para cálculo de metabolismo e carga.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border/50">
                                    <FormField control={form.control} name="name" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Nome Completo</FormLabel>
                                            <FormControl><Input {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="birthDate" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Data de Nascimento</FormLabel>
                                            <FormControl><Input type="date" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="gender" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Gênero</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
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
                                                <FormLabel className="text-xs font-bold uppercase">Peso (kg)</FormLabel>
                                                <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="height" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Altura (cm)</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="corrida" className="mt-6 space-y-6 animate-in fade-in">
                            <Card className="bg-card/50">
                                <CardHeader>
                                  <CardTitle className="font-headline text-xl md:text-2xl uppercase italic text-primary">Inteligência de Corrida</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6 border-t border-border/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FormField control={form.control} name="restingHr" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">FC Repouso</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="vo2Max" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">VDOT</FormLabel>
                                                <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="thresholdPace" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Pace Limiar</FormLabel>
                                                <FormControl><Input placeholder="05:00" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="thresholdHr" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">FC Limiar (L2)</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="space-y-4 border-t pt-6">
                                        <FormLabel className="text-xs font-bold uppercase">Dias de Corrida</FormLabel>
                                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                            {weekDays.map(day => (
                                                <FormField key={day.id} control={form.control} name="trainingDays" render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormControl>
                                                            <div 
                                                                onClick={() => {
                                                                    const current = field.value || [];
                                                                    if (current.includes(day.id)) field.onChange(current.filter(d => d !== day.id));
                                                                    else field.onChange([...current, day.id]);
                                                                }}
                                                                className={cn(
                                                                    "h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all",
                                                                    field.value?.includes(day.id) 
                                                                        ? "border-primary bg-primary/10 text-primary" 
                                                                        : "border-border/50 bg-secondary/10 text-muted-foreground"
                                                                )}
                                                            >
                                                                <span className="text-[10px] font-black">{day.label}</span>
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )} />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                                        <FormField control={form.control} name="raceDistance" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Distância Alvo</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
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
                                                <FormLabel className="text-xs font-bold uppercase">Data da Prova</FormLabel>
                                                <FormControl><Input type="date" {...field} value={field.value ?? ''} className="bg-secondary/10 h-12" /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="alimentacao" className="mt-6 space-y-6 animate-in fade-in">
                            <Card className="bg-card/50">
                                <CardHeader>
                                  <CardTitle className="font-headline text-xl md:text-2xl uppercase italic text-orange-500 flex items-center gap-2">
                                    <Utensils size={24}/> Nutrição & Metabolismo
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                                    <FormField control={form.control} name="aestheticGoal" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Objetivo Estético</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="performance">Performance</SelectItem>
                                                    <SelectItem value="cutting">Cutting (Definição)</SelectItem>
                                                    <SelectItem value="bulking">Bulking (Ganho)</SelectItem>
                                                    <SelectItem value="recomp">Recomp (Troca)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="trainingTiming" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Horário do Treino</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="jejum">Jejum</SelectItem>
                                                    <SelectItem value="manha">Manhã</SelectItem>
                                                    <SelectItem value="meio-dia">Meio-dia</SelectItem>
                                                    <SelectItem value="tarde">Tarde</SelectItem>
                                                    <SelectItem value="noite">Noite</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="mealCount" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Refeições p/ Dia</FormLabel>
                                            <FormControl><Input type="number" {...field} className="bg-secondary/10" /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="supplements" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Suplementação</FormLabel>
                                            <FormControl><Input placeholder="Ex: Whey, Creatina, Gel" {...field} className="bg-secondary/10" /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="allergies" render={({field}) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="text-xs font-bold uppercase">Alergias / Intolerâncias</FormLabel>
                                            <FormControl><Input placeholder="Ex: Lactose, Glúten..." {...field} className="bg-secondary/10" /></FormControl>
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="musculacao" className="mt-6 space-y-6 animate-in fade-in">
                            <Card className="bg-card/50">
                                <CardHeader>
                                  <CardTitle className="font-headline text-xl md:text-2xl uppercase italic text-purple-500 flex items-center gap-2">
                                    <Dumbbell size={24}/> Treinamento de Força
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6 border-t border-border/50">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField control={form.control} name="strengthSplit" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Divisão (Split)</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="full_body">Full Body</SelectItem>
                                                        <SelectItem value="upper_lower">Upper/Lower</SelectItem>
                                                        <SelectItem value="ppl">PPL (Push/Pull/Legs)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="strengthObjective" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Foco</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="performance">Específico Corrida</SelectItem>
                                                        <SelectItem value="strength">Força Máxima</SelectItem>
                                                        <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                                                        <SelectItem value="endurance">Resistência</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="legDay" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Dia de Perna</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {weekDays.map(d => <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
                                        <FormField control={form.control} name="prBench" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">PR Supino (kg)</FormLabel>
                                                <FormControl><Input type="number" {...field} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="prSquat" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">PR Agacham. (kg)</FormLabel>
                                                <FormControl><Input type="number" {...field} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="prDeadlift" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">PR Terra (kg)</FormLabel>
                                                <FormControl><Input type="number" {...field} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="compartilhamento" className="mt-6 space-y-6 animate-in fade-in">
                            <Card className="bg-card/50 border-primary/20">
                                <CardHeader>
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary"><ShieldCheck size={24}/></div>
                                    <div>
                                      <CardTitle className="font-headline text-xl uppercase italic">Vínculo de Assessoria</CardTitle>
                                      <CardDescription className="text-xs">Permita que seu atleta acesse o próprio plano usando o login do Google dele.</CardDescription>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6 border-t border-border/50">
                                    <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
                                        <h4 className="text-xs font-black uppercase italic flex items-center gap-2">
                                            <Link2 size={14} className="text-primary" /> E-mail do Atleta (Google)
                                        </h4>
                                        <FormField control={form.control} name="athleteEmail" render={({field}) => (
                                            <FormItem>
                                                <FormControl>
                                                  <Input 
                                                    placeholder="exemplo@gmail.com" 
                                                    {...field} 
                                                    disabled={!isOwner}
                                                    className="bg-black/30 h-12 border-border/50 focus:border-primary font-medium" 
                                                  />
                                                </FormControl>
                                                <FormDescription className="text-[10px]">
                                                    {isOwner 
                                                        ? "Insira o e-mail que o atleta usa para logar no Google. Ele verá apenas este perfil."
                                                        : "Apenas seu treinador pode alterar este e-mail."}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                        <Button 
                            type="button" 
                            size="lg" 
                            disabled={isSaving} 
                            className="flex-1 h-14 font-black uppercase tracking-widest bg-white text-black hover:bg-white/90"
                            onClick={handleSaveActiveTab}
                        >
                            {isSaving ? <Loader2 className="animate-spin mr-2 size-5" /> : <CheckCircle2 className="mr-2 size-5" />}
                            SALVAR ALTERAÇÕES
                        </Button>
                        
                        <Button 
                            type="button" 
                            size="lg" 
                            className="flex-1 h-14 font-black uppercase tracking-widest bg-primary text-black"
                            onClick={handleGenerate}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin mr-2 size-5" /> : <Zap className="mr-2 size-5" />} 
                            GERAR PLANILHA IA
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
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
