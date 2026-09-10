// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, COMPONENTES E ESTILOS
// ============================================================================

// Importa o React e o hook useState para gerenciar estados locais do formulário[cite: 11]
import React, { useState } from 'react';
// Importa componentes visuais do pacote React-Bootstrap[cite: 11]
import { Modal, Button, Form, Alert } from 'react-bootstrap';
// Importa arquivos de estilização externa[cite: 11]
import './estilo.css';
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: INSERIR
// ============================================================================

// Declara o componente responsável pelo cadastramento de novas perguntas[cite: 11]
const Inserir = () => {
  // Estado que gerencia a exibição da janela de login administrativo[cite: 11]
  const [showLogin, setShowLogin] = useState(true);
  // Estado que armazena o nome de usuário digitado[cite: 11]
  const [username, setUsername] = useState('');
  // Estado que armazena a senha informada[cite: 11]
  const [password, setPassword] = useState('');
  // Estado para armazenar mensagens de erro no login[cite: 11]
  const [error, setError] = useState('');

  // Usuário pré-autorizado[cite: 11]
  const validUsername = 'etecembu';
  // Senha pré-autorizada[cite: 11]
  const validPassword = 'etec@241';

  // Função que valida o login do administrador[cite: 11]
  const handleLogin = () => {
    // Compara o que foi digitado com as credenciais válidas[cite: 11]
    if (username === validUsername && password === validPassword) {
      // Fecha o modal de autenticação liberando a tela[cite: 11]
      setShowLogin(false);
      // Limpa os erros de autenticação[cite: 11]
      setError('');
    } else {
      // Alerta de falha na autenticação[cite: 11]
      setError('Usuário ou senha incorretos!');
    }
  };

  // Estado para o texto do enunciado da questão[cite: 11]
  const [questao, setQuestao] = useState('');
  // Estado para o texto da alternativa A (Perfil Biológicas)[cite: 11]
  const [opcaoA, setOpcaoA] = useState('');
  // Estado para o texto da alternativa B (Perfil Exatas)[cite: 11]
  const [opcaoB, setOpcaoB] = useState('');
  // Estado para o texto da alternativa C (Perfil Humanas)[cite: 11]
  const [opcaoC, setOpcaoC] = useState('');
  // Estado para o texto da alternativa D (Perfil Tecnológicas)[cite: 11]
  const [opcaoD, setOpcaoD] = useState('');
  // Estado para armazenar o arquivo binário da imagem selecionada[cite: 11]
  const [imagem, setImagem] = useState(null);
  // Estado para armazenar mensagens de feedback na interface[cite: 11]
  const [msg, setMsg] = useState('');
  // Estado que armazena a URL temporária para prévia visual da foto[cite: 11]
  const [previewUrl, setPreviewUrl] = useState(null);

  // Disparado no momento em que o usuário escolhe uma imagem no campo de arquivo[cite: 11]
  const handleImageChange = (e) => {
    // Pega o primeiro arquivo anexado[cite: 11]
    const file = e.target.files[0];
    // Se houver arquivo selecionado[cite: 11]
    if (file) {
      // Guarda o arquivo no estado[cite: 11]
      setImagem(file);
      // Cria a URL temporária para alimentar a tag img de pré-visualização[cite: 11]
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Função assíncrona executada na submissão do formulário[cite: 11]
  const handleSubmit = async (event) => {
    // Cancela o comportamento padrão de envio da página[cite: 11]
    event.preventDefault();

    // Valida se o usuário incluiu um arquivo de imagem[cite: 11]
    if (!imagem) {
      // Define alerta solicitando a escolha da imagem[cite: 11]
      setMsg('Selecione uma imagem antes de enviar.');
      // Interrompe o envio[cite: 11]
      return;
    }

    // Instancia o objeto FormData para empacotar campos textuais e binários[cite: 11]
    const formData = new FormData();
    formData.append('questao', questao);
    formData.append('opcaoA', opcaoA);
    formData.append('opcaoB', opcaoB);
    formData.append('opcaoC', opcaoC);
    formData.append('opcaoD', opcaoD);
    formData.append('imagem', imagem);

    try {
      // Realiza a chamada HTTP POST para a rota de cadastro no backend[cite: 11]
      const resposta = await fetch('http://localhost:3012/insert', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      // Dispara erro caso a requisição não seja bem-sucedida[cite: 11]
      if (!resposta.ok) throw new Error('Falha ao processar inserção no servidor.');

      // Define mensagem de confirmação de cadastro[cite: 11]
      setMsg('Registro inserido com sucesso!');

      // Limpa os campos após a conclusão bem-sucedida[cite: 11]
      setQuestao('');
      setOpcaoA('');
      setOpcaoB('');
      setOpcaoC('');
      setOpcaoD('');
      setImagem(null);
      setPreviewUrl(null);

      // Limpa a notificação de status após 10 segundos[cite: 11]
      setTimeout(() => setMsg(''), 10000);
    } catch (error) {
      // Informa ao usuário caso ocorra falha durante a gravação[cite: 11]
      setMsg(`Erro ao inserir registro! ${error.message}`);
    }
  };

  // Função auxiliar para renderizar linhas com labels alinhadas aos campos de entrada[cite: 11]
  const renderLinhaForm = (label, elemento) => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: '14px',
        width: '100%'
      }}
    >
      {/* Rótulo da linha do formulário[cite: 11] */}
      <label
        style={{
          color: '#FFF',
          fontWeight: 'bold',
          flex: '1 1 200px',
          maxWidth: '220px',
          textAlign: 'left',
          fontSize: '14px',
          marginBottom: '5px'
        }}
      >
        {label}
      </label>
      {/* Contêiner flexível do elemento do campo de entrada[cite: 11] */}
      <div style={{ flex: '999 1 260px', width: '100%' }}>
        {elemento}
      </div>
    </div>
  );

  // Retorno JSX do componente[cite: 11]
  return (
    // Div contêiner com fundo roxo[cite: 11]
    <div className='corpoP'>
      {/* Cabeçalho superior com título do teste[cite: 11] */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Janela modal para validação de credenciais de login administrativo[cite: 11] */}
      <Modal
        show={showLogin}
        backdrop="static"
        keyboard={false}
        contentClassName="modal-auth-custom"
      >
        {/* Contêiner de estilização do modal[cite: 11] */}
        <div
          style={{
            backgroundColor: '#4A148C',
            borderRadius: '16px',
            padding: '28px 22px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            width: '100%',
            maxWidth: '420px',
            margin: 'auto',
            boxSizing: 'border-box'
          }}
        >
          {/* Cabeçalho interno do card de login[cite: 11] */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', margin: 0 }}>
              🔒 Acesso Administrativo
            </h3>
            <p style={{ color: '#E1BEE7', fontSize: '13px', margin: '6px 0 0 0', fontWeight: '500' }}>
              Informe suas credenciais para continuar
            </p>
          </div>

          {/* Alerta de erro de autenticação[cite: 11] */}
          {error && (
            <Alert variant="danger" style={{ fontSize: '13px', padding: '10px', textAlign: 'center' }}>
              {error}
            </Alert>
          )}

          {/* Formulário de autenticação[cite: 11] */}
          <Form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {/* Campo Usuário[cite: 11] */}
            <Form.Group controlId="formUsername" style={{ marginBottom: '14px', textAlign: 'left' }}>
              <Form.Label style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                Usuário:
              </Form.Label>
              <Form.Control
                type="text"
                autoFocus
                placeholder="Informe o usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', boxSizing: 'border-box' }}
              />
            </Form.Group>

            {/* Campo Senha[cite: 11] */}
            <Form.Group controlId="formPassword" style={{ marginBottom: '20px', textAlign: 'left' }}>
              <Form.Label style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                Senha:
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Informe a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', boxSizing: 'border-box' }}
              />
            </Form.Group>

            {/* Botão de validação do login[cite: 11] */}
            <Button
              type="button"
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: 'yellow',
                borderColor: 'yellow',
                color: 'purple',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Acessar
            </Button>
          </Form>
        </div>
      </Modal>

      {/* Painel de formulário liberado após login com sucesso[cite: 11] */}
      {!showLogin && (
        <section style={{ width: '92%', maxWidth: '850px', margin: 'auto', marginTop: '25px', textAlign: 'center' }}>
          {/* Título da seção[cite: 11] */}
          <h1 style={{ color: '#FFF', marginBottom: '20px', fontWeight: 'bold', fontSize: '24px' }}>
            Cadastro de pergunta
          </h1>

          {/* Formulário com manipulador de submissão[cite: 11] */}
          <Form onSubmit={handleSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
            {/* Campo para o Enunciado da questão[cite: 11] */}
            {renderLinhaForm(
              'Questão:',
              <Form.Control
                as="textarea"
                value={questao}
                onChange={e => setQuestao(e.target.value)}
                placeholder="Digite o enunciado da questão..."
                style={{ width: '100%', minHeight: 65, padding: 8, fontSize: 13, boxSizing: 'border-box' }}
                required
              />
            )}

            {/* Campo da Alternativa A (Biológicas)[cite: 11] */}
            {renderLinhaForm(
              'Opção A (Biológicas):',
              <Form.Control
                type="text"
                value={opcaoA}
                onChange={e => setOpcaoA(e.target.value)}
                placeholder="Alternativa para o perfil Biológicas"
                style={{ width: '100%', padding: 8, fontSize: 13, boxSizing: 'border-box' }}
                required
              />
            )}

            {/* Campo da Alternativa B (Exatas)[cite: 11] */}
            {renderLinhaForm(
              'Opção B (Exatas):',
              <Form.Control
                type="text"
                value={opcaoB}
                onChange={e => setOpcaoB(e.target.value)}
                placeholder="Alternativa para o perfil Exatas"
                style={{ width: '100%', padding: 8, fontSize: 13, boxSizing: 'border-box' }}
                required
              />
            )}

            {/* Campo da Alternativa C (Humanas)[cite: 11] */}
            {renderLinhaForm(
              'Opção C (Humanas):',
              <Form.Control
                type="text"
                value={opcaoC}
                onChange={e => setOpcaoC(e.target.value)}
                placeholder="Alternativa para o perfil Humanas"
                style={{ width: '100%', padding: 8, fontSize: 13, boxSizing: 'border-box' }}
                required
              />
            )}

            {/* Campo da Alternativa D (Tecnológicas)[cite: 11] */}
            {renderLinhaForm(
              'Opção D (Tecnológicas):',
              <Form.Control
                type="text"
                value={opcaoD}
                onChange={e => setOpcaoD(e.target.value)}
                placeholder="Alternativa para o perfil Tecnológicas"
                style={{ width: '100%', padding: 8, fontSize: 13, boxSizing: 'border-box' }}
                required
              />
            )}

            {/* Campo do anexo de arquivo de imagem[cite: 11] */}
            {renderLinhaForm(
              'Imagem:',
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ width: '100%', padding: 6, fontSize: 13, boxSizing: 'border-box' }}
                required
              />
            )}

            {/* Exibe a prévia da foto escolhida se previewUrl estiver definido[cite: 11] */}
            {previewUrl && renderLinhaForm(
              'Pré-visualização:',
              <div style={{ textAlign: 'left' }}>
                <img
                  src={previewUrl}
                  alt="Pré-visualização da imagem"
                  style={{
                    maxHeight: '180px',
                    maxWidth: '100%',
                    width: 'auto',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '3px solid #FFF'
                  }}
                />
              </div>
            )}

            {/* Botão de envio do formulário[cite: 11] */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button
                variant="primary"
                type="submit"
                style={{
                  fontSize: '17px',
                  padding: '10px 40px',
                  backgroundColor: 'yellow',
                  borderColor: 'yellow',
                  color: 'purple',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '240px'
                }}
              >
                Inserir
              </Button>
            </div>
          </Form>

          {/* Exibe caixa de notificação se houver mensagem definida[cite: 11] */}
          {msg && (
            <Alert
              variant={msg.includes('Erro') ? 'danger' : 'info'}
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

// Exporta o componente Inserir[cite: 11]
export default Inserir;