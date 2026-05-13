'use client';

import { useContext, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { TrainingContext } from '@/contexts/TrainingContext';
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
import { 
    Loader2, 
    Zap, 
    Camera, 
    Dumbbell, 
    CheckCircle2,
    ShieldCheck,
    Utensils,
    Target,
    Activity,
    Trophy,
    CalendarCheck,
    Info,
    FileText,
    Upload
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
  restingHr: z.coerce.number().optional(),
  vo2Max: z.coerce.number().optional(),
  thresholdPace: z.string().optional(),
  thresholdHr: z.coerce.number().optional(),
  raceName: z.string().optional(),
  raceDistance: z.string().optional(),
  raceDate: z.string().optional(),
  raceGoalType: z.enum(['pace', 'time']).default('pace'),
  targetPace: z.string().optional(),
  targetTime: z.string().optional(),
  trainingDays: z.array(z.string()).default([]),
  longRunDay: z.string().optional(),
  planGenerationType: z.enum(['full', 'blocks']).default('blocks'),
  experienceLevel: z.enum(['run_walk', 'beginner', 'intermediate', 'advanced']).optional(),
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
    await context.generateRunningPlanAsync(context.activeProfile);
    setIsProcessing(false);
  };

  if (!context?.isHydrated) return <DashboardLayout><Skeleton className="h-96 w-full bg-secondary/20 rounded-3xl"/></DashboardLayout>;

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-8 pb-12 max-w-5xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={28}/>
              </div>
              <div>
                <h1 className="font-headline text-2xl md:text-3xl uppercase font-black italic">
                  <span className="text-white">MEU</span> <span className="text-primary">PERFIL</span>
                </h1>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest italic">Sincronização em Tempo Real</p>
              </div>
            </div>
          </header>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
              <Tabs defaultValue="perfil" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 h-auto bg-secondary/20 p-1 rounded-xl">
                  <TabsTrigger value="perfil" className="py-2.5 font-bold text-[10px] uppercase italic">Geral</TabsTrigger>
                  <TabsTrigger value="corrida" className="py-2.5 font-bold text-[10px] uppercase italic">Corrida</TabsTrigger>
                  <TabsTrigger value="alimentacao" className="py-2.5 font-bold text-[10px] uppercase italic">Dieta</TabsTrigger>
                  <TabsTrigger value="musculacao" className="py-2.5 font-bold text-[10px] uppercase italic">Força</TabsTrigger>
                </TabsList>

                {/* ABA GERAL */}
                <TabsContent value="perfil" className="mt-6 space-y-6">
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-primary/20 rounded-3xl">
                            <AvatarImage src={watchAvatarUrl} className="object-cover" />
                            <AvatarFallback className="text-3xl font-black italic">{watch('name')?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <input type="file" ref={avatarFileRef} className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                          <Button type="button" variant="secondary" size="icon" className="absolute -bottom-2 -right-2 rounded-xl h-10 w-10 bg-white text-black" onClick={() => avatarFileRef.current?.click()}>
                            <Camera size={16}/>
                          </Button>
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                          <CardTitle className="font-headline text-2xl uppercase italic font-black">Biometria</CardTitle>
                          <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground italic">Dados essenciais para cálculos de carga.</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                      <FormField control={form.control} name="name" render={({field}) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome Completo</FormLabel>
                          <FormControl><Input {...field} className="bg-black/30 h-14 font-bold rounded-xl" /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="birthDate" render={({field}) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data de Nascimento</FormLabel>
                          <FormControl><Input type="date" {...field} className="bg-black/30 h-14 font-bold rounded-xl" /></FormControl>
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="currentWeight" render={({field}) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Peso (kg)</FormLabel>
                            <FormControl><Input type="number" step="0.1" {...field} className="bg-black/30 h-14 text-center font-black rounded-xl" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="height" render={({field}) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Altura (cm)</FormLabel>
                            <FormControl><Input type="number" {...field} className="bg-black/30 h-14 text-center font-black rounded-xl" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ABA CORRIDA */}
                <TabsContent value="corrida" className="mt-6 space-y-6">
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="bg-primary/5 border-b border-border/50">
                      <CardTitle className="font-headline text-2xl uppercase italic text-primary font-black flex items-center gap-3">
                        <Activity size={28}/> Fisiologia & Prova Alvo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-10 pt-8">
                      {/* Seção 1: Fisiologia */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="vo2Max" render={({field}) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">VDOT (Jack Daniels)</FormLabel>
                              <Tooltip><TooltipTrigger asChild><Info className="size-3 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="text-[10px]">Índice de performance aeróbica baseado nos seus tempos.</p></TooltipContent></Tooltip>
                            </div>
                            <FormControl><Input type="number" step="0.1" {...field} className="bg-primary/5 border-primary/30 h-16 text-2xl font-black text-primary text-center rounded-2xl" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="thresholdHr" render={({field}) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">FC Limiar (L2)</FormLabel>
                            <FormControl><Input type="number" {...field} className="bg-black/40 h-16 text-2xl font-black text-center rounded-2xl border-border/40" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="experienceLevel" render={({field}) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nível do Atleta</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="bg-black/30 h-16 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="run_walk">Corrida & Caminhada</SelectItem>
                                <SelectItem value="beginner">Iniciante</SelectItem>
                                <SelectItem value="intermediate">Intermediário</SelectItem>
                                <SelectItem value="advanced">Avançado</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                      </div>

                      {/* Seção 2: Prova Alvo */}
                      <div className="space-y-6 pt-6 border-t border-border/20">
                        <div className="flex items-center gap-3"><Trophy className="text-primary size-5"/><h3 className="text-xs font-black uppercase italic tracking-widest">A Grande Prova</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="raceName" render={({field}) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome da Prova</FormLabel>
                              <FormControl><Input placeholder="Ex: Maratona de SP" {...field} className="bg-black/30 h-14 font-black rounded-xl" /></FormControl>
                            </FormItem>
                          )} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="raceDistance" render={({field}) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Distância</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                                  <SelectContent>
                                    <SelectItem value="5k">5 km</SelectItem>
                                    <SelectItem value="10k">10 km</SelectItem>
                                    <SelectItem value="21k">21.1 km</SelectItem>
                                    <SelectItem value="42k">42.2 km</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="raceDate" render={({field}) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Alvo</FormLabel>
                                <FormControl><Input type="date" {...field} className="bg-black/30 h-14 font-black rounded-xl" /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                           <FormField control={form.control} name="raceGoalType" render={({field}) => (
                             <FormItem className="space-y-3">
                               <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo de Meta</FormLabel>
                               <div className="flex gap-2">
                                 <Button type="button" variant={watchGoalType === 'pace' ? 'default' : 'secondary'} className="flex-1 rounded-xl h-12 font-bold uppercase italic" onClick={() => setValue('raceGoalType', 'pace')}>Pace (Ritmo)</Button>
                                 <Button type="button" variant={watchGoalType === 'time' ? 'default' : 'secondary'} className="flex-1 rounded-xl h-12 font-bold uppercase italic" onClick={() => setValue('raceGoalType', 'time')}>Tempo (Final)</Button>
                               </div>
                             </FormItem>
                           )} />
                           {watchGoalType === 'pace' ? (
                             <FormField control={form.control} name="targetPace" render={({field}) => (
                               <FormItem>
                                 <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pace Alvo (min/km)</FormLabel>
                                 <FormControl><Input placeholder="4:30" {...field} className="bg-primary/10 border-primary/30 h-12 font-black text-center rounded-xl" /></FormControl>
                               </FormItem>
                             )} />
                           ) : (
                             <FormField control={form.control} name="targetTime" render={({field}) => (
                               <FormItem>
                                 <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tempo Alvo (HH:MM:SS)</FormLabel>
                                 <FormControl><Input placeholder="03:30:00" {...field} className="bg-primary/10 border-primary/30 h-12 font-black text-center rounded-xl" /></FormControl>
                               </FormItem>
                             )} />
                           )}
                        </div>
                      </div>

                      {/* Seção 3: Disponibilidade */}
                      <div className="space-y-6 pt-6 border-t border-border/20">
                        <div className="flex items-center gap-3"><CalendarCheck className="text-primary size-5"/><h3 className="text-xs font-black uppercase italic tracking-widest">Disponibilidade Semanal</h3></div>
                        <div className="flex flex-wrap gap-4">
                          {weekDays.map((day) => (
                            <FormField key={day.id} control={form.control} name="trainingDays" render={({ field }) => (
                              <FormItem key={day.id} className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-xl border bg-black/20">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day.id])
                                        : field.onChange(field.value?.filter((value) => value !== day.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-xs font-black italic cursor-pointer">{day.label}</FormLabel>
                              </FormItem>
                            )} />
                          ))}
                        </div>
                      </div>

                      {/* Seção 4: Documento de Referência */}
                      <div className="space-y-6 pt-6 border-t border-border/20">
                         <div className="flex items-center gap-3"><FileText className="text-primary size-5"/><h3 className="text-xs font-black uppercase italic tracking-widest">IA Reference (PDF / Imagem)</h3></div>
                         <div 
                           className={cn(
                             "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
                             watchReferenceDoc ? "border-primary bg-primary/10" : "border-border/40 hover:bg-primary/5"
                           )}
                           onClick={() => refDocFileRef.current?.click()}
                         >
                           <input type="file" ref={refDocFileRef} className="sr-only" onChange={handleRefDocChange} accept=".pdf,image/*" />
                           {watchReferenceDoc ? (
                             <div className="flex flex-col items-center gap-2">
                               <CheckCircle2 className="size-10 text-primary" />
                               <p className="text-xs font-black uppercase italic text-primary">Documento de Elite Pronto</p>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center gap-2">
                               <Upload className="size-10 text-muted-foreground opacity-30" />
                               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">Arraste seu plano antigo ou orientações</p>
                             </div>
                           )}
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ABA DIETA */}
                <TabsContent value="alimentacao" className="mt-6 space-y-6">
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="bg-orange-500/5 border-b border-border/50">
                      <CardTitle className="font-headline text-2xl uppercase italic text-orange-500 font-black flex items-center gap-3">
                        <Utensils size={28}/> Nutrição IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                       <FormField control={form.control} name="aestheticGoal" render={({field}) => (
                         <FormItem>
                           <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta Estética / Performance</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
                             <SelectContent>
                               <SelectItem value="performance">Performance Pura</SelectItem>
                               <SelectItem value="cutting">Queima (Cutting)</SelectItem>
                               <SelectItem value="bulking">Ganho (Bulking)</SelectItem>
                               <SelectItem value="recomp">Recomposição</SelectItem>
                             </SelectContent>
                           </Select>
                         </FormItem>
                       )} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ABA MUSCULAÇÃO */}
                <TabsContent value="musculacao" className="mt-6 space-y-6">
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="bg-purple-500/5 border-b border-border/50">
                      <CardTitle className="font-headline text-2xl uppercase italic text-purple-500 font-black flex items-center gap-3">
                        <Dumbbell size={28}/> Força & Suporte
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8">
                      <FormField control={form.control} name="legDay" render={({field}) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dia de Perna (Crítico)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="bg-black/30 h-14 font-black rounded-xl"><SelectValue/></SelectTrigger></FormControl>
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

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/50 px-2 pb-10">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSaving} 
                  className="flex-1 h-16 font-black uppercase tracking-[0.2em] italic bg-white text-black hover:bg-white/90 shadow-2xl rounded-2xl"
                >
                  {isSaving ? <Loader2 className="animate-spin mr-3 size-6" /> : <CheckCircle2 className="mr-3 size-6" />}
                  SALVAR PERFIL
                </Button>
                
                <Button 
                  type="button" 
                  size="lg" 
                  className="flex-1 h-16 font-black uppercase tracking-[0.2em] italic bg-primary text-black shadow-2xl rounded-2xl"
                  onClick={handleGenerate}
                  disabled={isProcessing || !context.activeProfile}
                >
                  {isProcessing ? <Loader2 className="animate-spin mr-3 size-6" /> : <Zap className="mr-3 size-6" />} 
                  GERAR PLANILHA IA
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
