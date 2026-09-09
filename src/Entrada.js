// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, RECURSOS VISUAIS E ESTILOS
// ============================================================================

// Importa o objeto de classes ou estilos embutidos a partir do arquivo CSS local
import styles from './estilo.css';

// Importa o React e o hook useState para criação e manipulação do estado da página
import React, { useState } from 'react';

// Importa a imagem ilustrativa da tela inicial localizada no diretório de imagens
import prof from './img/foto.jpg';

// Importa o arquivo de imagem do logotipo institucional
import logo from './img/Logo.png';

// Importa a folha de estilo CSS global da aplicação
import './index.css';

// Importa o componente visual 'Iniciar' que será exibido ao avançar de tela
import Iniciar from './Iniciar';

// ============================================================================
// COMPONENTE PRINCIPAL: ENTRADA
// ============================================================================

// Declaração do componente funcional 'Entrada'
const Entrada = () => {
  // --------------------------------------------------------------------------
  // CONTROLE DE ESTADO DA NAVEGAÇÃO
  // --------------------------------------------------------------------------

  // Declara o estado 'pagina' com valor padrão 'Entrada' e a função 'alterarPagina' para modificá-lo
  const [pagina, alterarPagina] = useState('Entrada');

  // --------------------------------------------------------------------------
  // FUNÇÕES DE TRANSIÇÃO E MANIPULADORES DE EVENTOS
  // --------------------------------------------------------------------------

  // Função disparada para alterar o valor do estado da tela conforme o argumento recebido
  const mudarPagina = (nomePagina) => {
    // Atualiza o estado da aplicação para o novo nome de rota/tela fornecido
    alterarPagina(nomePagina);
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL DO COMPONENTE (JSX)
  // --------------------------------------------------------------------------

  // Operador ternário que verifica se a tela ativa é 'Entrada'
  return pagina === 'Entrada' ? (
    // Contêiner geral da visualização de boas-vindas do teste
    <div className="Entrada">
      {/* Bloco do cabeçalho institucional superior */}
      <div className='barraSuperior' style={styles.barraSuperior}>
        {/* Título principal destacado na barra superior */}
        <h1 className='barraTexto' style={styles.barraTexto}>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Seção central para exibição da foto/ilustração temática */}
      <div className='corpo' style={styles.corpo}>
        {/* Renderiza a imagem ilustrativa com texto alternativo para acessibilidade */}
        <img src={prof} alt="Imagem de perfil" />
      </div>

      {/* Seção central com o texto institucional e orientações gerais do teste */}
      <div className='corpo' style={styles.corpo}>
        {/* Parágrafo explicativo detalhando a quantidade de questões e a proposta vocacional */}
        <p>
          Este teste consiste em 10 questões de múltipla escolha e, com base no percentual de suas respostas, apresentará as profissões que mais se aproximam do seu perfil psicológico.
          Lembre-se: este é apenas um indicativo aproximado e pode servir como um guia inicial para sua reflexão sobre possíveis carreiras.
          Clique no botão abaixo para começar! 
        </p>
      </div>

      {/* Bloco que abriga a chamada de ação para início do questionário */}
      <div className='corpo' style={styles.corpo}>
        {/* Botão de ação que executa a transição do estado 'pagina' para 'Iniciar' */}
        <button className='btnPrincipal' onClick={() => mudarPagina('Iniciar')}>
          COMEÇAR
        </button>
      </div>

      {/* Bloco de rodapé para exibição do logotipo da instituição */}
      <div className='corpo' style={styles.corpo}>
        {/* Renderiza o logotipo com os estilos pré-definidos */}
        <img src={logo} style={styles.logo} alt="Logo do teste" />
      </div>
    </div>
  ) : (
    // Renderiza o componente 'Iniciar' quando o estado 'pagina' deixa de ser 'Entrada'
    <Iniciar />
  );
};

// ============================================================================
// EXPORTAÇÃO DO COMPONENTE
// ============================================================================

// Exporta o componente 'Entrada' como padrão para ser consumido nas rotas ou na raiz da aplicação
export default Entrada;