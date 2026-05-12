
# 🏃‍♂️ CorreJunto - Performance Atlética de Elite

O **CorreJunto** é um laboratório de performance para corredores, combinando a ciência clássica do esporte (Jack Daniels, VDOT) com inteligência artificial de última geração (Gemini 1.5 Flash).

## 🌐 Links de Acesso

- **🚀 Site Oficial:** [https://acessoria-corre-junto.vercel.app/](https://acessoria-corre-junto.vercel.app/)
- **📦 Repositório GitHub:** [https://github.com/rbonapaz-Bonapaz/Acessoria-Corre-Junto](https://github.com/rbonapaz-Bonapaz/Acessoria-Corre-Junto)

## 🔐 Autenticação e Sincronização (Multi-Usuário)

O app suporta **qualquer conta Google**. 
- **Privacidade:** Cada e-mail possui seu próprio banco de dados privado. Os perfis e treinos criados em uma conta não são visíveis para outras contas.
- **Sincronização:** Para ver os mesmos dados no PC e no Celular, você **deve utilizar o mesmo e-mail** em ambos os dispositivos.

## 🛠️ Configuração do Firebase (CRÍTICO PARA SINCRONIZAÇÃO)

Para que o login e a sincronização funcionem entre PC e Celular, você deve realizar estes passos no [Console do Firebase](https://console.firebase.google.com/):

### 1. Ativar a Autenticação
1. No menu à esquerda, clique em **Build** > **Authentication**.
2. Clique no botão **Get Started** (Começar). Isso ativará as APIs necessárias (Identity Toolkit).
3. Na aba **Sign-in method**, ative o provedor **Google**.

### 2. Autorizar o Domínio (Resolve erro de Login)
1. Ainda em **Authentication**, clique na aba **Settings** (Configurações) no topo.
2. No menu lateral, clique em **Authorized Domains** (Domínios autorizados).
3. Clique em **Add Domain** e adicione exatamente: `acessoria-corre-junto.vercel.app`.

### 3. Firestore Database
1. Clique em **Build** > **Firestore Database**.
2. Clique em **Create Database** e siga as instruções. Escolha uma localização próxima (ex: `southamerica-east1` para o Brasil).

**Nota:** Após estas ativações, o Google pode levar de 2 a 5 minutos para propagar as permissões de API.

## 🚀 Funcionalidades de Elite

- **Sincronização Nuvem:** Seus atletas e treinos sincronizados em tempo real entre PC e Celular via Firestore.
- **Seletor de Perfil:** Escolha quem está treinando logo na abertura do app (Estilo Netflix).
- **Motor de Periodização IA:** Geração de ciclos completos baseados no seu VDOT e ciência de Jack Daniels.
- **Coach Contextual:** Treinador de IA (Gemini 1.5 Flash) pronto para ajustar treinos ou analisar fotos do Strava/Garmin.
- **Calculadoras Calibradas:** Pace, Riegel, Zonas de FC (L2) e Nutrição/Hidratação.

---
*Desenvolvido para atletas que buscam transformar dados em performance.*
