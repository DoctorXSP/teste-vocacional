// Importa o módulo React principal para viabilizar o uso de JSX[cite: 9]
import React from 'react';
// Importa o cliente de renderização do ReactDOM (React 18+)[cite: 9]
import ReactDOM from 'react-dom/client';
// Importa o componente mestre da aplicação[cite: 9]
import App from './App';
// Importa a folha de estilos global do projeto[cite: 9]
import './index.css';

// Cria a raiz virtual do React no elemento HTML de id 'root'[cite: 9]
const root = ReactDOM.createRoot(document.getElementById('root'));
// Renderiza a árvore de componentes da aplicação dentro do contêiner raiz[cite: 9]
root.render(
  // Habilita verificações e alertas adicionais de ciclo de vida em ambiente de desenvolvimento[cite: 9]
  <React.StrictMode>
    {/* Componente principal da aplicação */}
    <App />
  </React.StrictMode>
);