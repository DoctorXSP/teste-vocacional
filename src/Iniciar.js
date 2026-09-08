// Importa o React e o hook de gerenciamento de estado
import React, { useState } from 'react';
// Importa componentes visuais do Bootstrap para formulários e botões
import { Button, Form, Alert } from 'react-bootstrap';
// Importa a folha de estilos personalizada
import './index.css';
// Importa o componente que executa o questionário vocacional
import Teste from './Teste';

// Declara o componente funcional Iniciar
const Iniciar = () => {
  // Estado para armazenar o nome digitado no campo de texto
  const [nome, alterarNome] = useState('');
  // Estado para armazenar o e-mail digitado no campo
  const [email, alterarEmail] = useState('');
  // Estado para armazenar o WhatsApp digitado
  const [whatsapp, alterarWhatsapp] = useState('');
  // Estado para mensagens informativas de retorno ou erros
  const [mensagem, alterarMensagem] = useState('');
  // Estado para alternar a tela visível ('Iniciar' ou 'Teste')
  const [pagina, alterarPagina] = useState('Iniciar');
  // Estado para armazenar os dados do usuário cadastrado, incluindo o id gerado
  const [usuarioCadastrado, setUsuarioCadastrado] = useState(null);

  // Manipulador de submissão do formulário de cadastro
  const enviarFormulario = async (evento) => {
    // Impede o recarregamento automático padrão da página pelo navegador
    evento.preventDefault();

    // Validação de preenchimento mínimo dos campos
    if (!nome.trim() || !email.trim() || !whatsapp.trim()) {
      // Exibe mensagem de alerta solicitando preenchimento
      alterarMensagem('Por favor, preencha todos os campos.');
      // Encerra a função caso falte algum dado
      return;
    }

    // Agrupa os valores dos estados em um objeto estruturado
    const dadosFormulario = { nome, email, whatsapp };

    // Bloco de tratamento de exceções para requisição assíncrona
    try {
      // Executa a chamada HTTP POST para a rota de cadastro no backend
      const resposta = await fetch('http://localhost:3012/caduser', {
        // Método HTTP utilizado
        method: 'POST',
        // Cabeçalhos informando o envio e recepção de JSON
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Converte o objeto JavaScript em uma string JSON
        body: JSON.stringify(dadosFormulario),
      });

      // Converte o corpo da resposta HTTP em objeto JSON
      const resultado = await resposta.json();

      // Dispara erro caso a requisição não tenha sido respondida com status 2xx
      if (!resposta.ok) {
        // Lança exceção com a mensagem recebida da API ou padrão
        throw new Error(resultado.message || 'Erro ao inserir registro!');
      }

      // Armazena as informações retornadas do usuário para compartilhar com o teste
      setUsuarioCadastrado({
        // Guarda o ID numérico criado no banco
        id: resultado.userId,
        // Guarda o nome do candidato
        nome: nome
      });

      // Transiciona o estado de rota interna para renderizar o componente do Teste
      alterarPagina('Teste');
    // Captura qualquer falha de rede ou validação
    } catch (erro) {
      // Atualiza a mensagem na interface alertando o usuário da falha
      alterarMensagem(`Erro ao cadastrar: ${erro.message}`);
    }
  };

  // Renderização condicional verificando se deve exibir o formulário inicial ou o teste
  return pagina === 'Iniciar' ? (
    // Contêiner principal com fundo estilizado
    <div className="corpoP">
      {/* Barra superior de identificação */}
      <div className="barraSuperior">
        {/* Título principal do aplicativo */}
        <h1 className="barraTexto">Teste de Aptidão Vocacional</h1>
      </div>

      {/* Seção central que envolve o formulário de entrada */}
      <section
        style={{
          width: '50%',
          margin: 'auto',
          marginTop: '45px',
          textAlign: 'center',
          fontSize: '16pt',
          fontWeight: 'bold',
        }}
      >
        {/* Subtítulo da etapa */}
        <h1 style={{ color: '#FFF' }}>Início</h1>
        {/* Orientação ao candidato */}
        <p style={{ color: '#FFF' }}>
          Preencha o formulário abaixo e clique em iniciar
        </p>

        {/* Formulário com escuta no evento de envio onSubmit */}
        <Form onSubmit={enviarFormulario}>
          {/* Grupo de campo para o Nome */}
          <Form.Group controlId="nome" style={{ marginBottom: 12 }}>
            {/* Label do campo Nome */}
            <Form.Label style={{ color: '#FFF', fontWeight: 'bold', marginRight: 10 }}>
              Nome:
            </Form.Label>
            {/* Input controlado pelo estado nome */}
            <Form.Control
              type="text"
              required
              value={nome}
              onChange={(e) => alterarNome(e.target.value)}
              placeholder="Preencha o nome completo"
              style={{ width: '60%', margin: 'auto', padding: 5, fontSize: 14 }}
            />
          </Form.Group>

          {/* Grupo de campo para o E-mail */}
          <Form.Group controlId="email" style={{ marginBottom: 12 }}>
            {/* Label do campo E-mail */}
            <Form.Label style={{ color: '#FFF', fontWeight: 'bold', marginRight: 10 }}>
              e-Mail:
            </Form.Label>
            {/* Input controlado pelo estado email */}
            <Form.Control
              type="email"
              required
              value={email}
              onChange={(e) => alterarEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              style={{ width: '60%', margin: 'auto', padding: 5, fontSize: 14 }}
            />
          </Form.Group>

          {/* Grupo de campo para o WhatsApp */}
          <Form.Group controlId="whatsapp" style={{ marginBottom: 15 }}>
            {/* Label do campo WhatsApp */}
            <Form.Label style={{ color: '#FFF', fontWeight: 'bold', marginRight: 10 }}>
              WhatsApp:
            </Form.Label>
            {/* Input controlado pelo estado whatsapp */}
            <Form.Control
              type="text"
              required
              value={whatsapp}
              onChange={(e) => alterarWhatsapp(e.target.value)}
              placeholder="(11) 99999-9999"
              style={{ width: '60%', margin: 'auto', padding: 5, fontSize: 14 }}
            />
          </Form.Group>

          {/* Botão para confirmação e envio dos dados */}
          <Button
            variant="primary"
            type="submit"
            style={{
              fontSize: 20,
              padding: '10px 30px',
              backgroundColor: '#FBBC05',
              borderColor: '#FBBC05',
              color: '#202124',
              fontWeight: 'bold',
              margin: 15,
              cursor: 'pointer'
            }}
          >
            Iniciar Teste
          </Button>
        </Form>

        {/* Exibe o componente de alerta caso exista mensagem de erro registrada */}
        {mensagem && (
          <Alert variant="danger" style={{ marginTop: 15, fontSize: 14 }}>
            {mensagem}
          </Alert>
        )}
      </section>
    </div>
  ) : (
    // Renderiza o componente Teste repassando o objeto com o ID do usuário cadastrado
    <Teste usuario={usuarioCadastrado} />
  );
};

// Exporta o componente Iniciar como padrão do módulo
export default Iniciar;