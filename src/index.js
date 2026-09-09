// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, TELAS E RECURSOS
// ============================================================================

// Importa o React base e os hooks useState (controle de estado) e useEffect (efeitos e eventos de janela)
import React, { useState, useEffect } from 'react';

// Importa o cliente ReactDOM para criar a raiz de renderização da aplicação no navegador (React 18+)
import ReactDOM from 'react-dom/client';

// Importa a tela inicial de boas-vindas e apresentação do teste
import Entrada from './Entrada';

// Importa o componente responsável pelo cadastro e inserção de novas perguntas
import Inserir from './Inserir';

// Importa a tela de coleta de dados do candidato antes do início das questões
import Iniciar from './Iniciar';

// Importa a tela interativa de execução do teste vocacional e emissão do relatório
import Teste from './Teste';

// Importa o componente administrativo de navegação, edição e exclusão de perguntas cadastradas
import Editar from './Editar';

// Importa o módulo administrativo de listagem e visualização dos usuários cadastrados
import ListarUsuario from './ListarUsuario';

// Importa o painel de exportação de dados (.zip) e restauração do banco com imagens
import Backup from './Backup';

// Importa a folha de estilos CSS global contendo classes estruturais como .menu, .btn e .corpoP
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: APP
// ============================================================================

// Declaração do componente funcional raiz App responsável pelas rotas internas e menu retrátil
function App() {
  // --------------------------------------------------------------------------
  // ESTADOS DE NAVEGAÇÃO E VISIBILIDADE DO MENU
  // --------------------------------------------------------------------------

  // Estado que define qual tela está sendo exibida no momento (inicia na tela 'Entrada')
  const [page, setPage] = useState('Entrada');

  // Estado booleano que indica se o menu superior deve ficar visível (true) ou oculto (false)
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // --------------------------------------------------------------------------
  // MANIPULADORES DE EVENTO
  // --------------------------------------------------------------------------

  // Função disparada ao clicar em qualquer botão de navegação para alternar a tela
  const handleButtonClick = (pageName) => {
    // Atualiza o estado da página ativa com o identificador da tela recebido
    setPage(pageName);
  };

  // --------------------------------------------------------------------------
  // MONITORAMENTO DO CURSOR DO MOUSE (MENU RETRÁTIL NO TOPO)
  // --------------------------------------------------------------------------

  // Efeito executado na montagem do componente para rastrear a posição vertical do cursor
  useEffect(() => {
    // Função manipuladora do evento de movimento do cursor do mouse
    const handleMouseMove = (e) => {
      // Verifica se a coordenada vertical Y do cursor está a menos de 50 pixels do topo da janela
      if (e.clientY < 50) {
        // Revela o menu tornando o estado visível
        setIsMenuVisible(true);
      } else {
        // Oculta o menu quando o cursor se afasta do topo
        setIsMenuVisible(false);
      }
    };

    // Adiciona o ouvinte de evento 'mousemove' ao objeto global window
    window.addEventListener('mousemove', handleMouseMove);

    // Função de limpeza (cleanup) executada na desmontagem do componente
    return () => {
      // Remove o ouvinte do mouse da janela global para prevenir vazamentos de memória (memory leaks)
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Vetor de dependências vazio garante que o listener seja registrado apenas uma vez

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO DO COMPONENTE (JSX)
  // --------------------------------------------------------------------------

  return (
    // Contêiner principal envolvendo o menu e o conteúdo das telas
    <div className='menu'>
      {/* Barra de botões do menu com visibilidade alternada conforme aproximação do mouse */}
      <div style={{ display: isMenuVisible ? 'block' : 'none' }}>
        {/* Botão de navegação para a tela inicial 'Entrada' */}
        <button className='btn' onClick={() => handleButtonClick('Entrada')}>
          HOME
        </button>

        {/* Botão de navegação para a tela de pré-teste 'Iniciar' */}
        <button className='btn' onClick={() => handleButtonClick('Iniciar')}>
          INICIAR
        </button>

        {/* Botão de navegação para a área de execução das perguntas 'Teste' */}
        <button className='btn' onClick={() => handleButtonClick('Teste')}>
          TESTE
        </button>

        {/* Botão de navegação para o formulário de cadastro de questões 'Inserir' */}
        <button className='btn' onClick={() => handleButtonClick('Inserir')}>
          CADASTRAR PERGUNTA
        </button>

        {/* Botão de navegação para o painel de edição e exclusão de questões 'Editar' */}
        <button className='btn' onClick={() => handleButtonClick('Editar')}>
          EDITAR PERGUNTAS
        </button>

        {/* Botão de navegação para a visualização dos dados e alunos 'ListarUsuario' */}
        <button className='btn' onClick={() => handleButtonClick('ListarUsuario')}>
          LISTAR USUÁRIOS
        </button>

        {/* Botão de navegação para a central de backup e restauração 'Backup' */}
        <button className='btn' onClick={() => handleButtonClick('Backup')}>
          BACKUP E RESTAURAÇÃO
        </button>
      </div>

      {/* Renderização condicional por curto-circuito: exibe a tela 'Entrada' */}
      {page === 'Entrada' && <Entrada />}

      {/* Renderização condicional por curto-circuito: exibe a tela 'Iniciar' */}
      {page === 'Iniciar' && <Iniciar />}

      {/* Renderização condicional por curto-circuito: exibe a tela 'Teste' */}
      {page === 'Teste' && <Teste />}

      {/* Renderização condicional por curto-circuito: exibe a tela 'Inserir' */}
      {page === 'Inserir' && <Inserir />}

      {/* Renderização condicional por curto-circuito: exibe a tela 'Editar' */}
      {page === 'Editar' && <Editar />}

      {/* Renderização condicional por curto-circuito: exibe a tela 'ListarUsuario' */}
      {page === 'ListarUsuario' && <ListarUsuario />}

      {/* Renderização condicional por curto-circuito: exibe a tela 'Backup' */}
      {page === 'Backup' && <Backup />}
    </div>
  );
}

// ============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO NO NAVEGADOR
// ============================================================================

// Cria a raiz virtual do DOM vinculando-se à div com id 'root' presente no index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Executa a montagem e renderização do componente App dentro do modo estrito do React
root.render(
  // StrictMode ativa verificações e avisos adicionais de ciclo de vida em ambiente de desenvolvimento
  <React.StrictMode>
    {/* Componente principal da aplicação */}
    <App />
  </React.StrictMode>
);