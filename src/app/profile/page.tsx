
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
    Link2,
    CalendarCheck,
    Users
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
  raceName: z.string().optional(),
  raceDistance: z.string().optional().or(z.literal('')),
  raceDate: z.string().optional().or(z.literal('')),
  raceGoalType: z.enum(['pace', 'time']).default('pace'),
  targetPace: z.string().optional(),
  targetTime: z.string().optional(),
  trainingDays: z.array(z.string()).default([]),
  longRunDay: z.string().optional().or(z.literal('')),
  planGenerationType: z.enum(['full', 'blocks']).default('blocks'),
  experienceLevel: z.enum(['run_walk', 'beginner', 'intermediate', 'advanced']).optional(),
  trainingHistory: z.string().optional().or(z.literal('')),
  aestheticGoal: z.enum(['cutting', 'bulking', 'recomp', 'performance']).optional(),
  trainingTiming: z.enum(['jejum', 'manha', 'meio-dia', 'tarde', 'noite']).optional(),
  mealCount: z.coerce.number().optional(),
  supplements: z.string().optional(),
  allergies: z.string().optional(),
  preferredFoods: z.string().optional(),
  excludedFoods: z.string().optional(),
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
        longRunDay: '', 
        planGenerationType: 'blocks',
        experienceLevel: 'beginner',
        raceGoalType: 'pace',
        strengthFrequency: 3,
        strengthDays: ['Terça', 'Quinta', 'Sábado'],
        strengthObjective: 'performance'
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
        toast({ title: `Dados Salvos` });
    } finally {
        setIsSaving(false);
    }
  };

  if (!context?.isHydrated) return <DashboardLayout><Skeleton className="h-96 w-full"/></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12 max-w-5xl mx-auto">
        <header className="flex justify-between items-center px-2">
            <h1 className="font-headline text-3xl tracking-wide uppercase font-black italic">
                <span className="text-white">MEU</span> <span className="text-primary">PERFIL</span>
            </h1>
            <Button variant="outline" size="sm" onClick={() => context.exportData()} className="gap-2 text-[10px] font-bold h-10 uppercase italic">
                <Download size={14}/> Backup JSON
            </Button>
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

                    <TabsContent value="perfil" className="mt-6 space-y-6">
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader>
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <Avatar className="h-28 w-28 border-4 border-primary/20 rounded-3xl">
                                            <AvatarImage src={watchAvatarUrl} className="object-cover" />
                                            <AvatarFallback className="text-3xl font-black italic">{watch('name')?.[0] || '?'}</AvatarFallback>
                                        </Avatar>
                                        <input type="file" ref={avatarFileRef} className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                                        <Button type="button" variant="secondary" size="icon" className="absolute -bottom-2 -right-2 rounded-xl h-10 w-10 shadow-xl bg-white text-black" onClick={() => avatarFileRef.current?.click()}>
                                            <Camera size={16}/>
                                        </Button>
                                    </div>
                                    <CardTitle className="font-headline text-3xl uppercase italic font-black">Biometria</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="name" render={({field}) => (
                                    <FormItem><FormLabel className="text-[10px] font-black uppercase">Nome</FormLabel><FormControl><Input {...field} value={field.value ?? ''} className="bg-black/30 h-14" /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="currentWeight" render={({field}) => (
                                    <FormItem><FormLabel className="text-[10px] font-black uppercase">Peso (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} className="bg-black/30 h-14" /></FormControl></FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="corrida" className="mt-6">
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader><CardTitle className="font-headline text-2xl uppercase italic text-primary font-black">Fisiologia & Prova</CardTitle></CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <FormField control={form.control} name="vo2Max" render={({field}) => (
                                        <FormItem><FormLabel className="text-[10px] font-black uppercase">VDOT</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} className="bg-black/40 h-14" /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="thresholdHr" render={({field}) => (
                                        <FormItem><FormLabel className="text-[10px] font-black uppercase">FC Limiar</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} className="bg-black/40 h-14" /></FormControl></FormItem>
                                    )} />
                                </div>
                                <div className="space-y-4">
                                    <FormLabel className="text-[10px] font-black uppercase">Dias de Corrida</FormLabel>
                                    <div className="grid grid-cols-7 gap-2">
                                        {weekDays.map(day => (
                                            <div 
                                                key={day.id}
                                                onClick={() => {
                                                    const curr = getValues('trainingDays') || [];
                                                    const next = curr.includes(day.id) ? curr.filter(d => d !== day.id) : [...curr, day.id];
                                                    setValue('trainingDays', next);
                                                }}
                                                className={cn(
                                                    "h-12 rounded-xl border flex items-center justify-center cursor-pointer font-black text-[10px] italic transition-all",
                                                    watch('trainingDays')?.includes(day.id) ? "bg-primary text-black border-primary" : "bg-black/20 text-muted-foreground border-border/50"
                                                )}
                                            >
                                                {day.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <FormField control={form.control} name="longRunDay" render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase">Dia do Longão</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="h-14 bg-black/30"><SelectValue placeholder="Selecione"/></SelectTrigger></FormControl>
                                            <SelectContent>{availableLongRunDays.map(d => <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex gap-4 pt-10 px-2">
                    <Button type="button" size="lg" disabled={isSaving} className="flex-1 h-16 font-black uppercase italic bg-white text-black" onClick={handleSaveActiveTab}>
                        {isSaving ? <Loader2 className="animate-spin mr-3" /> : <CheckCircle2 className="mr-3" />}
                        SALVAR ABA ATUAL
                    </Button>
                </div>
            </div>
        </Form>
      </div>
    </SidebarProvider>
  );
}
