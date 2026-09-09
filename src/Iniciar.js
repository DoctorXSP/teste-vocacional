// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, COMPONENTES E ESTILOS
// ============================================================================

// Importa o React base e o hook useState para criação e manipulação dos estados locais do componente
import React, { useState } from 'react';

// Importa os componentes gráficos de interface do pacote react-bootstrap para formulários, botões e avisos
import { Button, Form, Alert } from 'react-bootstrap';

// Importa o arquivo de folha de estilos CSS global com classes personalizadas (como .corpoP e .barraSuperior)
import './index.css';

// Importa o componente visual Teste, que será renderizado após a conclusão bem-sucedida do cadastro
import Teste from './Teste';

// ============================================================================
// COMPONENTE PRINCIPAL: INICIAR
// ============================================================================

// Declaração do componente funcional Iniciar responsável pela coleta de dados do candidato
const Iniciar = () => {
  // --------------------------------------------------------------------------
  // ESTADOS DO FORMULÁRIO E CONTROLE DE NAVEGAÇÃO
  // --------------------------------------------------------------------------

  // Estado que armazena o nome digitado no campo de texto pelo candidato
  const [nome, alterarNome] = useState('');

  // Estado que armazena o endereço de e-mail informado pelo candidato
  const [email, alterarEmail] = useState('');

  // Estado que armazena o número de telefone/WhatsApp preenchido
  const [whatsapp, alterarWhatsapp] = useState('');

  // Estado que guarda as mensagens de retorno para exibição em alerta (validação ou erro da API)
  const [mensagem, alterarMensagem] = useState('');

  // Estado de controle de rota interna da tela (inicia em 'Iniciar' e avança para 'Teste')
  const [pagina, alterarPagina] = useState('Iniciar');

  // Estado que armazena os dados do candidato (incluindo o id gerado no banco) para compartilhar com o Teste
  const [usuarioCadastrado, setUsuarioCadastrado] = useState(null);

  // --------------------------------------------------------------------------
  // LÓGICA DE SUBMISSÃO E ENVIO DO CADASTRO (POST)
  // --------------------------------------------------------------------------

  // Função assíncrona disparada ao enviar o formulário
  const enviarFormulario = async (evento) => {
    // Cancela o comportamento nativo de reload da página acionado pelo navegador
    evento.preventDefault();

    // Valida se algum dos três campos principais está vazio após remover espaços em branco
    if (!nome.trim() || !email.trim() || !whatsapp.trim()) {
      // Alimenta o estado de mensagem solicitando o preenchimento integral
      alterarMensagem('Por favor, preencha todos os campos.');
      // Interrompe o fluxo de execução para evitar requisições com dados incompletos
      return;
    }

    // Agrupa os valores dos estados em um objeto simples para envio
    const dadosFormulario = { nome, email, whatsapp };

    // Bloco de controle para captura de eventuais exceções de rede ou servidor
    try {
      // Dispara a requisição HTTP POST para a rota de cadastro no servidor local Node.js
      const resposta = await fetch('http://localhost:3012/caduser', {
        // Define o método da requisição como POST
        method: 'POST',
        // Configura os cabeçalhos indicando envio e recepção de dados estruturados em JSON
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Converte o objeto JavaScript para uma cadeia de caracteres no padrão JSON
        body: JSON.stringify(dadosFormulario),
      });

      // Extrai e converte a resposta do corpo HTTP para objeto JavaScript
      const resultado = await resposta.json();

      // Se a resposta HTTP contiver status de erro (fora do intervalo 200-299), lança uma exceção
      if (!resposta.ok) {
        // Dispara o erro utilizando a mensagem retornada pelo backend ou texto genérico
        throw new Error(resultado.message || 'Erro ao inserir registro!');
      }

      // Armazena no estado o ID gerado pelo banco de dados junto com o nome do candidato
      setUsuarioCadastrado({
        // Guarda a chave primária (ID) criada no banco de dados
        id: resultado.userId,
        // Guarda o nome completo do candidato
        nome: nome
      });

      // Atualiza o estado da página, permitindo a transição de tela para o componente Teste
      alterarPagina('Teste');
    } catch (erro) {
      // Em caso de falha de conexão ou erro reportado pela API, atualiza a mensagem exibida na tela
      alterarMensagem(`Erro ao cadastrar: ${erro.message}`);
    }
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO DO COMPONENTE VISUAL (JSX)
  // --------------------------------------------------------------------------

  // Operador ternário que verifica se a tela em exibição deve ser o formulário inicial
  return pagina === 'Iniciar' ? (
    // Contêiner geral da visualização com fundo roxo institucional
    <div className="corpoP">
      {/* Barra superior fixa de cabeçalho da aplicação */}
      <div className="barraSuperior">
        {/* Título principal do cabeçalho institucional */}
        <h1 className="barraTexto">Teste de Aptidão Vocacional</h1>
      </div>

      {/* Seção centralizada que engloba os campos e textos de entrada */}
      <section
        style={{
          width: '50%',             // Limita a largura a 50% do contêiner-pai
          margin: 'auto',            // Centraliza horizontalmente na janela
          marginTop: '45px',         // Adiciona recuo superior de 45 pixels
          textAlign: 'center',       // Centraliza o alinhamento de textos internos
          fontSize: '16pt',          // Define tamanho base da fonte em 16 pontos
          fontWeight: 'bold',        // Define o peso da fonte padrão em negrito
        }}
      >
        {/* Título da seção em texto branco */}
        <h1 style={{ color: '#FFF' }}>Início</h1>

        {/* Parágrafo com orientações prévias ao candidato */}
        <p style={{ color: '#FFF' }}>
          Preencha o formulário abaixo e clique em iniciar
        </p>

        {/* Formulário com manipulador de submissão vinculado */}
        <Form onSubmit={enviarFormulario}>
          {/* Grupo de entrada para o campo Nome */}
          <Form.Group controlId="nome" style={{ marginBottom: 12 }}>
            {/* Rótulo descritivo do campo Nome em branco e negrito */}
            <Form.Label style={{ color: '#FFF', fontWeight: 'bold', marginRight: 10 }}>
              Nome:
            </Form.Label>
            {/* Campo de entrada de texto controlado pelo estado nome */}
            <Form.Control
              type="text"                                    // Tipo do controle: texto
              required                                       // Torna o preenchimento obrigatório no navegador
              value={nome}                                   // Liga o valor ao estado local nome
              onChange={(e) => alterarNome(e.target.value)}  // Atualiza o estado a cada caractere digitado
              placeholder="Preencha o nome completo"        // Texto explicativo exibido quando vazio
              style={{ width: '60%', margin: 'auto', padding: 5, fontSize: 14 }} // Estilização visual do campo
            />
          </Form.Group>

          {/* Grupo de entrada para o campo E-mail */}
          <Form.Group controlId="email" style={{ marginBottom: 12 }}>
            {/* Rótulo descritivo do campo E-mail */}
            <Form.Label style={{ color: '#FFF', fontWeight: 'bold', marginRight: 10 }}>
              e-Mail:
            </Form.Label>
            {/* Campo de entrada de texto com validação automática de e-mail */}
            <Form.Control
              type="email"                                    // Tipo do controle: e-mail
              required                                        // Validação de preenchimento obrigatório
              value={email}                                   // Liga o valor ao estado local email
              onChange={(e) => alterarEmail(e.target.value)}  // Atualiza o estado a cada tecla digitada
              placeholder="seuemail@exemplo.com"              // Exemplo de máscara informativa
              style={{ width: '60%', margin: 'auto', padding: 5, fontSize: 14 }} // Dimensões do campo
            />
          </Form.Group>

          {/* Grupo de entrada para o campo WhatsApp */}
          <Form.Group controlId="whatsapp" style={{ marginBottom: 15 }}>
            {/* Rótulo descritivo do campo WhatsApp */}
            <Form.Label style={{ color: '#FFF', fontWeight: 'bold', marginRight: 10 }}>
              WhatsApp:
            </Form.Label>
            {/* Campo de entrada controlado pelo estado whatsapp */}
            <Form.Control
              type="text"                                       // Tipo do controle: texto
              required                                          // Preenchimento obrigatório
              value={whatsapp}                                  // Liga o valor ao estado local whatsapp
              onChange={(e) => alterarWhatsapp(e.target.value)} // Atualiza o estado com o valor digitado
              placeholder="(11) 99999-9999"                     // Máscara sugerida de preenchimento
              style={{ width: '60%', margin: 'auto', padding: 5, fontSize: 14 }} // Largura e formato
            />
          </Form.Group>

          {/* Botão para validação e submissão do formulário */}
          <Button
            variant="primary"        // Variante base de estilo do Bootstrap
            type="submit"            // Define o botão como disparador de envio do formulário
            style={{
              fontSize: 20,          // Tamanho da fonte do botão em 20 pixels
              padding: '10px 30px',  // Espaçamento interno vertical e horizontal
              backgroundColor: '#FBBC05', // Cor de fundo amarela chamativa
              borderColor: '#FBBC05',     // Cor de borda correspondente ao fundo
              color: '#202124',      // Cor do texto escuro para contraste de leitura
              fontWeight: 'bold',    // Texto em negrito destacado
              margin: 15,            // Margem de respiro ao redor do botão
              cursor: 'pointer'      // Cursor em formato de mão ao posicionar o mouse
            }}
          >
            Iniciar Teste
          </Button>
        </Form>

        {/* Renderização condicional do alerta de falha de preenchimento ou erro de rede */}
        {mensagem && (
          // Caixa de alerta visual do tipo perigo (danger / vermelho)
          <Alert variant="danger" style={{ marginTop: 15, fontSize: 14 }}>
            {mensagem}               {/* Exibe o texto de erro contido no estado */}
          </Alert>
        )}
      </section>
    </div>
  ) : (
    // Transiciona para o componente Teste repassando o objeto com o ID e o nome do candidato cadastrado
    <Teste usuario={usuarioCadastrado} />
  );
};

// ============================================================================
// EXPORTAÇÃO DO COMPONENTE
// ============================================================================

// Exporta o componente Iniciar como padrão para ser integrado na tela principal (App.js)
export default Iniciar;