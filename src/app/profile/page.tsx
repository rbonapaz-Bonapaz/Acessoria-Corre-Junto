
'use client';

import { useContext, useState, useEffect, useRef } from 'react';
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
    Upload,
    CalendarDays,
    Trash2,
    ChevronDown,
    Activity,
    CheckCircle2,
    Info,
    Clock,
    Target
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

type TabID = 'perfil' | 'corrida' | 'alimentacao' | 'musculacao';

const InfoIcon = ({ text }: { text: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center ml-1 cursor-help text-muted-foreground/60 hover:text-primary transition-colors">
          <Info size={13} />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[250px] bg-secondary border-border text-[11px] leading-relaxed p-3 shadow-xl">
        {text}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function ProfilePage() {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("perfil");
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const { reset, watch, setValue, trigger, getValues } = form;

  useEffect(() => {
    if (context?.isHydrated && context.activeProfile) {
        const p = context.activeProfile;
        reset({
            ...p,
            name: p.name || '',
            raceGoalType: p.targetTime ? 'time' : 'pace',
            targetPace: p.targetPace || '',
            targetTime: p.targetTime || '',
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

  const watchTrainingDays = watch('trainingDays') || [];
  const watchStrengthDays = watch('strengthDays') || [];
  const watchAvatarUrl = watch('avatarUrl');
  const watchRaceGoalType = watch('raceGoalType');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const dataUri = await fileToDataURI(e.target.files[0]);
        setValue('avatarUrl', dataUri, { shouldDirty: true });
        toast({ title: "Foto atualizada!", description: "Clique em Salvar para confirmar." });
      } catch (err) { 
        toast({ variant: 'destructive', title: 'Erro na imagem' }); 
      }
    }
  };

  const handleSaveActiveTab = async () => {
    if (!context) return;
    setIsSaving(true);

    const tabFields: Record<TabID, (keyof ProfileFormValues)[]> = {
        perfil: ['name', 'birthDate', 'gender', 'currentWeight', 'height', 'location', 'avatarUrl'],
        corrida: ['restingHr', 'thresholdPace', 'thresholdHr', 'trainingDays', 'longRunDay', 'experienceLevel', 'raceDistance', 'raceDate', 'trainingHistory', 'planGenerationType', 'vo2Max', 'raceGoalType', 'targetPace', 'targetTime'],
        alimentacao: ['aestheticGoal', 'trainingTiming', 'mealCount', 'supplements', 'allergies', 'preferredFoods', 'excludedFoods'],
        musculacao: ['strengthSplit', 'strengthObjective', 'strengthFrequency', 'strengthDays', 'strengthEquipment', 'strengthFocus', 'legDay', 'limitations', 'prBench', 'prSquat', 'prDeadlift']
    };

    const currentTabId = activeTab as TabID;
    const fieldsToValidate = tabFields[currentTabId];

    const isValid = await trigger(fieldsToValidate);

    if (!isValid) {
        setIsSaving(false);
        toast({
            variant: "destructive",
            title: "Dados Incompletos",
            description: `Existem erros na aba ${activeTab.toUpperCase()}. Corrija para salvar.`,
        });
        return;
    }

    try {
        const data = getValues();
        context.saveProfile({
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
        
        toast({ 
            title: `✅ ${activeTab.toUpperCase()} Salvo`, 
            description: 'Alterações registradas com sucesso.' 
        });
    } catch (err) {
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: 'Não foi possível salvar os dados.' });
    } finally {
        setTimeout(() => setIsSaving(false), 300);
    }
  };

  const handleGenerate = async (type: 'all' | 'running') => {
    if (!context) return;
    
    const isValid = await trigger(['restingHr', 'thresholdPace', 'thresholdHr', 'trainingDays', 'longRunDay', 'experienceLevel', 'raceDistance', 'raceDate', 'trainingHistory', 'vo2Max']);
    
    if (!isValid) {
        toast({
            variant: "destructive",
            title: "Dados Fisiológicos Necessários",
            description: "Preencha a aba CORRIDA antes de gerar o ciclo.",
        });
        setActiveTab('corrida');
        return;
    }

    setIsProcessing(true);
    try {
        const data = form.getValues();
        await context.generateRunningPlanAsync(data as any);
    } finally {
        setIsProcessing(false);
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

        <div className="max-w-4xl">
            <Form {...form}>
                <div className="space-y-8">
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
                                            <FormControl><Input placeholder="Ex: Três de Maio, RS" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
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
                                  <CardDescription className="text-xs">Configure seus dados fisiológicos para a periodização.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6 border-t border-border/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FormField control={form.control} name="restingHr" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">
                                                  FC Repouso <InfoIcon text="Frequência cardíaca medida em repouso absoluto. Indica seu nível de condicionamento cardiovascular." />
                                                </FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="vo2Max" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">
                                                  VO2 Máx <InfoIcon text="Capacidade máxima do seu corpo de consumir oxigênio. Indica seu 'teto' aeróbico." />
                                                </FormLabel>
                                                <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="thresholdPace" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">
                                                  Pace Limiar <InfoIcon text="Ritmo mais rápido sustentável por ~1h. Essencial para prescrever intensidades de treino." />
                                                </FormLabel>
                                                <FormControl><Input placeholder="05:00" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="thresholdHr" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">
                                                  FC Limiar (L2) <InfoIcon text="Frequência cardíaca no ponto onde o esforço passa de aeróbico para anaeróbico." />
                                                </FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="space-y-4 border-t pt-6">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-xs font-bold uppercase flex items-center gap-2">
                                                <CalendarDays className="size-4 text-primary" /> Disponibilidade Semanal Corrida
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
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                                        <FormField control={form.control} name="longRunDay" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Dia de Longão</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {weekDays.filter(d => watchTrainingDays.includes(d.id)).map(d => (
                                                            <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="planGenerationType" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">
                                                  Estratégia Ciclo <InfoIcon text="'Full' planeja até a prova; 'Blocks' gera 4 semanas focadas em uma fase." />
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="blocks">Blocos (4 Semanas)</SelectItem>
                                                        <SelectItem value="full">Completo (Até a Prova)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="experienceLevel" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Nível de Experiência</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="run_walk">Iniciante (Caminha/Corre)</SelectItem>
                                                        <SelectItem value="beginner">Começando (Até 20km/sem)</SelectItem>
                                                        <SelectItem value="intermediate">Intermediário (20-50km/sem)</SelectItem>
                                                        <SelectItem value="advanced">Avançado (50km+ / sem)</SelectItem>
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

                                    <div className="space-y-4 border-t pt-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <FormLabel className="text-xs font-bold uppercase">Objetivo da Prova</FormLabel>
                                            <FormField control={form.control} name="raceGoalType" render={({ field }) => (
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="pace" id="pace-goal" className="border-primary text-primary" />
                                                        <Label htmlFor="pace-goal" className="text-xs font-bold uppercase cursor-pointer">Pace Alvo</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="time" id="time-goal" className="border-primary text-primary" />
                                                        <Label htmlFor="time-goal" className="text-xs font-bold uppercase cursor-pointer">Tempo Alvo</Label>
                                                    </div>
                                                </RadioGroup>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {watchRaceGoalType === 'pace' ? (
                                                <FormField control={form.control} name="targetPace" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase flex items-center gap-2">
                                                            <Target size={14} className="text-primary" /> Pace Alvo Pretendido (min/km)
                                                        </FormLabel>
                                                        <FormControl><Input placeholder="04:30" {...field} value={field.value ?? ''} className="bg-secondary/10 h-12" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            ) : (
                                                <FormField control={form.control} name="targetTime" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase flex items-center gap-2">
                                                            <Clock size={14} className="text-primary" /> Tempo Alvo Pretendido (HH:MM:SS)
                                                        </FormLabel>
                                                        <FormControl><Input placeholder="03:45:00" {...field} value={field.value ?? ''} className="bg-secondary/10 h-12" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            )}
                                        </div>
                                    </div>

                                    <FormField control={form.control} name="trainingHistory" render={({field}) => (
                                        <FormItem className="border-t pt-6">
                                            <FormLabel className="text-xs font-bold uppercase">Contexto & Histórico</FormLabel>
                                            <FormControl><Textarea placeholder="Descreva brevemente sua rotina atual e metas..." {...field} value={field.value ?? ''} className="bg-secondary/10 min-h-[100px]" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="alimentacao" className="mt-6 space-y-6 animate-in fade-in">
                            <Card className="bg-card/50">
                                <CardHeader><CardTitle className="font-headline text-xl md:text-2xl uppercase italic">Combustível</CardTitle></CardHeader>
                                <CardContent className="space-y-6 pt-6 border-t border-border/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="aestheticGoal" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">
                                                  Objetivo Principal <InfoIcon text="Ajusta o aporte calórico: perda de gordura, ganho de massa ou performance pura." />
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="cutting">Secar (Cutting)</SelectItem>
                                                        <SelectItem value="bulking">Ganhar Massa (Bulking)</SelectItem>
                                                        <SelectItem value="performance">Performance</SelectItem>
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
                                                        <SelectItem value="tarde">À Tarde/Noite</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="mealCount" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Refeições/Dia</FormLabel>
                                                <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="supplements" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Suplementos</FormLabel>
                                                <FormControl><Input placeholder="Whey, Creatina, etc." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <FormField control={form.control} name="allergies" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Restrições / Alergias</FormLabel>
                                            <FormControl><Input placeholder="Lactose, Glúten, etc." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        </FormItem>
                                    )} />
                                    
                                    <FormField control={form.control} name="preferredFoods" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Alimentos Favoritos</FormLabel>
                                            <FormControl><Input placeholder="Ovos, Arroz, Frango..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="excludedFoods" render={({field}) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase">Alimentos Odiados</FormLabel>
                                            <FormControl><Textarea placeholder="Alimentos que você não come de jeito nenhum..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="musculacao" className="mt-6 space-y-6 animate-in fade-in">
                            <Card className="bg-card/50">
                                <CardHeader><CardTitle className="font-headline text-xl md:text-2xl uppercase italic text-primary">Blindagem de Elite</CardTitle></CardHeader>
                                <CardContent className="space-y-6 pt-6 border-t border-border/50">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-xs font-bold uppercase flex items-center gap-2">
                                                <CalendarDays className="size-4 text-primary" /> Dias de Musculação
                                            </FormLabel>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase italic">{watchStrengthDays.length} Dias / Semana</span>
                                        </div>
                                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                            {weekDays.map(day => (
                                                <FormField key={day.id} control={form.control} name="strengthDays" render={({ field }) => (
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
                                                                {field.value?.includes(day.id) && <Dumbbell className="size-3 mt-1" />}
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                                        <FormField control={form.control} name="strengthObjective" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Objetivo de Força</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="strength">Força Máxima</SelectItem>
                                                        <SelectItem value="hypertrophy">Hipertrofia</SelectItem>
                                                        <SelectItem value="performance">Performance na Corrida</SelectItem>
                                                        <SelectItem value="endurance">Resistência Muscular</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="strengthSplit" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">
                                                  Divisão de Treino <InfoIcon text="Organização semanal dos grupos musculares." />
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="full_body">Corpo Todo</SelectItem>
                                                        <SelectItem value="upper_lower">Superior / Inferior</SelectItem>
                                                        <SelectItem value="ppl">Empurre / Puxe / Pernas (PPL)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                                        <FormField control={form.control} name="legDay" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase">
                                                    <CalendarDays className="h-4 w-4 text-primary" /> 
                                                    Dia de Perna (Leg Day) <InfoIcon text="A IA evitará agendar treinos intensos de corrida no dia seguinte a este." />
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10 h-12"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {weekDays.filter(d => watchStrengthDays.includes(d.id)).map(d => (
                                                            <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="space-y-4 border-t pt-6">
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
                                    </div>

                                    <div className="space-y-4 border-t pt-6">
                                        <FormLabel className="text-xs font-bold uppercase">Grupos de Foco</FormLabel>
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
                                            <FormItem><FormLabel className="text-[10px] font-bold uppercase">Supino (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="prSquat" render={({field}) => (
                                            <FormItem><FormLabel className="text-[10px] font-bold uppercase">Agachamento (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="prDeadlift" render={({field}) => (
                                            <FormItem><FormLabel className="text-[10px] font-bold uppercase">Terra (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl></FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                            type="button" 
                            size="lg" 
                            disabled={isSaving} 
                            className="flex-1 h-12 font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 text-xs"
                            onClick={handleSaveActiveTab}
                        >
                            {isSaving ? <Loader2 className="animate-spin mr-2 size-4" /> : <CheckCircle2 className="mr-2 size-4" />}
                            {isSaving ? "SALVANDO..." : `SALVAR ${activeTab.toUpperCase()}`}
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
                </div>
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
                        Esta ação removerá permanentemente todos os seus data salvos localmente.
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
      </div>
    </DashboardLayout>
  );
}
