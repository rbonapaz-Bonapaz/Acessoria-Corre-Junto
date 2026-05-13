
# 🏃‍♂️ CORRE JUNTO - Performance Atlética

Laboratório de performance para atletas operando em arquitetura **Cloud-First** via Firebase Firestore.

## 🚀 Como sincronizar e resolver erros de Login

### 1. Erro de Identidade (auth/identity-toolkit)
Se você ver o erro "Identity Toolkit API has not been used", siga estes passos:
1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Vá em **Authentication** e clique em **"Get Started"** (Começar).
3. Ative o provedor **Google**.
4. **IMPORTANTE:** Se o erro persistir, acesse o [Google Cloud Console](https://console.cloud.google.com/), selecione seu projeto e procure por **"Identity Toolkit API"** no campo de busca. Certifique-se de que ela está **ATIVA**.

### 2. Sincronização Vercel
Se o seu GitHub atualizou mas a Vercel não:
- Confirme se a **Production Branch** na Vercel está definida como `principal`.
- Execute um novo "Sync Changes" para disparar o build.

## 📱 Funcionalidades
- **Assessoria na Nuvem:** Sincronização automática entre PC e Celular via Firestore.
- **Herança de IA:** Atleta usa própria chave API ou a do treinador como fallback automático.
- **Modelo Coach:** Treinador gerencia múltiplos atletas; Atletas acessam via e-mail do Google.
- **Análise PDF:** Gemini interpreta orientações de arquivos PDF e planos anteriores.

## 🎨 Branding
- **CORRE:** Branco
- **JUNTO:** Verde (Primary)
