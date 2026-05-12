
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
    Route, 
    Link2,
    Activity,
    RefreshCw,
    Download,
    Upload
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const weekDays = [
  { id: 'Domingo', label: 'Dom' },
  { id: 'Segunda', label: 'Seg' },
  { id: 'Terça', label: 'Ter' },
  { id: 'Quarta', label: 'Qua' },
  { id: 'Quinta', label: 'Qui' },
  { id: 'Sexta', label: 'Sex' },
  { id: 'Sábado', label: 'Sáb' },
] as const;

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
  raceDate: z.string().min(1, "Data da prova obrigatória."),
  raceDistance: z.string().min(1, "Selecione a distância."),
  trainingDays: z.array(z.string()).min(1, "Selecione pelo menos um dia."),
  longRunDay: z.string().min(1, "Selecione o dia do longão"),
  planGenerationType: z.enum(['full', 'blocks']).default('blocks'),
  experienceLevel: z.enum(['run_walk', 'beginner', 'intermediate', 'advanced']),
  trainingHistory: z.string().min(5, 'Descreva seu histórico.'),
  
  // Dieta
  aestheticGoal: z.enum(['cutting', 'bulking', 'recomp', 'performance']).optional(),
  trainingTiming: z.enum(['jejum', 'manha', 'meio-dia', 'tarde', 'noite']).optional(),
  excludedFoods: z.string().optional(),
  
  // Força
  strengthSplit: z.enum(['full_body', 'upper_lower', 'ppl']).optional(),
  legDay: z.string().optional(),
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
            strengthSplit: p.strengthPreferences?.splitPreference || 'full_body',
            prBench: p.strengthPreferences?.prBench || 0,
            prSquat: p.strengthPreferences?.prSquat || 0,
            prDeadlift: p.strengthPreferences?.prDeadlift || 0,
            legDay: p.strengthPreferences?.legDay || 'Quarta',
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

  if (!context?.isHydrated) return <DashboardLayout><Skeleton className="h-96 w-full"/></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="font-headline text-4xl tracking-wide uppercase font-black italic">
                    <span className="text-white">Meus Dados &</span> <span className="text-primary">Ciclo</span>
                </h1>
                <p className="text-muted-foreground mt-1">Armazenamento Local-First. Conecte seus sensores e configure seu perfil.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload size={16}/> Importar
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => context.importData(ev.target?.result as string);
                      reader.readAsText(file);
                  }
              }}/>
              <Button variant="outline" size="sm" onClick={() => context.exportData()} className="gap-2">
                <Download size={16}/> Exportar
              </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
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
                                                <FormLabel>Restrições Alimentares</FormLabel>
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
                                                <FormItem><FormLabel>Supino (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="prSquat" render={({field}) => (
                                                <FormItem><FormLabel>Agachamento (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="prDeadlift" render={({field}) => (
                                                <FormItem><FormLabel>Terra (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="legDay" render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Dia de Perna (Leg Day)</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="bg-secondary/10"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {weekDays.map(d => <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>IA prioriza descanso de corrida após este dia.</FormDescription>
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

            <div className="space-y-6">
                <Card className="border-accent/20 bg-accent/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Link2 className="size-5 text-accent" /> Integrações
                        </CardTitle>
                        <CardDescription>Conecte seus aplicativos externos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-[#FC6100] flex items-center justify-center text-white font-black text-xl italic">S</div>
                                <div>
                                    <div className="font-bold text-sm">Strava</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-black">Atividades de Corrida</div>
                                </div>
                            </div>
                            <Switch 
                                checked={context.activeProfile?.integrations?.strava.connected}
                                onCheckedChange={(val) => context.toggleIntegration('strava', val)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-white flex items-center justify-center text-black font-black text-xl italic border border-black">C</div>
                                <div>
                                    <div className="font-bold text-sm">COROS</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-black">EvoLab Metrics</div>
                                </div>
                            </div>
                            <Switch 
                                checked={context.activeProfile?.integrations?.coros.connected}
                                onCheckedChange={(val) => context.toggleIntegration('coros', val)}
                            />
                        </div>

                        {(context.activeProfile?.integrations?.strava.connected || context.activeProfile?.integrations?.coros.connected) && (
                            <div className="p-4 rounded-xl bg-secondary/30 border border-dashed border-border animate-in slide-in-from-bottom-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground">Última Sincronização</span>
                                    <RefreshCw className="size-3 text-accent animate-spin" />
                                </div>
                                <div className="text-xs font-bold text-foreground">Hoje às 10:45</div>
                                <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-accent mt-2">Sincronizar Manualmente</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="size-5 text-primary" /> Sugestões de IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-tight text-primary italic">Status do Ciclo</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Baseado no seu <span className="text-white font-bold">Pace Limiar ({watch('thresholdPace')})</span> e no <span className="text-white font-bold">Leg Day ({watch('legDay')})</span>, o Gemini recomenda evitar treinos de tiro nas quintas-feiras.
                            </p>
                        </div>
                        <Button variant="outline" className="w-full text-xs font-bold gap-2">
                            <RefreshCw size={14}/> Re-calibrar Plano
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
