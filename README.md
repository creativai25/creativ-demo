# Creativ AI — Diagnóstico Inteligente de Frota

![Creativ AI Demo](https://creativ-demo.vercel.app/og-image.jpg) <!-- Você pode adicionar um print do projeto aqui depois -->

Um simulador interativo de diagnóstico operacional focado em frotas industriais. Desenvolvido para demonstrar de forma rápida e visual o impacto da Inteligência Artificial na segurança, eficiência e redução de custos da frota.

🌐 **Live Demo:** [https://creativ-demo.vercel.app](https://creativ-demo.vercel.app)

## 🚀 Funcionalidades

- **Fluxo em 3 Etapas:** Interface gamificada guiando o usuário desde a seleção do setor até o recebimento do diagnóstico.
- **Cálculo de KPI em Tempo Real:** Estimativa de economia mensal e redução de acidentes com base no perfil da frota.
- **Mapa de Maturidade (Radar Chart):** Gráfico interativo feito com `Chart.js` comparando o cenário atual com a projeção usando as soluções Creativ AI.
- **Insights Gerados por IA:** Integração com o modelo **Google Gemini 2.0 Flash** via API para gerar recomendações estratégicas exclusivas e contextualizadas ao setor (Logística, Mineração, Utilities, etc).
- **Captação de Leads Segura:** Integração direta com **Supabase** via REST API para salvar os dados da simulação e contatos de oportunidades reais.
- **Design Moderno:** UI/UX com estética Premium/Dark Theme, Glassmorphism e micro-interações.

## 🛠️ Stack Tecnológico

- **Frontend:** HTML5, CSS3 (Vanilla com CSS Variables), JavaScript (ES6+).
- **Gráficos:** [Chart.js](https://www.chartjs.org/)
- **Integração de IA:** [Google AI Studio / Gemini API](https://aistudio.google.com/)
- **Backend / Database:** [Supabase](https://supabase.com/)
- **Hospedagem / Deploy:** [Vercel](https://vercel.com/)

## 💻 Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/creativai25/creativ-demo.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd creativ-demo
   ```
3. Configure as chaves de API:
   - Renomeie o arquivo `config.example.js` para `config.js`
   - Abra o `config.js` e insira suas chaves do Gemini e do Supabase nas variáveis correspondentes.
4. Rode um servidor local (a API do Gemini pode ter problemas de CORS se aberto direto via `file://`).
   - Usando a extensão Live Server no VSCode.
   - Ou usando Python: `python -m http.server 8000` e abra `http://localhost:8000` no navegador.

## 🤝 Autor

Desenvolvido para demonstração de IA e Gestão Operacional de Frotas pela **Creativ AI Soluções**.
