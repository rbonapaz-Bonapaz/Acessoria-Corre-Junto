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
    CalendarDays,
    Download,
    Upload
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  });

  const { reset, watch, setValue, trigger } = form;

  useEffect(() => {
    if (context?.isHydrated && context.activeProfile) {
        const p = context.activeProfile;
        const presets = ['5k', '10k', '15k', '21.1k', '42.2k'];
        const isPreset = presets.includes(p.raceDistance);

        reset({
            ...p,
            name: p.name || '',
            raceDistancePreset: isPreset ? (p.raceDistance as any) : 'other',
            customRaceDistance: isPreset ? '' : p.raceDistance?.replace('k','') || '',
            aestheticGoal: p.dietPreferences?.aestheticGoal || 'performance',
            strengthSplit: p.strengthPreferences?.splitPreference || 'full_body',
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
    context.saveProfile(data as any);
    toast({ title: '✅ Perfil Atualizado!', description: 'Seus dados locais foram salvos.' });
  };

  const handleGenerate = async (type: string) => {
      if (!context) return;
      setIsProcessing(true);
      await context.generateRunningPlanAsync(form.getValues() as any);
      setIsProcessing(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        context?.importData(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  if (!context?.isHydrated) return <DashboardLayout><Skeleton className="h-96 w-full"/></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="font-headline text-4xl tracking-wide uppercase font-black italic">
                    <span className="text-white">Meus Dados &</span> <span className="text-primary">Ciclo</span>
                </h1>
                <p className="text-muted-foreground mt-1">Armazenamento Local-First. Seus dados nunca saem do navegador.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload size={16}/> Importar JSON
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport}/>
              <Button variant="outline" size="sm" onClick={() => context.exportData()} className="gap-2">
                <Download size={16}/> Exportar Tudo
              </Button>
            </div>
        </div>

        <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" /> Gestão do Ciclo IA
                </CardTitle>
                <CardDescription>Planilhas geradas via Gemini API Key do usuário.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Ciclo de Corrida</p>
                    <Button type="button" size="sm" className="w-full font-bold" onClick={() => handleGenerate('running')} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Route className="h-3 w-3 mr-2" />} GERAR PLANO
                    </Button>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Plano de Dieta</p>
                    <Button type="button" size="sm" variant="outline" className="w-full font-bold" onClick={() => handleGenerate('nutrition')} disabled={isProcessing}>
                        <Utensils className="h-3 w-3 mr-2" /> GERAR DIETA
                    </Button>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Treino de Força</p>
                    <Button type="button" size="sm" variant="outline" className="w-full font-bold" onClick={() => handleGenerate('strength')} disabled={isProcessing}>
                        <Dumbbell className="h-3 w-3 mr-2" /> GERAR FORÇA
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(handleSaveProfile)}>
            <Tabs defaultValue="perfil" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 h-auto bg-secondary/20 p-1 rounded-xl">
                    <TabsTrigger value="perfil" className="py-3 font-bold text-xs sm:text-sm">Perfil</TabsTrigger>
                    <TabsTrigger value="corrida" className="py-3 font-bold text-xs sm:text-sm">Corrida</TabsTrigger>
                    <TabsTrigger value="alimentacao" className="py-3 font-bold text-xs sm:text-sm">Dieta</TabsTrigger>
                    <TabsTrigger value="musculacao" className="py-3 font-bold text-xs sm:text-sm">Força</TabsTrigger>
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
                                    <CardDescription>Calibração basal do atleta.</CardDescription>
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
                                    <FormLabel>Localização</FormLabel>
                                    <FormControl><Input placeholder="Cidade, Estado" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
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
                                        <FormLabel>FC Repouso</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="thresholdPace" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Pace Limiar (MM:SS)</FormLabel>
                                        <FormControl><Input placeholder="05:00" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="thresholdHr" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>FC Limiar (L2)</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="trainingDays" render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Dias Disponíveis</FormLabel>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {weekDays.map(day => (
                                                <Button 
                                                    key={day.id}
                                                    type="button"
                                                    variant={field.value?.includes(day.id) ? "default" : "outline"}
                                                    size="sm"
                                                    className="text-[10px]"
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
                                        <FormLabel>Dia do Longão</FormLabel>
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
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alimentacao" className="mt-6 space-y-6 animate-in fade-in">
                    <Card>
                        <CardHeader><CardTitle className="font-headline uppercase italic">Nutrição</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                            <FormField control={form.control} name="aestheticGoal" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Objetivo</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="cutting">Secar (Cutting)</SelectItem>
                                            <SelectItem value="bulking">Ganhar Massa (Bulking)</SelectItem>
                                            <SelectItem value="performance">Apenas Performance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="trainingTiming" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Momento do Treino</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="jejum">Jejum</SelectItem>
                                            <SelectItem value="manha">Manhã</SelectItem>
                                            <SelectItem value="noite">Noite</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="excludedFoods" render={({field}) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Alimentos Excluídos (Restrições)</FormLabel>
                                    <FormControl><Textarea {...field} value={field.value ?? ''} className="bg-secondary/10" /></FormControl>
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="musculacao" className="mt-6 space-y-6 animate-in fade-in">
                    <Card>
                        <CardHeader><CardTitle className="font-headline uppercase italic">Força</CardTitle></CardHeader>
                        <CardContent className="space-y-6 pt-6 border-t border-border/50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="prBench" render={({field}) => (
                                    <FormItem><FormLabel>Supino (PR kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="prSquat" render={({field}) => (
                                    <FormItem><FormLabel>Agachamento (PR kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="prDeadlift" render={({field}) => (
                                    <FormItem><FormLabel>Terra (PR kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="legDay" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Dia do Treino de Perna</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {weekDays.map(d => <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Button type="submit" size="lg" className="w-full h-14 font-black uppercase tracking-widest bg-primary text-black">
                Salvar Dados Localmente
            </Button>
            </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
