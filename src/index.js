// Importa as bibliotecas base do React e os hooks de ciclo de vida e estado
import React, { useState, useEffect } from 'react';
// Importa o cliente do ReactDOM para montagem da árvore da aplicação no DOM do navegador
import ReactDOM from 'react-dom/client';
// Importa as páginas existentes do projeto
import Entrada from './Entrada';
import Inserir from './Inserir';
import Iniciar from './Iniciar';
import Teste from './Teste';
// Importa o novo componente de Edição, Navegação e Exclusão de perguntas
import Editar from './Editar';
import ListarUsuario from './ListarUsuario';
import Backup from './Backup';
// Importa os estilos CSS personalizados da aplicação
import './index.css';

// Componente principal App que gerencia a navegação e o menu superior
function App() {
  // Estado que armazena a página atualmente ativa (inicia na 'Entrada')
  const [page, setPage] = useState('Entrada');
  // Estado que controla se a barra do menu deve estar visível ou oculta
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Manipulador para alternar a tela ao clicar nos botões do menu
  const handleButtonClick = (pageName) => {
    setPage(pageName);
  };

  // Efeito para monitorar a posição do cursor do mouse na tela
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Se o mouse estiver a menos de 50px do topo da página, revela o menu
      if (e.clientY < 50) {
        setIsMenuVisible(true);
      } else {
        // Caso contrário, recolhe o menu
        setIsMenuVisible(false);
      }
    };

    // Registra o ouvinte de movimento do mouse na janela global
    window.addEventListener('mousemove', handleMouseMove);

    // Remove o listener na desmontagem do componente para evitar vazamento de memória
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className='menu'>
      {/* Barra de botões do menu com visibilidade condicional baseada na posição do mouse */}
      <div style={{ display: isMenuVisible ? 'block' : 'none' }}>
        <button className='btn' onClick={() => handleButtonClick('Entrada')}>HOME</button>
        <button className='btn' onClick={() => handleButtonClick('Iniciar')}>INICIAR</button>
        <button className='btn' onClick={() => handleButtonClick('Teste')}>TESTE</button>
        <button className='btn' onClick={() => handleButtonClick('Inserir')}>CADASTRAR PERGUNTA</button>
        {/* Novo botão adicionado para acessar o módulo de Edição e Gestão de perguntas */}
        <button className='btn' onClick={() => handleButtonClick('Editar')}>EDITAR PERGUNTAS</button>
        <button className='btn' onClick={() => handleButtonClick('ListarUsuario')}>LISTAR USUÁRIOS</button>
        <button className='btn' onClick={() => handleButtonClick('Backup')}>BACKUP E RESTAURAÇÃO</button>
      </div>

      {/* Renderização condicional das telas conforme a página selecionada */}
      {page === 'Entrada' && <Entrada />}
      {page === 'Iniciar' && <Iniciar />}
      {page === 'Teste' && <Teste />}
      {page === 'Inserir' && <Inserir />}
      {/* Exibição condicional da tela Editar */}
      {page === 'Editar' && <Editar />}
      {page === 'ListarUsuario' && <ListarUsuario />}
      {page === 'Backup' && <Backup />}
    </div>
  );
}

// Inicializa e monta a raiz do React no elemento com id 'root'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);