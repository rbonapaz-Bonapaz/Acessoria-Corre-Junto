
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  User as UserIcon, 
  Activity, 
  MessageSquare, 
  Trophy, 
  Calculator,
  BookOpen,
  Target,
  Key,
  Link2,
  Info,
  Loader2,
  LogIn,
  LogOut,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarHeader, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { TrainingContext } from "@/contexts/TrainingContext";
import { useUser } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const items = [
  { title: "DASHBOARD", url: "/", icon: LayoutDashboard },
  { title: "MEU PLANO", url: "/training", icon: Target },
  { title: "EVOLUÇÃO", url: "/analysis", icon: Activity },
  { title: "CONQUISTAS", url: "/vault", icon: Trophy },
  { title: "COACH IA", url: "/coach", icon: MessageSquare },
  { title: "CALCULADORAS", url: "/calculators", icon: Calculator },
  { title: "DICIONÁRIO", url: "/dictionary", icon: BookOpen },
  { title: "INTEGRAÇÕES", url: "/integrations", icon: Link2 },
  { title: "PERFIL ATLETA", url: "/profile", icon: UserIcon },
  { title: "SOBRE", url: "/about", icon: Info },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const context = React.useContext(TrainingContext);
  const { user, loading: authLoading } = useUser();
  const [showKeyModal, setShowKeyModal] = React.useState(false);
  const [tempKey, setTempKey] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    if (context?.isHydrated && !context.apiKey && user) {
      setShowKeyModal(true);
    }
  }, [context?.isHydrated, context?.apiKey, user]);

  const handleSaveKey = () => {
    if (tempKey.trim() && context) {
      context.setApiKey(tempKey.trim());
      setShowKeyModal(false);
    }
  };

  if (!context?.isHydrated || authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="size-12 animate-spin text-primary" />
        <p className="font-headline font-black uppercase italic tracking-widest text-primary animate-pulse">Sincronizando Laboratório...</p>
      </div>
    );
  }

  // Gate de Autenticação
  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center space-y-8">
        <div className="font-headline font-black text-6xl italic tracking-tighter flex flex-col items-center leading-none">
          <span className="text-white">CORRE</span>
          <span className="text-primary">JUNTO</span>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-black uppercase italic text-white">Laboratório de Elite</h2>
          <p className="text-muted-foreground font-medium">Sincronize seus treinos, analise sua biomecânica e gere planos com IA em qualquer dispositivo.</p>
        </div>
        <Button 
          size="lg" 
          onClick={() => context?.login()} 
          className="bg-white text-black hover:bg-primary font-black uppercase tracking-widest h-16 px-10 rounded-2xl shadow-2xl transition-all hover:scale-105"
        >
          <LogIn className="mr-3 size-6" /> Entrar com Google
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar collapsible="icon" className="border-r border-border/50">
          <SidebarHeader className="py-8 px-4 flex items-center justify-center overflow-hidden">
            <LogoDisplay />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.url}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-200 h-10 px-6",
                          pathname === item.url ? "bg-primary text-black" : "text-muted-foreground hover:text-white"
                        )}
                      >
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span className="font-headline font-bold text-[11px] tracking-wider">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/20 space-y-2">
            <SidebarMenuItem>
              <SidebarMenuButton 
                className={cn(
                  "w-full h-12 border transition-all rounded-xl",
                  context?.apiKey ? "text-primary border-primary/20 bg-primary/5" : "text-muted-foreground border-border/20"
                )} 
                onClick={() => setShowKeyModal(true)}
              >
                <Key className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden font-headline font-bold text-[11px] tracking-wider uppercase">
                  {context?.apiKey ? "IA ATIVA" : "Configurar IA"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                className="w-full h-12 text-muted-foreground border border-border/20 rounded-xl hover:bg-destructive/10 hover:text-destructive" 
                onClick={() => context?.logout()}
              >
                <LogOut className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden font-headline font-bold text-[11px] tracking-wider uppercase">Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-white" />
              <div className="font-headline font-black text-lg uppercase italic tracking-tighter flex items-center gap-3">
                <span className="text-white">
                   {items.find(i => i.url === pathname)?.title || "PORTAL"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4">
                <div className="text-right hidden md:block leading-none">
                  <p className="text-[10px] font-black text-white tracking-widest uppercase italic">
                    {context?.activeProfile?.name || user?.displayName?.split(' ')[0] || 'ATLETA'}
                  </p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-tighter">Sincronizado</p>
                </div>
                <div className="size-9 rounded-full bg-primary flex items-center justify-center font-headline font-black text-black shadow-lg shadow-primary/20 overflow-hidden border-2 border-primary/20">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    context?.activeProfile?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-16">
            {children}
          </main>
        </SidebarInset>
      </div>

      <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline italic font-black uppercase">Configuração de IA</DialogTitle>
            <DialogDescription>
              Sua Gemini API Key será salva na nuvem para uso em todos os seus dispositivos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                1. Gere sua chave gratuita no <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-accent underline font-bold">Google AI Studio</a>.
                <br/>2. Cole abaixo.
              </p>
              <Input
                placeholder="Cole sua API Key aqui..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="bg-secondary/50 border-border h-14 font-mono text-sm rounded-xl focus:border-primary text-center"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveKey} className="w-full font-black uppercase tracking-widest bg-primary text-black h-16 rounded-2xl shadow-xl shadow-primary/20 text-lg italic">Ativar Inteligência</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

function LogoDisplay() {
  const { state } = useSidebar();
  
  if (state === "collapsed") {
    return (
      <div className="font-headline font-black text-2xl italic tracking-tighter flex flex-col items-center leading-none">
        <span className="text-white">C</span>
        <span className="text-primary">J</span>
      </div>
    );
  }

  return (
    <div className="font-headline font-black text-3xl italic tracking-tighter flex flex-col items-center leading-none">
      <span className="text-white">CORRE</span>
      <span className="text-primary">JUNTO</span>
    </div>
  );
}
