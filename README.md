
# 🏃‍♂️ CORRE JUNTO - Performance Atlética

Laboratório de performance para atletas operando em arquitetura **Cloud-First** via Firebase Firestore.

## 🚀 Como sincronizar e resolver erros de Login (403 Forbidden)

Se você vir o erro "Requests to this API identitytoolkit method are blocked" ou "Falha na Autenticação", siga estes 3 passos obrigatórios:

### 1. Ativar o serviço de Identidade (Obrigatório)
1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Vá em **Build > Authentication**.
3. **IMPORTANTE:** Se você ver um botão escrito **"Get Started"** (ou "Começar"), você **PRECISA** clicar nele. Sem isso, o Google bloqueia qualquer tentativa de login.
4. Vá na aba **"Método de login"**, clique em **"Adicionar novo provedor"**, escolha **Google** e ative-o.

### 2. Ativar a API no Google Cloud
1. Acesse o [Console do Google Cloud](https://console.cloud.google.com/).
2. Procure por **"Identity Toolkit API"** e clique em **ATIVAR**.

### 3. Autorizar o Domínio atual
1. Copie o endereço do seu navegador (ex: `https://9002-....cloudworkstations.dev`).
2. No Firebase Console, vá em **Authentication > Settings > Authorized Domains**.
3. Clique em **"Add Domain"** e cole o endereço (sem o `https://` e sem o caminho final, apenas o domínio).

## 📱 Funcionalidades
- **Assessoria na Nuvem:** Sincronização automática entre PC e Celular via Firestore.
- **Herança de IA:** Atleta usa própria chave API ou a do treinador como fallback automático.
- **Modelo Coach:** Treinador gerencia múltiplos atletas; Atletas acessam via e-mail do Google.
- **Análise PDF:** Gemini interpreta orientações de arquivos PDF e planos anteriores.

## 🎨 Branding
- **CORRE:** Branco
- **JUNTO:** Verde (Primary)
