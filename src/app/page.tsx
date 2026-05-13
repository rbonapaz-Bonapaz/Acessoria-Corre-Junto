
"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
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
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrainingContext } from "@/contexts/TrainingContext";
import Link from "next/link";

const data = [
  { day: "Dom", previsto: 0, real: 0 },
  { day: "Seg", previsto: 5, real: 4.8 },
  { day: "Ter", previsto: 8, real: 8.2 },
  { day: "Qua", previsto: 0, real: 0 },
  { day: "Qui", previsto: 12, real: 11.5 },
  { day: "Sex", previsto: 6, real: 7.0 },
  { day: "Sáb", previsto: 22, real: 22.4 },
];

export default function Home() {
  const context = React.useContext(TrainingContext);
  const profile = context?.activeProfile;
  const plan = context?.trainingPlan;

  const stats = [
    { label: "Volume Semanal", value: "86.7 km", change: "+4.2%", icon: Milestone },
    { label: "VDOT Atual", value: profile?.vo2Max?.toString() || "54.2", change: "+0.8", icon: Zap },
    { label: "FC Média", value: "142 bpm", change: "-2.1%", icon: Activity },
    { label: "Score de Recuperação", value: "88%", change: "Ideal", icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className={cn("bg-card border-border hover:border-accent/50 transition-colors shadow-sm")}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
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
                    <Tooltip 
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
              <CardDescription>Sincronizado na Nuvem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {plan ? (
                 <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
                    <div className="flex items-center gap-2 text-accent font-semibold">
                      <Calendar className="size-4" />
                      <span>{plan.weeklyPlans[0]?.runs[0]?.day || 'Hoje'}</span>
                    </div>
                    <h3 className="font-headline text-lg font-bold">{plan.weeklyPlans[0]?.runs[0]?.type || 'Descanso'}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.weeklyPlans[0]?.runs[0]?.description || 'Aproveite o off para recuperar as fibras musculares.'}
                    </p>
                    <div className="pt-2">
                      <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-primary/30">{plan.blockType}</Badge>
                    </div>
                  </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-sm text-muted-foreground italic">Gere seu ciclo no perfil para ver seus treinos aqui.</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/profile">GERAR MEU CICLO</Link>
                  </Button>
                </div>
              )}
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
