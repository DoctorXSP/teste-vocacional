// Importa a biblioteca do React e os hooks para controle de ciclo de vida e estado
import React, { useState, useEffect, useCallback } from 'react';
// Importa os componentes do Bootstrap para layout, modal e controles de formulário
import { Modal, Button, Form, Alert } from 'react-bootstrap';
// Importa os estilos visuais globais
import './index.css';

// Declaração do componente funcional Editar
const Editar = () => {
  // Estado que gerencia a exibição da tela de login administrativo
  const [showLogin, setShowLogin] = useState(true);
  // Estado que armazena o usuário digitado no login
  const [username, setUsername] = useState('');
  // Estado que armazena a senha digitada no login
  const [password, setPassword] = useState('');
  // Estado que armazena a mensagem de erro de autenticação
  const [error, setError] = useState('');

  // Usuário pré-definido para validação
  const validUsername = 'etecembu';
  // Senha pré-definida para validação
  const validPassword = 'etec@241';

  // Validação das credenciais do painel
  const handleLogin = () => {
    if (username === validUsername && password === validPassword) {
      // Libera o painel de edição
      setShowLogin(false);
      setError('');
    } else {
      setError('Usuário ou senha incorretos!');
    }
  };

  // Lista com todas as questões recuperadas do banco de dados
  const [listaQuestoes, setListaQuestoes] = useState([]);
  // Índice da questão atualmente em exibição/edição
  const [indiceAtual, setIndiceAtual] = useState(0);

  // Estados dos campos do registro corrente
  const [idAtual, setIdAtual] = useState(null);
  const [questao, setQuestao] = useState('');
  const [opcaoA, setOpcaoA] = useState('');
  const [opcaoB, setOpcaoB] = useState('');
  const [opcaoC, setOpcaoC] = useState('');
  const [opcaoD, setOpcaoD] = useState('');
  const [imagemAtual, setImagemAtual] = useState(null);
  const [novaImagem, setNovaImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Estados para feedbacks e controle de modal de confirmação
  const [msg, setMsg] = useState('');
  const [showModalExcluir, setShowModalExcluir] = useState(false);

  // Função para popular os estados dos campos com o registro do índice selecionado
  const carregarRegistro = useCallback((indice, lista) => {
    if (lista && lista.length > 0 && indice >= 0 && indice < lista.length) {
      const item = lista[indice];
      setIdAtual(item.id);
      setQuestao(item.questao);
      setOpcaoA(item.opcaoA);
      setOpcaoB(item.opcaoB);
      setOpcaoC(item.opcaoC);
      setOpcaoD(item.opcaoD);
      setImagemAtual(item.imagem);
      setNovaImagem(null);
      setPreviewUrl(null);
    }
  }, []);

  // Busca todas as questões cadastradas no backend
  const carregarTodas = useCallback(async () => {
    try {
      const resposta = await fetch('http://localhost:3012/todasQuestoes');
      if (!resposta.ok) throw new Error('Erro ao buscar lista de questões');
      const dados = await resposta.json();
      setListaQuestoes(dados);
      if (dados.length > 0) {
        carregarRegistro(0, dados);
      }
    } catch (err) {
      setMsg(`Erro ao carregar registros: ${err.message}`);
    }
  }, [carregarRegistro]);

  // Carrega os dados do banco assim que o operador faz login
  useEffect(() => {
    if (!showLogin) {
      carregarTodas();
    }
  }, [showLogin, carregarTodas]);

  // Navegação: Registro Anterior
  const registroAnterior = () => {
    if (indiceAtual > 0) {
      const novoIndice = indiceAtual - 1;
      setIndiceAtual(novoIndice);
      carregarRegistro(novoIndice, listaQuestoes);
      setMsg('');
    }
  };

  // Navegação: Próximo Registro
  const proximoRegistro = () => {
    if (indiceAtual < listaQuestoes.length - 1) {
      const novoIndice = indiceAtual + 1;
      setIndiceAtual(novoIndice);
      carregarRegistro(novoIndice, listaQuestoes);
      setMsg('');
    }
  };

  // Manipulador para seleção de nova foto/arquivo
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNovaImagem(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Salva as alterações feitas no registro atual (PUT)
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('questao', questao);
    formData.append('opcaoA', opcaoA);
    formData.append('opcaoB', opcaoB);
    formData.append('opcaoC', opcaoC);
    formData.append('opcaoD', opcaoD);
    if (novaImagem) {
      formData.append('imagem', novaImagem);
    }

    try {
      const resposta = await fetch(`http://localhost:3012/update/${idAtual}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!resposta.ok) throw new Error('Falha ao atualizar registro no servidor');

      setMsg('Alterações salvas com sucesso!');
      await carregarTodas();
      setTimeout(() => setMsg(''), 6000);
    } catch (err) {
      setMsg(`Erro ao salvar: ${err.message}`);
    }
  };

  // Executa a exclusão definitiva do registro após confirmação no modal (DELETE)
  const confirmarExclusao = async () => {
    setShowModalExcluir(false);

    try {
      const resposta = await fetch(`http://localhost:3012/delete/${idAtual}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!resposta.ok) throw new Error('Falha ao excluir registro do banco');

      setMsg('Registro excluído com sucesso!');
      // Atualiza a lista após exclusão
      const novaLista = listaQuestoes.filter(item => item.id !== idAtual);
      setListaQuestoes(novaLista);

      if (novaLista.length > 0) {
        const proximoIndice = indiceAtual >= novaLista.length ? novaLista.length - 1 : indiceAtual;
        setIndiceAtual(proximoIndice);
        carregarRegistro(proximoIndice, novaLista);
      } else {
        setIdAtual(null);
        setQuestao('');
        setOpcaoA('');
        setOpcaoB('');
        setOpcaoC('');
        setOpcaoD('');
        setImagemAtual(null);
      }

      setTimeout(() => setMsg(''), 6000);
    } catch (err) {
      setMsg(`Erro ao excluir: ${err.message}`);
    }
  };

  return (
    // Fundo da tela inteira roxo (purple)
    <div className='corpoP'>
      {/* Barra superior institucional exibida ao fundo */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Caixa do modal exatamente no modelo aprovado, centralizada vertical e horizontalmente */}
      <Modal
        show={showLogin}
        centered
        backdrop="static"
        keyboard={false}
        contentClassName="modal-auth-custom"
      >
        <div
          style={{
            backgroundColor: '#4A148C', // Cor da caixa com cantos arredondados
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

          {/* Alerta de erro de autenticação */}
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

          {/* Formulário com submissão por Enter */}
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

      {/* Modal de Confirmação para Deletar */}
      <Modal show={showModalExcluir} onHide={() => setShowModalExcluir(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#d32f2f', color: '#FFF' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 'bold' }}>Confirmação de Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px', fontSize: '15px' }}>
          Tem certeza de que deseja <b>deletar permanentemente</b> esta pergunta (ID: {idAtual}) do banco de dados?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalExcluir(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarExclusao} style={{ fontWeight: 'bold' }}>
            Sim, Deletar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Interface Principal exibida após login */}
      {!showLogin && (
        <section style={{ width: '85%', margin: 'auto', marginTop: '25px', textAlign: 'center' }}>
          <h1 style={{ color: '#FFF', marginBottom: '15px', fontWeight: 'bold' }}>Edição de Perguntas</h1>

          {/* Barra de Navegação entre Registros e Controles de Ação */}
          {listaQuestoes.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '850px',
              margin: '0 auto 20px auto',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '10px 20px',
              borderRadius: '8px'
            }}>
              <div style={{ minWidth: '180px', textAlign: 'left' }}>
                {/* O botão Anterior só é renderizado a partir do 2º registro */}
                {indiceAtual > 0 && (
                  <Button
                    variant="light"
                    onClick={registroAnterior}
                    style={{ fontWeight: 'bold', marginRight: '10px' }}
                  >
                    ◀ Anterior
                  </Button>
                )}
                {/* O botão Próximo só é renderizado enquanto não for o último registro */}
                {indiceAtual < listaQuestoes.length - 1 && (
                  <Button
                    variant="light"
                    onClick={proximoRegistro}
                    style={{ fontWeight: 'bold' }}
                  >
                    Próximo ▶
                  </Button>
                )}
              </div>

              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '16px' }}>
                Registro {indiceAtual + 1} de {listaQuestoes.length} (ID: {idAtual})
              </span>

              <Button
                variant="danger"
                onClick={() => setShowModalExcluir(true)}
                style={{ fontWeight: 'bold' }}
              >
                🗑️ Deletar Pergunta
              </Button>
            </div>
          )}

          {/* Formulário com labels à esquerda (220px) e inputs perfeitamente alinhados */}
          {listaQuestoes.length > 0 ? (
            <Form onSubmit={handleSalvarEdicao} style={{ display: 'inline-block', width: '100%', maxWidth: '850px' }}>
              
              {/* Linha 1: Enunciado da questão */}
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

              {/* Linha 2: Opção A (Biológicas) */}
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

              {/* Linha 3: Opção B (Exatas) */}
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

              {/* Linha 4: Opção C (Humanas) */}
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

              {/* Linha 5: Opção D (Tecnológicas) */}
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

              {/* Linha 6: Troca de Imagem */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                  Substituir Imagem:
                </label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ flex: '1', padding: 6, fontSize: 13 }}
                />
              </div>

              {/* Linha 7: Exibição da Imagem Atual e da Nova Imagem selecionada */}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ flex: '0 0 220px', textAlign: 'left', color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>
                  Visualização:
                </div>
                <div style={{ flex: '1', display: 'flex', gap: '20px', textAlign: 'left' }}>
                  {imagemAtual && (
                    <div>
                      <span style={{ display: 'block', color: '#FFF', fontSize: '16px', marginBottom: '4px', fontWeight: 700 }}>Atual:</span>
                      <img
                        src={`http://localhost:3012/${imagemAtual}`}
                        alt="Imagem cadastrada"
                        style={{ height: '250px', width: '250px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #FFF' }}
                      />
                    </div>
                  )}

                  {previewUrl && (
                    <div>
                      <span style={{ display: 'block', color: '#FFD600', fontSize: '16px', marginBottom: '4px', fontWeight: 700 }}>Nova Foto:</span>
                      <img
                        src={previewUrl}
                        alt="Prévia da nova imagem"
                        style={{ height: '250px', width: '250px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #FFD600' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Linha 8: Botão Salvar Alterações */}
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
                  Salvar Alterações
                </Button>
              </div>
            </Form>
          ) : (
            <p style={{ color: '#FFF', marginTop: '30px' }}>Nenhum registro encontrado no banco de dados.</p>
          )}

          {/* Mensagem de Feedback */}
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

// Exporta o componente Editar como padrão
export default Editar;