// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, TELAS E RECURSOS VISUAIS
// ============================================================================

// Importa os hooks useState e useEffect do React para gerenciar estado e efeitos colaterais
import React, { useState, useEffect } from 'react';

// Importa o componente da tela inicial de boas-vindas
import Entrada from './Entrada';
// Importa o componente para inserção de novas perguntas
import Inserir from './Inserir';
// Importa o componente de cadastro e identificação inicial do participante
import Iniciar from './Iniciar';
// Importa o componente que executa o questionário vocacional
import Teste from './Teste';
// Importa o componente responsável pela edição e exclusão de questões existentes
import Editar from './Editar';
// Importa o componente que exibe os relatórios e lista de candidatos/usuários
import ListarUsuario from './ListarUsuario';
// Importa o componente para exportação e restauração de dados
import Backup from './Backup';

// Importa as folhas de estilo globais do componente e do projeto
import './App.css';
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: APP
// ============================================================================

// Função principal que serve como roteador e casca da aplicação
function App() {
  // Estado que armazena o nome da tela ativa no momento, iniciando em 'Entrada'
  const [page, setPage] = useState('Entrada');
  // Estado que armazena os dados do candidato logado/cadastrado para uso no teste
  const [usuarioAtivo, setUsuarioAtivo] = useState(null);

  // Estado para controlar se a barra de navegação no desktop deve ficar visível ao aproximar o mouse
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  // Estado que armazena se o menu hambúrguer para celular está aberto ou fechado
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Função auxiliar para mudar a tela ativa e recolher o menu móvel
  const handleButtonClick = (pageName) => {
    // Altera a tela renderizada
    setPage(pageName);
    // Fecha o menu retrátil caso estivesse aberto no smartphone
    setMobileMenuOpen(false);
  };

  // Callback acionado quando o aluno completa o formulário em Iniciar.js
  const handleConcluirCadastro = (dadosUsuario) => {
    // Guarda o objeto com as informações do aluno no estado
    setUsuarioAtivo(dadosUsuario);
    // Direciona imediatamente para a tela de execução do teste
    setPage('Teste');
  };

  // Hook que adiciona um listener para detectar a proximidade do mouse no topo da tela (Desktop)
  useEffect(() => {
    // Função disparada a cada movimento do ponteiro
    const handleMouseMove = (e) => {
      // Executa apenas em telas com largura superior a 768px
      if (window.innerWidth > 768) {
        // Se a posição vertical do mouse estiver a menos de 50px do topo
        if (e.clientY < 50) {
          // Revela a barra de menu
          setIsMenuVisible(true);
        } else {
          // Oculta a barra de menu
          setIsMenuVisible(false);
        }
      }
    };

    // Registra o evento de escuta na janela
    window.addEventListener('mousemove', handleMouseMove);

    // Função de limpeza executada na desmontagem do componente para remover o listener
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Array vazio garante que o efeito seja montado apenas uma vez

  // Estrutura JSX retornada pelo componente
  return (
    // Contêiner raiz
    <div className="App">
      {/* Botão Hambúrguer visível em telas menores para alternar visibilidade do menu */}
      <button 
        className="btnHamburger" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Abrir Menu"
      >
        {/* Barras visuais que compõem o ícone hambúrguer */}
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Barra de navegação com classes condicionais para responsividade e animações */}
      <nav className={`menu ${mobileMenuOpen ? 'menuMobileAtivo' : ''} ${isMenuVisible ? 'menuDesktopAtivo' : ''}`}>
        {/* Botão que navega para a página Home/Entrada */}
        <button className="btn" onClick={() => handleButtonClick('Entrada')}>
          HOME
        </button>
        {/* Botão que navega para a tela de inscrição inicial */}
        <button className="btn" onClick={() => handleButtonClick('Iniciar')}>
          INICIAR
        </button>
        {/* Botão que navega para o questionário */}
        <button className="btn" onClick={() => handleButtonClick('Teste')}>
          TESTE
        </button>
        {/* Botão que navega para a tela de inclusão de novas perguntas */}
        <button className="btn" onClick={() => handleButtonClick('Inserir')}>
          CADASTRAR PERGUNTA
        </button>
        {/* Botão que navega para a tela de gerenciamento/edição de perguntas */}
        <button className="btn" onClick={() => handleButtonClick('Editar')}>
          EDITAR PERGUNTAS
        </button>
        {/* Botão que navega para a listagem de usuários */}
        <button className="btn" onClick={() => handleButtonClick('ListarUsuario')}>
          LISTAR USUÁRIOS
        </button>
        {/* Botão que navega para a tela de backup e restauração */}
        <button className="btn" onClick={() => handleButtonClick('Backup')}>
          BACKUP E RESTAURAÇÃO
        </button>
      </nav>

      {/* Contêiner principal onde o conteúdo de cada página é exibido dinamicamente */}
      <main className="App-content">
        {/* Renderiza Entrada se page for 'Entrada' */}
        {page === 'Entrada' && (
          <Entrada onIniciar={() => handleButtonClick('Iniciar')} />
        )}

        {/* Renderiza Iniciar se page for 'Iniciar', passando a função de transição */}
        {page === 'Iniciar' && (
          <Iniciar onConcluirCadastro={handleConcluirCadastro} />
        )}

        {/* Renderiza Teste se page for 'Teste', repassando os dados do candidato cadastrado */}
        {page === 'Teste' && (
          <Teste usuario={usuarioAtivo} />
        )}

        {/* Renderiza a tela de inserção de perguntas */}
        {page === 'Inserir' && <Inserir />}
        {/* Renderiza a tela de edição de perguntas */}
        {page === 'Editar' && <Editar />}
        {/* Renderiza o relatório de usuários */}
        {page === 'ListarUsuario' && <ListarUsuario />}
        {/* Renderiza a ferramenta de backup do sistema */}
        {page === 'Backup' && <Backup />}
      </main>
    </div>
  );
}

// Exporta o componente App como padrão para renderização no index.js
export default App;