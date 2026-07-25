# 🍕 Sistema de Comandas Profissional - Pizzaria & Hamburgueria

Este é um sistema web completo para gestão de restaurantes, desenvolvido com foco em performance, design moderno (Dark Mode) e facilidade de uso. O sistema foi construído utilizando tecnologias web puras para garantir leveza e compatibilidade.

## 🚀 Tecnologias Utilizadas

*   **HTML5** & **CSS3** (Variáveis, Flexbox, Grid, Glassmorphism)
*   **JavaScript Puro** (Vanilla JS) - Sem frameworks pesados
*   **Chart.js** - Para gráficos dinâmicos no dashboard
*   **Toastify.js** - Para notificações elegantes
*   **AOS.js** - Para animações de scroll
*   **Font Awesome** - Para ícones profissionais

## 📁 Estrutura do Projeto

```text
📁 projeto-pizzaria/
├── 📁 assets/          # Imagens, ícones e logos
├── 📁 css/             # Arquivos de estilização organizados por módulo
├── 📁 js/              # Lógica do sistema separada por funcionalidades
├── 📁 pages/           # Templates das páginas (carregados via SPA)
├── index.html          # Estrutura principal e Sidebar
├── login.html          # Tela de acesso
└── README.md           # Documentação
```

## 🛠️ Funcionalidades Principais

1.  **Dashboard Administrativo**: Resumo de faturamento, pedidos ativos e gráficos de vendas.
2.  **Mapa de Mesas**: Visualização em tempo real do status das mesas (Livre, Ocupada, Pedindo Conta).
3.  **Sistema de Comandas**: Adição de produtos, controle de quantidades e envio para cozinha.
4.  **Módulo Cozinha**: Recebimento de pedidos em tempo real com alteração de status (Pendente -> Preparando -> Pronto).
5.  **Módulo Caixa**: Fechamento de contas, aplicação de descontos e múltiplos métodos de pagamento (PIX, Cartão, Dinheiro).
6.  **Controle de Estoque**: Gestão de insumos com alertas de estoque baixo.
7.  **Relatórios**: Histórico de vendas e exportação simulada.

## 🔑 Acesso ao Sistema

Para acessar o sistema, utilize as seguintes credenciais na tela de login:

*   **E-mail**: `admin@admin.com`
*   **Senha**: `admin123`

## ⚙️ Como Executar

1.  Extraia o conteúdo do arquivo ZIP.
2.  Abra a pasta no seu editor de código (ex: VS Code).
3.  Abra o arquivo `index.html` em qualquer navegador moderno.
4.  O sistema utiliza `localStorage` para persistir os dados localmente no seu navegador.

## 📝 Notas de Desenvolvimento

*   O sistema utiliza um conceito de **SPA (Single Page Application)** simplificado com JavaScript puro, carregando os conteúdos da pasta `pages/` dinamicamente sem recarregar a página.
*   O design é **totalmente responsivo**, adaptando-se a celulares, tablets e desktops.
*   O código está extensamente comentado para facilitar a manutenção e personalização.

---
Desenvolvido com ❤️ para gestão de excelência.
