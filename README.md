
# 🏃‍♂️ CorreJunto - Performance Atlética de Elite

O **CorreJunto** é um laboratório de performance para corredores, combinando a ciência clássica do esporte (Jack Daniels, VDOT) com inteligência artificial de última geração (Gemini 1.5 Flash).

## 🌐 Links de Acesso

- **🚀 Site Oficial:** [https://acessoria-corre-junto.vercel.app/](https://acessoria-corre-junto.vercel.app/)
- **📦 Repositório GitHub:** [https://github.com/rbonapaz-Bonapaz/Acessoria-Corre-Junto](https://github.com/rbonapaz-Bonapaz/Acessoria-Corre-Junto)

## 🛠️ Configuração do Firebase (CRÍTICO PARA SINCRONIZAÇÃO)

Para que o login e a sincronização funcionem, você precisa realizar estes dois passos no [Console do Firebase](https://console.firebase.google.com/):

### 1. Ativar a Autenticação (Resolve erro de API)
1. No menu à esquerda, clique em **Build** > **Authentication**.
2. Clique no botão **Get Started** (Começar).
3. Na aba **Sign-in method**, ative o provedor **Google**.

### 2. Autorizar o Domínio (Resolve erro de Login)
1. Ainda em **Authentication**, clique na aba **Settings** (Configurações) no topo.
2. No menu lateral, clique em **Authorized Domains** (Domínios autorizados).
3. Clique em **Add Domain** e adicione: `acessoria-corre-junto.vercel.app`.

**Nota:** Após ativar, aguarde cerca de 2 a 5 minutos para que o Google propague as permissões.

## 🚀 Funcionalidades de Elite

- **Sincronização Nuvem:** Seus atletas e treinos sincronizados em tempo real entre PC e Celular via Firestore.
- **Motor de Periodização IA:** Geração de ciclos completos baseados no seu VDOT.
- **Coach Contextual:** Treinador de IA pronto para ajustar treinos ou analisar fotos do Strava/Garmin.
- **Calculadoras Calibradas:** Pace, Riegel, Zonas de FC (L2) e Nutrição.

---
*Desenvolvido para atletas que buscam transformar dados em performance.*
