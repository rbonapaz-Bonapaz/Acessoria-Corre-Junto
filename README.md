
# 🏃‍♂️ CorreJunto - Laboratório de Performance Atlética

O **CorreJunto** é um laboratório de elite para corredores e treinadores, unindo a ciência de Jack Daniels (VDOT) com a inteligência do Gemini 1.5 Flash.

## 🛠️ RESOLUÇÃO DE PROBLEMAS (CRÍTICO)

Se você estiver recebendo o erro **"Configuração Necessária"** ou **"API em Ativação"**, siga rigorosamente estes passos no Console do Firebase:

### 1. Ativar o Motor de Autenticação
1. Vá em **Build** > **Authentication**.
2. Se aparecer um botão azul **"Get Started" (Começar)**, clique nele. **Mesmo que você já tenha clicado antes, clique novamente se ele aparecer.**
3. Na aba **Sign-in method**, clique em **Add new provider** e escolha **Google**. Ative e salve.

### 2. E-mail de Suporte (PASSO ESQUECIDO)
1. Vá na **Engrenagem (Configurações do Projeto)** no topo do menu lateral esquerdo > **Project Settings**.
2. Na aba **General**, procure pelo campo **Support email**.
3. **Selecione seu e-mail da lista.** Sem isso, o Google não permite o login.

### 3. Autorizar o Domínio
1. Volte em **Authentication** > aba **Settings** > **Authorized domains**.
2. Clique em **Add domain** e adicione: `acessoria-corre-junto.vercel.app`.

### 4. Firestore (Banco de Dados)
1. Vá em **Build** > **Firestore Database** > **Create Database**.
2. Escolha uma localização (ex: `southamerica-east1`) e inicie em **Modo de Teste**.

---

## 🌐 Modelos de Uso

### 1. Modelo Assessoria (Híbrido)
Você utiliza um único login do Google para gerenciar múltiplos atletas.
- **Gestão Centralizada:** Você cria os perfis e vincula o e-mail do atleta (na aba Vínculo do Perfil).
- **Inteligência de Chaves:** O sistema prioriza a chave de API do atleta. Se ele não tiver, usa a **sua chave de treinador**.
- **Acesso do Aluno:** O aluno loga com o Google dele e vê apenas o perfil que você vinculou. Você continua tendo acesso total aos dados dele.

### 2. Modelo Independente
Cada atleta possui sua própria conta Google e gerencia tudo de forma isolada com sua própria chave de API.

---
*Transformando dados brutos em recordes pessoais.*
