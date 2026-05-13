
"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Milestone, 
  ArrowUpRight, 
  Zap,
  Calendar,
  Info,
  Plus,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Lock,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const chartData = [
  { day: "Dom", previsto: 0, real: 0 },
  { day: "Seg", previsto: 5, real: 4.8 },
  { day: "Ter", previsto: 8, real: 8.2 },
  { day: "Qua", previsto: 0, real: 0 },
  { day: "Qui", previsto: 12, real: 11.5 },
  { day: "Sex", previsto: 6, real: 7.0 },
  { day: "Sáb", previsto: 22, real: 22.4 },
];

const stats = [
  { label: "Volume Semanal", value: "86.7 km", change: "+4.2%", icon: Milestone, info: "Distância total percorrida nos últimos 7 dias." },
  { label: "VDOT Atual", value: "54.2", change: "+0.8", icon: Zap, info: "Índice que define seus ritmos de treino baseado em performance recente." },
  { label: "FC Média", value: "142 bpm", change: "-2.1%", icon: Activity, info: "Frequência cardíaca média durante a semana de treinos." },
  { label: "Recuperação", value: "88%", change: "Ideal", icon: Clock, info: "Indicador de prontidão para evitar o overtraining." },
];

export default function Home() {
  const context = React.useContext(AppContext);
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const activeProfile = context?.activeProfile;
  const profiles = context?.profiles || [];

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Sincronização Ativa!", description: "Acessando seu laboratório de performance." });
    } catch (error: any) {
      console.error("Auth Error:", error);
      
      let errorMessage = "Certifique-se de que a API Identity Toolkit está ATIVA no console do Google e que o domínio está autorizado.";
      
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "O provedor Google não está ativado no Firebase Console. Vá em Authentication > Método de Login e ative o Google.";
      } else if (error.message.includes('ProjectConfigService.GetProjectConfig are blocked')) {
        errorMessage = "O acesso à API foi bloqueado. Verifique se clicou em 'Get Started' no Firebase Console > Authentication.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `O domínio ${window.location.hostname} não está autorizado no Firebase Console > Authentication > Configurações > Domínios Autorizados.`;
      }

      toast({ 
        variant: "destructive", 
        title: "Falha na Autenticação", 
        description: errorMessage,
        duration: 15000,
      });
    }
  };

  const myAthletes = profiles.filter(p => p.ownerUid === user?.uid);
  const linkedProfiles = profiles.filter(p => p.ownerUid !== user?.uid && p.athleteEmail === user?.email);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-12 animate-in fade-in duration-700">
        <div className="space-y-4">
          <div className="font-headline font-black text-6xl md:text-9xl italic tracking-tighter uppercase leading-none">
            <span className="text-white">CORRE</span><span className="text-primary">JUNTO</span>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg md:text-2xl italic font-medium">
            Performance atlética de elite impulsionada por IA e sincronizada na nuvem.
          </p>
        </div>

        <div className="bg-card/40 border-2 border-border/50 p-10 md:p-16 rounded-[3rem] shadow-2xl max-w-lg w-full space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={150} />
          </div>
          
          <div className="space-y-2 relative z-10">
            <Lock className="size-16 text-primary mx-auto mb-4" />
            <h2 className="font-headline font-black text-2xl uppercase italic text-white">Área do Atleta</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Faça login para acessar seu laboratório</p>
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full h-20 bg-primary text-black hover:bg-primary/90 font-black uppercase italic text-xl rounded-3xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4"
          >
            ENTRAR COM GOOGLE <ArrowRight size={24} />
          </Button>

          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter italic">
            Ao entrar você concorda com nossos termos de performance de elite.
          </p>
        </div>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl w-full mx-auto space-y-12 animate-in fade-in duration-700">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-7xl font-headline font-black uppercase italic tracking-tighter leading-none">
              <span className="text-white">LABORATÓRIO</span> <br/>
              <span className="text-white">CORRE</span> <span className="text-primary">JUNTO</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-xl font-medium max-w-2xl mx-auto italic">
              Bem-vindo, <span className="text-white">{user.displayName}</span>. <br/>
              Acesse sua assessoria ou gerencie seus atletas abaixo.
            </p>
          </div>

          <div className="space-y-16">
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4 border-b border-border/20 pb-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary size-6" />
                  <h3 className="text-sm font-black uppercase italic tracking-widest text-white">Minha Gestão (Treinador)</h3>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-black px-3 py-1">{myAthletes.length} Atletas Ativos</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
                {myAthletes.map((p) => (
                  <ProfileCard key={p.id} profile={p} onSwitch={() => context.switchProfile(p.id)} />
                ))}
                
                <Link href="/profile" onClick={() => context.switchProfile(null)} className="group flex flex-col items-center gap-6 transition-all hover:scale-105">
                  <div className="size-24 md:size-32 rounded-[2rem] bg-secondary/30 border-2 border-dashed border-border group-hover:border-primary group-hover:bg-primary/5 flex items-center justify-center transition-all shadow-xl">
                    <Plus className="size-12 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-headline font-black text-[10px] md:text-xs uppercase italic tracking-widest text-muted-foreground group-hover:text-white">Novo Atleta</span>
                </Link>
              </div>
            </div>

            {linkedProfiles.length > 0 && (
              <div className="space-y-8 pt-8">
                <div className="flex items-center gap-3 px-4 border-b border-border/20 pb-6">
                  <UserIcon className="text-accent size-6" />
                  <h3 className="text-sm font-black uppercase italic tracking-widest text-white">Meus Treinos (Atleta)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
                  {linkedProfiles.map((p) => (
                    <ProfileCard key={p.id} profile={p} onSwitch={() => context.switchProfile(p.id)} isLinked />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <header className="px-2">
            <h2 className="text-3xl md:text-5xl font-headline font-black uppercase italic tracking-tighter">
                <span className="text-white">DASHBOARD DE</span> <span className="text-primary">PERFORMANCE</span>
            </h2>
            <p className="text-muted-foreground text-sm font-medium mt-2">Visão geral da evolução biomecânica e metabólica.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
          <TooltipProvider>
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border hover:border-primary/50 transition-colors shadow-xl relative overflow-hidden rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-[10px] font-black uppercase italic text-muted-foreground tracking-widest">{stat.label}</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild><Info className="size-3 text-muted-foreground/50 cursor-help" /></TooltipTrigger>
                      <TooltipContent className="max-w-[200px] text-[10px]">{stat.info}</TooltipContent>
                    </Tooltip>
                  </div>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-headline font-black italic">{stat.value}</div>
                  <p className={cn("text-[10px] font-bold uppercase mt-1 flex items-center", stat.change.startsWith("+") || stat.change === "Ideal" ? "text-primary" : "text-muted-foreground")}>
                    {stat.change}<ArrowUpRight className="ml-1 h-3 w-3" />
                  </p>
                </CardContent>
              </Card>
            ))}
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
          <Card className="lg:col-span-2 bg-card/40 border-border shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b border-border/20">
              <CardTitle className="font-headline font-black uppercase italic text-white flex items-center gap-3">
                <TrendingUp size={24} className="text-primary" /> Comparação de Volume
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest">Previsto vs. Realizado (km)</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '1rem' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area name="Realizado" type="monotone" dataKey="real" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorReal)" strokeWidth={3} />
                    <Area name="Previsto" type="monotone" dataKey="previsto" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" fill="transparent" strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col">
            <CardHeader className="p-8 border-b border-border/20">
              <CardTitle className="font-headline font-black uppercase italic text-white flex items-center gap-3">
                <Calendar size={24} className="text-primary" /> Próxima Sessão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex-1 space-y-8">
              <div className="p-6 rounded-[2rem] bg-secondary/30 border border-primary/20 space-y-4">
                <div className="flex items-center gap-2 text-primary font-black uppercase italic text-sm tracking-widest">
                  <Zap className="size-4" /><span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
                </div>
                <h3 className="font-headline text-2xl font-black italic uppercase leading-none text-white">Rodagem de Base</h3>
                <p className="text-xs text-muted-foreground italic font-medium leading-relaxed">"Treino leve para recuperação e fortalecimento da base aeróbica."</p>
                <div className="pt-2"><Badge className="bg-primary/20 text-primary border-none font-black text-[10px] uppercase italic">Fase Ativa</Badge></div>
              </div>
              <Button asChild className="w-full h-16 bg-primary text-black font-black uppercase italic text-lg rounded-2xl shadow-xl shadow-primary/20">
                <Link href="/training">Ver Minha Planilha <ChevronRight className="ml-2" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfileCard({ profile, onSwitch, isLinked = false }: { profile: any, onSwitch: () => void, isLinked?: boolean }) {
  return (
    <button
      onClick={onSwitch}
      className="group flex flex-col items-center gap-6 transition-all hover:scale-105"
    >
      <div className="relative">
        <Avatar className={cn(
          "size-24 md:size-32 border-4 transition-all shadow-2xl rounded-[2.5rem]",
          isLinked ? "border-accent/40 group-hover:border-accent" : "border-transparent group-hover:border-primary"
        )}>
          <AvatarImage src={profile.avatarUrl} className="object-cover" />
          <AvatarFallback className="bg-secondary text-4xl font-black italic">{profile.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-opacity flex items-center justify-center",
          isLinked ? "bg-accent/20" : "bg-primary/20"
        )}>
          <ChevronRight className="size-12 text-white" />
        </div>
        {isLinked && (
          <div className="absolute -top-3 -right-3 bg-accent text-black p-2 rounded-full shadow-2xl border-4 border-background">
            <UserIcon size={16} />
          </div>
        )}
      </div>
      <div className="text-center space-y-2">
        <span className="font-headline font-black text-[10px] md:text-sm uppercase italic tracking-widest text-muted-foreground group-hover:text-white transition-colors truncate max-w-[150px] block">
          {profile.name}
        </span>
        <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest bg-secondary/50 text-primary border-none">
          {isLinked ? 'MEU TREINO' : 'GESTÃO ATLETA'}
        </Badge>
      </div>
    </button>
  );
}
