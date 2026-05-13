
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  User, 
  Activity, 
  MessageSquare, 
  Trophy, 
  Calculator,
  ChevronDown,
  BookOpen,
  Target,
  Key,
  Link2,
  Info,
  Users,
  AlertCircle,
  LogOut
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
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { AppContext } from "@/contexts/AppContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";

const items = [
  { title: "DASHBOARD", url: "/", icon: LayoutDashboard },
  { title: "MEU PLANO", url: "/training", icon: Target },
  { title: "EVOLUÇÃO", url: "/analysis", icon: Activity },
  { title: "CONQUISTAS", url: "/vault", icon: Trophy },
  { title: "COACH IA", url: "/coach", icon: MessageSquare },
  { title: "CALCULADORAS", url: "/calculators", icon: Calculator },
  { title: "DICIONÁRIO", url: "/dictionary", icon: BookOpen },
  { title: "INTEGRAÇÕES", url: "/integrations", icon: Link2 },
  { title: "MEU PERFIL", url: "/profile", icon: User },
  { title: "SOBRE", url: "/about", icon: Info },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const context = React.useContext(AppContext);
  const { toast } = useToast();
  const [showKeyModal, setShowKeyModal] = React.useState(false);
  const [tempKey, setTempKey] = React.useState("");

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      context?.setApiKey(tempKey.trim());
      setShowKeyModal(false);
      toast({ title: "Sua IA está ativa!", description: "O sistema agora usará sua própria cota do Google." });
    }
  };

  const handleSwitchProfile = () => {
    context?.switchProfile(null); 
    router.push('/');
  };

  const handleLogout = () => {
    // No modo local, apenas limpa a sessão visual
    context?.switchProfile(null);
    router.push('/');
    toast({ title: "Sessão encerrada" });
  };

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
                          pathname === item.url ? "bg-secondary/50 text-white" : "text-muted-foreground hover:text-white"
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
                  "w-full h-12 border transition-all",
                  context?.apiKey ? "text-primary border-primary/20 bg-primary/5" : "text-muted-foreground border-border/20"
                )} 
                onClick={() => setShowKeyModal(true)}
              >
                <Key className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden font-headline font-bold text-[11px] tracking-wider uppercase">
                  {context?.apiKey ? "IA Ativa" : "Configurar IA"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-white" />
              <div className="font-headline font-black text-sm uppercase italic tracking-tighter">
                <span className="text-white">
                   {items.find(i => i.url === pathname)?.title || "PORTAL"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 pl-4 outline-none group text-right">
                    <div className="text-right hidden md:block leading-none">
                      <div className="flex items-center justify-end gap-2">
                        <p className="text-[10px] font-black text-white tracking-widest uppercase italic truncate max-w-[150px]">
                          {context?.activeProfile?.name || 'USUÁRIO LOCAL'}
                        </p>
                        <ChevronDown size={12} className="text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-tighter text-accent">Modo Local</p>
                    </div>
                    <div className="size-9 rounded-full flex items-center justify-center font-headline font-black text-black bg-primary shadow-lg shadow-primary/20 shrink-0">
                      {(context?.activeProfile?.name?.[0] || 'L')}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card border-border p-2 rounded-2xl shadow-2xl mt-2">
                  <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Local-First Browser
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem asChild className="p-3 focus:bg-primary/10 focus:text-primary cursor-pointer rounded-xl group transition-all">
                    <Link href="/profile" className="flex items-center gap-3">
                      <User size={18} className="text-muted-foreground group-focus:text-primary transition-colors" />
                      <span className="font-headline font-black text-xs uppercase italic tracking-wider">Meus Dados</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="p-3 focus:bg-primary/10 focus:text-primary cursor-pointer rounded-xl group transition-all"
                    onClick={handleSwitchProfile}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-muted-foreground group-focus:text-primary transition-colors" />
                      <span className="font-headline font-black text-xs uppercase italic tracking-wider">Trocar Atleta</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/20" />
                  
                  <DropdownMenuItem 
                    className="p-3 focus:bg-destructive/10 text-destructive cursor-pointer rounded-xl group transition-all"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={18} className="text-destructive" />
                      <span className="font-headline font-black text-xs uppercase italic tracking-wider">Sair</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-16">
            {children}
          </main>
        </SidebarInset>
      </div>

      <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline italic font-black uppercase">Sua Chave Gemini</DialogTitle>
            <DialogDescription>
              Insira sua API Key do Google para processar seus treinos localmente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3 items-start">
                <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  Obtenha sua chave gratuita no <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary underline font-bold">Google AI Studio</a>. Seus dados permanecem apenas neste navegador.
                </p>
              </div>
              <Input
                placeholder="Cole sua API Key aqui..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="bg-secondary/50 border-border h-12 font-mono text-sm rounded-xl focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveKey} className="w-full font-black uppercase tracking-widest bg-primary text-black h-12 rounded-xl">Ativar Inteligência</Button>
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
      <div className="font-headline font-black text-2xl italic tracking-tighter">
        <span className="text-white">C</span>
        <span className="text-primary">J</span>
      </div>
    );
  }

  return (
    <div className="font-headline font-black text-2xl italic tracking-tighter flex items-center gap-2">
      <span className="text-white">CORREJUNTO</span>
    </div>
  );
}
