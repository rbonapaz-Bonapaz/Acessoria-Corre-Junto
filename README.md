
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

Se o erro de login persistir no celular, siga estes passos EXATOS no seu Console do Firebase:

### 1. Ativar o Provedor Google
1. No menu à esquerda, clique em **Build** > **Authentication**.
2. Clique na aba **Método de login** (no topo).
3. Clique em **Adicionar novo provedor**.
4. Escolha **Google**, ative a chave e selecione um e-mail de suporte. Clique em **Salvar**.

### 2. Autorizar o Domínio (Resolve o erro no Celular)
1. Ainda em **Authentication**, clique na aba **Configurações** (no topo).
2. No menu lateral da esquerda (dentro da área branca), clique em **Domínios autorizados**.
3. Clique em **Adicionar domínio** e adicione exatamente: `acessoria-corre-junto.vercel.app`.

### 3. Firestore Database (Onde ficam os dados)
1. No menu principal à esquerda, clique em **Build** > **Firestore Database**.
2. Se não houver um banco, clique em **Criar banco de dados**.
3. Escolha uma localização (ex: `southamerica-east1` para o Brasil) e inicie em **Modo de Teste**.

**Nota:** Após estas ativações, o Google leva cerca de **2 a 5 minutos** para propagar as permissões. Se o erro "Identity Toolkit API" aparecer, aguarde um pouco e tente logar novamente.

---
*Desenvolvido para atletas que buscam transformar dados em performance.*
