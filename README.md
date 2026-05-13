
# 🏃‍♂️ CORRE JUNTO - Performance Atlética

Laboratório de performance para atletas operando em arquitetura **Cloud-First** via Firebase Firestore.

## 🚀 Como sincronizar e resolver erros de Login

### 1. Erro de Identidade (auth/identity-toolkit)
Se você ver o erro "Identity Toolkit API has not been used", siga estes passos:
1. Acesse o [Console do Google Cloud](https://console.cloud.google.com/).
2. Procure por **"Identity Toolkit API"** e clique em **ATIVAR**.
3. **IMPORTANTE:** Se o erro persistir, acesse o [Console do Firebase](https://console.firebase.google.com/), vá em **Authentication** e clique em **"Get Started"** (Começar).

### 2. Domínios Autorizados
Se o login falhar por domínio, adicione o endereço atual (URL do navegador) em:
**Firebase Console > Authentication > Settings > Authorized Domains**.

### 3. Sincronização Mobile
Para ver os mesmos dados no celular e PC:
1. Faça login com a **mesma conta Google** em ambos.
2. Certifique-se de que a API Key do Gemini está configurada.

## 📱 Funcionalidades
- **Assessoria na Nuvem:** Sincronização automática entre PC e Celular via Firestore.
- **Herança de IA:** Atleta usa própria chave API ou a do treinador como fallback automático.
- **Modelo Coach:** Treinador gerencia múltiplos atletas; Atletas acessam via e-mail do Google.
- **Análise PDF:** Gemini interpreta orientações de arquivos PDF e planos anteriores.

## 🎨 Branding
- **CORRE:** Branco
- **JUNTO:** Verde (Primary)
