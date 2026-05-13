
'use client';

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { chatWithAICoach } from "@/ai/flows/chat-with-ai-coach";
import { AppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Paperclip,
  X,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, fileToDataURI } from "@/lib/utils";
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, query, orderBy, serverTimestamp, deleteDoc, getDocs } from "firebase/firestore";

type Message = {
  id?: string;
  role: "user" | "model";
  parts: string;
  image?: string;
  createdAt?: any;
};

export default function CoachPage() {
  const context = React.useContext(AppContext);
  const db = useFirestore();
  const { toast } = useToast();
  const profile = context?.activeProfile;
  const plan = context?.trainingPlan;

  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [attachedImage, setAttachedImage] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Busca histórico de chat do Firestore
  const chatHistoryQuery = React.useMemo(() => {
    if (!profile) return null;
    return query(
      collection(db, 'athletes', profile.id, 'chat_history'),
      orderBy('createdAt', 'asc')
    );
  }, [db, profile]);

  const { data: messages = [] } = useCollection<Message>(chatHistoryQuery);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copiado!", description: "Mensagem salva na área de transferência." });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uri = await fileToDataURI(file);
      setAttachedImage(uri);
    }
  };

  const handleClearHistory = async () => {
    if (!profile) return;
    const q = query(collection(db, 'athletes', profile.id, 'chat_history'));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    toast({ title: "Histórico Limpo", description: "Sua conversa foi reiniciada." });
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || loading || !profile) return;

    if (!context?.apiKey) {
      toast({ variant: "destructive", title: "IA Desativada", description: "Configure sua Gemini API Key no menu lateral." });
      return;
    }

    const currentInput = input;
    const currentImage = attachedImage;
    
    setInput("");
    setAttachedImage(null);
    setLoading(true);

    try {
      // Salva mensagem do usuário no Firestore
      const chatRef = collection(db, 'athletes', profile.id, 'chat_history');
      await addDoc(chatRef, {
        role: "user",
        parts: currentInput,
        image: currentImage || null,
        createdAt: serverTimestamp()
      });

      const workoutHistoryContext = `Perfil: ${profile.name}. Peso: ${profile.currentWeight}kg. Pace T: ${profile.thresholdPace}. FC Limiar: ${profile.thresholdHr}bpm.`;
      const planContext = plan ? `Atualmente no bloco ${plan.blockType}. Objetivo: ${profile.raceDistance} em ${profile.raceDate}.` : "Sem plano ativo no momento.";

      const response = await chatWithAICoach({
        apiKey: context.apiKey,
        conversationHistory: messages.map(m => ({ role: m.role, parts: m.parts })),
        workoutHistory: workoutHistoryContext,
        trainingPlan: planContext,
        imageDataUri: currentImage || undefined
      });

      // Salva resposta da IA no Firestore
      await addDoc(chatRef, {
        role: "model",
        parts: response.feedback,
        createdAt: serverTimestamp()
      });

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
        <div className="flex justify-between items-center">
          <div className="text-left space-y-2">
            <h1 className="font-headline text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
              GEMINI <span className="text-primary">COACH</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg font-medium">
              Assessoria técnica sincronizada na nuvem.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearHistory} className="text-destructive hover:bg-destructive/10 border-destructive/20 gap-2 font-black italic uppercase text-[10px] h-10 px-4 rounded-xl">
            <Trash2 size={14} /> Limpar Conversa
          </Button>
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
              className="py-4 font-headline font-black text-xs md:text-sm uppercase italic gap-2 data-[state=active]:bg-primary data-[state=active]:text-black transition-all rounded-xl"
            >
              <History className="size-4" /> Histórico Completo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversar" className="mt-0 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-card/40 border-border/50 flex flex-col h-[600px] overflow-hidden rounded-3xl shadow-2xl relative">
              <CardContent className="flex-1 p-0 overflow-hidden relative">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="size-16 rounded-3xl bg-secondary/50 flex items-center justify-center border border-border/50 text-muted-foreground">
                      <MessageSquare className="size-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-headline font-black text-xl uppercase italic text-white tracking-widest">INICIE A CONVERSA</h3>
                      <p className="text-muted-foreground text-xs font-medium max-w-xs mx-auto italic leading-relaxed">
                        Tire dúvidas técnicas ou peça ajustes no seu cronograma. Seus dados estão sincronizados entre todos os seus dispositivos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-full p-8" ref={scrollRef}>
                    <div className="space-y-10">
                      {messages.map((msg, i) => (
                        <div 
                          key={msg.id || i} 
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
                            {msg.image && (
                              <div className="mb-4 rounded-xl overflow-hidden border border-white/20">
                                <img src={msg.image} alt="Anexo" className="w-full h-auto max-h-60 object-contain" />
                              </div>
                            )}
                            {msg.parts}
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleCopy(msg.parts, msg.id || String(i))}
                              className={cn(
                                "absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity size-8 text-muted-foreground hover:text-primary",
                                msg.role === 'user' ? "left-0" : "right-0"
                              )}
                            >
                              {copiedId === (msg.id || String(i)) ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
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
                            <span className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">O Coach está analisando...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>

              <CardFooter className="p-6 border-t border-border/20 bg-secondary/10 flex-col gap-4">
                {attachedImage && (
                  <div className="w-full flex items-center gap-3 p-2 bg-secondary/50 border border-primary/30 rounded-xl animate-in slide-in-from-bottom-2">
                    <div className="size-12 rounded-lg overflow-hidden border border-border">
                      <img src={attachedImage} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-black uppercase text-primary italic">IMAGEM ANEXADA</p>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => setAttachedImage(null)}><X className="size-4" /></Button>
                  </div>
                )}
                
                <div className="flex w-full gap-4 items-center">
                  <div className="flex-1 relative">
                    <Input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Peça ajustes no plano ou envie um feedback..."
                      className="bg-black/30 border-border/50 h-16 px-6 pr-24 rounded-2xl focus-visible:ring-primary font-medium text-white italic border-2"
                    />
                    <div className="absolute right-3 top-3 flex gap-2">
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="size-10 text-muted-foreground hover:text-primary rounded-xl"><Paperclip className="size-5" /></Button>
                      <Button onClick={handleSend} disabled={loading || (!input.trim() && !attachedImage)} size="icon" className="size-10 bg-primary hover:bg-primary/90 rounded-xl text-black"><Send className="size-5" /></Button>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="mt-0">
            <Card className="bg-card/40 border-border/50 rounded-3xl p-8 space-y-6">
              <h3 className="font-headline font-black text-xl uppercase italic text-white tracking-widest">LINHA DO TEMPO</h3>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Nenhum histórico disponível para este atleta.</p>
                ) : (
                  messages.filter(m => m.role === 'model').map((msg, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-secondary/20 border border-border/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase">Coach Feedback</Badge>
                        <span className="text-[9px] text-muted-foreground italic">
                          {msg.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'Recentemente'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic line-clamp-3">{msg.parts}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
