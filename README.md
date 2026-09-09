# 🧭 Teste Vocacional Web

Aplicação Full Stack interativa desenvolvida para orientação profissional e mapeamento de perfis em quatro vertentes centrais: **Biológicas**, **Exatas**, **Humanas** e **Tecnológicas**.

O sistema apresenta questionários dinâmicos com alternativas aleatórias, processa os perfis ponderados, gera relatórios com gráficos (radar/polar) e exportação em PDF com QR Code, além de disponibilizar um módulo administrativo para gestão de perguntas, upload de imagens e rotinas de backup do banco de dados.

---

## 🏗️ Arquitetura da Solução

- **Frontend:** React (Vite / CRA), Bootstrap, Chart.js, jsPDF, html2canvas.
- **Backend:** Node.js, Express, Multer, Archiver.
- **Banco de Dados:** MySQL.

---

## 📦 Estrutura de Arquivos e Dependências

### 1. Back-end (API Node.js)

| Arquivo | Dependências / Bibliotecas | Função no Arquivo |
| :--- | :--- | :--- |
| `server.js` / `app.js` | `express`, `cors`, `dotenv` | Inicialização do servidor HTTP, configuração de middlewares (JSON, CORS) e injeção de variáveis de ambiente. |
| `db.js` / `connection.js` | `mysql2` (ou `mysql`) | Pool de conexões assíncronas e execução de queries no MySQL. |
| `routes/questoes.js` | `express.Router`, `multer` | CRUD de perguntas, sorteio aleatório de questões e middleware de upload das imagens dos quadrantes/enunciados. |
| `routes/backup.js` | `archiver`, `fs`, `path` | Compactação de arquivos SQL e da pasta de imagens em arquivo `.zip` para rotinas de backup e restauração. |

#### Comandos de Instalação (Back-end)
```bash
cd backend
npm install express mysql2 cors dotenv multer archiver
npm install --save-dev nodemon
```

---

### 2. Front-end (React)

| Arquivo / Componente | Dependências / Bibliotecas | Função no Arquivo |
| :--- | :--- | :--- |
| `src/main.jsx` / `App.jsx` | `react`, `react-dom`, `react-router-dom` | Ponto de entrada, renderização do DOM e roteamento das páginas da aplicação. |
| `src/pages/Iniciar.jsx` | `bootstrap`, `react-router-dom` | Tela inicial de cadastro/identificação do candidato e apresentação do teste. |
| `src/pages/Teste.jsx` | `react` (`useState`, `useEffect`), `axios` | Execução do questionário, paginação das perguntas e lógica do algoritmo Fisher-Yates para embaralhamento das alternativas. |
| `src/pages/Resultado.jsx` | `chart.js`, `react-chartjs-2`, `jspdf`, `html2canvas`, `qrcode` | Cálculo dos percentuais por área, plotagem do gráfico de radar/polar e exportação do diagnóstico em PDF com validação via QR Code. |
| `src/pages/Editar.jsx` (Admin) | `bootstrap`, `axios` | Painel administrativo para cadastro, edição, exclusão de questões e upload de imagens. |

#### Comandos de Instalação (Front-end)
```bash
cd frontend
npm install react react-dom react-router-dom axios bootstrap
npm install chart.js react-chartjs-2 jspdf html2canvas qrcode
```

---

## ⚙️ Configuração e Execução

### 1. Banco de Dados (MySQL)
1. Crie o banco de dados no seu servidor MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS teste_vocacional;
   USE teste_vocacional;
   ```
2. Execute o script de criação das tabelas de `usuarios`, `questoes` e `respostas`.

### 2. Configuração do Back-end
1. Acesse o diretório do servidor:
   ```bash
   cd backend
   ```
2. Crie um arquivo `.env` na raiz do back-end com as seguintes variáveis:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=teste_vocacional
   ```
3. Inicie a API:
   ```bash
   npm run dev
   # ou: node server.js
   ```

### 3. Execução do Front-end
1. Em outro terminal, acesse a pasta do front-end:
   ```bash
   cd frontend
   npm run dev
   # ou: npm start
   ```
2. Abra no navegador: `http://localhost:5173` (ou `http://localhost:3000`).

---

## 🛠️ Detalhes das Bibliotecas Utilizadas

- **`express`**: Framework web minimalista para construção das rotas da API REST.
- **`mysql2`**: Driver cliente para execução de queries parametrizadas com suporte a Promises.
- **`multer`**: Manipulação de requisições `multipart/form-data` para gravação de arquivos de imagem em disco.
- **`archiver`**: Criação de fluxos de compactação `.zip` para download de dumps e mídia.
- **`react-router-dom`**: Gerenciamento de navegação SPA (rotas entre Iniciar, Teste, Resultado e Admin).
- **`chart.js` & `react-chartjs-2`**: Renderização do gráfico de radar demonstrando o equilíbrio entre as 4 áreas.
- **`jspdf` & `html2canvas`**: Captura visual da tela de diagnóstico e conversão em documento PDF para download do usuário.
- **`qrcode`**: Geração do código QR para validação ou compartilhamento direto do laudo vocacional.

---

## 💬 Contato e Conexões

Dúvidas do projeto, trocas de ideia ou quiser saber mais sobre o desenvolvedor, acesse:  
👉 [linktr.ee/profemersonsilv](https://linktr.ee/profemersonsilv)
