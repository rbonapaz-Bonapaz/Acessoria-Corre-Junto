
# 🏃‍♂️ CorreJunto - Laboratório de Performance Atlética

O **CorreJunto** é um laboratório de elite para corredores e treinadores, unindo a ciência de Jack Daniels (VDOT) com a inteligência do Gemini 1.5 Flash.

## 🌐 Modelos de Uso

Existem duas formas principais de operar o sistema:

### 1. Modelo Assessoria (Híbrido)
Você utiliza um único login do Google para gerenciar múltiplos atletas.
- **Gestão Centralizada:** Você cria os perfis e vincula o e-mail do atleta.
- **Inteligência de Chaves (ECONOMIA):** O sistema prioriza a chave de API do atleta (se ele configurar uma). Caso o atleta não tenha chave, o sistema usa a **sua chave de treinador**. Isso evita que você sobrecarregue sua cota se muitos alunos estiverem ativos.
- **Acesso do Aluno:** O aluno loga com o Google dele e vê apenas o perfil que você vinculou.

### 2. Modelo Independente
Cada atleta possui sua própria conta Google e gerencia tudo de forma isolada.

## 🛠️ Configuração Técnica (CRÍTICO)

Para que a sincronização entre PC e Celular funcione, você **deve** realizar estes passos no seu Console do Firebase:

### 1. Ativar a Autenticação
1. Vá em **Build** > **Authentication** > Clique no botão **Começar (Get Started)**.
2. Na aba **Sign-in method**, ative o provedor **Google**.

### 2. Autorizar o Domínio (IMPORTANTE)
1. Ainda em **Authentication**, vá na aba **Settings** > **Authorized domains**.
2. Adicione o domínio: `acessoria-corre-junto.vercel.app`. Sem isso, o login no celular será bloqueado.

### 3. Firestore (Banco de Dados)
1. Vá em **Build** > **Firestore Database** > **Create Database**.
2. Escolha uma localização (ex: `southamerica-east1`) e inicie em **Modo de Teste**.

## 🔐 Segurança e IA
- Sua **Gemini API Key** é salva de forma privada no seu banco de dados Firebase.
- O sistema é inteligente: se o atleta colocar a chave dele, a sua é preservada.
- Seus dados não são compartilhados com outros usuários. Cada login Google possui seu próprio banco de dados isolado.

---
*Transformando dados brutos em recordes pessoais.*
