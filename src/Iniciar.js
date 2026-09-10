// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, COMPONENTES E ESTILOS
// ============================================================================

// Importa o React e o hook useState para gerenciar as informações digitadas[cite: 10]
import React, { useState } from 'react';
// Importa componentes estilizados de formulário e alertas do React-Bootstrap[cite: 10]
import { Button, Form, Alert } from 'react-bootstrap';
// Importa folhas de estilos visuais da aplicação[cite: 10]
import './estilo.css';
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: INICIAR
// ============================================================================

// Declara o componente funcional Iniciar recebendo o callback onConcluirCadastro via desestruturação de props[cite: 10]
const Iniciar = ({ onConcluirCadastro }) => {
  // Estado local para armazenar o nome digitado pelo usuário[cite: 10]
  const [nome, alterarNome] = useState('');
  // Estado local para armazenar o e-mail digitado[cite: 10]
  const [email, alterarEmail] = useState('');
  // Estado local para armazenar o WhatsApp digitado[cite: 10]
  const [whatsapp, alterarWhatsapp] = useState('');
  // Estado para armazenar mensagens de retorno ou validação do formulário[cite: 10]
  const [mensagem, alterarMensagem] = useState('');

  // Função assíncrona responsável por validar e submeter os dados para a API do backend[cite: 10]
  const enviarFormulario = async (evento) => {
    // Interrompe o recarregamento padrão da página disparado pelo evento submit do form[cite: 10]
    evento.preventDefault();

    // Valida se algum dos campos está em branco ou preenchido apenas com espaços[cite: 10]
    if (!nome.trim() || !email.trim() || !whatsapp.trim()) {
      // Exibe mensagem de alerta informando a obrigatoriedade dos dados[cite: 10]
      alterarMensagem('Por favor, preencha todos os campos.');
      // Encerra a execução da função impedindo a requisição[cite: 10]
      return;
    }

    // Monta o objeto com os dados a serem transmitidos[cite: 10]
    const dadosFormulario = { nome, email, whatsapp };

    try {
      // Envia requisição HTTP POST para cadastrar o usuário no banco de dados[cite: 10]
      const resposta = await fetch('http://localhost:3012/caduser', {
        method: 'POST',
        headers: {
          // Informa que o corpo da requisição é um documento JSON[cite: 10]
          'Content-Type': 'application/json',
          // Informa que a resposta esperada é do tipo JSON[cite: 10]
          'Accept': 'application/json',
        },
        // Converte o objeto javascript para string no formato JSON[cite: 10]
        body: JSON.stringify(dadosFormulario),
      });

      // Converte o corpo da resposta HTTP em objeto JavaScript[cite: 10]
      const resultado = await resposta.json();

      // Dispara erro se o código de status HTTP for diferente de 2xx[cite: 10]
      if (!resposta.ok) {
        throw new Error(resultado.message || 'Erro ao inserir registro!');
      }

      // Notifica o componente App.js fornecendo os dados e ID do novo participante registrado[cite: 10]
      if (onConcluirCadastro) {
        onConcluirCadastro({
          id: resultado.userId,
          nome: nome
        });
      }
    } catch (erro) {
      // Atualiza o estado da mensagem para informar o erro capturado na requisição[cite: 10]
      alterarMensagem(`Erro ao cadastrar: ${erro.message}`);
    }
  };

  // Estrutura JSX a ser renderizada pelo componente[cite: 10]
  return (
    // Contêiner principal com a classe de estilo de fundo roxo[cite: 10]
    <div className="corpoP">
      {/* Barra superior institucional[cite: 10] */}
      <div className="barraSuperior">
        <h1 className="barraTexto">Teste de Aptidão Vocacional</h1>
      </div>

      {/* Caixa delimitadora do formulário[cite: 10] */}
      <section
        style={{
          width: '90%',
          maxWidth: '520px',
          margin: 'auto',
          marginTop: '25px',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Título da seção[cite: 10] */}
        <h1 style={{ color: '#FFF', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Início</h1>

        {/* Mensagem instrutiva aos participantes[cite: 10] */}
        <p style={{ color: '#FFF', fontSize: '15px', marginBottom: '20px' }}>
          Preencha o formulário abaixo e clique em iniciar
        </p>

        {/* Formulário com evento de envio acoplado[cite: 10] */}
        <Form onSubmit={enviarFormulario}>
          {/* Grupo de entrada do campo Nome[cite: 10] */}
          <Form.Group controlId="nome" style={{ marginBottom: 14, textAlign: 'left' }}>
            {/* Rótulo do campo Nome[cite: 10] */}
            <Form.Label style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
              Nome:
            </Form.Label>
            {/* Caixa de texto controlada para o Nome[cite: 10] */}
            <Form.Control
              type="text"
              required
              value={nome}
              onChange={(e) => alterarNome(e.target.value)}
              placeholder="Preencha o nome completo"
              style={{ width: '100%', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </Form.Group>

          {/* Grupo de entrada do campo e-Mail[cite: 10] */}
          <Form.Group controlId="email" style={{ marginBottom: 14, textAlign: 'left' }}>
            {/* Rótulo do campo e-Mail[cite: 10] */}
            <Form.Label style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
              e-Mail:
            </Form.Label>
            {/* Caixa de texto controlada para o e-mail[cite: 10] */}
            <Form.Control
              type="email"
              required
              value={email}
              onChange={(e) => alterarEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              style={{ width: '100%', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </Form.Group>

          {/* Grupo de entrada do campo WhatsApp[cite: 10] */}
          <Form.Group controlId="whatsapp" style={{ marginBottom: 18, textAlign: 'left' }}>
            {/* Rótulo do campo WhatsApp[cite: 10] */}
            <Form.Label style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
              WhatsApp:
            </Form.Label>
            {/* Caixa de texto controlada para o número de WhatsApp[cite: 10] */}
            <Form.Control
              type="text"
              required
              value={whatsapp}
              onChange={(e) => alterarWhatsapp(e.target.value)}
              placeholder="(11) 99999-9999"
              style={{ width: '100%', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </Form.Group>

          {/* Botão para efetuar a submissão e prosseguir para o teste[cite: 10] */}
          <Button
            variant="primary"
            type="submit"
            style={{
              fontSize: '17px',
              padding: '10px 30px',
              backgroundColor: '#FBBC05',
              borderColor: '#FBBC05',
              color: '#202124',
              fontWeight: 'bold',
              marginTop: '10px',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '260px'
            }}
          >
            Iniciar Teste
          </Button>
        </Form>

        {/* Exibe o balão de alerta em vermelho caso ocorra algum erro[cite: 10] */}
        {mensagem && (
          <Alert variant="danger" style={{ marginTop: 15, fontSize: '14px' }}>
            {mensagem}
          </Alert>
        )}
      </section>
    </div>
  );
};

// Exporta o componente Iniciar como padrão[cite: 10]
export default Iniciar;