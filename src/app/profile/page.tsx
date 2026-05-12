
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
    Route,
    ChevronDown
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
  { id: 'Domingo', label: 'Dom' },
  { id: 'Segunda', label: 'Seg' },
  { id: 'Terça', label: 'Ter' },
  { id: 'Quarta', label: 'Qua' },
  { id: 'Quinta', label: 'Qui' },
  { id: 'Sexta', label: 'Sex' },
  { id: 'Sábado', label: 'Sáb' },
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
                                    <CardHeader><CardTitle className="font-headline text-xl md:text-2xl uppercase italic">O Cérebro Técnico</CardTitle></CardHeader>
                                    <CardContent className="space-y-6 pt-6 border-t border-border/50">
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                                            <FormField control={form.control} name="experienceLevel" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Nível e Histórico</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="run_walk">Caminhada/Corrida</SelectItem>
                                                            <SelectItem value="beginner">Iniciante</SelectItem>
                                                            <SelectItem value="intermediate">Intermediário</SelectItem>
                                                            <SelectItem value="advanced">Avançado / Elite</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="planGenerationType" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Configuração de Ciclo</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="blocks">Geração por Blocos (4 semanas)</SelectItem>
                                                            <SelectItem value="full">Ciclo Completo (Até a prova)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="raceDistance" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Objetivo de Prova</FormLabel>
                                                    <FormControl><Input placeholder="Nome da Prova ou Meta" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="raceDate" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Data do Alvo</FormLabel>
                                                    <FormControl><Input type="date" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="trainingDays" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Dias Disponíveis</FormLabel>
                                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                                        {weekDays.map(day => (
                                                            <Button 
                                                                key={day.id}
                                                                type="button"
                                                                variant={field.value?.includes(day.id) ? "default" : "outline"}
                                                                size="sm"
                                                                className="text-[9px] font-bold h-7 px-2"
                                                                onClick={() => {
                                                                    const current = field.value || [];
                                                                    if (current.includes(day.id)) setValue('trainingDays', current.filter(d => d !== day.id));
                                                                    else setValue('trainingDays', [...current, day.id]);
                                                                }}
                                                            >
                                                                {day.label}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="longRunDay" render={({field}) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase">Dia do Longão</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {weekDays.filter(d => watchTrainingDays.includes(d.id)).map(d => (
                                                                <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="trainingHistory" render={({field}) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase">Histórico Técnico (Contexto)</FormLabel>
                                                <FormControl><Textarea placeholder="Descreva seu histórico recente de volume e lesões..." {...field} value={field.value ?? ''} className="bg-secondary/10 min-h-[100px]" /></FormControl>
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
                                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {weekDays.map(d => <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription className="text-[9px]">A IA evita intensidade (Tiro/Longão) nas 24h seguintes.</FormDescription>
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
                                Salvar Perfil
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
                                    Gerar Ciclo IA
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
                <Card className="border-accent/20 bg-accent/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 font-headline uppercase italic">
                            <Link2 className="size-5 text-accent" /> Conexões
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-[#FC6100] flex items-center justify-center text-white font-black text-sm italic">S</div>
                                <div>
                                    <div className="font-bold text-xs">Strava</div>
                                    <div className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter">Performance Sync</div>
                                </div>
                            </div>
                            <Switch 
                                checked={context.activeProfile?.integrations?.strava.connected}
                                onCheckedChange={(val) => context.toggleIntegration('strava', val)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm italic border border-black">C</div>
                                <div>
                                    <div className="font-bold text-xs">COROS</div>
                                    <div className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter">EvoLab Metrics</div>
                                </div>
                            </div>
                            <Switch 
                                checked={context.activeProfile?.integrations?.coros.connected}
                                onCheckedChange={(val) => context.toggleIntegration('coros', val)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 font-headline uppercase italic tracking-tight">
                            <Target className="size-5 text-primary" /> Status do Motor
                        </Target>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3 rounded-xl bg-secondary/20 border border-border space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-primary italic">
                                <span>Pace Limiar</span>
                                <span className="text-white">{watch('thresholdPace')}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-primary italic">
                                <span>Dia Perna</span>
                                <span className="text-white">{watch('legDay')}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tight text-primary italic">
                                <span>Timing</span>
                                <span className="text-white uppercase">{watch('trainingTiming')}</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-tight italic">
                            O Gemini Coach cruzará o Leg Day com seu T-Pace para garantir que as sessões de V02 Max ocorram no momento ideal de recuperação.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
