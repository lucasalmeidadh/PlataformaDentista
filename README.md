# 🗓️ Agendamento - Sistema de Gestão e Agenda

Este projeto é uma aplicação moderna para gerenciamento de agendamentos, pacientes e finanças, desenvolvida com foco em performance e uma experiência de usuário fluida.

## 🚀 Tecnologias Utilizadas

O projeto utiliza as tecnologias mais modernas do ecossistema JavaScript/React:

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Calendário:** [FullCalendar](https://fullcalendar.io/) e [React Big Calendar](https://jquense.github.io/react-big-calendar/)
- **Requisições HTTP:** [Axios](https://axios-http.com/)
- **Manipulação de Datas:** [date-fns](https://date-fns.org/)

## ✨ Principais Funcionalidades

- **📅 Agenda Inteligente:** Visualização por dia, semana, mês e lista. Suporte a arrastar e soltar (drag and drop) e troca rápida entre profissionais.
- **👥 Gestão de Pacientes:** Cadastro completo, histórico de atendimentos e integração com prontuários.
- **💰 Controle Financeiro:** Gestão de pagamentos, cobranças e fluxo de caixa.
- **🔐 Autenticação:** Sistema de login seguro com rotas protegidas.
- **🦷 Odontograma:** Representação visual para tratamentos dentários (integrado à ficha do paciente).
- **📱 Responsividade:** Interface adaptável para diferentes tamanhos de tela.

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- **Node.js** (versão 18 ou superior recomendada)
- **npm** ou **yarn**

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/agendamento.git
cd agendamento
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` ou `.env.local` na raiz do projeto (use o `.env.example` se disponível como base) e adicione as URLs da API e outras chaves necessárias.

## 🚀 Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento (Vite) |
| `npm run build` | Cria a versão de produção otimizada |
| `npm run lint` | Executa o linter para verificar erros de código |
| `npm run preview` | Visualiza localmente o build de produção |

## 📁 Estrutura de Pastas

```text
src/
├── assets/       # Imagens, fontes e recursos estáticos
├── core/         # Lógica central, hooks globais e tipos
├── pages/        # Componentes de página (Agenda, Patients, Finance, etc.)
├── services/     # Integração com API (Axios) e serviços
├── ui/           # Componentes de interface reutilizáveis
├── App.tsx       # Componente principal e rotas
└── main.tsx      # Ponto de entrada da aplicação
```

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Faça o Commit de suas alterações (`git commit -m 'Add: Nova Feature'`)
4. Envie para o repositório remoto (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---
Desenvolvido com ❤️ por [Seu Nome/Empresa]
