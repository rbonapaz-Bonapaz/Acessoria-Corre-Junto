
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
  User,
  ChevronRight
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
  { 
    label: "Volume Semanal", 
    value: "86.7 km", 
    change: "+4.2%", 
    icon: Milestone,
    info: "Distância total percorrida nos últimos 7 dias."
  },
  { 
    label: "VDOT Atual", 
    value: "54.2", 
    change: "+0.8", 
    icon: Zap,
    info: "O VDOT é um índice que mede sua aptidão aeróbica atual e define seus ritmos de treino com base em performance."
  },
  { 
    label: "FC Média", 
    value: "142 bpm", 
    change: "-2.1%", 
    icon: Activity,
    info: "Frequência cardíaca média durante seus treinos da semana."
  },
  { 
    label: "Score de Recuperação", 
    value: "88%", 
    change: "Ideal", 
    icon: Clock,
    info: "Indicador baseado em variabilidade da FC e qualidade do sono para evitar overtraining."
  },
];

export default function Home() {
  const context = React.useContext(AppContext);
  const activeProfile = context?.activeProfile;
  const profiles = context?.profiles || [];

  // Proteção contra Hydration Mismatch: renderiza um estado estável durante SSR
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

  // Se não houver perfil selecionado, mostra o Profile Picker
  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline font-black uppercase italic tracking-tighter text-white">
              QUEM ESTÁ <span className="text-primary">TREINANDO?</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-xl font-medium max-w-2xl mx-auto italic">
              Selecione sua identidade atlética para acessar seu laboratório de performance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => context.switchProfile(profile.id)}
                className="group flex flex-col items-center gap-4 transition-all hover:scale-105"
              >
                <div className="relative">
                  <Avatar className="size-24 md:size-32 border-4 border-transparent group-hover:border-primary transition-all shadow-2xl">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="bg-secondary text-3xl font-black">{profile.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity flex items-center justify-center">
                    <ChevronRight className="size-8 text-black" />
                  </div>
                </div>
                <span className="font-headline font-black text-xs md:text-sm uppercase italic tracking-widest text-muted-foreground group-hover:text-white transition-colors">
                  {profile.name}
                </span>
              </button>
            ))}

            <Link
              href="/profile"
              className="group flex flex-col items-center gap-4 transition-all hover:scale-105"
            >
              <div className="size-24 md:size-32 rounded-full bg-secondary/30 border-2 border-dashed border-border group-hover:border-primary group-hover:bg-primary/5 flex items-center justify-center transition-all">
                <Plus className="size-10 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="font-headline font-black text-[10px] md:text-xs uppercase italic tracking-widest text-muted-foreground group-hover:text-white transition-colors">
                Novo Atleta
              </span>
            </Link>
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
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3 text-muted-foreground/50 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px] text-[10px] leading-relaxed">
                        {stat.info}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <stat.icon className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-headline font-bold">{stat.value}</div>
                  <p className={cn(
                    "text-xs mt-1 flex items-center",
                    stat.change.startsWith("+") || stat.change === "Ideal" ? "text-accent" : "text-muted-foreground"
                  )}>
                    {stat.change}
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </p>
                </CardContent>
              </Card>
            ))}
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-card border-border shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Comparação de Volume</CardTitle>
                  <CardDescription>Previsto vs. Realizado (km)</CardDescription>
                </div>
                <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5">Semana Atual</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
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
              <CardDescription>Gerada pelo Motor de Periodização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
                <div className="flex items-center gap-2 text-accent font-semibold">
                  <Calendar className="size-4" />
                  <span>Quinta-feira, 24 Out</span>
                </div>
                <h3 className="font-headline text-lg font-bold">Intervalados de Tempo</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  3km Aquecimento @ Zona 1-2. Principal: 3 x 3km @ Ritmo T (4:12/km) com 2:00 trote de recuperação. 2km Desaquecimento.
                </p>
                <div className="pt-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-primary/30">Fase de Construção</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso do Bloco</span>
                  <span className="font-medium">Semana 2 de 4</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[45%]" />
                </div>
              </div>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/training">Ver Plano Completo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
