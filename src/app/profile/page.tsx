
'use client';

import { useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
    Loader2, 
    Zap, 
    Camera, 
    Trash2, 
    ChevronDown, 
    Dumbbell, 
    Utensils, 
    Route, 
    CalendarDays 
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
} from '@/components/ui/alert-dialog';

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
  gender: z.enum(['male', 'female', 'other'], { required_error: "Selecione o gênero" }),
  currentWeight: z.coerce.number().min(30, 'Insira um peso válido.'),
  height: z.coerce.number().min(100, 'Insira uma altura válida em cm.'),
  restingHr: z.coerce.number().min(30, "Mínimo 30bpm"),
  vo2Max: z.coerce.number().min(20, 'Insira um VO2 Max válido.'),
  thresholdPace: z.string().regex(/^\d{1,2}:\d{2}$/, 'Formato MM:SS.'),
  thresholdHr: z.coerce.number().min(100, "Mínimo 100bpm"),
  raceName: z.string().optional(),
  raceDistancePreset: z.enum(['5k', '10k', '15k', '21.1k', '42.2k', 'other']),
  customRaceDistance: z.string().optional(),
  raceDate: z.string().min(1, "Data da prova obrigatória."),
  raceGoal: z.string().optional(),
  trainingDays: z.array(z.string()).min(1, "Selecione pelo menos um dia."),
  longRunDay: z.string().min(1, "Selecione o dia do longão"),
  planGenerationType: z.enum(['full', 'blocks']).default('blocks'),
  experienceLevel: z.enum(['run_walk', 'beginner', 'intermediate', 'advanced']),
  trainingHistory: z.string().min(5, 'Descreva seu histórico.'),
  
  // Nutrição
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
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [planToDelete, setPlanToDelete] = useState<'running' | 'nutrition' | 'strength' | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: '', 
        avatarUrl: '', 
        location: '', 
        birthDate: '', 
        gender: 'male', 
        currentWeight: 70, 
        height: 170, 
        restingHr: 50, 
        vo2Max: 45, 
        thresholdPace: '05:00', 
        thresholdHr: 165,
        raceName: '', 
        raceDistancePreset: '10k', 
        customRaceDistance: '', 
        raceDate: '', 
        raceGoal: '',
        trainingDays: ['Segunda', 'Quarta', 'Sexta'], 
        longRunDay: 'Sexta', 
        planGenerationType: 'blocks',
        experienceLevel: 'beginner', 
        trainingHistory: '',
        aestheticGoal: 'performance', 
        trainingTiming: 'manha', 
        mealCount: 4, 
        supplements: '', 
        allergies: '', 
        preferredFoods: '', 
        excludedFoods: '',
        strengthSplit: 'full_body', 
        strengthFrequency: 2, 
        strengthEquipment: ['Academia Completa'], 
        strengthFocus: ['Core / Estabilidade'],
        legDay: 'Quarta', 
        limitations: '', 
        prBench: 0, 
        prSquat: 0, 
        prDeadlift: 0,
    }
  });

  const { reset, watch, setValue, trigger } = form;

  useEffect(() => {
    if (mounted && context?.isHydrated && context.activeProfile) {
        const p = context.activeProfile;
        const presets = ['5k', '10k', '15k', '21.1k', '42.2k'];
        const isPreset = presets.includes(p.raceDistance);

        reset({
            ...p,
            name: p.name || '',
            location: p.location || '',
            birthDate: p.birthDate || '',
            gender: (p.gender as any) || 'male',
            raceDistancePreset: isPreset ? (p.raceDistance as any) : 'other',
            customRaceDistance: isPreset ? '' : p.raceDistance?.replace('k','') || '',
            planGenerationType: p.planGenerationType || 'blocks',
            trainingHistory: p.trainingHistory || '',
            raceName: p.raceName || '',
            raceGoal: p.raceGoal || '',
            experienceLevel: p.experienceLevel || 'beginner',
            
            aestheticGoal: p.dietPreferences?.aestheticGoal || 'performance',
            trainingTiming: (p.dietPreferences?.trainingTiming as any) || 'manha',
            mealCount: p.dietPreferences?.mealCount || 4,
            supplements: p.dietPreferences?.supplements || '',
            allergies: p.dietPreferences?.allergies || '',
            preferredFoods: p.dietPreferences?.preferredFoods || '',
            excludedFoods: p.dietPreferences?.excludedFoods || '',
            
            strengthSplit: p.strengthPreferences?.splitPreference || 'full_body',
            strengthFrequency: p.strengthPreferences?.frequency || 2,
            strengthEquipment: p.strengthPreferences?.equipment || ['Academia Completa'],
            strengthFocus: p.strengthPreferences?.focusAreas || ['Core / Estabilidade'],
            legDay: p.strengthPreferences?.legDay || 'Quarta',
            limitations: p.strengthPreferences?.limitations || '',
            prBench: p.strengthPreferences?.prBench || 0,
            prSquat: p.strengthPreferences?.prSquat || 0,
            prDeadlift: p.strengthPreferences?.prDeadlift || 0,
        });
        setTimeout(() => trigger(), 500);
    }
  }, [mounted, context?.isHydrated, context?.activeProfile, reset, trigger]);

  const watchTrainingDays = watch('trainingDays');
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
    try {
        const raceDistance = data.raceDistancePreset === 'other' ? `${data.customRaceDistance}k` : data.raceDistancePreset;
        const profileData = {
            ...data,
            id: context.activeProfile?.id,
            raceDistance,
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
        };
        context.saveProfile(profileData as any);
        toast({ 
            title: '✅ Perfil Atualizado!', 
            description: 'Suas alterações foram salvas com sucesso.' 
        });
    } catch (e) {
        toast({ 
            variant: 'destructive', 
            title: '❌ Erro ao Salvar', 
            description: 'Não foi possível salvar os dados no momento.' 
        });
    }
  };

  const handleGenerate = async (type: 'all' | 'running' | 'nutrition' | 'strength') => {
      if (!context) return;
      setIsProcessing(true);
      const data = form.getValues();
      const raceDistance = data.raceDistancePreset === 'other' ? `${data.customRaceDistance}k` : data.raceDistancePreset;
      
      const profileToSave = { 
          ...data, 
          id: context.activeProfile?.id, 
          raceDistance,
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
      } as any;

      const savedProfile = context.saveProfile(profileToSave);

      try {
          await context.generateRunningPlanAsync(savedProfile);
          router.push('/training');
      } catch (err) { 
          // Erro já tratado no contexto
      } finally { 
          setIsProcessing(false); 
      }
  };

  if (!mounted || !context?.isHydrated) {
    return (
        <DashboardLayout>
            <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
        <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="font-headline text-4xl tracking-wide uppercase font-black italic">
                    <span className="text-white">Meus Dados &</span> <span className="text-primary">Ciclo</span>
                </h1>
                <p className="text-muted-foreground mt-1">Configure seu perfil para calibração fina da IA.</p>
            </div>
        </div>

        <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" /> Gestão do Ciclo IA
                </CardTitle>
                <CardDescription>Ações rápidas para gerar ou resetar seus planos.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Planilha de Corrida</p>
                    <div className="flex gap-2">
                        <Button type="button" size="sm" className="flex-1 font-bold" onClick={() => handleGenerate('running')} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Route className="h-3 w-3 mr-2" />} GERAR
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="text-destructive border-destructive/20" onClick={() => setPlanToDelete('running')}>
                            <Trash2 className="h-3 w-3"/>
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Plano Nutricional</p>
                    <div className="flex gap-2">
                        <Button type="button" size="sm" className="flex-1 font-bold" onClick={() => handleGenerate('nutrition')} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Utensils className="h-3 w-3 mr-2" />} GERAR
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="text-destructive border-destructive/20" onClick={() => setPlanToDelete('nutrition')}>
                            <Trash2 className="h-3 w-3"/>
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Treino de Força</p>
                    <div className="flex gap-2">
                        <Button type="button" size="sm" className="flex-1 font-bold" onClick={() => handleGenerate('strength')} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Dumbbell className="h-3 w-3 mr-2" />} GERAR
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="text-destructive border-destructive/20" onClick={() => setPlanToDelete('strength')}>
                            <Trash2 className="h-3 w-3"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(handleSaveProfile)}>
            <Tabs defaultValue="perfil" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 h-auto bg-secondary/20 p-1 rounded-xl">
                    <TabsTrigger value="perfil" className="py-3 data-[state=active]:bg-background rounded-lg font-bold text-xs sm:text-sm">Perfil</TabsTrigger>
                    <TabsTrigger value="corrida" className="py-3 data-[state=active]:bg-background rounded-lg font-bold text-xs sm:text-sm">Corrida</TabsTrigger>
                    <TabsTrigger value="alimentacao" className="py-3 data-[state=active]:bg-background rounded-lg font-bold text-xs sm:text-sm">Dieta</TabsTrigger>
                    <TabsTrigger value="musculacao" className="py-3 data-[state=active]:bg-background rounded-lg font-bold text-xs sm:text-sm">Força</TabsTrigger>
                </TabsList>

                <TabsContent value="perfil" className="mt-6 space-y-6 animate-in fade-in">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 border-2 border-primary/20">
                                        <AvatarImage src={watchAvatarUrl} />
                                        <AvatarFallback className="text-2xl font-black">{watch('name')?.[0] || '?'}</AvatarFallback>
                                    </Avatar>
                                    <input type="file" ref={avatarFileRef} className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                                    <Button type="button" variant="secondary" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-lg" onClick={() => avatarFileRef.current?.click()}>
                                        <Camera size={14}/>
                                    </Button>
                                </div>
                                <div>
                                    <CardTitle className="font-headline text-2xl uppercase italic">Dados Pessoais</CardTitle>
                                    <CardDescription>Informações básicas para calibração.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                            <FormField control={form.control} name="name" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl><Input {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="birthDate" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Data de Nascimento</FormLabel>
                                    <FormControl><Input type="date" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="gender" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Gênero</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="male">Masculino</SelectItem>
                                            <SelectItem value="female">Feminino</SelectItem>
                                            <SelectItem value="other">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="currentWeight" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Peso (kg)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="height" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Altura (cm)</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="location" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Cidade / Estado</FormLabel>
                                    <FormControl><Input placeholder="Ex: São Paulo, SP" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="corrida" className="mt-6 space-y-6 animate-in fade-in">
                    <Card>
                        <CardHeader><CardTitle className="font-headline uppercase italic">Fisiologia & Objetivos</CardTitle></CardHeader>
                        <CardContent className="space-y-8 pt-6 border-t border-border/50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="restingHr" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>FC de Repouso (bpm)</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormDescription>Use ao acordar.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="thresholdPace" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Pace de Limiar (MM:SS)</FormLabel>
                                        <FormControl><Input placeholder="04:50" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormDescription>Ritmo de L2.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="thresholdHr" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>FC de Limiar (bpm)</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormDescription>FC no ritmo L2.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="raceDate" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Data da Prova Alvo</FormLabel>
                                        <FormControl><Input type="date" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="raceDistancePreset" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Distância</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="5k">5km</SelectItem>
                                                <SelectItem value="10k">10km</SelectItem>
                                                <SelectItem value="15k">15km</SelectItem>
                                                <SelectItem value="21.1k">21.1km (Meia)</SelectItem>
                                                <SelectItem value="42.2k">42.2km (Maratona)</SelectItem>
                                                <SelectItem value="other">Outra</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="experienceLevel" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Nível de Experiência</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="run_walk">Caminhada/Corrida</SelectItem>
                                                <SelectItem value="beginner">Iniciante</SelectItem>
                                                <SelectItem value="intermediate">Intermediário</SelectItem>
                                                <SelectItem value="advanced">Avançado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="planGenerationType" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Estratégia de Geração</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="blocks">Por Blocos (4 em 4 semanas)</SelectItem>
                                                <SelectItem value="full">Ciclo Completo (Até o dia da prova)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="space-y-4">
                                <FormLabel>Dias de Treino de Corrida</FormLabel>
                                <div className="flex flex-wrap gap-2">
                                    {weekDays.map((day) => (
                                        <FormField key={day.id} control={form.control} name="trainingDays" render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0 bg-secondary/10 p-3 rounded-lg border border-border/50">
                                                <FormControl>
                                                    <Checkbox 
                                                        checked={field.value?.includes(day.id)} 
                                                        onCheckedChange={(checked) => { 
                                                            const current = new Set(field.value || []); 
                                                            if (checked) current.add(day.id); else current.delete(day.id); 
                                                            field.onChange(Array.from(current)); 
                                                        }} 
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-bold cursor-pointer">{day.label}</FormLabel>
                                            </FormItem>
                                        )} />
                                    ))}
                                </div>
                            </div>

                            <FormField control={form.control} name="longRunDay" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Dia do Longão (Maior Volume)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {weekDays.filter(d => watchTrainingDays.includes(d.id)).map(d => (
                                                <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="trainingHistory" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Histórico de Treino (Contexto para IA)</FormLabel>
                                    <FormControl><Textarea placeholder="Corro 3x por semana há 1 ano..." {...field} value={field.value ?? ''} className="bg-secondary/10 min-h-[100px]" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alimentacao" className="mt-6 space-y-6 animate-in fade-in">
                    <Card>
                        <CardHeader><CardTitle className="font-headline uppercase italic">Nutrição Esportiva</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                            <FormField control={form.control} name="aestheticGoal" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Objetivo Estético</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="cutting">Secar (Cutting)</SelectItem>
                                            <SelectItem value="bulking">Ganho de Massa (Bulking)</SelectItem>
                                            <SelectItem value="recomp">Recomposição</SelectItem>
                                            <SelectItem value="performance">Apenas Performance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="trainingTiming" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Momento do Treino</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="jejum">Em Jejum</SelectItem>
                                            <SelectItem value="manha">Manhã</SelectItem>
                                            <SelectItem value="meio-dia">Meio-dia</SelectItem>
                                            <SelectItem value="tarde">Tarde</SelectItem>
                                            <SelectItem value="noite">Noite</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="mealCount" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Refeições por Dia</FormLabel>
                                    <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="supplements" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Suplementação Atual</FormLabel>
                                    <FormControl><Input placeholder="Whey, Creatina, Gel de Carbo..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="allergies" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Alergias ou Intolerâncias</FormLabel>
                                    <FormControl><Input placeholder="Lactose, Glúten, Amendoim..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="preferredFoods" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Alimentos Favoritos</FormLabel>
                                    <FormControl><Input placeholder="Ovos, Arroz, Batata Doce..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="excludedFoods" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Alimentos que NÃO consome</FormLabel>
                                    <FormControl><Input placeholder="Coentro, Fígado, Carne Vermelha..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="musculacao" className="mt-6 space-y-6 animate-in fade-in">
                    <Card>
                        <CardHeader><CardTitle className="font-headline uppercase italic text-primary">Treino de Força (Running Strength)</CardTitle></CardHeader>
                        <CardContent className="space-y-8 pt-6 border-t border-border/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="strengthSplit" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Divisão (Split)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="full_body">Full Body (Corpo Todo)</SelectItem>
                                                <SelectItem value="upper_lower">Upper / Lower (Superior / Inferior)</SelectItem>
                                                <SelectItem value="ppl">Push / Pull / Legs</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="strengthFrequency" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Frequência Semanal</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="legDay" render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Dia do Treino de Perna</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue placeholder="Selecione o dia" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {weekDays.map(day => (
                                                    <SelectItem key={day.id} value={day.id}>{day.id}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Essencial para a IA evitar tiros/longos no dia seguinte.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="space-y-4">
                                <FormLabel>Equipamentos Disponíveis</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {equipmentOptions.map((eq) => (
                                        <FormField key={eq} control={form.control} name="strengthEquipment" render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0 p-2 border rounded-md">
                                                <FormControl>
                                                    <Checkbox 
                                                        checked={field.value?.includes(eq)} 
                                                        onCheckedChange={(checked) => { 
                                                            const current = new Set(field.value || []); 
                                                            if (checked) current.add(eq); else current.delete(eq); 
                                                            field.onChange(Array.from(current)); 
                                                        }} 
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm cursor-pointer">{eq}</FormLabel>
                                            </FormItem>
                                        )} />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <FormLabel>Áreas de Foco Adicional</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {focusAreasOptions.map((focus) => (
                                        <FormField key={focus} control={form.control} name="strengthFocus" render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0 p-2 border rounded-md">
                                                <FormControl>
                                                    <Checkbox 
                                                        checked={field.value?.includes(focus)} 
                                                        onCheckedChange={(checked) => { 
                                                            const current = new Set(field.value || []); 
                                                            if (checked) current.add(focus); else current.delete(focus); 
                                                            field.onChange(Array.from(current)); 
                                                        }} 
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm cursor-pointer">{focus}</FormLabel>
                                            </FormItem>
                                        )} />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
                                <FormField control={form.control} name="prBench" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>PR Supino (kg)</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="prSquat" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>PR Agachamento (kg)</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="prDeadlift" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>PR L. Terra (kg)</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="limitations" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Limitações ou Lesões</FormLabel>
                                    <FormControl><Input placeholder="Dor no joelho esquerdo, hérnia de disco..." {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border/50">
                <Button type="submit" variant="outline" size="lg" className="h-14 px-8 font-bold">Salvar Alterações do Perfil</Button>
                <div className="flex flex-1 rounded-md shadow-lg overflow-hidden">
                    <Button type="button" size="lg" className="flex-1 h-14 rounded-none font-black uppercase tracking-widest bg-primary text-black hover:bg-primary/90" onClick={() => handleGenerate('all')} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2"/>} Gerar Ciclo IA Completo
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="lg" className="h-14 rounded-none px-3 border-l border-black/10 bg-primary text-black hover:bg-primary/90">
                                <ChevronDown size={18}/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuItem className="py-3 font-bold" onClick={() => handleGenerate('running')}>Gerar Apenas Corrida</DropdownMenuItem>
                            <DropdownMenuItem className="py-3 font-bold" onClick={() => handleGenerate('nutrition')}>Gerar Apenas Dieta</DropdownMenuItem>
                            <DropdownMenuItem className="py-3 font-bold" onClick={() => handleGenerate('strength')}>Gerar Apenas Força</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            </form>
        </Form>

        <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Plano?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação removerá o módulo permanentemente do seu perfil.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { if(planToDelete === 'running') context.deleteTrainingPlan(true); setPlanToDelete(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </div>
    </DashboardLayout>
  );
}
