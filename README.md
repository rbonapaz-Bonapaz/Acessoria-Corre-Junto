# 🏃‍♂️ CorreJunto - Laboratório de Performance Atlética

O **CorreJunto** é um laboratório de elite para corredores e treinadores, unindo a ciência de Jack Daniels (VDOT) com a inteligência do Gemini 1.5 Flash.

## 🛠️ RESOLUÇÃO DE PROBLEMAS (GUIA DEFINITIVO)

Se você vir o erro **"API em Ativação"** ou falha no login, siga esta ordem exata:

### 1. Verificar a Chave no Código (src/firebase/config.ts)
1. No Console do Firebase, clique na **Engrenagem (Configurações do Projeto)**.
2. Role até o final em **Seus aplicativos**.
3. Clique no ícone de código `</>` ou no nome do seu Web App.
4. Copie o objeto `firebaseConfig` e certifique-se de que ele é o mesmo que está no arquivo `src/firebase/config.ts`.
5. **DICA:** Se o `messagingSenderId` no código não for `654958868324`, o login não funcionará para o seu projeto atual.

### 2. Autorizar o Domínio e Ativar Google
1. Vá em **Build** > **Authentication** > aba **Settings** > **Authorized domains**.
2. Adicione: `acessoria-corre-junto.vercel.app`.
3. Vá na aba **Sign-in method**, clique em **Google**, ative e salve.

### 3. E-mail de Suporte (Obrigatório)
1. Nas **Configurações do Projeto (Geral)**, verifique se o campo **"E-mail de suporte ao público"** está preenchido com seu e-mail. Sem isso, o Google bloqueia o login.

---

## 🌐 Modelos de Uso

### 1. Modelo Assessoria (Recomendado)
Você utiliza um único login do Google para gerenciar múltiplos atletas.
- **Gestão Centralizada:** Você cria os perfis e vincula o e-mail do atleta (na aba Vínculo do Perfil).
- **Inteligência:** O sistema prioriza a chave de API do atleta. Se ele não tiver, usa a **sua chave de treinador**.

### 2. Modelo de Chave Híbrida
- Cada atleta pode colocar sua própria chave Gemini no menu lateral.
- Se eles fizerem isso, o processamento da IA não consome a sua cota.

---
*Transformando dados brutos em recordes pessoais.*
