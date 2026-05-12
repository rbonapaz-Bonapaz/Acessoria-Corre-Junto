
# 🏃‍♂️ CorreJunto - Performance Atlética de Elite

O **CorreJunto** é um laboratório de performance para corredores, combinando a ciência clássica do esporte (Jack Daniels, VDOT) com inteligência artificial de última geração (Gemini 1.5 Flash).

## 🌐 Links de Acesso

- **🚀 Site Oficial:** [https://acessoria-corre-junto.vercel.app/](https://acessoria-corre-junto.vercel.app/)
- **📦 Repositório GitHub:** [https://github.com/rbonapaz-Bonapaz/Acessoria-Corre-Junto](https://github.com/rbonapaz-Bonapaz/Acessoria-Corre-Junto)

## 🛠️ Configuração do Firebase (CRÍTICO PARA SINCRONIZAÇÃO)

Para que o login e a sincronização entre PC e Celular funcionem, o Google exige que você autorize o domínio do seu site. Siga estes passos no seu console:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. No menu à esquerda, clique em **Build** (Construir) > **Authentication**.
3. Clique na aba **Settings** (Configurações) no topo da tela.
4. No menu lateral que aparecerá, clique em **Authorized Domains** (Domínios autorizados).
5. Clique em **Add Domain** (Adicionar domínio) e adicione: `acessoria-corre-junto.vercel.app`.

**Nota Importante:** Sem este passo, o login no celular será bloqueado com erro de "Domínio não autorizado".

## 🚀 Funcionalidades de Elite

- **Sincronização Nuvem:** Seus atletas e treinos sincronizados em tempo real entre PC e Celular via Firestore.
- **Motor de Periodização IA:** Geração de ciclos completos baseados no seu VDOT.
- **Coach Contextual:** Treinador de IA pronto para ajustar treinos ou analisar fotos do Strava/Garmin.
- **Laboratório Biomecânico:** Extração de métricas avançadas (Razão de Passada, Cadência, TCS).
- **Calculadoras Calibradas:** Pace, Riegel, Zonas de FC (L2) e Nutrição.

## 🏁 Como Iniciar o Desenvolvimento

1. Clone o repositório.
2. Instale as dependências: `npm install`.
3. Rode o ambiente de desenvolvimento: `npm run dev`.
4. Configure sua **Gemini API Key** no menu do App para ativar a inteligência.

---
*Desenvolvido para atletas que buscam transformar dados em performance.*
