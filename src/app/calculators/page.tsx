"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Droplets, 
  Heart, 
  Zap, 
  Copy,
  Clock,
  Target,
  Activity,
  Milestone,
  TrendingUp,
  MoveRight,
  IterationCcw,
  Info,
  Footprints
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function CalculatorsPage() {
  const { toast } = useToast();

  // --- Funções Auxiliares de Formatação ---
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
  
  const formatPace = (minPerKm: number) => {
    if (!minPerKm || minPerKm === Infinity) return "00:00";
    const totalSec = Math.round(minPerKm * 60);
    return `${pad(totalSec / 60)}:${pad(totalSec % 60)}`;
  };

  const formatTime = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes === Infinity) return "00:00:00";
    const totalSec = Math.round(totalMinutes * 60);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copiado: ${title}`);
  };

  const showToast = (msg: string) => {
    toast({ title: "Sucesso", description: msg });
  };

  // --- 1. CALCULADORA DE PACE ---
  const [pDist, setPDist] = React.useState("10");
  const [pTimeH, setPTimeH] = React.useState("0");
  const [pTimeM, setPTimeM] = React.useState("50");
  const [pTimeS, setPTimeS] = React.useState("00");
  const [pResult, setPResult] = React.useState<string | null>(null);

  const calcPaceAction = () => {
    const d = parseFloat(pDist);
    const t = parseInt(pTimeH) * 60 + parseInt(pTimeM) + parseInt(pTimeS) / 60;
    if (d > 0 && t > 0) setPResult(formatPace(t / d));
  };

  // --- 2. CALCULADORA DE TEMPO ---
  const [tDist, setTDist] = React.useState("10");
  const [tPaceM, setTPaceM] = React.useState("5");
  const [tPaceS, setTPaceS] = React.useState("00");
  const [tResult, setTResult] = React.useState<string | null>(null);

  const calcTimeAction = () => {
    const d = parseFloat(tDist);
    const p = parseInt(tPaceM) + parseInt(tPaceS) / 60;
    if (d > 0 && p > 0) setTResult(formatTime(d * p));
  };

  // --- 3. CALCULADORA DE DISTÂNCIA ---
  const [dTimeH, setDTimeH] = React.useState("1");
  const [dTimeM, setDTimeM] = React.useState("0");
  const [dTimeS, setDTimeS] = React.useState("0");
  const [dPaceM, setDPaceM] = React.useState("5");
  const [dPaceS, setDPaceS] = React.useState("00");
  const [dResult, setDResult] = React.useState<string | null>(null);

  const calcDistAction = () => {
    const t = parseInt(dTimeH) * 60 + parseInt(dTimeM) + parseInt(dTimeS) / 60;
    const p = parseInt(dPaceM) + parseInt(dPaceS) / 60;
    if (t > 0 && p > 0) setDResult((t / p).toFixed(2) + " km");
  };

  // --- 4. CONVERSOR ESTEIRA ---
  const [ePaceM, setEPaceM] = React.useState("5");
  const [ePaceS, setEPaceS] = React.useState("00");
  const [eVel, setEVel] = React.useState("12.0");
  const [eResPace, setEResPace] = React.useState<string | null>(null);
  const [eResVel, setEResVel] = React.useState<string | null>(null);

  const calcVelFromPace = () => {
    const p = parseInt(ePaceM) + parseInt(ePaceS) / 60;
    if (p > 0) setEResVel((60 / p).toFixed(1) + " km/h");
  };
  const calcPaceFromVel = () => {
    const v = parseFloat(eVel);
    if (v > 0) setEResPace(formatPace(60 / v));
  };

  // --- 5. ESTRATÉGIA DE PROVA ---
  const [sDist, setSDist] = React.useState("21.1");
  const [sTimeH, setSTimeH] = React.useState("1");
  const [sTimeM, setSTimeM] = React.useState("45");
  const [sTimeS, setSTimeS] = React.useState("00");
  const [sType, setSType] = React.useState<"negative" | "even" | "positive">("negative");
  const [sResult, setSResult] = React.useState<any | null>(null);

  const calcStrategyAction = () => {
    const d = parseFloat(sDist);
    const t = parseInt(sTimeH) * 60 + parseInt(sTimeM) + parseInt(sTimeS) / 60;
    const ap = t / d;
    
    let skm = d <= 5.5 ? 0.3 : (d <= 10.5 ? 0.5 : 1);
    const firstEnd = d / 2;
    const sprintStart = d - skm;
    
    let p1, p2, p3;
    if (sType === 'negative') {
      p1 = ap + 8/60; p2 = ap - 8/60; p3 = p2 - 5/60;
    } else if (sType === 'even') {
      p1 = ap; p2 = ap; p3 = ap - 5/60;
    } else {
      p1 = ap - 8/60; p2 = ap + 8/60; p3 = p2;
    }

    const segments = [
      { label: `Início (0 a ${firstEnd.toFixed(1)}k)`, pace: formatPace(p1), desc: "Poupe energia, ritmo sob controle." },
      { label: `Manutenção (${firstEnd.toFixed(1)}k a ${sprintStart.toFixed(1)}k)`, pace: formatPace(p2), desc: "Hora de acelerar." },
      { label: `Sprint Final (${sprintStart.toFixed(1)}k ao fim)`, pace: formatPace(p3), desc: "Dê tudo de si!" }
    ];

    const splits = [];
    let cumulative = 0;
    for (let i = 1; i <= Math.ceil(d); i++) {
      const mark = i > d ? d : i;
      const prevMark = i - 1;
      const distInSplit = mark - prevMark;
      let splitPace = ap;
      if (mark <= firstEnd) splitPace = p1;
      else if (mark <= sprintStart) splitPace = p2;
      else splitPace = p3;
      cumulative += distInSplit * splitPace;
      splits.push({ km: mark === d ? d.toFixed(2) : mark, time: formatTime(cumulative), pace: formatPace(splitPace) });
      if (mark === d) break;
    }
    setSResult({ avgPace: formatPace(ap), segments, splits });
  };

  // --- 6. PREVISÃO DE PROVA (Riegel) ---
  const [prDist, setPRDist] = React.useState("5");
  const [prTimeH, setPRTimeH] = React.useState("0");
  const [prTimeM, setPRTimeM] = React.useState("22");
  const [prTimeS, setPRTimeS] = React.useState("30");
  const [prRes, setPRRes] = React.useState<any[] | null>(null);

  const calcPredictorAction = () => {
    const d1 = parseFloat(prDist);
    const t1 = parseInt(prTimeH) * 60 + parseInt(prTimeM) + parseInt(prTimeS) / 60;
    if (d1 <= 0 || t1 <= 0) return;
    const targets = [5, 10, 21.097, 42.195];
    const results = targets.map(d2 => {
      const t2 = t1 * Math.pow(d2 / d1, 1.06);
      return { dist: d2 === 21.097 ? "Meia" : d2 === 42.195 ? "Maratona" : d2 + "k", time: formatTime(t2), pace: formatPace(t2 / d2) };
    });
    setPRRes(results);
  };

  // --- 7. ZONAS DE FC ---
  const [fcMax, setFCMax] = React.useState("185");
  const [fcRest, setFCRest] = React.useState("");
  const [fcLthr, setFCLthr] = React.useState("");
  const [fcZones, setFCZones] = React.useState<any[] | null>(null);

  const calcZonesAction = () => {
    const max = parseInt(fcMax);
    const rest = parseInt(fcRest);
    const lthr = parseInt(fcLthr);
    if (lthr > 0 && rest > 0) {
      setFCZones([
        { label: "Z1 - Recuperação", range: `< ${Math.round(lthr * 0.80)}`, color: "bg-slate-400" },
        { label: "Z2 - Resistência Aeróbica", range: `${Math.round(lthr * 0.80)}-${Math.round(lthr * 0.90)}`, color: "bg-emerald-500" },
        { label: "Z3 - Potência Aeróbica", range: `${Math.round(lthr * 0.90)+1}-${Math.round(lthr * 0.95)}`, color: "bg-yellow-500" },
        { label: "Z4 - Limiar", range: `${Math.round(lthr * 0.95)+1}-${Math.round(lthr * 1.02)}`, color: "bg-orange-500" },
        { label: "Z5 - Resistência Anaeróbica", range: `${Math.round(lthr * 1.02)+1}-${Math.round(lthr * 1.06)}`, color: "bg-red-500" },
        { label: "Z6 - Potência Anaeróbica", range: `> ${Math.round(lthr * 1.06)}`, color: "bg-purple-600" },
      ]);
    } else {
      setFCZones([
        { label: "Z1 - Recuperação", range: `${Math.round(max * 0.5)}-${Math.round(max * 0.6)}`, color: "bg-slate-400" },
        { label: "Z2 - Resistência Aeróbica", range: `${Math.round(max * 0.6)+1}-${Math.round(max * 0.7)}`, color: "bg-emerald-500" },
        { label: "Z3 - Moderado / Ritmo", range: `${Math.round(max * 0.7)+1}-${Math.round(max * 0.8)}`, color: "bg-yellow-500" },
        { label: "Z4 - Limiar de Lactato", range: `${Math.round(max * 0.8)+1}-${Math.round(max * 0.9)}`, color: "bg-orange-500" },
        { label: "Z5 - Máxima / VO2 Máx", range: `${Math.round(max * 0.9)+1}-${max}`, color: "bg-red-500" },
      ]);
    }
  };

  // --- 8. HIDRATAÇÃO ---
  const [hWeight, setHWeight] = React.useState("75");
  const [hDurH, setHDurH] = React.useState("1");
  const [hDurM, setHDurM] = React.useState("0");
  const [hClimate, setHClimate] = React.useState("1.0");
  const [hInt, setHInt] = React.useState("1.0");
  const [hRes, setHRes] = React.useState<any | null>(null);

  const calcHidraAction = () => {
    const w = parseFloat(hWeight);
    const tH = parseInt(hDurH) + parseInt(hDurM) / 60;
    const fc = parseFloat(hClimate);
    const fi = parseFloat(hInt);
    const vol = Math.round(w * 8 * fc * fi * tH);
    const per15 = Math.round(vol / (tH * 4));
    const caps = Math.ceil(tH * (fc * fi > 1.3 ? 2 : 1));
    const carb = Math.round((fi <= 1.0 ? 30 : 50) * tH);
    setHRes({ vol, per15, caps, carb });
  };

  // --- 9. RUN / WALK ---
  const [rwDist, setRwDist] = React.useState("10");
  const [rwRunM, setRwRunM] = React.useState("4");
  const [rwRunS, setRwRunS] = React.useState("0");
  const [rwWalkM, setRwWalkM] = React.useState("1");
  const [rwWalkS, setRwWalkS] = React.useState("0");
  const [rwRes, setRwRes] = React.useState<any | null>(null);

  const calcRwAction = () => {
    const d = parseFloat(rwDist);
    const runSec = parseInt(rwRunM) * 60 + parseInt(rwRunS);
    const walkSec = parseInt(rwWalkM) * 60 + parseInt(rwWalkS);
    if (d > 0 && (runSec + walkSec) > 0) {
      const cycles = Math.ceil((d * 1000) / 1000); // Simplificado para o protótipo
      setRwRes({ cycles, totalTime: "Cálculo em breve" });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
        <header className="px-2">
          <h1 className="text-3xl md:text-5xl font-headline font-black uppercase italic tracking-tighter">
            <span className="text-white">CENTRAL DE</span> <span className="text-primary">CÁLCULOS</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg font-medium max-w-2xl mt-2">
            Ferramentas técnicas para planejar ritmos, estratégias de prova e fisiologia do exercício.
          </p>
        </header>

        <Tabs defaultValue="essenciais" className="w-full">
          <div className="px-2 sticky top-16 z-20 bg-background/95 backdrop-blur-sm py-2">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/20 p-1 rounded-xl h-auto gap-2 border border-border/30 shadow-lg">
              <TabsTrigger value="essenciais" className="py-4 font-black text-[10px] md:text-xs uppercase italic gap-2 data-[state=active]:bg-primary data-[state=active]:text-black">
                <Target className="size-4" /> Cálculos Essenciais
              </TabsTrigger>
              <TabsTrigger value="planejamento" className="py-4 font-black text-[10px] md:text-xs uppercase italic gap-2 data-[state=active]:bg-primary data-[state=active]:text-black">
                <TrendingUp className="size-4" /> Planejamento & Apoio
              </TabsTrigger>
            </TabsList>
          </div>

          {/* --- ABA ESSENCIAIS --- */}
          <TabsContent value="essenciais" className="mt-8 space-y-8 px-2 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* PACE */}
              <Card className="bg-card/40 border-border/50 flex flex-col justify-between hover:border-primary/30 transition-all">
                <CardHeader className="pb-4 border-b border-border/20 mb-4 bg-secondary/10">
                   <CardTitle className="text-xs font-black uppercase italic text-primary flex items-center gap-2">
                     <Activity className="size-3" /> Calcular Pace
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Distância (km)</Label>
                    <Input type="number" value={pDist} onChange={e => setPDist(e.target.value)} className="bg-black/20 h-10 font-bold" />
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {["5", "10", "21.1", "42.2"].map(v => (
                        <Button key={v} variant="secondary" size="sm" className="h-6 text-[8px] font-black uppercase" onClick={() => setPDist(v)}>
                          {v === "21.1" ? "Meia" : v === "42.2" ? "Mara" : v + "k"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Tempo Final</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="number" placeholder="H" value={pTimeH} onChange={e => setPTimeH(e.target.value)} className="bg-black/20 text-center px-1" />
                      <Input type="number" placeholder="M" value={pTimeM} onChange={e => setPTimeM(e.target.value)} className="bg-black/20 text-center px-1" />
                      <Input type="number" placeholder="S" value={pTimeS} onChange={e => setPTimeS(e.target.value)} className="bg-black/20 text-center px-1" />
                    </div>
                  </div>
                  <Button className="w-full h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest mt-2" onClick={calcPaceAction}>Calcular</Button>
                  {pResult && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 relative group">
                      <div className="text-[8px] font-black uppercase text-emerald-400 mb-0.5">Pace Médio</div>
                      <div className="text-xl font-black italic text-emerald-400">{pResult} <small className="text-[9px] font-normal opacity-70">min/km</small></div>
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 size-6" onClick={() => copyToClipboard(pResult, "Pace")}>
                        <Copy className="size-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* TEMPO */}
              <Card className="bg-card/40 border-border/50 flex flex-col justify-between hover:border-primary/30 transition-all">
                <CardHeader className="pb-4 border-b border-border/20 mb-4 bg-secondary/10">
                   <CardTitle className="text-xs font-black uppercase italic text-primary flex items-center gap-2">
                     <Clock className="size-3" /> Calcular Tempo
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Distância (km)</Label>
                    <Input type="number" value={tDist} onChange={e => setTDist(e.target.value)} className="bg-black/20 h-10 font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Pace Alvo (min/km)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="Min" value={tPaceM} onChange={e => setTPaceM(e.target.value)} className="bg-black/20 text-center" />
                      <Input type="number" placeholder="Seg" value={tPaceS} onChange={e => setTPaceS(e.target.value)} className="bg-black/20 text-center" />
                    </div>
                  </div>
                  <Button className="w-full h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest mt-2" onClick={calcTimeAction}>Calcular</Button>
                  {tResult && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 relative group">
                      <div className="text-[8px] font-black uppercase text-emerald-400 mb-0.5">Tempo Previsto</div>
                      <div className="text-xl font-black italic text-emerald-400">{tResult}</div>
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 size-6" onClick={() => copyToClipboard(tResult, "Tempo")}>
                        <Copy className="size-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* DISTÂNCIA */}
              <Card className="bg-card/40 border-border/50 flex flex-col justify-between hover:border-primary/30 transition-all">
                <CardHeader className="pb-4 border-b border-border/20 mb-4 bg-secondary/10">
                   <CardTitle className="text-xs font-black uppercase italic text-primary flex items-center gap-2">
                     <Milestone className="size-3" /> Calcular Distância
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Tempo a Correr</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="number" placeholder="H" value={dTimeH} onChange={e => setDTimeH(e.target.value)} className="bg-black/20 text-center px-1" />
                      <Input type="number" placeholder="M" value={dTimeM} onChange={e => setDTimeM(e.target.value)} className="bg-black/20 text-center px-1" />
                      <Input type="number" placeholder="S" value={dTimeS} onChange={e => setDTimeS(e.target.value)} className="bg-black/20 text-center px-1" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-muted-foreground">Pace Médio (min/km)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="Min" value={dPaceM} onChange={e => setDPaceM(e.target.value)} className="bg-black/20 text-center" />
                      <Input type="number" placeholder="Seg" value={dPaceS} onChange={e => setDPaceS(e.target.value)} className="bg-black/20 text-center" />
                    </div>
                  </div>
                  <Button className="w-full h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest mt-2" onClick={calcDistAction}>Calcular</Button>
                  {dResult && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 relative group">
                      <div className="text-[8px] font-black uppercase text-emerald-400 mb-0.5">Distância Estimada</div>
                      <div className="text-xl font-black italic text-emerald-400">{dResult}</div>
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 size-6" onClick={() => copyToClipboard(dResult, "Distância")}>
                        <Copy className="size-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ESTEIRA */}
              <Card className="bg-card/40 border-border/50 flex flex-col justify-between hover:border-primary/30 transition-all">
                <CardHeader className="pb-4 border-b border-border/20 mb-4 bg-secondary/10">
                   <CardTitle className="text-xs font-black uppercase italic text-primary flex items-center gap-2">
                     <Zap className="size-3" /> Conversor Esteira
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-muted-foreground">Pace ➔ km/h</Label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="M" value={ePaceM} onChange={e => setEPaceM(e.target.value)} className="bg-black/20 text-center px-1" />
                        <Input type="number" placeholder="S" value={ePaceS} onChange={e => setEPaceS(e.target.value)} className="bg-black/20 text-center px-1" />
                        <Button variant="outline" className="shrink-0 h-10 border-primary/30 text-primary" onClick={calcVelFromPace}><MoveRight size={14} /></Button>
                      </div>
                      {eResVel && <div className="text-[10px] font-black text-center text-primary animate-in fade-in">{eResVel}</div>}
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-muted-foreground">km/h ➔ Pace</Label>
                      <div className="flex gap-2">
                        <Input type="number" value={eVel} onChange={e => setEVel(e.target.value)} className="bg-black/20 font-bold" />
                        <Button variant="outline" className="shrink-0 h-10 border-primary/30 text-primary" onClick={calcPaceFromVel}><MoveRight size={14} /></Button>
                      </div>
                      {eResPace && <div className="text-[10px] font-black text-center text-primary animate-in fade-in">{eResPace} min/km</div>}
                   </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- ABA PLANEJAMENTO --- */}
          <TabsContent value="planejamento" className="mt-8 space-y-8 px-2 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ESTRATÉGIA DE PACE */}
              <Card className="lg:col-span-2 bg-card/40 border-border/50 overflow-hidden shadow-2xl">
                <CardHeader className="bg-secondary/10 border-b border-border/20">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-black uppercase italic text-primary flex items-center gap-2">
                      <Target className="size-4" /> Estratégia de Pacing
                    </CardTitle>
                    <div className="flex gap-1">
                       {["negative", "even", "positive"].map(type => (
                         <Button key={type} size="sm" variant={sType === type ? "default" : "outline"} className={cn("text-[8px] h-7 font-black uppercase px-2", sType === type && "bg-primary text-black")} onClick={() => setSType(type as any)}>
                            {type === "negative" ? "Negativo" : type === "even" ? "Constante" : "Positivo"}
                         </Button>
                       ))}
                    </div>
                  </div>
                  <CardDescription className="text-[10px] italic mt-2">
                    {sType === "negative" && "Comece conservador e termine forte (Ideal para Recordes)."}
                    {sType === "even" && "Mantenha o mesmo ritmo do início ao fim."}
                    {sType === "positive" && "Comece rápido e controle a queda no final."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <Label className="text-[9px] font-bold uppercase text-muted-foreground">Distância da Prova (km)</Label>
                       <Input type="number" value={sDist} onChange={e => setSDist(e.target.value)} className="bg-black/20 h-10 font-black text-lg" />
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-[9px] font-bold uppercase text-muted-foreground">Tempo Alvo</Label>
                       <div className="grid grid-cols-3 gap-2">
                          <Input type="number" placeholder="H" value={sTimeH} onChange={e => setSTimeH(e.target.value)} className="bg-black/20 text-center font-bold" />
                          <Input type="number" placeholder="M" value={sTimeM} onChange={e => setSTimeM(e.target.value)} className="bg-black/20 text-center font-bold" />
                          <Input type="number" placeholder="S" value={sTimeS} onChange={e => setSTimeS(e.target.value)} className="bg-black/20 text-center font-bold" />
                       </div>
                    </div>
                  </div>
                  <Button className="w-full h-14 bg-primary text-black font-black uppercase italic tracking-widest" onClick={calcStrategyAction}>Gerar Plano de Prova</Button>

                  {sResult && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                       <div className="p-4 rounded-xl bg-secondary/20 border border-primary/20 relative">
                          <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground" onClick={() => copyToClipboard(`Estratégia ${sType.toUpperCase()} - Pace Médio: ${sResult.avgPace}`, "Plano")}>
                            <Copy size={14} />
                          </Button>
                          <h3 className="text-center font-black uppercase italic text-sm mb-4">Pace Médio Alvo: <span className="text-primary">{sResult.avgPace} MIN/KM</span></h3>
                          <div className="space-y-3">
                             {sResult.segments.map((seg: any, i: number) => (
                               <div key={i} className="flex justify-between items-center border-b border-border/10 pb-2">
                                  <div className="text-[10px]">
                                    <div className="font-bold text-white italic">{seg.label}</div>
                                    <div className="text-muted-foreground opacity-70 leading-tight">{seg.desc}</div>
                                  </div>
                                  <div className="text-primary font-black italic">{seg.pace}</div>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-3">
                          <div className="text-[11px] font-black uppercase italic text-primary tracking-widest flex items-center gap-2">
                            <IterationCcw size={12} /> Parciais Acumuladas
                          </div>
                          <div className="rounded-xl border border-border/30 bg-black/20 overflow-hidden">
                             <div className="grid grid-cols-3 p-3 bg-secondary/50 text-[9px] font-black text-muted-foreground uppercase italic border-b border-border/20">
                                <span>KM</span>
                                <span className="text-center">Passagem</span>
                                <span className="text-right">Ritmo do Trecho</span>
                             </div>
                             <div className="divide-y divide-border/10 max-h-[350px] overflow-y-auto">
                                {sResult.splits.map((split: any, idx: number) => (
                                  <div key={idx} className={cn("grid grid-cols-3 p-3 hover:bg-white/5 transition-colors", idx === sResult.splits.length -1 && "bg-primary/10")}>
                                     <span className="text-[10px] font-bold text-white italic">{split.km}</span>
                                     <span className="text-center text-primary font-black italic">{split.time}</span>
                                     <span className="text-right text-[10px] text-muted-foreground italic">{split.pace}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* PREVISÃO */}
                <Card className="bg-card/40 border-border/50">
                  <CardHeader className="bg-secondary/10 border-b border-border/20 py-3 px-4">
                    <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2">
                      <IterationCcw className="size-3" /> Previsão de Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <Label className="text-[8px] font-bold uppercase">Dist. Atual (km)</Label>
                          <Input type="number" value={prDist} onChange={e => setPRDist(e.target.value)} className="bg-black/20 h-8" />
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[8px] font-bold uppercase">Tempo</Label>
                          <div className="flex gap-1">
                            <Input type="number" placeholder="H" value={prTimeH} onChange={e => setPRTimeH(e.target.value)} className="bg-black/20 h-8 text-center px-1" />
                            <Input type="number" placeholder="M" value={prTimeM} onChange={e => setPRTimeM(e.target.value)} className="bg-black/20 h-8 text-center px-1" />
                          </div>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full h-8 text-[9px] border-primary/30 text-primary font-bold uppercase italic" onClick={calcPredictorAction}>Simular Projeções</Button>
                    {prRes && (
                      <div className="space-y-2 border-t border-border/20 pt-3">
                        {prRes.map(r => (
                          <div key={r.dist} className="flex justify-between items-center p-2 rounded bg-black/20 border border-border/10">
                            <span className="text-[10px] font-black uppercase italic text-muted-foreground">{r.dist}</span>
                            <div className="text-right">
                               <div className="text-xs font-black text-white italic">{r.time}</div>
                               <div className="text-[8px] text-primary italic">{r.pace} min/km</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* HIDRATAÇÃO */}
                <Card className="bg-card/40 border-border/50">
                  <CardHeader className="bg-secondary/10 border-b border-border/20 py-3 px-4">
                    <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2">
                      <Droplets className="size-3" /> Plano de Hidratação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <Label className="text-[8px] font-bold uppercase">Peso (kg)</Label>
                          <Input type="number" value={hWeight} onChange={e => setHWeight(e.target.value)} className="bg-black/20 h-8" />
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[8px] font-bold uppercase">Duração (H/M)</Label>
                          <div className="flex gap-1">
                            <Input type="number" value={hDurH} onChange={e => setHDurH(e.target.value)} className="bg-black/20 h-8 text-center px-1" />
                            <Input type="number" value={hDurM} onChange={e => setHDurM(e.target.value)} className="bg-black/20 h-8 text-center px-1" />
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <Label className="text-[8px] font-bold uppercase">Clima</Label>
                          <Select value={hClimate} onValueChange={setHClimate}>
                             <SelectTrigger className="h-8 text-[9px] bg-black/20"><SelectValue /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="0.8">Frio</SelectItem>
                               <SelectItem value="1.0">Moderado</SelectItem>
                               <SelectItem value="1.25">Quente</SelectItem>
                               <SelectItem value="1.5">Extremo</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[8px] font-bold uppercase">Esforço</Label>
                          <Select value={hInt} onValueChange={setHInt}>
                             <SelectTrigger className="h-8 text-[9px] bg-black/20"><SelectValue /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="0.8">Leve (Z2)</SelectItem>
                               <SelectItem value="1.0">Moderado (Z3)</SelectItem>
                               <SelectItem value="1.2">Intenso (Z4)</SelectItem>
                               <SelectItem value="1.4">Prova (Max)</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full h-8 text-[9px] border-primary/30 text-primary font-bold uppercase italic" onClick={calcHidraAction}>Calcular Plano</Button>
                    {hRes && (
                      <div className="grid grid-cols-2 gap-2 animate-in zoom-in-95">
                         <div className="p-2 rounded bg-black/20 border border-border/10 text-center">
                            <div className="text-[7px] font-black uppercase text-muted-foreground">Total</div>
                            <div className="text-sm font-black text-primary italic">{hRes.vol}ml</div>
                         </div>
                         <div className="p-2 rounded bg-black/20 border border-border/10 text-center">
                            <div className="text-[7px] font-black uppercase text-muted-foreground">/ 15 Min</div>
                            <div className="text-sm font-black text-primary italic">{hRes.per15}ml</div>
                         </div>
                         <div className="col-span-2 p-2 rounded bg-black/20 border border-border/10">
                            <div className="flex items-center gap-2 text-[9px] mb-1">
                               <Zap size={10} className="text-yellow-500" /> <span className="font-bold uppercase">Nutrição Sugerida:</span>
                            </div>
                            <div className="text-[8px] text-muted-foreground italic leading-tight">
                               • Sais: {hRes.caps} cápsula(s) de 250mg.<br/>
                               • Carbos: ~{hRes.carb}g (aprox. {Math.max(1, Math.ceil(hRes.carb / 25))} géis).
                            </div>
                         </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ZONAS FC */}
                <Card className="bg-card/40 border-border/50">
                  <CardHeader className="bg-secondary/10 border-b border-border/20 py-3 px-4">
                    <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2">
                      <Heart className="size-3" /> Zonas de Esforço
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                       <div className="space-y-1">
                          <Label className="text-[7px] font-bold uppercase">FC Máx</Label>
                          <Input type="number" value={fcMax} onChange={e => setFCMax(e.target.value)} className="bg-black/20 h-8 px-1 text-center" />
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[7px] font-bold uppercase">Repouso</Label>
                          <Input type="number" placeholder="Opc" value={fcRest} onChange={e => setFCRest(e.target.value)} className="bg-black/20 h-8 px-1 text-center" />
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[7px] font-bold uppercase">Limiar</Label>
                          <Input type="number" placeholder="L2" value={fcLthr} onChange={e => setFCLthr(e.target.value)} className="bg-black/20 h-8 px-1 text-center" />
                       </div>
                    </div>
                    <Button variant="outline" className="w-full h-8 text-[9px] border-primary/30 text-primary font-bold uppercase italic" onClick={calcZonesAction}>Gerar Zonas</Button>
                    {fcZones && (
                      <div className="space-y-1 animate-in fade-in">
                        {fcZones.map(z => (
                          <div key={z.label} className="flex items-center justify-between p-1.5 rounded bg-black/10 text-[8px] border border-border/5">
                             <div className="flex items-center gap-2">
                                <div className={cn("w-0.5 h-3 rounded-full", z.color)} />
                                <span className="font-bold text-white uppercase italic">{z.label}</span>
                             </div>
                             <span className="font-black text-primary">{z.range} <small className="font-normal opacity-50">bpm</small></span>
                          </div>
                        ))}
                        <p className="text-[7px] text-muted-foreground italic mt-2 flex items-start gap-1">
                          <Info size={8} /> {fcLthr && fcRest ? "Cálculo baseado em Limiar de Lactato (Evolab)." : "Cálculo básico por % de FC Máxima."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* RUN / WALK */}
                <Card className="bg-card/40 border-border/50">
                   <CardHeader className="bg-secondary/10 border-b border-border/20 py-3 px-4">
                    <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2">
                      <Footprints className="size-3" /> Run / Walk Ciclos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-1">
                        <Label className="text-[8px] font-bold uppercase">Distância (km)</Label>
                        <Input type="number" value={rwDist} onChange={e => setRwDist(e.target.value)} className="bg-black/20 h-8" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <Label className="text-[8px] font-bold uppercase">Corre (M:S)</Label>
                          <div className="flex gap-1">
                            <Input type="number" placeholder="M" value={rwRunM} onChange={e => setRwRunM(e.target.value)} className="bg-black/20 h-8 text-center px-1" />
                            <Input type="number" placeholder="S" value={rwRunS} onChange={e => setRwRunS(e.target.value)} className="bg-black/20 h-8 text-center px-1" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[8px] font-bold uppercase">Caminha (M:S)</Label>
                          <div className="flex gap-1">
                            <Input type="number" placeholder="M" value={rwWalkM} onChange={e => setRwWalkM(e.target.value)} className="bg-black/20 h-8 text-center px-1" />
                            <Input type="number" placeholder="S" value={rwWalkS} onChange={e => setRwWalkS(e.target.value)} className="bg-black/20 h-8 text-center px-1" />
                          </div>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full h-8 text-[9px] border-primary/30 text-primary font-bold uppercase italic" onClick={calcRwAction}>Calcular Run/Walk</Button>
                    {rwRes && (
                      <div className="p-2 rounded bg-black/20 border border-border/10 text-center animate-in zoom-in-95">
                         <div className="text-[7px] font-black uppercase text-muted-foreground">Estimativa</div>
                         <div className="text-xs font-black text-primary italic">Plano Gerado</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
