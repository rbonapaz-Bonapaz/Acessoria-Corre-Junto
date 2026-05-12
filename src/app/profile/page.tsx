'use client';

import { useContext, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { fileToDataURI } from "@/lib/utils";
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
    Loader2, 
    Zap, 
    Camera, 
    Dumbbell, 
    Utensils, 
    Link2,
    Download,
    Upload,
    CalendarDays,
    Target,
    Trash2,
    ChevronDown,
    Activity,
    User as UserIcon,
    Flame
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const weekDays = [
  { id: 'Segunda', label: 'SEG' },
  { id: 'Terça', label: 'TER' },
  { id: 'Quarta', label: 'QUA' },
  { id: 'Quinta', label: 'QUI' },
  { id: 'Sexta', label: 'SEX' },
  { id: 'Sábado', label: 'SÁB' },
  { id: 'Domingo', label: 'DOM' },
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
  raceGoal: z.string().optional(),
  trainingDays: z.array(z.string()).min(1, "Selecione pelo menos um dia."),
  longRunDay: z.string().min(1, "Selecione o dia do longão"),
  planGenerationType: z.enum(['full', 'blocks']).default('blocks'),
  experienceLevel: z.enum(['run_walk', 'beginner', 'intermediate', 'advanced']),
  trainingHistory: z.string().min(5, 'Descreva seu histórico.'),
  
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
  strengthFrequency: z.coerce.number().optional(),
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: '', 
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
        raceDistance: '10k',
        gender: 'male',
        strengthFrequency: 3,
        strengthEquipment: ['Academia Completa'],
        strengthFocus: ['Core / Estabilidade']
    }
  });

  const { reset, watch, setValue, trigger } = form;

  useEffect(() => {
    if (context?.isHydrated && context.activeProfile) {
        const p = context.activeProfile;
        reset({
            ...p,
            name: p.name || '',
            aestheticGoal: p.dietPreferences?.aestheticGoal || 'performance',
            trainingTiming: p.dietPreferences?.trainingTiming || 'manha',
            mealCount: p.dietPreferences?.mealCount || 4,
            supplements: p.dietPreferences?.supplements || '',
            allergies: p.dietPreferences?.allergies || '',
            preferredFoods: p.dietPreferences?.preferredFoods || '',
            excludedFoods: p.dietPreferences?.excludedFoods || '',
            strengthSplit: p.strengthPreferences?.splitPreference || 'full_body',
            strengthFrequency: p.strengthPreferences?.frequency || 3,
            strengthEquipment: p.strengthPreferences?.equipment || ['Academia Completa'],
            strengthFocus: p.strengthPreferences?.focusAreas || ['Core / Estabilidade'],
            legDay: p.strengthPreferences?.legDay || 'Quarta',
            limitations: p.strengthPreferences?.limitations || '',
            prBench: p.strengthPreferences?.prBench || 0,
            prSquat: p.strengthPreferences?.prSquat || 0,
            prDeadlift: p.strengthPreferences?.prDeadlift || 0,
        } as any);
        trigger();
    }
  }, [context?.isHydrated, context?.activeProfile, reset, trigger]);

  const watchTrainingDays = watch('trainingDays') || [];
  const watchAvatarUrl = watch('avatarUrl');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const dataUri = await fileToDataURI(e.target.files[0]);
        setValue('avatarUrl', dataUri, { shouldDirty: true });
      } catch (err) { 
        toast({ variant: 'destructive', title: 'Erro na imagem' }); 
      }
    }
  };

  const handleSaveProfile = async (data: ProfileFormValues) => {
    if (!context) return;
    context.saveProfile({
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
            frequency: data.strengthFrequency,
            equipment: data.strengthEquipment,
            focusAreas: data.strengthFocus,
            legDay: data.legDay,
            limitations: data.limitations,
            prBench: data.prBench,
            prSquat: data.prSquat,
            prDeadlift: data.prDeadlift
        }
    } as any);
  };

  const handleGenerate = async (type: 'all' | 'running') => {
    if (!context) return;
    setIsProcessing(true);
    try {
        const data = form.getValues();
        await context.generateRunningPlanAsync(data as any);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleStravaClick = () => {
    if (!context) return;
    const isConnected = !!context.activeProfile?.integrations?.strava.connected;
    
    if (!isConnected) {
      // Inicia o "redirecionamento"
      context.toggleIntegration('strava', true);
    } else {
      context.toggleIntegration('strava', false);
    }
  };

  if (!context?.isHydrated) return <DashboardLayout><Skeleton className="h-96 w-full"/></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
            <div>
                <h1 className="font-headline text-2xl md:text-4xl tracking-wide uppercase font-black italic">
                    <span className="text-white">Meus Dados &</span> <span className="text-primary">Ciclo</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Configure sua base biométrica e planejamento técnico.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none gap-2 text-[10px] font-bold h-10">
                <Upload size={14}/> Importar
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => context.importData(ev.target?.result as string);
                      reader.readAsText(file);
                  }
              }}/>
              <Button variant="outline" size="sm" onClick={() => context.exportData()} className="flex-1 sm:flex-none gap-2 text-[10px] font-bold h-10">
                <Download size={14}/> Exportar
              </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
            <div className="lg:col-span-2">
                <Form {...form}>
                    <form className="space-y-8" onSubmit={form.handleSubmit(handleSaveProfile)}>
                        <Tabs defaultValue="perfil" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-4 h-auto bg-secondary/20 p-1 rounded-xl overflow-x-auto">
                                <TabsTrigger value="perfil" className="py-2.5 font-bold text-[10px] uppercase">Perfil</TabsTrigger>
                                <TabsTrigger value="corrida" className="py-2.5 font-bold text-[10px] uppercase">Corrida</TabsTrigger>
                                <TabsTrigger value="alimentacao" className="py-2.5 font-bold text-[10px] uppercase">Dieta</TabsTrigger>
                                <TabsTrigger value="musculacao" className="py-2.5 font-bold text-[10px] uppercase">Força</TabsTrigger>
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
                                        <FormField control={form.control} name="location" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Localização (Cidade/Estado)</FormLabel>
                                                <FormControl><Input placeholder="Calibração de clima para IA" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="corrida" className="mt-6 space-y-6 animate-in fade-in">
                                <Card className="bg-card/50">
                                    <CardHeader>
                                      <CardTitle className="font-headline text-xl md:text-2xl uppercase italic text-primary">Inteligência de Corrida</CardTitle>
                                      <CardDescription className="text-xs">Configure seus dias de treino e metas para a periodização.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8 pt-6 border-t border-border/50">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <FormField control={form.control} name="restingHr" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">FC Repouso</FormLabel>
                                                    <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="thresholdPace" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Pace Limiar (T-Pace)</FormLabel>
                                                    <FormControl><Input placeholder="05:00" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="thresholdHr" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">FC Limiar (L2)</FormLabel>
                                                    <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="space-y-4 border-t pt-6">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-xs font-bold uppercase flex items-center gap-2">
                                                    <CalendarDays className="size-4 text-primary" /> Disponibilidade Semanal
                                                </FormLabel>
                                                <span className="text-[9px] font-black text-muted-foreground uppercase italic">{watchTrainingDays.length} Dias / Semana</span>
                                            </div>
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
                                                                            : "border-border/50 bg-secondary/10 text-muted-foreground grayscale"
                                                                    )}
                                                                >
                                                                    <span className="text-[10px] font-black">{day.label}</span>
                                                                    {field.value?.includes(day.id) && <Activity className="size-3 mt-1" />}
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )} />
                                                ))}
                                            </div>
                                            <FormDescription className="text-[9px] italic">Selecione todos os dias em que você pode correr. O Coach distribuirá o volume entre eles.</FormDescription>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                                            <FormField control={form.control} name="longRunDay" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Dia Preferencial de Longão</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {weekDays.map(d => (
                                                                <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription className="text-[9px]">Geralmente o dia com mais tempo livre (fim de semana).</FormDescription>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="experienceLevel" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Nível de Experiência</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="run_walk">Iniciante (Caminha/Corre)</SelectItem>
                                                            <SelectItem value="beginner">Começando a Correr (Até 20km/sem)</SelectItem>
                                                            <SelectItem value="intermediate">Intermediário (20-50km/sem)</SelectItem>
                                                            <SelectItem value="advanced">Avançado (Elite / 50km+ sem)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                                            <FormField control={form.control} name="raceDistance" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Distância Alvo</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="5k">5 km</SelectItem>
                                                            <SelectItem value="10k">10 km</SelectItem>
                                                            <SelectItem value="21k">Meia Maratona (21.1k)</SelectItem>
                                                            <SelectItem value="42k">Maratona (42.2k)</SelectItem>
                                                            <SelectItem value="ultra">Ultramaratona</SelectItem>
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

                                        <FormField control={form.control} name="trainingHistory" render={({field}) => (
                                            <FormItem className="border-t pt-6">
                                                <FormLabel className="text-xs font-bold uppercase">Contexto & Histórico (Opcional)</FormLabel>
                                                <FormControl><Textarea placeholder="Ex: Sinto dor no joelho após 10km, já corri maratonas, etc..." {...field} value={field.value ?? ''} className="bg-secondary/10 min-h-[100px]" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="alimentacao" className="mt-6 space-y-6 animate-in fade-in">
                                <Card className="bg-card/50">
                                    <CardHeader><CardTitle className="font-headline text-xl md:text-2xl uppercase italic">O Combustível</CardTitle></CardHeader>
                                    <CardContent className="space-y-6 pt-6 border-t border-border/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="aestheticGoal" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Objetivo Principal</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="cutting">Secar (Cutting)</SelectItem>
                                                            <SelectItem value="bulking">Ganhar Massa (Bulking)</SelectItem>
                                                            <SelectItem value="performance">Apenas Performance</SelectItem>
                                                            <SelectItem value="recomp">Recomposição</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="trainingTiming" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Momento do Treino</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="jejum">Em Jejum</SelectItem>
                                                            <SelectItem value="manha">Manhã</SelectItem>
                                                            <SelectItem value="meio-dia">Meio-dia</SelectItem>
                                                            <SelectItem value="tarde">À Noite</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="mealCount" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Número de Refeições/Dia</FormLabel>
                                                    <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="supplements" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Suplementação em Uso</FormLabel>
                                                    <FormControl><Input placeholder="Whey, Creatina, Gel de Carbo..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="allergies" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Alergias ou Restrições</FormLabel>
                                                <FormControl><Input placeholder="Lactose, Glúten, Amendoim..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                        
                                        <FormField control={form.control} name="preferredFoods" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Alimentos Favoritos</FormLabel>
                                                <FormControl><Input placeholder="Ovos, Arroz, Batata Doce..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="excludedFoods" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Alimentos Excluídos</FormLabel>
                                                <FormControl><Textarea placeholder="Alimentos a serem ignorados pela IA..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="musculacao" className="mt-6 space-y-6 animate-in fade-in">
                                <Card className="bg-card/50">
                                    <CardHeader><CardTitle className="font-headline text-xl md:text-2xl uppercase italic text-primary">A Blindagem de Elite</CardTitle></CardHeader>
                                    <CardContent className="space-y-6 pt-6 border-t border-border/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="legDay" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase">
                                                        <CalendarDays className="h-4 w-4 text-primary" /> Dia de Perna (Leg Day)
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {weekDays.map(d => <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription className="text-[9px]">A IA evita intensidade (Tiro/Longão) nas 24h seguintes ao Leg Day.</FormDescription>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="strengthSplit" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Equipamentos Disponíveis</FormLabel>
                                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                                        {equipmentOptions.map(eq => (
                                                            <FormField key={eq} control={form.control} name="strengthEquipment" render={({ field }) => (
                                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                                    <FormControl><Checkbox checked={field.value?.includes(eq)} onCheckedChange={(checked) => {
                                                                        const current = field.value || [];
                                                                        if (checked) field.onChange([...current, eq]); else field.onChange(current.filter(i => i !== eq));
                                                                    }} /></FormControl>
                                                                    <FormLabel className="text-[9px] font-bold cursor-pointer uppercase">{eq}</FormLabel>
                                                                </FormItem>
                                                            )} />
                                                        ))}
                                                    </div>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="space-y-4 border-t pt-6">
                                            <FormLabel className="text-xs font-bold uppercase">Grupos de Foco Adicional</FormLabel>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {focusAreasOptions.map(focus => (
                                                    <FormField key={focus} control={form.control} name="strengthFocus" render={({ field }) => (
                                                        <FormItem className="flex items-center space-x-2 space-y-0 p-2 border border-border/30 rounded-lg bg-secondary/10">
                                                            <FormControl><Checkbox checked={field.value?.includes(focus)} onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                if (checked) field.onChange([...current, focus]); else field.onChange(current.filter(i => i !== focus));
                                                            }} /></FormControl>
                                                            <FormLabel className="text-[8px] font-black uppercase leading-tight cursor-pointer">{focus}</FormLabel>
                                                        </FormItem>
                                                    )} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
                                            <FormField control={form.control} name="prBench" render={({field}) => (
                                                <FormItem><FormLabel className="text-[10px] font-bold uppercase">PR Supino (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="prSquat" render={({field}) => (
                                                <FormItem><FormLabel className="text-[10px] font-bold uppercase">PR Agachamento (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="prDeadlift" render={({field}) => (
                                                <FormItem><FormLabel className="text-[10px] font-bold uppercase">PR Terra (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button type="submit" size="lg" className="flex-1 h-12 font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 text-xs">
                                SALVAR PERFIL
                            </Button>
                            <div className="flex flex-1 rounded-md shadow-lg overflow-hidden">
                                <Button 
                                    type="button" 
                                    size="lg" 
                                    className="flex-1 h-12 font-black rounded-none uppercase tracking-widest bg-primary text-black text-xs"
                                    onClick={() => handleGenerate('running')}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="animate-spin mr-2 size-4" /> : <Zap className="mr-2 size-4" />} 
                                    GERAR CICLO IA
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="lg" className="h-12 rounded-none px-3 border-l border-primary-foreground/20 bg-primary text-black">
                                            <ChevronDown size={18}/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64">
                                        <DropdownMenuItem className="py-3 font-bold uppercase text-[10px]" onClick={() => handleGenerate('running')}>Gerar Apenas Corrida</DropdownMenuItem>
                                        <DropdownMenuItem className="py-3 font-bold uppercase text-[10px]" disabled>Gerar Dieta (Em breve)</DropdownMenuItem>
                                        <DropdownMenuItem className="py-3 font-bold uppercase text-[10px]" disabled>Gerar Força (Em breve)</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </form>
                </Form>
                
                <div className="mt-8 pt-8 border-t border-border/50">
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 text-[10px] font-bold uppercase">
                          <Trash2 size={14} className="mr-2" /> Excluir Todos os Dados Locais
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação é irreversível. Todos os seus planos, perfis e a chave de API salvos neste navegador serão removidos permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              if (context.activeProfile?.id) {
                                context.deleteProfile(context.activeProfile.id);
                              }
                            }}
                          >
                            Excluir Tudo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="border-accent/20 bg-accent/5 overflow-hidden">
                    <CardHeader className="bg-secondary/20 border-b">
                        <CardTitle className="text-lg flex items-center gap-2 font-headline uppercase italic">
                            <Link2 className="size-5 text-accent" /> Conexões Strava
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-[#FC6100] flex items-center justify-center text-white font-black text-xl italic shadow-lg">S</div>
                                    <div>
                                        <div className="font-black text-sm uppercase italic">Strava API</div>
                                        <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">ID: 202859</div>
                                    </div>
                                </div>
                                <Switch 
                                    checked={!!context.activeProfile?.integrations?.strava.connected}
                                    onCheckedChange={handleStravaClick}
                                    className="data-[state=checked]:bg-[#FC6100]"
                                />
                            </div>
                            
                            {context.activeProfile?.integrations?.strava.connected ? (
                              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-[10px] font-bold uppercase italic text-green-400 text-center animate-in zoom-in-95">
                                Atleta Conectado: Sincronização Ativa
                              </div>
                            ) : (
                              <Button 
                                onClick={handleStravaClick}
                                className="w-full bg-[#FC6100] hover:bg-[#E55700] text-white font-black uppercase italic tracking-widest h-12 shadow-orange-500/20 shadow-lg"
                              >
                                DIRECIOnAR PARA CONECTAR
                              </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 font-headline uppercase italic tracking-tight">
                            <Target className="size-5 text-primary" /> Status do Motor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3 rounded-xl bg-secondary/20 border border-border space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-primary italic">
                                <span>Pace Limiar</span>
                                <span className="text-white">{watch('thresholdPace')}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-primary italic">
                                <span>Dias Treino</span>
                                <span className="text-white">{watchTrainingDays.length}x / sem</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-primary italic">
                                <span>Leg Day</span>
                                <span className="text-white">{watch('legDay')}</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-tight italic">
                            O Gemini Coach cruzará sua disponibilidade de {watchTrainingDays.length} dias com o Leg Day para otimizar os blocos de V02 Max.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
