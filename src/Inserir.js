// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, COMPONENTES E ESTILOS
// ============================================================================

// Importa a biblioteca React e o hook useState para gerenciar os estados do componente
import React, { useState } from 'react';

// Importa os componentes visuais pré-construídos do React-Bootstrap para layout e controle de interface
import { Modal, Button, Form, Alert } from 'react-bootstrap';

// Importa o arquivo global de estilos CSS da aplicação (incluindo cores de fundo e resets)
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: INSERIR
// ============================================================================

// Declaração do componente funcional Inserir, responsável por cadastrar novas questões no banco
const Inserir = () => {
  // --------------------------------------------------------------------------
  // ESTADOS DE AUTENTICAÇÃO ADMINISTRATIVA
  // --------------------------------------------------------------------------

  // Estado booleano que controla a visibilidade da janela modal de autenticação (inicia aberta)
  const [showLogin, setShowLogin] = useState(true);

  // Estado que armazena a string do nome de usuário digitado no login
  const [username, setUsername] = useState('');

  // Estado que armazena a string da senha digitada no login
  const [password, setPassword] = useState('');

  // Estado que guarda mensagens de advertência quando as credenciais forem rejeitadas
  const [error, setError] = useState('');

  // Identificador padrão de usuário autorizado para o painel de cadastro
  const validUsername = 'etecembu';

  // Senha padrão de acesso administrativo ao painel de cadastro
  const validPassword = 'etec@241';

  // Função responsável por validar os dados inseridos contra as credenciais estáticas
  const handleLogin = () => {
    // Compara o usuário e senha informados com as constantes autorizadas
    if (username === validUsername && password === validPassword) {
      // Fecha a modal de autenticação, liberando o painel de cadastro
      setShowLogin(false);
      // Limpa qualquer mensagem prévia de erro
      setError('');
    } else {
      // Alimenta o estado com mensagem de erro visual para o operador
      setError('Usuário ou senha incorretos!');
    }
  };

  // --------------------------------------------------------------------------
  // ESTADOS DOS CAMPOS DA NOVA QUESTÃO
  // --------------------------------------------------------------------------

  // Estado que armazena o texto do enunciado da questão
  const [questao, setQuestao] = useState('');

  // Estado que armazena a alternativa associada ao perfil Biológicas (Opção A)
  const [opcaoA, setOpcaoA] = useState('');

  // Estado que armazena a alternativa associada ao perfil Exatas (Opção B)
  const [opcaoB, setOpcaoB] = useState('');

  // Estado que armazena a alternativa associada ao perfil Humanas (Opção C)
  const [opcaoC, setOpcaoC] = useState('');

  // Estado que armazena a alternativa associada ao perfil Tecnológicas (Opção D)
  const [opcaoD, setOpcaoD] = useState('');

  // Estado que guarda o objeto binário do arquivo de imagem selecionado
  const [imagem, setImagem] = useState(null);

  // Estado que armazena mensagens operacionais de feedback (sucesso ou falha no cadastro)
  const [msg, setMsg] = useState('');

  // Estado que guarda a URL temporária para pré-visualização da imagem no navegador
  const [previewUrl, setPreviewUrl] = useState(null);

  // --------------------------------------------------------------------------
  // MANIPULAÇÃO DE ARQUIVOS E ENVIO (POST)
  // --------------------------------------------------------------------------

  // Função disparada no evento onChange do campo de upload de arquivo
  const handleImageChange = (e) => {
    // Captura o primeiro arquivo selecionado pelo operador no seletor
    const file = e.target.files[0];

    // Verifica se um arquivo válido foi carregado
    if (file) {
      // Armazena a referência do arquivo binário no estado
      setImagem(file);
      // Gera uma URL temporária vinculada ao arquivo em memória para exibição em tela
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Função assíncrona executada ao enviar o formulário de inclusão
  const handleSubmit = async (event) => {
    // Interrompe o recarregamento padrão da página disparado pelo navegador
    event.preventDefault();

    // Valida se o operador anexou uma imagem antes de tentar a inclusão
    if (!imagem) {
      // Alerta o operador e encerra a submissão
      setMsg('Selecione uma imagem antes de enviar.');
      return;
    }

    // Instancia um objeto FormData para encapsular texto e arquivo binário
    const formData = new FormData();
    formData.append('questao', questao); // Anexa o enunciado da questão
    formData.append('opcaoA', opcaoA);   // Anexa o texto da alternativa Biológicas
    formData.append('opcaoB', opcaoB);   // Anexa o texto da alternativa Exatas
    formData.append('opcaoC', opcaoC);   // Anexa o texto da alternativa Humanas
    formData.append('opcaoD', opcaoD);   // Anexa o texto da alternativa Tecnológicas
    formData.append('imagem', imagem);   // Anexa o arquivo de imagem propriamente dito

    // Bloco para captura e tratamento de falhas na comunicação com a API
    try {
      // Dispara a requisição HTTP POST para o endpoint de cadastro no servidor local
      const resposta = await fetch('http://localhost:3012/insert', {
        method: 'POST', // Método de submissão
        body: formData,  // Corpo da requisição com os dados empacotados em FormData
        headers: {
          'Accept': 'application/json' // Indica expectativa de resposta em formato JSON
        }
      });

      // Lança uma exceção se a resposta HTTP não retornar status na faixa 200-299
      if (!resposta.ok) throw new Error('Falha ao processar inserção no servidor.');

      // Alimenta o estado com aviso de confirmação de cadastro bem-sucedido
      setMsg('Registro inserido com sucesso!');

      // Reseta todos os campos do formulário para permitir nova inserção
      setQuestao('');
      setOpcaoA('');
      setOpcaoB('');
      setOpcaoC('');
      setOpcaoD('');
      setImagem(null);
      setPreviewUrl(null);

      // Agenda a limpeza automática da mensagem de feedback após 10 segundos
      setTimeout(() => setMsg(''), 10000);
    } catch (error) {
      // Atualiza a mensagem na interface com o texto explicativo da exceção
      setMsg(`Erro ao inserir registro! ${error.message}`);
    }
  };

  // ==========================================================================
  // RENDERIZAÇÃO DO COMPONENTE (JSX)
  // ==========================================================================

  return (
    // Contêiner base estrutural com a classe de fundo roxo padronizado
    <div className='corpoP'>
      {/* Barra de cabeçalho fixa com o título do projeto */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL BLOQUEANTE DE LOGIN ADMINISTRATIVO                             */}
      {/* -------------------------------------------------------------------- */}
      <Modal
        show={showLogin}                      // Condiciona a exibição ao estado showLogin
        centered                              // Centraliza a janela verticalmente na tela
        backdrop="static"                     // Impede fechamento ao clicar fora da área útil
        keyboard={false}                      // Desativa fechamento pelo pressionamento da tecla ESC
        contentClassName="modal-auth-custom"  // Classe para remover estilos nativos do Bootstrap
      >
        {/* Contêiner estilizado com cantos arredondados e cor roxa escura */}
        <div
          style={{
            backgroundColor: '#4A148C',
            borderRadius: '16px',
            padding: '32px 28px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            width: '100%',
            maxWidth: '420px',
            margin: 'auto',
            boxSizing: 'border-box'
          }}
        >
          {/* Cabeçalho centralizado com ícone e descrição */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h3
              style={{
                color: '#ffffff',
                fontSize: '21px',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '-0.3px'
              }}
            >
              🔒 Acesso Administrativo
            </h3>
            <p
              style={{
                color: '#E1BEE7',
                fontSize: '13px',
                margin: '8px 0 0 0',
                fontWeight: '500'
              }}
            >
              Informe suas credenciais para continuar
            </p>
          </div>

          {/* Exibe o alerta em vermelho caso ocorra erro na validação */}
          {error && (
            <Alert
              variant="danger"
              style={{
                fontSize: '13px',
                fontWeight: '600',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '18px',
                textAlign: 'center'
              }}
            >
              {error}
            </Alert>
          )}

          {/* Formulário de autenticação com interceptação do submit */}
          <Form
            onSubmit={(e) => {
              e.preventDefault(); // Previne o reload padrão do navegador
              handleLogin();      // Executa a função de autenticação
            }}
          >
            {/* Grupo de entrada do nome de usuário */}
            <Form.Group controlId="formUsername" style={{ marginBottom: '16px', textAlign: 'left' }}>
              <Form.Label
                style={{
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginBottom: '6px',
                  display: 'block'
                }}
              >
                Usuário:
              </Form.Label>
              <Form.Control
                type="text"
                autoFocus                                    // Foca o campo automaticamente ao carregar
                placeholder="Informe o usuário"
                value={username}                             // Valor amarrado ao estado username
                onChange={(e) => setUsername(e.target.value)}// Atualiza o estado a cada caractere
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: '#ffffff',
                  color: '#212121',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </Form.Group>

            {/* Grupo de entrada da senha de acesso */}
            <Form.Group controlId="formPassword" style={{ marginBottom: '24px', textAlign: 'left' }}>
              <Form.Label
                style={{
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginBottom: '6px',
                  display: 'block'
                }}
              >
                Senha:
              </Form.Label>
              <Form.Control
                type="password"                              // Oculta visualmente os caracteres digitados
                placeholder="Informe a senha"
                value={password}                             // Valor amarrado ao estado password
                onChange={(e) => setPassword(e.target.value)}// Atualiza o estado a cada caractere
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: '#ffffff',
                  color: '#212121',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </Form.Group>

            {/* Botão de envio para validar as credenciais informadas */}
            <Button
              type="submit"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '15px',
                fontWeight: 'bold',
                backgroundColor: 'yellow',
                borderColor: 'yellow',
                color: 'purple',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Acessar
            </Button>
          </Form>
        </div>
      </Modal>

      {/* -------------------------------------------------------------------- */}
      {/* PAINEL DE CADASTRO (EXIBIDO APENAS APÓS SUCESSO NO LOGIN)            */}
      {/* -------------------------------------------------------------------- */}
      {!showLogin && (
        <section style={{ width: '85%', margin: 'auto', marginTop: '35px', textAlign: 'center' }}>
          {/* Título da seção de cadastro em branco */}
          <h1 style={{ color: '#FFF', marginBottom: '25px', fontWeight: 'bold' }}>Cadastro de pergunta</h1>

          {/* Formulário com labels fixas à esquerda (220px) e campos alinhados */}
          <Form onSubmit={handleSubmit} style={{ display: 'inline-block', width: '100%', maxWidth: '850px' }}>
            
            {/* Linha 1: Enunciado da questão */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Questão:
              </label>
              <Form.Control
                as="textarea"                              // Renderiza como área de texto multi-linhas
                value={questao}                            // Vinculado ao estado questao
                onChange={e => setQuestao(e.target.value)} // Atualiza o estado ao digitar
                placeholder="Digite o enunciado da questão..."
                style={{ flex: '1', height: 65, padding: 8, fontSize: 13 }}
                required                                   // Torna o preenchimento obrigatório
              />
            </div>

            {/* Linha 2: Alternativa Biológicas (Opção A) */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Opção A (Biológicas):
              </label>
              <Form.Control
                type="text"
                value={opcaoA}                            // Vinculado ao estado opcaoA
                onChange={e => setOpcaoA(e.target.value)} // Atualiza o estado ao digitar
                placeholder="Alternativa para o perfil Biológicas"
                style={{ flex: '1', padding: 8, fontSize: 13 }}
                required                                  // Preenchimento obrigatório
              />
            </div>

            {/* Linha 3: Alternativa Exatas (Opção B) */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Opção B (Exatas):
              </label>
              <Form.Control
                type="text"
                value={opcaoB}                            // Vinculado ao estado opcaoB
                onChange={e => setOpcaoB(e.target.value)} // Atualiza o estado ao digitar
                placeholder="Alternativa para o perfil Exatas"
                style={{ flex: '1', padding: 8, fontSize: 13 }}
                required                                  // Preenchimento obrigatório
              />
            </div>

            {/* Linha 4: Alternativa Humanas (Opção C) */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Opção C (Humanas):
              </label>
              <Form.Control
                type="text"
                value={opcaoC}                            // Vinculado ao estado opcaoC
                onChange={e => setOpcaoC(e.target.value)} // Atualiza o estado ao digitar
                placeholder="Alternativa para o perfil Humanas"
                style={{ flex: '1', padding: 8, fontSize: 13 }}
                required                                  // Preenchimento obrigatório
              />
            </div>

            {/* Linha 5: Alternativa Tecnológicas (Opção D) */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Opção D (Tecnológicas):
              </label>
              <Form.Control
                type="text"
                value={opcaoD}                            // Vinculado ao estado opcaoD
                onChange={e => setOpcaoD(e.target.value)} // Atualiza o estado ao digitar
                placeholder="Alternativa para o perfil Tecnológicas"
                style={{ flex: '1', padding: 8, fontSize: 13 }}
                required                                  // Preenchimento obrigatório
              />
            </div>

            {/* Linha 6: Seleção do arquivo de imagem */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Imagem:
              </label>
              <Form.Control
                type="file"                                // Entrada para seleção de arquivo do sistema
                accept="image/*"                           // Filtra apenas extensões de imagem
                onChange={handleImageChange}               // Aciona a leitura e prévia do arquivo
                style={{ flex: '1', padding: 6, fontSize: 13 }}
                required                                   // Torna a imagem obrigatória
              />
            </div>

            {/* Linha 7: Pré-visualização da imagem caso tenha sido selecionada */}
            {previewUrl && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ flex: '0 0 220px' }}></div>
                <img
                  src={previewUrl}
                  alt="Pré-visualização da imagem"
                  style={{ height: '180px', width: '180px', objectFit: 'cover', borderRadius: '10px', border: '3px solid #FFF' }}
                />
              </div>
            )}

            {/* Linha 8: Botão de submissão do cadastro */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
              <div style={{ flex: '0 0 220px' }}></div>
              <Button
                variant="primary"
                type="submit"
                style={{
                  fontSize: '18px',
                  padding: '10px 40px',
                  backgroundColor: 'yellow',
                  borderColor: 'yellow',
                  color: 'purple',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Inserir
              </Button>
            </div>
          </Form>

          {/* Alerta visual com feedback do resultado da requisição */}
          {msg && (
            <Alert
              variant={msg.includes('Erro') ? 'danger' : 'info'} // Alterna entre vermelho e azul conforme o retorno
              style={{ marginTop: '20px', fontWeight: 'bold', maxWidth: '850px', margin: '20px auto 0 auto' }}
            >
              {msg}
            </Alert>
          )}
        </section>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTAÇÃO DO COMPONENTE
// ============================================================================

// Exporta o componente Inserir como padrão para importação nas rotas do App.js
export default Inserir;