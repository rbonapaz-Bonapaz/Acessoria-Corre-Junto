"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Clock, 
  Milestone, 
  TrendingUp, 
  Info,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  
  // State
  const [paceDist, setPaceDist] = React.useState("5");
  const [paceH, setPaceH] = React.useState("");
  const [paceM, setPaceM] = React.useState("");
  const [paceS, setPaceS] = React.useState("");
  const [paceRes, setPaceRes] = React.useState<string | null>(null);

  const [timeDist, setTimeDist] = React.useState("5");
  const [timePM, setTimePM] = React.useState("");
  const [timePS, setTimePS] = React.useState("");
  const [timeRes, setTimeRes] = React.useState<string | null>(null);

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
      toast({ title: "Copiado!", description: "Resultado copiado com sucesso." });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao copiar." });
    }
  };

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
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12">
        <header className="px-2">
          <h1 className="text-2xl md:text-4xl font-headline font-black uppercase italic tracking-tight">
            <span className="text-white">Calculadoras de</span> <span className="text-primary">Performance</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Ferramentas técnicas para planejar seus ritmos e metas.</p>
        </header>

        <Tabs defaultValue="basic" className="w-full">
          <div className="px-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-secondary/20 p-1 rounded-xl h-auto gap-1">
              <TabsTrigger value="basic" className="py-2.5 font-bold text-[10px] uppercase">Básicos</TabsTrigger>
              <TabsTrigger value="treadmill" className="py-2.5 font-bold text-[10px] uppercase">Esteira</TabsTrigger>
              <TabsTrigger value="strategy" className="py-2.5 font-bold text-[10px] uppercase">Estratégia</TabsTrigger>
              <TabsTrigger value="zones" className="py-2.5 font-bold text-[10px] uppercase">Zonas FC</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basic" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2">
              <Card className="bg-card/50 border-border shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm md:text-lg flex items-center gap-2 text-primary font-black uppercase italic">
                    <Milestone className="size-4" /> Pace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Distância (km)</Label>
                    <Input type="number" value={paceDist} onChange={e => setPaceDist(e.target.value)} className="bg-secondary/30 h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tempo Final (H:M:S)</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Input placeholder="H" value={paceH} onChange={e => setPaceH(e.target.value)} className="bg-secondary/30" />
                      <Input placeholder="M" value={paceM} onChange={e => setPaceM(e.target.value)} className="bg-secondary/30" />
                      <Input placeholder="S" value={paceS} onChange={e => setPaceS(e.target.value)} className="bg-secondary/30" />
                    </div>
                  </div>
                  <Button onClick={handleCalcPace} className="w-full bg-primary text-black font-black uppercase tracking-widest text-xs h-10">Calcular</Button>
                  {paceRes && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center animate-in zoom-in-95">
                      <div className="text-[10px] uppercase font-black text-muted-foreground">Pace Médio</div>
                      <div className="text-xl font-bold font-headline text-primary italic">{paceRes} <span className="text-xs font-normal">min/km</span></div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm md:text-lg flex items-center gap-2 text-primary font-black uppercase italic">
                    <Clock className="size-4" /> Tempo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Distância (km)</Label>
                    <Input type="number" value={timeDist} onChange={e => setTimeDist(e.target.value)} className="bg-secondary/30 h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Pace Alvo (min:seg)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Min" value={timePM} onChange={e => setTimePM(e.target.value)} className="bg-secondary/30" />
                      <Input placeholder="Seg" value={timePS} onChange={e => setTimePS(e.target.value)} className="bg-secondary/30" />
                    </div>
                  </div>
                  <Button onClick={handleCalcTime} className="w-full bg-primary text-black font-black uppercase tracking-widest text-xs h-10">Calcular</Button>
                  {timeRes && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center animate-in zoom-in-95">
                      <div className="text-[10px] uppercase font-black text-muted-foreground">Tempo Estimado</div>
                      <div className="text-xl font-bold font-headline text-primary italic">{timeRes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="treadmill" className="mt-6">
            <Card className="bg-card/50 border-border shadow-lg mx-2">
              <CardHeader className="text-center">
                <CardTitle className="text-lg md:text-xl text-primary font-black uppercase italic tracking-tight">Conversor de Esteira</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 max-w-md mx-auto">
                <div className="space-y-1.5">
                  <Label className="text-center block text-xs font-bold uppercase text-muted-foreground mb-2">Velocidade na Esteira (km/h)</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="Ex: 12.0" 
                    value={esteiraKmh} 
                    onChange={e => setEsteiraKmh(e.target.value)} 
                    className="bg-secondary/20 h-14 md:h-16 text-3xl font-black text-center text-primary" 
                  />
                </div>
                <Button onClick={handleEsteira} className="w-full bg-primary text-black font-black uppercase tracking-widest h-12">Converter</Button>
                {esteiraRes && (
                  <div className="p-6 rounded-2xl bg-secondary/10 border border-border text-center">
                    <div className="text-muted-foreground uppercase tracking-widest text-[10px] font-black mb-2">Equivale ao Pace de</div>
                    <div className="text-5xl font-black font-headline text-primary italic">{esteiraRes}</div>
                    <div className="text-muted-foreground text-xs font-bold mt-1">min/km</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategy" className="mt-6">
            <Card className="bg-card/50 border-border shadow-lg mx-2">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-primary font-black uppercase italic tracking-tight">Estratégia de Splits</CardTitle>
                <CardDescription className="text-xs">Distribua seu esforço para quebrar recordes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Tipo de Estratégia</Label>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant={stratType === 'negative' ? 'default' : 'outline'} 
                        onClick={() => setStratType('negative')}
                        className="justify-start text-[10px] font-bold h-9"
                      >
                        Split Negativo (Sugerido)
                      </Button>
                      <Button 
                        variant={stratType === 'even' ? 'default' : 'outline'} 
                        onClick={() => setStratType('even')}
                        className="justify-start text-[10px] font-bold h-9"
                      >
                        Ritmo Constante
                      </Button>
                      <Button 
                        variant={stratType === 'positive' ? 'default' : 'outline'} 
                        onClick={() => setStratType('positive')}
                        className="justify-start text-[10px] font-bold h-9"
                      >
                        Split Positivo
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Distância (km)</Label>
                    <Input value={stratDist} onChange={e => setStratDist(e.target.value)} className="bg-secondary/30 h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Tempo Alvo</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Input placeholder="H" value={stratH} onChange={e => setStratH(e.target.value)} className="bg-secondary/30" />
                      <Input placeholder="M" value={stratM} onChange={e => setStratM(e.target.value)} className="bg-secondary/30" />
                      <Input placeholder="S" value={stratS} onChange={e => setStratS(e.target.value)} className="bg-secondary/30" />
                    </div>
                  </div>
                </div>
                <Button onClick={handleStrategy} className="w-full bg-primary text-black font-black uppercase tracking-widest h-12 text-xs">Gerar Plano de Prova</Button>
                
                {stratRes && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                        <div className="text-[9px] text-muted-foreground uppercase font-black mb-1">Início (0 - {stratRes.dist1}k)</div>
                        <div className="text-lg font-headline font-black text-primary italic">{stratRes.p1} <span className="text-[10px] font-normal text-muted-foreground">min/km</span></div>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                        <div className="text-[9px] text-muted-foreground uppercase font-black mb-1">Manutenção</div>
                        <div className="text-lg font-headline font-black text-primary italic">{stratRes.p2} <span className="text-[10px] font-normal text-muted-foreground">min/km</span></div>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                        <div className="text-[9px] text-muted-foreground uppercase font-black mb-1">Sprint Final</div>
                        <div className="text-lg font-headline font-black text-primary italic">{stratRes.p3} <span className="text-[10px] font-normal text-muted-foreground">min/km</span></div>
                      </div>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 border-dashed text-center">
                      <p className="text-[10px] italic text-muted-foreground leading-tight">
                        {stratType === 'negative' ? "Comece controlado para poupar glicogênio e feche os últimos km com força total." : "Mantenha o foco mental para sustentar o ritmo sem oscilações significativas."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="zones" className="mt-6">
             <Card className="bg-card/50 border-border shadow-lg max-w-xl mx-auto overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="text-lg md:text-xl text-primary font-black uppercase italic tracking-tight">Zonas de Frequência Cardíaca</CardTitle>
                <CardDescription className="text-xs">Determine suas intensidades baseadas na FC Máxima.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 max-w-xs mx-auto">
                  <Label className="text-center block text-[10px] font-black uppercase text-muted-foreground">FC Máxima (bpm)</Label>
                  <Input type="number" placeholder="Ex: 188" className="bg-secondary/30 h-12 text-center text-2xl font-black text-primary" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { zone: "Z1", label: "Recuperação", range: "94 - 113", color: "text-blue-400" },
                    { zone: "Z2", label: "Aeróbica (Base)", range: "113 - 132", color: "text-green-400" },
                    { zone: "Z3", label: "Ritmo / Tempo", range: "132 - 151", color: "text-yellow-400" },
                    { zone: "Z4", label: "Limiar Lactato", range: "151 - 170", color: "text-orange-400" },
                    { zone: "Z5", label: "Máximo / VO2", range: "170 - 188", color: "text-red-400" },
                  ].map((z) => (
                    <div key={z.zone} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/50">
                      <div className="flex items-center gap-3">
                        <span className={cn("font-black w-6 text-sm italic", z.color)}>{z.zone}</span>
                        <span className="text-[10px] font-bold uppercase tracking-tight">{z.label}</span>
                      </div>
                      <span className="font-headline font-black text-sm italic">{z.range} <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">bpm</span></span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex gap-3">
                  <Info className="size-4 text-primary shrink-0" />
                  <p className="text-[9px] text-muted-foreground leading-relaxed italic">
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