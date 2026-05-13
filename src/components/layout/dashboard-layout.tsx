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
  LogOut,
  LogIn,
  Users
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
import { useUser, useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
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
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [showKeyModal, setShowKeyModal] = React.useState(false);
  const [tempKey, setTempKey] = React.useState("");

  React.useEffect(() => {
    // Se o usuário não tem chave e não está logado, ou se é um novo atleta
    // Mas por enquanto, mostramos apenas se ele quiser ativar sua própria IA
    if (context?.isHydrated && !context.apiKey) {
      // Opcional: mostrar modal automaticamente
    }
  }, [context?.isHydrated, context?.apiKey]);

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      context?.setApiKey(tempKey.trim());
      setShowKeyModal(false);
      toast({ title: "Sua IA está ativa!", description: "O sistema agora usará sua própria cota do Google." });
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Sincronização Ativa!", description: "Baixando seus dados da nuvem..." });
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({ variant: "destructive", title: "Erro de Login", description: error.message });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Sessão Encerrada", description: "Você está agora no Modo Local." });
      router.push('/');
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao sair" });
    }
  };

  const handleSwitchProfile = () => {
    context?.switchProfile(null); 
    router.push('/');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar collapsible="icon" className="border-r border-border/50">
          <SidebarHeader className="py-8 px-6">
            <div className="flex items-center gap-2">
              <span className="font-headline font-black text-2xl tracking-tighter group-data-[collapsible=icon]:hidden italic text-white">
                CORRE<span className="text-primary">JUNTO</span>
              </span>
            </div>
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
            {!user ? (
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full text-primary hover:bg-primary/10 h-12 bg-primary/5 border border-primary/20" onClick={handleLogin}>
                  <LogIn className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden font-headline font-black text-[10px] tracking-widest uppercase italic">Entrar / Sincronizar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full text-muted-foreground hover:text-white" onClick={() => setShowKeyModal(true)}>
                  <Key className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden font-headline font-bold text-[11px] tracking-wider uppercase">Minha Chave IA</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sticky top-0 bg-background/80 backdrop-blur-md z-30 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-white" />
              <div className="font-headline font-black text-lg uppercase italic tracking-tighter hidden md:flex items-center gap-3">
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
                          {user ? user.displayName : (context?.activeProfile?.name || 'ATLETA')}
                        </p>
                        <ChevronDown size={12} className="text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                      </div>
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-tighter",
                        user ? "text-primary" : "text-destructive"
                      )}>
                        {user ? 'Sincronizado' : 'Modo Local'}
                      </p>
                    </div>
                    <div className={cn(
                      "size-9 rounded-full flex items-center justify-center font-headline font-black text-black shadow-lg shrink-0",
                      user ? "bg-primary shadow-primary/20" : "bg-destructive shadow-destructive/20"
                    )}>
                      {(user?.displayName?.[0] || context?.activeProfile?.name?.[0] || 'A')}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card border-border p-2 rounded-2xl shadow-2xl mt-2">
                  <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Gerenciamento
                  </DropdownMenuLabel>
                  
                  {!user && (
                    <DropdownMenuItem onClick={handleLogin} className="p-3 focus:bg-primary/10 text-primary cursor-pointer rounded-xl group transition-all">
                      <LogIn size={18} className="text-primary" />
                      <span className="font-headline font-black text-xs uppercase italic tracking-wider">Entrar no Google</span>
                    </DropdownMenuItem>
                  )}

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
                    className="p-3 focus:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer rounded-xl group transition-all"
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
              Por padrão, usamos a inteligência da sua assessoria. Se quiser usar sua própria cota gratuita do Google, insira sua chave abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Obtenha sua chave gratuita no <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-accent underline font-bold">Google AI Studio</a>.
              </p>
              <Input
                placeholder="Cole sua API Key aqui..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="bg-secondary/50 border-border h-12 font-mono text-sm rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveKey} className="w-full font-black uppercase tracking-widest bg-primary text-black h-12 rounded-xl">Ativar Minha Chave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
