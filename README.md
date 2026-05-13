
# 🏃‍♂️ CorreJunto - Laboratório de Performance Atlética

O **CorreJunto** é um laboratório de elite para corredores e treinadores, unindo a ciência de Jack Daniels (VDOT) com a inteligência do Gemini 1.5 Flash.

## 🌐 Modelos de Uso

Existem duas formas principais de operar o sistema:

### 1. Modelo Assessoria (Recomendado para Treinadores)
Você utiliza um único login do Google para gerenciar múltiplos atletas.
- **Vantagem:** Você usa apenas **uma chave de API Gemini** para todos os seus alunos.
- **Como fazer:** Logue com sua conta, vá em "Meus Dados" e use o botão "Trocar Atleta" para criar novas identidades. Todos os perfis criados aqui serão sincronizados na sua nuvem.
- **Acesso do Aluno:** O aluno pode ver os dados se você logar com sua conta no dispositivo dele, ou você pode exportar o **Backup JSON** do treino dele e enviar para ele importar no app dele.

### 2. Modelo Independente
Cada atleta possui sua própria conta Google.
- **Vantagem:** Privacidade total.
- **Configuração:** O atleta deve configurar sua própria chave de API Gemini no menu lateral.

## 🛠️ Configuração Técnica (CRÍTICO)

Para que a sincronização entre PC e Celular funcione, você **deve** realizar estes passos no seu Console do Firebase:

### 1. Ativar a Autenticação
1. Vá em **Build** > **Authentication** > **Get Started**.
2. Na aba **Sign-in method**, ative o provedor **Google**.

### 2. Autorizar o Domínio
1. Ainda em **Authentication**, vá na aba **Settings** > **Authorized domains**.
2. Adicione o domínio: `acessoria-corre-junto.vercel.app`.

### 3. Firestore (Banco de Dados)
1. Vá em **Build** > **Firestore Database** > **Create Database**.
2. Escolha uma localização (ex: `southamerica-east1`) e inicie em **Modo de Teste**.

## 🔐 Segurança e IA
- Sua **Gemini API Key** é salva de forma criptografada na sua conta privada do Firebase.
- Seus dados não são compartilhados com outros usuários. Cada login Google possui seu próprio banco de dados isolado.

---
*Transformando dados brutos em recordes pessoais.*
