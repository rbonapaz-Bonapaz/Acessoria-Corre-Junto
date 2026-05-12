
"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, SidebarMenu, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Clock, 
  Milestone, 
  Activity, 
  Droplets, 
  TrendingUp, 
  FastForward,
  Copy,
  Zap,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- Utility Functions ---
const pad = (n: number) => String(n).padStart(2, '0');

const formatPace = (minPerKm: number) => {
  const sec = Math.round(minPerKm * 60);
  return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
};

const formatTime = (totalMinutes: number) => {
  const sec = Math.round(totalMinutes * 60);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export default function CalculatorsPage() {
  const { toast } = useToast();
  
  // State for different calculators
  const [paceDist, setPaceDist] = React.useState("5");
  const [paceH, setPaceH] = React.useState("");
  const [paceM, setPaceM] = React.useState("");
  const [paceS, setPaceS] = React.useState("");
  const [paceRes, setPaceRes] = React.useState<string | null>(null);

  const [timeDist, setTimeDist] = React.useState("5");
  const [timePM, setTimePM] = React.useState("");
  const [timePS, setTimePS] = React.useState("");
  const [timeRes, setTimeRes] = React.useState<string | null>(null);

  const [distH, setDistH] = React.useState("");
  const [distM, setDistM] = React.useState("");
  const [distS, setDistS] = React.useState("");
  const [distPM, setDistPM] = React.useState("");
  const [distPS, setDistPS] = React.useState("");
  const [distRes, setDistRes] = React.useState<string | null>(null);

  const [esteiraKmh, setEsteiraKmh] = React.useState("");
  const [esteiraRes, setEsteiraRes] = React.useState<string | null>(null);

  const [stratDist, setStratDist] = React.useState("10");
  const [stratH, setStratH] = React.useState("");
  const [stratM, setStratM] = React.useState("");
  const [stratS, setStratS] = React.useState("");
  const [stratType, setStratType] = React.useState<'negative' | 'even' | 'positive'>('negative');
  const [stratRes, setStratRes] = React.useState<any>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copiado!", description: "Resultado copiado para a área de transferência." });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível copiar." });
    }
  };

  // --- Calculations ---

  const handleCalcPace = () => {
    const d = parseFloat(paceDist);
    const h = parseInt(paceH) || 0;
    const m = parseInt(paceM) || 0;
    const s = parseInt(paceS) || 0;
    if (d <= 0 || (h === 0 && m === 0 && s === 0)) return;
    const totalMin = h * 60 + m + s / 60;
    setPaceRes(formatPace(totalMin / d));
  };

  const handleCalcTime = () => {
    const d = parseFloat(timeDist);
    const pm = parseInt(timePM) || 0;
    const ps = parseInt(timePS) || 0;
    if (d <= 0 || (pm === 0 && ps === 0)) return;
    const paceMin = pm + ps / 60;
    setTimeRes(formatTime(d * paceMin));
  };

  const handleCalcDist = () => {
    const h = parseInt(distH) || 0;
    const m = parseInt(distM) || 0;
    const s = parseInt(distS) || 0;
    const pm = parseInt(distPM) || 0;
    const ps = parseInt(distPS) || 0;
    if ((h === 0 && m === 0 && s === 0) || (pm === 0 && ps === 0)) return;
    const totalMin = h * 60 + m + s / 60;
    const paceMin = pm + ps / 60;
    setDistRes((totalMin / paceMin).toFixed(2) + " km");
  };

  const handleEsteira = () => {
    const speed = parseFloat(esteiraKmh);
    if (speed <= 0) return;
    setEsteiraRes(formatPace(60 / speed));
  };

  const handleStrategy = () => {
    const d = parseFloat(stratDist);
    const h = parseInt(stratH) || 0;
    const m = parseInt(stratM) || 0;
    const s = parseInt(stratS) || 0;
    if (d <= 0 || (h === 0 && m === 0 && s === 0)) return;
    const totalMin = h * 60 + m + s / 60;
    const avgPace = totalMin / d;

    // Simplified split logic based on the provided HTML
    let p1, p2, p3;
    if (stratType === 'negative') {
      p1 = avgPace + 8/60; p2 = avgPace - 8/60; p3 = p2 - 5/60;
    } else if (stratType === 'even') {
      p1 = avgPace; p2 = avgPace; p3 = avgPace - 5/60;
    } else {
      p1 = avgPace - 8/60; p2 = avgPace + 8/60; p3 = avgPace;
    }

    const firstEnd = d / 2;
    const sprintDist = d <= 5.5 ? 0.3 : (d <= 10.5 ? 0.5 : 1);
    const sprintStart = d - sprintDist;

    setStratRes({
      avg: formatPace(avgPace),
      p1: formatPace(p1),
      p2: formatPace(p2),
      p3: formatPace(p3),
      dist1: firstEnd.toFixed(1),
      dist2: (d - firstEnd - sprintDist).toFixed(1),
      dist3: sprintDist.toFixed(1)
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-headline font-bold">Calculadoras de Performance</h1>
          <p className="text-muted-foreground">Ferramentas essenciais para planejar seus ritmos, tempos e estratégias.</p>
        </header>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-secondary p-1 rounded-xl h-auto">
            <TabsTrigger value="basic" className="py-2">Básicos</TabsTrigger>
            <TabsTrigger value="treadmill" className="py-2">Esteira</TabsTrigger>
            <TabsTrigger value="strategy" className="py-2">Estratégia</TabsTrigger>
            <TabsTrigger value="zones" className="py-2">Zonas FC</TabsTrigger>
          </TabsList>

          {/* BASIC CALCULATORS */}
          <TabsContent value="basic" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-accent">
                    <Milestone className="size-4" /> Calcular Pace
                  </CardTitle>
                  <CardDescription>Descubra seu ritmo em min/km.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Distância (km)</Label>
                    <Input type="number" value={paceDist} onChange={e => setPaceDist(e.target.value)} className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo Final (h:m:s)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="H" value={paceH} onChange={e => setPaceH(e.target.value)} className="bg-secondary/50" />
                      <Input placeholder="M" value={paceM} onChange={e => setPaceM(e.target.value)} className="bg-secondary/50" />
                      <Input placeholder="S" value={paceS} onChange={e => setPaceS(e.target.value)} className="bg-secondary/50" />
                    </div>
                  </div>
                  <Button onClick={handleCalcPace} className="w-full">Calcular</Button>
                  {paceRes && (
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center animate-in zoom-in-95">
                      <div className="text-sm text-muted-foreground">Pace Médio</div>
                      <div className="text-2xl font-bold font-headline text-accent">{paceRes} min/km</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-accent">
                    <Clock className="size-4" /> Calcular Tempo
                  </CardTitle>
                  <CardDescription>Projete seu tempo de chegada.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Distância (km)</Label>
                    <Input type="number" value={timeDist} onChange={e => setTimeDist(e.target.value)} className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pace Alvo (min:seg)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Min" value={timePM} onChange={e => setTimePM(e.target.value)} className="bg-secondary/50" />
                      <Input placeholder="Seg" value={timePS} onChange={e => setTimePS(e.target.value)} className="bg-secondary/50" />
                    </div>
                  </div>
                  <Button onClick={handleCalcTime} className="w-full">Calcular</Button>
                  {timeRes && (
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center animate-in zoom-in-95">
                      <div className="text-sm text-muted-foreground">Tempo Estimado</div>
                      <div className="text-2xl font-bold font-headline text-accent">{timeRes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-accent">
                    <TrendingUp className="size-4" /> Distância
                  </CardTitle>
                  <CardDescription>Até onde você consegue ir?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tempo Disponível</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="H" value={distH} onChange={e => setDistH(e.target.value)} className="bg-secondary/50" />
                      <Input placeholder="M" value={distM} onChange={e => setDistM(e.target.value)} className="bg-secondary/50" />
                      <Input placeholder="S" value={distS} onChange={e => setDistS(e.target.value)} className="bg-secondary/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Pace Médio</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Min" value={distPM} onChange={e => setDistPM(e.target.value)} className="bg-secondary/50" />
                      <Input placeholder="Seg" value={distPS} onChange={e => setDistPS(e.target.value)} className="bg-secondary/50" />
                    </div>
                  </div>
                  <Button onClick={handleCalcDist} className="w-full">Calcular</Button>
                  {distRes && (
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center animate-in zoom-in-95">
                      <div className="text-sm text-muted-foreground">Distância Total</div>
                      <div className="text-2xl font-bold font-headline text-accent">{distRes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TREADMILL */}
          <TabsContent value="treadmill" className="mt-6">
            <Card className="bg-card border-border shadow-lg max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-accent">Conversor de Velocidade (Esteira)</CardTitle>
                <CardDescription>Converta km/h em pace (min/km) instantaneamente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Velocidade na Esteira (km/h)</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="Ex: 12.0" 
                    value={esteiraKmh} 
                    onChange={e => setEsteiraKmh(e.target.value)} 
                    className="bg-secondary/50 h-14 text-2xl text-center" 
                  />
                </div>
                <Button onClick={handleEsteira} size="lg" className="w-full bg-primary text-xl">Converter</Button>
                {esteiraRes && (
                  <div className="p-8 rounded-2xl bg-secondary/30 border border-border text-center">
                    <div className="text-muted-foreground uppercase tracking-widest text-xs font-bold mb-2">Equivale ao Pace de</div>
                    <div className="text-5xl font-bold font-headline text-accent">{esteiraRes}</div>
                    <div className="text-muted-foreground mt-1">min/km</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STRATEGY */}
          <TabsContent value="strategy" className="mt-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-accent">Estratégia de Splits</CardTitle>
                <CardDescription>Distribua seu esforço de forma inteligente para bater recordes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Tipo de Estratégia</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant={stratType === 'negative' ? 'default' : 'outline'} 
                        onClick={() => setStratType('negative')}
                        className="justify-start"
                      >
                        Split Negativo (Sugerido)
                      </Button>
                      <Button 
                        variant={stratType === 'even' ? 'default' : 'outline'} 
                        onClick={() => setStratType('even')}
                        className="justify-start"
                      >
                        Ritmo Constante
                      </Button>
                      <Button 
                        variant={stratType === 'positive' ? 'default' : 'outline'} 
                        onClick={() => setStratType('positive')}
                        className="justify-start"
                      >
                        Split Positivo
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Distância (km)</Label>
                    <Input value={stratDist} onChange={e => setStratDist(e.target.value)} className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo Alvo</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="H" value={stratH} onChange={e => setStratH(e.target.value)} className="bg-secondary/50" />
                      <Input placeholder="M" value={stratM} onChange={e => setStratM(e.target.value)} className="bg-secondary/50" />
                      <Input placeholder="S" value={stratS} onChange={e => setStratS(e.target.value)} className="bg-secondary/50" />
                    </div>
                  </div>
                </div>
                <Button onClick={handleStrategy} className="w-full bg-primary h-12 text-lg">Gerar Plano de Prova</Button>
                
                {stratRes && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-secondary/40 border border-border">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Início (0 - {stratRes.dist1}k)</div>
                        <div className="text-xl font-headline font-bold text-accent">{stratRes.p1} <span className="text-sm font-normal text-muted-foreground">min/km</span></div>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/40 border border-border">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Manutenção</div>
                        <div className="text-xl font-headline font-bold text-accent">{stratRes.p2} <span className="text-sm font-normal text-muted-foreground">min/km</span></div>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/40 border border-border">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Sprint Final</div>
                        <div className="text-xl font-headline font-bold text-accent">{stratRes.p3} <span className="text-sm font-normal text-muted-foreground">min/km</span></div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-accent/5 rounded-xl border border-accent/20 border-dashed">
                      <p className="text-sm italic text-muted-foreground">
                        {stratType === 'negative' ? "Comece controlado para poupar glicogênio e feche os últimos km com força total." : "Mantenha o foco mental para sustentar o ritmo sem oscilações significativas."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ZONES FC */}
          <TabsContent value="zones" className="mt-6">
             <Card className="bg-card border-border shadow-lg max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-accent">Zonas de Frequência Cardíaca</CardTitle>
                <CardDescription>Determine suas intensidades baseadas na FC Máxima.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>FC Máxima (bpm)</Label>
                  <Input type="number" placeholder="Ex: 188" className="bg-secondary/50 h-12 text-center text-xl" />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { zone: "Z1", label: "Recuperação", range: "94 - 113", color: "text-blue-400" },
                    { zone: "Z2", label: "Aeróbica (Base)", range: "113 - 132", color: "text-green-400" },
                    { zone: "Z3", label: "Ritmo / Tempo", range: "132 - 151", color: "text-yellow-400" },
                    { zone: "Z4", label: "Limiar Lactato", range: "151 - 170", color: "text-orange-400" },
                    { zone: "Z5", label: "Máximo / VO2", range: "170 - 188", color: "text-red-400" },
                  ].map((z) => (
                    <div key={z.zone} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border">
                      <div className="flex items-center gap-3">
                        <span className={cn("font-bold w-8", z.color)}>{z.zone}</span>
                        <span className="text-sm font-medium">{z.label}</span>
                      </div>
                      <span className="font-headline font-bold">{z.range} <span className="text-[10px] text-muted-foreground uppercase">bpm</span></span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 flex gap-3">
                  <Info className="size-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cálculos baseados na % da FC Máxima. Para maior precisão, use a Reserva de FC (Karvonen) se souber sua FC de Repouso.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
