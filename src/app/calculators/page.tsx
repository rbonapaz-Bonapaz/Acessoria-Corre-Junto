
"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Info
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
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${pad(m)}:${pad(s)}`;
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
    toast({ title: "Copiado!", description: `${title} salvo na área de transferência.` });
  };

  // --- 1. CALCULADORA DE PACE ---
  const [pDist, setPDist] = React.useState("10");
  const [pTimeH, setPTimeH] = React.useState("");
  const [pTimeM, setPTimeM] = React.useState("50");
  const [pTimeS, setPTimeS] = React.useState("00");
  const [pResult, setPResult] = React.useState<string | null>(null);

  const calcPaceAction = () => {
    const d = parseFloat(pDist);
    const t = (parseInt(pTimeH) || 0) * 60 + (parseInt(pTimeM) || 0) + (parseInt(pTimeS) || 0) / 60;
    if (d > 0 && t > 0) setPResult(formatPace(t / d));
  };

  // --- 2. CALCULADORA DE TEMPO ---
  const [tDist, setTDist] = React.useState("10");
  const [tPaceM, setTPaceM] = React.useState("5");
  const [tPaceS, setTPaceS] = React.useState("00");
  const [tResult, setTResult] = React.useState<string | null>(null);

  const calcTimeAction = () => {
    const d = parseFloat(tDist);
    const p = (parseInt(tPaceM) || 0) + (parseInt(tPaceS) || 0) / 60;
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
    const t = (parseInt(dTimeH) || 0) * 60 + (parseInt(dTimeM) || 0) + (parseInt(dTimeS) || 0) / 60;
    const p = (parseInt(dPaceM) || 0) + (parseInt(dPaceS) || 0) / 60;
    if (t > 0 && p > 0) setDResult((t / p).toFixed(2) + " km");
  };

  // --- 4. CONVERSOR ESTEIRA ---
  const [ePaceM, setEPaceM] = React.useState("5");
  const [ePaceS, setEPaceS] = React.useState("00");
  const [eVel, setEVel] = React.useState("12.0");
  const [eResPace, setEResPace] = React.useState<string | null>(null);
  const [eResVel, setEResVel] = React.useState<string | null>(null);

  const calcVelFromPace = () => {
    const p = (parseInt(ePaceM) || 0) + (parseInt(ePaceS) || 0) / 60;
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
    const t = (parseInt(sTimeH) || 0) * 60 + (parseInt(sTimeM) || 0) + (parseInt(sTimeS) || 0) / 60;
    if (!d || t <= 0) {
      toast({ variant: "destructive", title: "Dados incompletos", description: "Informe a distância e o tempo alvo." });
      return;
    }
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
      { label: `Manutenção (${firstEnd.toFixed(1)}k a ${sprintStart.toFixed(1)}k)`, pace: formatPace(p2), desc: "Aceleração gradual." },
      { label: `Sprint Final (${sprintStart.toFixed(1)}k ao fim)`, pace: formatPace(p3), desc: "Esforço máximo!" }
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
  const [prTimeM, setPRTimeM] = React.useState("25");
  const [prTimeS, setPRTimeS] = React.useState("00");
  const [prRes, setPRRes] = React.useState<any[] | null>(null);

  const calcPredictorAction = () => {
    const d1 = parseFloat(prDist);
    const t1 = (parseInt(prTimeH) || 0) * 60 + (parseInt(prTimeM) || 0) + (parseInt(prTimeS) || 0) / 60;
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
    const lthr = parseInt(fcLthr);
    if (lthr > 0) {
      setFCZones([
        { label: "Z1 - Recuperação", range: `< ${Math.round(lthr * 0.80)}`, color: "bg-slate-500" },
        { label: "Z2 - Base Aeróbica", range: `${Math.round(lthr * 0.80)}-${Math.round(lthr * 0.90)}`, color: "bg-emerald-500" },
        { label: "Z3 - Potência Aeróbica", range: `${Math.round(lthr * 0.90)+1}-${Math.round(lthr * 0.95)}`, color: "bg-yellow-500" },
        { label: "Z4 - Limiar", range: `${Math.round(lthr * 0.95)+1}-${Math.round(lthr * 1.02)}`, color: "bg-orange-500" },
        { label: "Z5 - Anaeróbica", range: `${Math.round(lthr * 1.02)+1}-${Math.round(lthr * 1.06)}`, color: "bg-red-500" },
        { label: "Z6 - Potência", range: `> ${Math.round(lthr * 1.06)}`, color: "bg-purple-600" },
      ]);
    } else {
      setFCZones([
        { label: "Z1 - Recuperação", range: `${Math.round(max * 0.5)}-${Math.round(max * 0.6)}`, color: "bg-slate-500" },
        { label: "Z2 - Resistência", range: `${Math.round(max * 0.6)+1}-${Math.round(max * 0.7)}`, color: "bg-emerald-500" },
        { label: "Z3 - Moderado", range: `${Math.round(max * 0.7)+1}-${Math.round(max * 0.8)}`, color: "bg-yellow-500" },
        { label: "Z4 - Limiar", range: `${Math.round(max * 0.8)+1}-${Math.round(max * 0.9)}`, color: "bg-orange-500" },
        { label: "Z5 - Máxima", range: `${Math.round(max * 0.9)+1}-${max}`, color: "bg-red-500" },
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
    const tH = (parseInt(hDurH) || 0) + (parseInt(hDurM) || 0) / 60;
    const fc = parseFloat(hClimate);
    const fi = parseFloat(hInt);
    const vol = Math.round(w * 8 * fc * fi * tH);
    const per15 = Math.round(vol / (tH * 4));
    const caps = Math.ceil(tH * (fc * fi > 1.3 ? 2 : 1));
    const carb = Math.round((fi <= 1.0 ? 30 : 50) * tH);
    setHRes({ vol, per15, caps, carb });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <header className="px-4">
          <h1 className="text-3xl md:text-5xl font-headline font-black uppercase italic tracking-tighter leading-none">
            <span className="text-white">CENTRAL DE</span> <br/>
            <span className="text-primary">CÁLCULOS ELITE</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg font-medium max-w-2xl mt-4">
            Ferramentas técnicas para corredores que buscam precisão e performance baseada em dados.
          </p>
        </header>

        <Tabs defaultValue="essenciais" className="w-full">
          <div className="px-4 sticky top-16 z-20 bg-background/95 backdrop-blur-md py-4 border-b border-border/10">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/20 p-1.5 rounded-2xl h-auto gap-2 shadow-inner">
              <TabsTrigger value="essenciais" className="py-4 font-black text-xs md:text-sm uppercase italic gap-2 data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl">
                <Zap className="size-4" /> Básicos
              </TabsTrigger>
              <TabsTrigger value="planejamento" className="py-4 font-black text-xs md:text-sm uppercase italic gap-2 data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl">
                <Target className="size-4" /> Planejamento
              </TabsTrigger>
            </TabsList>
          </div>

          {/* --- ABA ESSENCIAIS --- */}
          <TabsContent value="essenciais" className="mt-8 space-y-8 px-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* PACE */}
              <Card className="bg-card/40 border-border/50 flex flex-col hover:border-primary/40 transition-colors rounded-2xl shadow-xl overflow-hidden">
                <CardHeader className="pb-4 bg-secondary/10 border-b border-border/10">
                   <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                     <Activity className="size-3" /> Calcular Pace
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Distância (km)</Label>
                    <Input type="number" value={pDist} onChange={e => setPDist(e.target.value)} className="bg-black/30 h-14 text-2xl font-black border-border/40 focus:border-primary text-center rounded-xl" />
                    <div className="grid grid-cols-4 gap-2">
                      {["5", "10", "21.1", "42.2"].map(v => (
                        <Button key={v} variant="secondary" size="sm" className={cn("h-10 text-[9px] font-black uppercase rounded-lg transition-all", pDist === v ? "bg-primary text-black" : "bg-secondary/40 hover:bg-secondary/60")} onClick={() => setPDist(v)}>
                          {v === "21.1" ? "Meia" : v === "42.2" ? "Marat" : v + "k"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest text-center block">Tempo Final</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Input type="number" placeholder="H" value={pTimeH} onChange={e => setPTimeH(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <span className="text-[8px] block text-center opacity-50 uppercase font-bold">Horas</span>
                      </div>
                      <div className="space-y-1">
                        <Input type="number" placeholder="M" value={pTimeM} onChange={e => setPTimeM(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <span className="text-[8px] block text-center opacity-50 uppercase font-bold">Min</span>
                      </div>
                      <div className="space-y-1">
                        <Input type="number" placeholder="S" value={pTimeS} onChange={e => setPTimeS(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <span className="text-[8px] block text-center opacity-50 uppercase font-bold">Seg</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full h-14 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-primary/10" onClick={calcPaceAction}>Calcular</Button>
                  {pResult && (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 group relative shadow-inner">
                      <div className="text-[10px] font-black uppercase text-emerald-400 mb-1 tracking-widest">Ritmo Médio</div>
                      <div className="text-4xl font-black italic text-emerald-400 leading-none">{pResult} <small className="text-xs font-bold opacity-60">min/km</small></div>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 size-8 hover:bg-emerald-500/20" onClick={() => copyToClipboard(pResult, "Pace")}>
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* TEMPO */}
              <Card className="bg-card/40 border-border/50 flex flex-col hover:border-primary/40 transition-colors rounded-2xl shadow-xl overflow-hidden">
                <CardHeader className="pb-4 bg-secondary/10 border-b border-border/10">
                   <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                     <Clock className="size-3" /> Calcular Tempo
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Distância (km)</Label>
                    <Input type="number" value={tDist} onChange={e => setTDist(e.target.value)} className="bg-black/30 h-14 text-2xl font-black text-center rounded-xl" />
                    <div className="grid grid-cols-4 gap-2">
                      {["5", "10", "21.1", "42.2"].map(v => (
                        <Button key={v} variant="secondary" size="sm" className={cn("h-10 text-[9px] font-black uppercase rounded-lg", tDist === v ? "bg-primary text-black" : "bg-secondary/40")} onClick={() => setTDist(v)}>
                          {v === "21.1" ? "Meia" : v === "42.2" ? "Marat" : v + "k"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Pace Alvo (min/km)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Input type="number" placeholder="Min" value={tPaceM} onChange={e => setTPaceM(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <span className="text-[8px] block text-center opacity-50 uppercase font-bold">Minutos</span>
                      </div>
                      <div className="space-y-1">
                        <Input type="number" placeholder="Seg" value={tPaceS} onChange={e => setTPaceS(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                        <span className="text-[8px] block text-center opacity-50 uppercase font-bold">Segundos</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full h-14 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl" onClick={calcTimeAction}>Calcular</Button>
                  {tResult && (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 group relative shadow-inner">
                      <div className="text-[10px] font-black uppercase text-emerald-400 mb-1 tracking-widest">Tempo Previsto</div>
                      <div className="text-4xl font-black italic text-emerald-400 leading-none">{tResult}</div>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 size-8" onClick={() => copyToClipboard(tResult, "Tempo")}>
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* DISTÂNCIA */}
              <Card className="bg-card/40 border-border/50 flex flex-col hover:border-primary/40 transition-colors rounded-2xl shadow-xl overflow-hidden">
                <CardHeader className="pb-4 bg-secondary/10 border-b border-border/10">
                   <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                     <Milestone className="size-3" /> Calcular Distância
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Tempo Total</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="number" placeholder="H" value={dTimeH} onChange={e => setDTimeH(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                      <Input type="number" placeholder="M" value={dTimeM} onChange={e => setDTimeM(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                      <Input type="number" placeholder="S" value={dTimeS} onChange={e => setDTimeS(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Pace Médio</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="Min" value={dPaceM} onChange={e => setDPaceM(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                      <Input type="number" placeholder="Seg" value={dPaceS} onChange={e => setDPaceS(e.target.value)} className="bg-black/30 h-12 text-center text-lg font-black rounded-xl" />
                    </div>
                  </div>
                  <Button className="w-full h-14 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl" onClick={calcDistAction}>Calcular</Button>
                  {dResult && (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 group relative shadow-inner">
                      <div className="text-[10px] font-black uppercase text-emerald-400 mb-1 tracking-widest">Distância Estimada</div>
                      <div className="text-4xl font-black italic text-emerald-400 leading-none">{dResult}</div>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 size-8" onClick={() => copyToClipboard(dResult, "Distância")}>
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ESTEIRA */}
              <Card className="bg-card/40 border-border/50 flex flex-col hover:border-primary/40 transition-colors rounded-2xl shadow-xl overflow-hidden">
                <CardHeader className="pb-4 bg-secondary/10 border-b border-border/10">
                   <CardTitle className="text-[10px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                     <MoveRight className="size-3" /> Conversor Esteira
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Ritmo ➔ Velocidade</Label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="Min" value={ePaceM} onChange={e => setEPaceM(e.target.value)} className="bg-black/30 h-14 text-center text-lg font-black rounded-xl flex-1" />
                        <Input type="number" placeholder="Seg" value={ePaceS} onChange={e => setEPaceS(e.target.value)} className="bg-black/30 h-14 text-center text-lg font-black rounded-xl flex-1" />
                        <Button variant="outline" className="shrink-0 h-14 w-14 border-primary/30 text-primary hover:bg-primary/20 rounded-xl" onClick={calcVelFromPace}><MoveRight size={20} /></Button>
                      </div>
                      {eResVel && <div className="text-lg font-black text-center text-primary animate-in fade-in py-2 bg-primary/5 rounded-xl border border-primary/10 tracking-widest">{eResVel}</div>}
                   </div>
                   <div className="space-y-4 border-t border-border/20 pt-6">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Velocidade ➔ Ritmo</Label>
                      <div className="flex gap-2">
                        <Input type="number" value={eVel} onChange={e => setEVel(e.target.value)} className="bg-black/30 h-14 text-center flex-1 text-2xl font-black rounded-xl" />
                        <Button variant="outline" className="shrink-0 h-14 w-14 border-primary/30 text-primary hover:bg-primary/20 rounded-xl" onClick={calcPaceFromVel}><MoveRight size={20} /></Button>
                      </div>
                      {eResPace && <div className="text-lg font-black text-center text-primary animate-in fade-in py-2 bg-primary/5 rounded-xl border border-primary/10 tracking-widest">{eResPace} min/km</div>}
                   </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- ABA PLANEJAMENTO --- */}
          <TabsContent value="planejamento" className="mt-8 space-y-8 px-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ESTRATÉGIA DE PACE */}
              <Card className="lg:col-span-2 bg-card/40 border-border/50 overflow-hidden shadow-2xl rounded-3xl">
                <CardHeader className="bg-secondary/10 border-b border-border/20 py-8 px-8">
                   <CardTitle className="text-lg font-black uppercase italic text-primary flex items-center gap-3 tracking-tighter">
                     <TrendingUp size={24} /> Pacing de Prova Estratégico
                   </CardTitle>
                </CardHeader>
                <CardContent className="pt-10 px-8 pb-12 space-y-12">
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase italic tracking-widest text-muted-foreground">Tipo de Prova</Label>
                    <div className="grid grid-cols-3 gap-3">
                       {[
                         { id: "negative", label: "Negativo", desc: "Inicie conservador e termine forte (ideal para RPs).", color: "bg-[#a761d4]" },
                         { id: "even", label: "Constante", desc: "Mantenha o mesmo ritmo do início ao fim (ideal para controle total).", color: "bg-[#a761d4]" },
                         { id: "positive", label: "Positivo", desc: "Comece rápido e controle a queda no final (Estratégia agressiva).", color: "bg-[#a761d4]" }
                       ].map(type => (
                         <Button 
                           key={type.id} 
                           size="lg" 
                           variant={sType === type.id ? "default" : "secondary"} 
                           className={cn(
                             "flex-1 h-14 font-black uppercase px-3 italic rounded-2xl transition-all border-2 border-transparent", 
                             sType === type.id ? `${type.color} text-white shadow-xl shadow-purple-500/20 border-white/10` : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
                           )} 
                           onClick={() => setSType(type.id as any)}
                         >
                            {type.label}
                         </Button>
                       ))}
                    </div>
                    <p className="text-center text-sm italic text-muted-foreground min-h-[1.5rem] animate-in fade-in duration-300 font-medium">
                      {sType === "negative" && "Inicie conservador e termine forte (ideal para RPs)."}
                      {sType === "even" && "Mantenha o mesmo ritmo do início ao fim (ideal para controle total)."}
                      {sType === "positive" && "Comece rápido e controle a queda no final (Estratégia agressiva)."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase italic tracking-widest text-muted-foreground">Distância (km)</Label>
                       <Input type="number" value={sDist} onChange={e => setSDist(e.target.value)} className="bg-black/30 h-16 font-black text-4xl border-border/40 focus:border-accent text-center rounded-2xl" />
                       <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "5K", val: "5" },
                            { label: "10K", val: "10" },
                            { label: "MEIA", val: "21.1" },
                            { label: "MARATONA", val: "42.2" }
                          ].map(d => (
                            <Button key={d.label} variant="secondary" className={cn("h-10 text-[10px] font-black rounded-xl transition-all", sDist === d.val ? "bg-primary text-black" : "bg-secondary/40")} onClick={() => setSDist(d.val)}>
                              {d.label}
                            </Button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase italic tracking-widest text-muted-foreground text-center block">Tempo Alvo</Label>
                       <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Input type="number" placeholder="H" value={sTimeH} onChange={e => setSTimeH(e.target.value)} className="bg-black/30 h-16 text-center font-black text-3xl rounded-2xl" />
                            <span className="text-[10px] block text-center font-bold opacity-40 uppercase">H</span>
                          </div>
                          <div className="space-y-1">
                            <Input type="number" placeholder="M" value={sTimeM} onChange={e => setSTimeM(e.target.value)} className="bg-black/30 h-16 text-center font-black text-3xl rounded-2xl" />
                            <span className="text-[10px] block text-center font-bold opacity-40 uppercase">Min</span>
                          </div>
                          <div className="space-y-1">
                            <Input type="number" placeholder="S" value={sTimeS} onChange={e => setSTimeS(e.target.value)} className="bg-black/30 h-16 text-center font-black text-3xl rounded-2xl" />
                            <span className="text-[10px] block text-center font-bold opacity-40 uppercase">Seg</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <Button className="w-full h-16 bg-primary text-black font-black uppercase italic tracking-[0.2em] text-xl shadow-2xl shadow-primary/20 rounded-2xl hover:scale-[1.01] active:scale-[0.98] transition-all" onClick={calcStrategyAction}>Gerar Estratégia</Button>

                  {sResult && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                       <div className="p-8 rounded-3xl bg-secondary/20 border border-primary/20 relative shadow-2xl overflow-hidden">
                          <div className="absolute -top-10 -right-10 size-40 bg-primary/5 blur-3xl rounded-full" />
                          <Button variant="ghost" size="icon" className="absolute top-6 right-6 text-muted-foreground hover:text-primary transition-colors" onClick={() => copyToClipboard(`Estratégia ${sType.toUpperCase()} - Pace Médio: ${sResult.avgPace}\nDistância: ${sDist}km`, "Plano Completo")}>
                            <Copy size={20} />
                          </Button>
                          <h3 className="text-center font-black uppercase italic text-lg mb-8 tracking-widest">Ritmo Médio Alvo: <span className="text-primary text-3xl ml-2">{sResult.avgPace} <small className="text-sm">min/km</small></span></h3>
                          <div className="space-y-6">
                             {sResult.segments.map((seg: any, i: number) => (
                               <div key={i} className="flex justify-between items-center border-b border-border/10 pb-5 last:border-0 last:pb-0">
                                  <div className="space-y-1">
                                    <div className="text-sm font-black text-white italic uppercase tracking-wider">{seg.label}</div>
                                    <div className="text-[11px] text-muted-foreground font-medium max-w-[200px] leading-tight">{seg.desc}</div>
                                  </div>
                                  <div className="text-primary font-black italic text-2xl tracking-tighter">{seg.pace}</div>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="text-xs font-black uppercase italic text-primary tracking-[0.2em] flex items-center gap-2 px-1">
                            <IterationCcw size={16} /> Checkpoints por Quilômetro
                          </div>
                          <div className="rounded-3xl border border-border/30 bg-black/20 overflow-hidden shadow-2xl">
                             <div className="grid grid-cols-3 p-5 bg-secondary/40 text-[10px] font-black text-muted-foreground uppercase italic border-b border-border/20 tracking-widest">
                                <span>KM</span>
                                <span className="text-center">Passagem</span>
                                <span className="text-right">Ritmo do Trecho</span>
                             </div>
                             <div className="divide-y divide-border/10 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {sResult.splits.map((split: any, idx: number) => (
                                  <div key={idx} className={cn("grid grid-cols-3 p-5 hover:bg-white/5 transition-colors items-center", idx === sResult.splits.length -1 && "bg-primary/10 border-t border-primary/30")}>
                                     <span className="text-sm font-bold text-white italic">{split.km}</span>
                                     <span className="text-center text-primary font-black italic text-lg">{split.time}</span>
                                     <span className="text-right text-[11px] text-muted-foreground italic font-bold">{split.pace}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-8">
                {/* PREVISÃO */}
                <Card className="bg-card/40 border-border/50 rounded-2xl shadow-xl">
                  <CardHeader className="bg-secondary/10 border-b border-border/20 py-5 px-6">
                    <CardTitle className="text-[11px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                      <IterationCcw className="size-4" /> Previsão de Prova (Riegel)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 px-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest opacity-70">Distância Ref. (km)</Label>
                          <Input type="number" value={prDist} onChange={e => setPRDist(e.target.value)} className="bg-black/20 h-12 font-black text-lg rounded-xl text-center" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest opacity-70">Tempo Ref.</Label>
                          <div className="flex gap-1.5">
                            <Input type="number" placeholder="M" value={prTimeM} onChange={e => setPRTimeM(e.target.value)} className="bg-black/20 h-12 text-center px-1 font-black rounded-xl flex-1" />
                            <Input type="number" placeholder="S" value={prTimeS} onChange={e => setPRTimeS(e.target.value)} className="bg-black/20 h-12 text-center px-1 font-black rounded-xl flex-1" />
                          </div>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full h-12 text-[11px] border-primary/30 text-primary font-black uppercase italic tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all" onClick={calcPredictorAction}>Simular Projeções</Button>
                    {prRes && (
                      <div className="space-y-3 border-t border-border/20 pt-6 animate-in zoom-in-95">
                        {prRes.map(r => (
                          <div key={r.dist} className="flex justify-between items-center p-4 rounded-2xl bg-black/30 border border-border/20 hover:border-primary/20 transition-all">
                            <span className="text-xs font-black uppercase italic text-muted-foreground tracking-tighter">{r.dist}</span>
                            <div className="text-right">
                               <div className="text-lg font-black text-white italic leading-none">{r.time}</div>
                               <div className="text-[10px] text-primary italic font-bold mt-1 tracking-widest">{r.pace} min/km</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* HIDRATAÇÃO */}
                <Card className="bg-card/40 border-border/50 rounded-2xl shadow-xl">
                  <CardHeader className="bg-secondary/10 border-b border-border/20 py-5 px-6">
                    <CardTitle className="text-[11px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                      <Droplets className="size-4" /> Plano de Nutrição & Hidratação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 px-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest opacity-70">Peso (kg)</Label>
                          <Input type="number" value={hWeight} onChange={e => setHWeight(e.target.value)} className="bg-black/20 h-12 font-black text-lg rounded-xl text-center" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest opacity-70">Duração (H/M)</Label>
                          <div className="flex gap-1.5">
                            <Input type="number" placeholder="H" value={hDurH} onChange={e => setHDurH(e.target.value)} className="bg-black/20 h-12 text-center px-1 font-black rounded-xl flex-1" />
                            <Input type="number" placeholder="M" value={hDurM} onChange={e => setHDurM(e.target.value)} className="bg-black/20 h-12 text-center px-1 font-black rounded-xl flex-1" />
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest opacity-70">Clima</Label>
                          <Select value={hClimate} onValueChange={setHClimate}>
                             <SelectTrigger className="h-12 text-xs bg-black/20 font-black rounded-xl border-border/40"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-card border-border">
                               <SelectItem value="0.8">Frio</SelectItem>
                               <SelectItem value="1.0">Moderado</SelectItem>
                               <SelectItem value="1.25">Quente</SelectItem>
                               <SelectItem value="1.5">Extremo</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-bold uppercase tracking-widest opacity-70">Intensidade</Label>
                          <Select value={hInt} onValueChange={setHInt}>
                             <SelectTrigger className="h-12 text-xs bg-black/20 font-black rounded-xl border-border/40"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-card border-border">
                               <SelectItem value="0.8">Leve (Z2)</SelectItem>
                               <SelectItem value="1.0">Moderado (Z3)</SelectItem>
                               <SelectItem value="1.2">Forte (Z4)</SelectItem>
                               <SelectItem value="1.4">Máximo (Z5)</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full h-12 text-[11px] border-primary/30 text-primary font-black uppercase italic tracking-widest rounded-xl hover:bg-primary hover:text-black" onClick={calcHidraAction}>Calcular Planejamento</Button>
                    {hRes && (
                      <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95">
                         <div className="p-4 rounded-2xl bg-black/30 border border-border/20 text-center shadow-xl">
                            <div className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Total Líquido</div>
                            <div className="text-2xl font-black text-primary italic leading-none">{hRes.vol}ml</div>
                         </div>
                         <div className="p-4 rounded-2xl bg-black/30 border border-border/20 text-center shadow-xl">
                            <div className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Dose / 15min</div>
                            <div className="text-2xl font-black text-primary italic leading-none">{hRes.per15}ml</div>
                         </div>
                         <div className="col-span-2 p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3 shadow-inner">
                            <div className="flex items-center gap-3 text-xs mb-1 text-primary italic font-black uppercase tracking-widest">
                               <Zap size={16} className="text-yellow-500 fill-yellow-500" /> Nutrição Esportiva:
                            </div>
                            <div className="text-[11px] text-muted-foreground font-medium italic leading-relaxed space-y-2">
                               <p>• <strong className="text-white">Eletrólitos:</strong> {hRes.caps} cápsula(s) de 250mg de sódio.</p>
                               <p>• <strong className="text-white">Energia:</strong> ~{hRes.carb}g de carboidratos (aprox. {Math.max(1, Math.ceil(hRes.carb / 25))} géis).</p>
                            </div>
                         </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ZONAS FC */}
                <Card className="bg-card/40 border-border/50 rounded-2xl shadow-xl">
                  <CardHeader className="bg-secondary/10 border-b border-border/20 py-5 px-6">
                    <CardTitle className="text-[11px] font-black uppercase italic text-primary flex items-center gap-2 tracking-widest">
                      <Heart className="size-4" /> Zonas de Esforço (FC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 px-6 space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-tighter opacity-60">FC Máx</Label>
                          <Input type="number" value={fcMax} onChange={e => setFCMax(e.target.value)} className="bg-black/20 h-12 px-1 text-center font-black rounded-xl" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-tighter opacity-60">Repouso</Label>
                          <Input type="number" placeholder="Opc." value={fcRest} onChange={e => setFCRest(e.target.value)} className="bg-black/20 h-12 px-1 text-center font-black rounded-xl" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-tighter opacity-60">Limiar L2</Label>
                          <Input type="number" placeholder="L2" value={fcLthr} onChange={e => setFCLthr(e.target.value)} className="bg-black/20 h-12 px-1 text-center font-black rounded-xl" />
                       </div>
                    </div>
                    <Button variant="outline" className="w-full h-12 text-[11px] border-primary/30 text-primary font-black uppercase italic tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all" onClick={calcZonesAction}>Gerar Zonas</Button>
                    {fcZones && (
                      <div className="space-y-2 animate-in fade-in">
                        {fcZones.map(z => (
                          <div key={z.label} className="flex items-center justify-between p-3.5 rounded-2xl bg-black/20 text-[11px] border border-border/10 shadow-sm">
                             <div className="flex items-center gap-3">
                                <div className={cn("w-1.5 h-6 rounded-full", z.color)} />
                                <span className="font-black text-white uppercase italic tracking-tighter leading-none">{z.label}</span>
                             </div>
                             <span className="font-black text-primary tracking-widest">{z.range} <small className="font-normal opacity-50 text-[9px]">bpm</small></span>
                          </div>
                        ))}
                        <p className="text-[10px] text-muted-foreground italic mt-5 flex items-start gap-3 bg-secondary/30 p-4 rounded-2xl leading-relaxed">
                          <Info size={14} className="shrink-0 mt-0.5 text-primary" /> 
                          {fcLthr ? "Cálculo avançado baseado no Limiar de Lactato (Padrão Elite)." : "Cálculo baseado em percentual simples da FC Máxima."}
                        </p>
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
