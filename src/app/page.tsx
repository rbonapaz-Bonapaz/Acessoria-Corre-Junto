
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
  Users,
  ShieldCheck,
  User as UserIcon
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
import { useUser } from "@/firebase";

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
  { label: "VDOT Atual", value: "54.2", change: "+0.8", icon: Zap, info: "Índice que define seus ritmos de treino baseado em performance." },
  { label: "FC Média", value: "142 bpm", change: "-2.1%", icon: Activity, info: "Frequência cardíaca média durante a semana." },
  { label: "Recuperação", value: "88%", change: "Ideal", icon: Clock, info: "Indicador para evitar overtraining." },
];

export default function Home() {
  const context = React.useContext(AppContext);
  const { user } = useUser();
  const activeProfile = context?.activeProfile;
  const profiles = context?.profiles || [];

  const myAthletes = profiles.filter(p => p.ownerUid === user?.uid || p.ownerUid === 'local-user');
  const linkedProfiles = profiles.filter(p => p.ownerUid !== user?.uid && p.athleteEmail === user?.email && p.ownerUid !== 'local-user');

  if (!context?.isHydrated) {
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

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
        <div className="max-w-5xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline font-black uppercase italic tracking-tighter">
              <span className="text-white">LABORATÓRIO</span> <br/>
              <span className="text-white">CORRE</span><span className="text-primary">JUNTO</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-xl font-medium max-w-2xl mx-auto italic">
              Selecione um perfil para gerenciar sua assessoria ou visualizar seu plano de atleta.
            </p>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2 border-b border-border/20 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-primary size-5" />
                  <h3 className="text-xs font-black uppercase italic tracking-widest text-white">Minha Gestão (Treinador)</h3>
                </div>
                {myAthletes.length > 0 && <Badge variant="outline" className="text-[10px] uppercase font-black">{myAthletes.length} Atletas</Badge>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {myAthletes.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} onSwitch={() => context.switchProfile(profile.id)} />
                ))}
                <Link href="/profile" onClick={() => context.switchProfile(null)} className="group flex flex-col items-center gap-4 transition-all hover:scale-105">
                  <div className="size-24 md:size-32 rounded-3xl bg-secondary/30 border-2 border-dashed border-border group-hover:border-primary group-hover:bg-primary/5 flex items-center justify-center transition-all">
                    <Plus className="size-10 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-headline font-black text-[10px] md:text-xs uppercase italic tracking-widest text-muted-foreground group-hover:text-white">Novo Perfil</span>
                </Link>
              </div>
            </div>

            {linkedProfiles.length > 0 && (
              <div className="space-y-6 pt-6">
                <div className="flex items-center gap-2 px-2 border-b border-border/20 pb-4">
                  <UserIcon className="text-accent size-5" />
                  <h3 className="text-xs font-black uppercase italic tracking-widest text-white">Meus Treinos (Atleta)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {linkedProfiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} onSwitch={() => context.switchProfile(profile.id)} isLinked />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TooltipProvider>
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card border-border hover:border-accent/50 transition-colors shadow-sm relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild><Info className="size-3 text-muted-foreground/50 cursor-help" /></TooltipTrigger>
                      <TooltipContent className="max-w-[200px] text-[10px]">{stat.info}</TooltipContent>
                    </Tooltip>
                  </div>
                  <stat.icon className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-headline font-bold">{stat.value}</div>
                  <p className={cn("text-xs mt-1 flex items-center", stat.change.startsWith("+") || stat.change === "Ideal" ? "text-accent" : "text-muted-foreground")}>
                    {stat.change}<ArrowUpRight className="ml-1 h-3 w-3" />
                  </p>
                </CardContent>
              </Card>
            ))}
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Comparação de Volume</CardTitle>
              <CardDescription>Previsto vs. Realizado (km)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area name="Realizado" type="monotone" dataKey="real" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorReal)" strokeWidth={2} />
                    <Area name="Previsto" type="monotone" dataKey="previsto" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" fill="transparent" strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Próxima Sessão</CardTitle>
              <CardDescription>Sincronizada do seu plano</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
                <div className="flex items-center gap-2 text-accent font-semibold">
                  <Calendar className="size-4" /><span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
                </div>
                <h3 className="font-headline text-lg font-bold">Rodagem de Base</h3>
                <p className="text-sm text-muted-foreground italic">"Treino leve para recuperação e base aeróbica."</p>
                <div className="pt-2"><Badge variant="secondary">Fase Ativa</Badge></div>
              </div>
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-black font-black uppercase h-12 rounded-xl">
                <Link href="/training">Ver Planilha</Link>
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
      className="group flex flex-col items-center gap-4 transition-all hover:scale-105"
    >
      <div className="relative">
        <Avatar className={cn(
          "size-24 md:size-32 border-4 transition-all shadow-2xl rounded-3xl",
          isLinked ? "border-accent/40 group-hover:border-accent" : "border-transparent group-hover:border-primary"
        )}>
          <AvatarImage src={profile.avatarUrl} className="object-cover" />
          <AvatarFallback className="bg-secondary text-3xl font-black italic">{profile.name[0]}</AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity flex items-center justify-center",
          isLinked ? "bg-accent/20" : "bg-primary/20"
        )}>
          <ChevronRight className="size-8 text-white" />
        </div>
        {isLinked && (
          <div className="absolute -top-2 -right-2 bg-accent text-black p-1.5 rounded-full shadow-lg border-2 border-background">
            <UserIcon size={12} />
          </div>
        )}
      </div>
      <div className="text-center space-y-1">
        <span className="font-headline font-black text-[10px] md:text-xs uppercase italic tracking-widest text-muted-foreground group-hover:text-white transition-colors truncate max-w-[120px] block">
          {profile.name}
        </span>
        <span className="text-[8px] font-bold uppercase tracking-tighter opacity-50 block">
          {isLinked ? 'Meu Treino' : 'Gestão Atleta'}
        </span>
      </div>
    </button>
  );
}
