
# 🏃‍♂️ CORRE JUNTO - Performance Atlética

Laboratório de performance para atletas, operando em arquitetura **Local-First**.

## 🚀 Como sincronizar alterações e atualizar a Vercel

Se o seu GitHub atualizou mas a Vercel não:

1. **Ajuste de Erros de Build:** Verifique se há erros no painel da Vercel. O erro "Module not found" geralmente impede o deploy.
2. **Confirme a Branch na Vercel:** Vá no painel da Vercel em `Settings > Git` e verifique se a **Production Branch** está definida como `principal`.
3. **Reconciliar Conflitos:** Se encontrar o erro `fatal: Need to specify how to reconcile divergent branches` no terminal:
   - Abra o **Terminal** no Firebase Studio.
   - Execute: `git config pull.rebase false`
   - Execute: `git pull origin principal`
   - Use o botão **"Sync Changes"** novamente.

## 📱 Funcionalidades
- **Arquitetura Local-First:** Privacidade total, dados salvos no seu navegador.
- **Modelo de Assessoria:** Treinador gerencia múltiplos atletas; Atletas acessam via vínculo de e-mail.
- **Coach IA Gemini:** Feedback técnico baseado em biomecânica e suporte a arquivos PDF.
- **Calculadoras de Elite:** Pace, VDOT, Estratégia de Prova e Nutrição.
- **Calendário Profissional:** Semana começando no Domingo em todas as funções.

## 🎨 Branding
- **CORRE:** Branco
- **JUNTO:** Verde (Primary)
