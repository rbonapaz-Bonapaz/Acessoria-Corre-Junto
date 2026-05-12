"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { chatWithAICoach, type ChatWithAICoachOutput } from "@/ai/flows/chat-with-ai-coach";
import { AppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  MessageSquare,
  History,
  Copy,
  Check,
  BrainCircuit,
  Zap,
  Dna,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "model";
  parts: string;
};

export default function CoachPage() {
  const context = React.useContext(AppContext);
  const { toast } = useToast();
  const profile = context?.activeProfile;
  const plan = context?.trainingPlan;

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<number | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copiado!", description: "Mensagem salva na área de transferência." });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!context?.apiKey) {
      toast({ variant: "destructive", title: "IA Desativada", description: "Configure sua Gemini API Key no menu lateral." });
      return;
    }

    const userMessage: Message = { role: "user", parts: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const workoutHistoryContext = `Perfil: ${profile?.name || 'Atleta'}. Peso: ${profile?.currentWeight}kg. Pace T: ${profile?.thresholdPace}. FC Limiar: ${profile?.thresholdHr}bpm.`;
      const planContext = plan ? `Atualmente no bloco ${plan.blockType}. Objetivo: ${profile?.raceDistance} em ${profile?.raceDate}.` : "Sem plano ativo no momento.";

      const response = await chatWithAICoach({
        conversationHistory: [...messages, userMessage],
        workoutHistory: workoutHistoryContext,
        trainingPlan: planContext
      });

      setMessages(prev => [...prev, { role: "model", parts: response.feedback }]);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro na IA", description: "Não foi possível obter resposta do Coach." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
        {/* Cabeçalho do Coach */}
        <div className="text-center space-y-2">
          <h1 className="font-headline text-4xl md:text-5xl font-black uppercase italic italic tracking-tighter text-white">
            GEMINI <span className="text-primary">COACH</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">
            Sua assessoria técnica personalizada via inteligência artificial.
          </p>
        </div>

        <Tabs defaultValue="conversar" className="w-full space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/20 p-1.5 rounded-2xl h-auto gap-2">
            <TabsTrigger 
              value="conversar" 
              className="py-4 font-headline font-black text-xs md:text-sm uppercase italic gap-2 data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl"
            >
              <MessageSquare className="size-4" /> Conversar
            </TabsTrigger>
            <TabsTrigger 
              value="historico" 
              className="py-4 font-headline font-black text-xs md:text-sm uppercase italic gap-2 data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl opacity-60"
            >
              <History className="size-4" /> Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversar" className="mt-0 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-card/40 border-border/50 flex flex-col h-[550px] overflow-hidden rounded-3xl shadow-2xl relative">
              <CardContent className="flex-1 p-0 overflow-hidden relative">
                {messages.length === 0 ? (
                  /* Estado Vazio - Inicie a Conversa */
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="size-16 rounded-3xl bg-secondary/50 flex items-center justify-center border border-border/50 text-muted-foreground">
                      <MessageSquare className="size-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-headline font-black text-xl uppercase italic text-white tracking-widest">INICIE A CONVERSA</h3>
                      <p className="text-muted-foreground text-xs font-medium max-w-xs mx-auto italic leading-relaxed">
                        Tire dúvidas técnicas ou peça ajustes no seu plano de performance.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Chat Ativo */
                  <ScrollArea className="h-full p-8" ref={scrollRef}>
                    <div className="space-y-10">
                      {messages.map((msg, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-start gap-4 group",
                            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <Avatar className={cn(
                            "size-10 border-2",
                            msg.role === 'model' ? "border-primary bg-primary shadow-lg shadow-primary/10" : "border-border bg-secondary"
                          )}>
                            <AvatarFallback className="font-black">
                              {msg.role === 'model' ? <Bot className="size-6 text-black" /> : <User className="size-6 text-white" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "max-w-[80%] relative rounded-2xl p-5 text-sm leading-relaxed shadow-xl",
                            msg.role === 'user' 
                              ? "bg-primary text-black font-black italic rounded-tr-none" 
                              : "bg-black/30 border border-border/50 text-white italic rounded-tl-none"
                          )}>
                            {msg.parts}
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleCopy(msg.parts, i)}
                              className={cn(
                                "absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity size-8 text-muted-foreground hover:text-primary",
                                msg.role === 'user' ? "left-0" : "right-0"
                              )}
                            >
                              {copiedId === i ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex items-start gap-4 animate-pulse">
                          <Avatar className="size-10 border-2 border-primary bg-primary">
                            <AvatarFallback><Bot className="size-6 text-black" /></AvatarFallback>
                          </Avatar>
                          <div className="bg-black/30 border border-border/50 rounded-2xl rounded-tl-none p-5 flex items-center gap-3">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">Analisando contexto de elite...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>

              <CardFooter className="p-6 border-t border-border/20 bg-secondary/10">
                <div className="flex w-full gap-4 items-center">
                  <div className="flex-1 relative">
                    <Input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Pergunte ou cole histórico do Gemini..."
                      className="bg-black/30 border-border/50 h-16 px-6 pr-16 rounded-2xl focus-visible:ring-primary font-medium text-white italic placeholder:text-muted-foreground/50 border-2"
                    />
                    <Button 
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      size="icon" 
                      className="absolute right-3 top-3 size-10 bg-primary hover:bg-primary/90 rounded-xl text-black shadow-lg shadow-primary/20"
                    >
                      <Send className="size-5" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <div className="flex flex-wrap gap-3 justify-center pt-8">
              {[
                "Ajuste meu plano (estou cansado)",
                "Analise minha Cadência",
                "Explique o treino de Limiar",
                "Dica para Maratona"
              ].map(suggestion => (
                <Button 
                  key={suggestion} 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-secondary/30 text-[10px] font-black uppercase italic border-border/50 hover:bg-primary hover:text-black transition-all h-9 px-4"
                  onClick={() => setInput(suggestion)}
                >
                  <Sparkles className="mr-2 size-3 text-primary" /> {suggestion}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="historico" className="mt-0">
            <Card className="bg-card/40 border-border/50 rounded-3xl p-12 text-center border-2 border-dashed">
              <div className="space-y-4">
                 <History className="size-12 text-muted-foreground/30 mx-auto" />
                 <h3 className="font-headline font-black text-xl text-muted-foreground uppercase italic tracking-widest">Sem Histórico Salvo</h3>
                 <p className="text-sm text-muted-foreground/50 max-w-xs mx-auto">
                    Suas conversas técnicas de elite aparecerão aqui para consultas futuras.
                 </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}