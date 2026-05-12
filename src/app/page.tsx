"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis, 
  AreaProps
} from "recharts";
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Milestone, 
  ArrowUpRight, 
  Zap,
  Calendar,
  Info
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

const data = [
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
                  <AreaChart data={data}>
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
                <a href="/training">Ver Plano Completo</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}