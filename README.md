
# 🏃‍♂️ CorreJunto - Laboratório de Performance Atlética

O **CorreJunto** é um laboratório de elite para corredores e treinadores, unindo a ciência de Jack Daniels (VDOT) com a inteligência do Gemini 1.5 Flash.

## 🛠️ RESOLUÇÃO DE PROBLEMAS (PASSO A PASSO FINAL)

Se você vir o erro **"API em Ativação"**, siga esta ordem exata:

### 1. Verificar a Chave (Configuração do Projeto)
1. No Console do Firebase, clique na **Engrenagem (Configurações do Projeto)**.
2. Na aba **Geral**, role até o final em **Seus aplicativos**.
3. Copie o objeto `firebaseConfig` que aparece lá.
4. **IMPORTANTE:** O seu `messagingSenderId` no console deve ser o mesmo que o `Número do projeto` (654958868324). Se no código estiver diferente, o login nunca funcionará.

### 2. Autorizar o Domínio
1. Vá em **Build** > **Authentication** > aba **Settings** > **Authorized domains**.
2. Adicione o domínio: `acessoria-corre-junto.vercel.app`.

### 3. Ativar a API manualmente (Se nada funcionar)
1. Se o erro persistir por mais de 10 minutos, acesse este link (substituindo pelo seu ID do projeto):
   `https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=SEU-PROJECT-ID`
2. Clique em **Ativar**.

---

## 🌐 Modelos de Uso

### 1. Modelo Assessoria (Híbrido)
Você utiliza um único login do Google para gerenciar múltiplos atletas.
- **Gestão Centralizada:** Você cria os perfis e vincula o e-mail do atleta (na aba Vínculo do Perfil).
- **Inteligência de Chaves:** O sistema prioriza a chave de API do atleta. Se ele não tiver, usa a **sua chave de treinador**.

### 2. Modelo Independente
Cada atleta possui sua própria conta Google e gerencia tudo de forma isolada com sua própria chave de API.

---
*Transformando dados brutos em recordes pessoais.*
