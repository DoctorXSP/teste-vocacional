// Importa o React e o hook de estado useState
import React, { useState } from 'react';
// Importa os componentes de Modal, Botão, Formulário e Alerta do React-Bootstrap
import { Modal, Button, Form, Alert } from 'react-bootstrap';
// Importa a folha de estilos CSS global do projeto
import './index.css';

// Declaração do componente funcional Inserir
const Inserir = () => {
  // Estado que controla a exibição da janela modal de autenticação
  const [showLogin, setShowLogin] = useState(true);
  // Estado que armazena o login digitado pelo operador
  const [username, setUsername] = useState('');
  // Estado que armazena a senha digitada pelo operador
  const [password, setPassword] = useState('');
  // Estado que guarda mensagens de erro caso o login seja inválido
  const [error, setError] = useState('');

  // Usuário padrão de acesso administrativo
  const validUsername = 'etecembu';
  // Senha padrão de acesso administrativo
  const validPassword = 'etec@241';

  // Função disparada para checar as credenciais de login
  const handleLogin = () => {
    if (username === validUsername && password === validPassword) {
      setShowLogin(false);
      setError('');
    } else {
      setError('Usuário ou senha incorretos!');
    }
  };

  // Estados dos campos de cadastro da questão
  const [questao, setQuestao] = useState('');
  const [opcaoA, setOpcaoA] = useState('');
  const [opcaoB, setOpcaoB] = useState('');
  const [opcaoC, setOpcaoC] = useState('');
  const [opcaoD, setOpcaoD] = useState('');
  const [imagem, setImagem] = useState(null);
  const [msg, setMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  // Manipulador ao selecionar um arquivo de imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Manipulador ao submeter o formulário de inclusão
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!imagem) {
      setMsg('Selecione uma imagem antes de enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('questao', questao);
    formData.append('opcaoA', opcaoA);
    formData.append('opcaoB', opcaoB);
    formData.append('opcaoC', opcaoC);
    formData.append('opcaoD', opcaoD);
    formData.append('imagem', imagem);

    try {
      const resposta = await fetch('http://localhost:3012/insert', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!resposta.ok) throw new Error('Falha ao processar inserção no servidor.');

      setMsg('Registro inserido com sucesso!');
      setQuestao('');
      setOpcaoA('');
      setOpcaoB('');
      setOpcaoC('');
      setOpcaoD('');
      setImagem(null);
      setPreviewUrl(null);

      setTimeout(() => setMsg(''), 10000);
    } catch (error) {
      setMsg(`Erro ao inserir registro! ${error.message}`);
    }
  };

  return (
    // Fundo da tela inteira roxo (purple)
    <div className='corpoP'>
      {/* Barra superior exibida ao fundo */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Caixa do modal exatamente no modelo anterior, perfeitamente centralizada */}
      <Modal
        show={showLogin}
        centered
        backdrop="static"
        keyboard={false}
        contentClassName="modal-auth-custom"
      >
        <div
          style={{
            backgroundColor: '#4A148C', // Cor da caixa que você gostou
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
          {/* Cabeçalho da Caixa */}
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

          {/* Alerta de erro */}
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

          {/* Formulário */}
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {/* Campo Usuário */}
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
                autoFocus
                placeholder="Informe o usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            {/* Campo Senha */}
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
                type="password"
                placeholder="Informe a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Botão Acessar */}
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

      {/* Conteúdo da Página de Cadastro de Pergunta (após autenticado) */}
      {!showLogin && (
        <section style={{ width: '85%', margin: 'auto', marginTop: '35px', textAlign: 'center' }}>
          <h1 style={{ color: '#FFF', marginBottom: '25px', fontWeight: 'bold' }}>Cadastro de pergunta</h1>

          <Form onSubmit={handleSubmit} style={{ display: 'inline-block', width: '100%', maxWidth: '850px' }}>
            {/* Questão */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Questão:
              </label>
              <Form.Control
                as="textarea"
                value={questao}
                onChange={e => setQuestao(e.target.value)}
                placeholder="Digite o enunciado da questão..."
                style={{ flex: '1', height: 65, padding: 8, fontSize: 13 }}
                required
              />
            </div>

            {/* Opção A */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Opção A (Biológicas):
              </label>
              <Form.Control
                type="text"
                value={opcaoA}
                onChange={e => setOpcaoA(e.target.value)}
                placeholder="Alternativa para o perfil Biológicas"
                style={{ flex: '1', padding: 8, fontSize: 13 }}
                required
              />
            </div>

            {/* Opção B */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Opção B (Exatas):
              </label>
              <Form.Control
                type="text"
                value={opcaoB}
                onChange={e => setOpcaoB(e.target.value)}
                placeholder="Alternativa para o perfil Exatas"
                style={{ flex: '1', padding: 8, fontSize: 13 }}
                required
              />
            </div>

            {/* Opção C */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Opção C (Humanas):
              </label>
              <Form.Control
                type="text"
                value={opcaoC}
                onChange={e => setOpcaoC(e.target.value)}
                placeholder="Alternativa para o perfil Humanas"
                style={{ flex: '1', padding: 8, fontSize: 13 }}
                required
              />
            </div>

            {/* Opção D */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Opção D (Tecnológicas):
              </label>
              <Form.Control
                type="text"
                value={opcaoD}
                onChange={e => setOpcaoD(e.target.value)}
                placeholder="Alternativa para o perfil Tecnológicas"
                style={{ flex: '1', padding: 8, fontSize: 13 }}
                required
              />
            </div>

            {/* Imagem */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                Imagem:
              </label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ flex: '1', padding: 6, fontSize: 13 }}
                required
              />
            </div>

            {/* Preview */}
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

            {/* Botão Enviar */}
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

export default Inserir;