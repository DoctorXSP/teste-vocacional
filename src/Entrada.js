// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, RECURSOS VISUAIS E ESTILOS
// ============================================================================

// Importa a biblioteca central React
import React from 'react';
// Importa a imagem ilustrativa da tela inicial
import prof from './img/foto.jpg';
// Importa a imagem da logo da instituição
import logo from './img/Logo.png';
// Importa folhas de estilo para a tela e elementos globais
import './estilo.css';
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: ENTRADA
// ============================================================================

// Declara o componente funcional Entrada recebendo via props a função onIniciar
const Entrada = ({ onIniciar }) => {
  // Retorna a estrutura visual da tela inicial
  return (
    // Contêiner de fundo da aplicação
    <div className="corpoP">
      {/* Barra superior com o título institucional */}
      <div className="barraSuperior">
        <h1 className="barraTexto">Teste de Aptidão Vocacional</h1>
      </div>

      {/* Cartão principal com bordas arredondadas e fundo claro */}
      <div className="quadroConteudo">
        
        {/* Contêiner de exibição da foto / ilustração */}
        <div style={{ textAlign: 'center', marginBottom: '20px', width: '100%' }}>
          <img 
            src={prof} 
            alt="Apresentação do Teste Vocacional" 
            style={{
              width: '100%',
              maxWidth: '480px',
              height: 'auto',
              maxHeight: '260px',
              objectFit: 'cover',
              borderRadius: '10px',
              border: '2px solid #e0e0e0',
              display: 'inline-block'
            }} 
          />
        </div>

        {/* Bloco de texto com orientações para o candidato */}
        <div style={{ width: '100%', maxWidth: '850px', marginBottom: '22px', textAlign: 'justify' }}>
          <p style={{
            color: '#212529',
            fontSize: '15px',
            lineHeight: '1.6',
            margin: '0 auto'
          }}>
            Este teste consiste em 10 questões de múltipla escolha e, com base no percentual de suas respostas, apresentará as profissões que mais se aproximam do seu perfil psicológico.
            Lembre-se: este é apenas um indicativo aproximado e pode servir como um guia inicial para sua reflexão sobre possíveis carreiras.
            Clique no botão abaixo para começar!
          </p>
        </div>

        {/* Seção com o botão de início */}
        <div style={{ textAlign: 'center', marginBottom: '25px', width: '100%' }}>
          <button 
            className="btnPrincipal" 
            // Ao clicar, executa a prop onIniciar passando a tela de destino 'Iniciar'
            onClick={() => onIniciar ? onIniciar('Iniciar') : null}
          >
            COMEÇAR
          </button>
        </div>

        {/* Div inferior contendo a logo da ETEC */}
        <div style={{ width: '100%', maxWidth: '650px', borderTop: '1px solid #e0e0e0', paddingTop: '16px', textAlign: 'center' }}>
          <img 
            src={logo} 
            alt="Logo da Etec de Embu das Artes" 
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }} 
          />
        </div>

      </div>
    </div>
  );
};

// Exporta o componente Entrada como padrão
export default Entrada;