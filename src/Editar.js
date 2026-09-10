// ============================================================================
// IMPORTAÇÕES DE PACOTES E MÓDULOS EXTERNOS
// ============================================================================

// Importa os hooks do React para controle de estado, ciclo de vida e memorização de funções
import React, { useState, useEffect, useCallback } from 'react';
// Importa componentes visuais do pacote React-Bootstrap
import { Modal, Button, Form, Alert } from 'react-bootstrap';
// Importa as folhas de estilo customizadas
import './estilo.css';
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: EDITAR
// ============================================================================

// Componente para visualização, navegação, edição e remoção de questões
const Editar = () => {
  // Estado que gerencia a exibição da janela modal de autenticação
  const [showLogin, setShowLogin] = useState(true);
  // Estado que armazena o texto do campo de usuário
  const [username, setUsername] = useState('');
  // Estado que armazena o texto do campo de senha
  const [password, setPassword] = useState('');
  // Estado para armazenar mensagens de erro no login
  const [error, setError] = useState('');

  // Usuário padrão com acesso autorizado
  const validUsername = 'etecembu';
  // Senha padrão autorizada
  const validPassword = 'etec@241';

  // Função responsável por autenticar o usuário
  const handleLogin = () => {
    // Compara as credenciais inseridas com as válidas
    if (username === validUsername && password === validPassword) {
      // Fecha a janela de login
      setShowLogin(false);
      // Remove erros anteriores
      setError('');
    } else {
      // Exibe aviso de credenciais inválidas
      setError('Usuário ou senha incorretos!');
    }
  };

  // Estado que armazena o array completo de questões vindas do backend
  const [listaQuestoes, setListaQuestoes] = useState([]);
  // Estado que indica o índice da questão atualmente exibida na tela
  const [indiceAtual, setIndiceAtual] = useState(0);

  // Estados dos campos do formulário para o registro ativo
  const [idAtual, setIdAtual] = useState(null);
  const [questao, setQuestao] = useState('');
  const [opcaoA, setOpcaoA] = useState('');
  const [opcaoB, setOpcaoB] = useState('');
  const [opcaoC, setOpcaoC] = useState('');
  const [opcaoD, setOpcaoD] = useState('');
  const [imagemAtual, setImagemAtual] = useState(null);
  const [novaImagem, setNovaImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Estado para feedback geral ao usuário (sucesso/erro)
  const [msg, setMsg] = useState('');
  // Estado que gerencia a exibição da janela de confirmação de exclusão
  const [showModalExcluir, setShowModalExcluir] = useState(false);

  // Função memorizada para carregar dados de um índice específico da lista nos inputs
  const carregarRegistro = useCallback((indice, lista) => {
    // Verifica se a lista possui elementos e se o índice está dentro dos limites válidos
    if (lista && lista.length > 0 && indice >= 0 && indice < lista.length) {
      // Obtém o registro no índice desejado
      const item = lista[indice];
      // Atualiza o índice corrente
      setIndiceAtual(indice);
      // Atualiza o identificador único
      setIdAtual(item.id);
      // Popula o enunciado
      setQuestao(item.questao);
      // Popula as opções de alternativas
      setOpcaoA(item.opcaoA);
      setOpcaoB(item.opcaoB);
      setOpcaoC(item.opcaoC);
      setOpcaoD(item.opcaoD);
      // Define a foto atual armazenada no servidor
      setImagemAtual(item.imagem);
      // Reseta qualquer nova imagem selecionada previamente
      setNovaImagem(null);
      // Reseta o preview local da imagem
      setPreviewUrl(null);
    }
  }, []);

  // Função memorizada que busca todas as questões da API no backend
  const carregarTodas = useCallback(async (idParaFocar = null) => {
    try {
      // Faz requisição GET ao backend
      const resposta = await fetch('http://localhost:3012/todasQuestoes');
      // Lança erro caso a resposta não seja 200 OK
      if (!resposta.ok) throw new Error('Erro ao buscar lista de questões');

      // Converte o corpo da resposta em JSON
      const dados = await resposta.json();
      // Armazena a lista no estado
      setListaQuestoes(dados);

      // Se existirem questões cadastradas
      if (dados.length > 0) {
        let indiceAlvo = 0;
        // Caso tenhamos solicitado o foco em um ID específico (após edição)
        if (idParaFocar !== null) {
          // Busca a posição do ID na nova lista
          const indiceEncontrado = dados.findIndex(item => item.id === idParaFocar);
          // Se encontrou, define como o novo alvo
          if (indiceEncontrado !== -1) {
            indiceAlvo = indiceEncontrado;
          }
        }
        // Carrega o registro no formulário
        carregarRegistro(indiceAlvo, dados);
      }
    } catch (err) {
      // Atualiza a mensagem de erro
      setMsg(`Erro ao carregar registros: ${err.message}`);
    }
  }, [carregarRegistro]);

  // Efeito disparado quando o modal de login é superado com sucesso
  useEffect(() => {
    // Se logado, busca os dados no servidor
    if (!showLogin) {
      carregarTodas();
    }
  }, [showLogin, carregarTodas]);

  // Função para navegar até a questão anterior
  const registroAnterior = () => {
    // Garante que não recuará além do índice zero
    if (indiceAtual > 0) {
      const novoIndice = indiceAtual - 1;
      carregarRegistro(novoIndice, listaQuestoes);
      setMsg('');
    }
  };

  // Função para navegar até a próxima questão
  const proximoRegistro = () => {
    // Garante que não avançará além do último elemento
    if (indiceAtual < listaQuestoes.length - 1) {
      const novoIndice = indiceAtual + 1;
      carregarRegistro(novoIndice, listaQuestoes);
      setMsg('');
    }
  };

  // Função que lida com a seleção de uma nova imagem pelo input de arquivo
  const handleImageChange = (e) => {
    // Pega o arquivo do input
    const file = e.target.files[0];
    if (file) {
      // Guarda o arquivo binário no estado
      setNovaImagem(file);
      // Cria uma URL em memória para exibir o preview imediatamente
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Função assíncrona para submeter as alterações feitas no formulário
  const handleSalvarEdicao = async (e) => {
    // Evita o recarregamento tradicional da página
    e.preventDefault();
    // Armazena temporariamente o ID ativo
    const idSalvo = idAtual;

    // Constrói o objeto FormData para permitir upload de arquivos e texto
    const formData = new FormData();
    formData.append('questao', questao);
    formData.append('opcaoA', opcaoA);
    formData.append('opcaoB', opcaoB);
    formData.append('opcaoC', opcaoC);
    formData.append('opcaoD', opcaoD);

    // Se o usuário selecionou uma nova imagem, anexa no payload
    if (novaImagem) {
      formData.append('imagem', novaImagem);
    }

    try {
      // Dispara a requisição HTTP PUT para atualizar o registro
      const resposta = await fetch(`http://localhost:3012/update/${idSalvo}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      // Valida se o status da resposta é de sucesso
      if (!resposta.ok) throw new Error('Falha ao atualizar registro no servidor');

      // Informa o usuário sobre o sucesso
      setMsg('Alterações salvas com sucesso!');
      // Recarrega todos os registros e mantém o foco no item recém-alterado
      await carregarTodas(idSalvo);
      // Agenda a limpeza automática da mensagem de feedback após 6 segundos
      setTimeout(() => setMsg(''), 6000);
    } catch (err) {
      // Apresenta a mensagem de erro
      setMsg(`Erro ao salvar: ${err.message}`);
    }
  };

  // Função assíncrona que confirma e executa a deleção do registro
  const confirmarExclusao = async () => {
    // Fecha o modal de confirmação
    setShowModalExcluir(false);
    try {
      // Envia a requisição HTTP DELETE para o endpoint
      const resposta = await fetch(`http://localhost:3012/delete/${idAtual}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      // Valida retorno da requisição
      if (!resposta.ok) throw new Error('Falha ao excluir registro do banco');

      // Mensagem de sucesso
      setMsg('Registro excluído com sucesso!');
      // Filtra o array removendo o item excluído da memória local
      const novaLista = listaQuestoes.filter(item => item.id !== idAtual);
      setListaQuestoes(novaLista);

      // Se ainda restarem elementos após a remoção
      if (novaLista.length > 0) {
        // Ajusta o índice para não estourar os limites da lista
        const proximoIndice = indiceAtual >= novaLista.length ? novaLista.length - 1 : indiceAtual;
        // Carrega o registro adjacente
        carregarRegistro(proximoIndice, novaLista);
      } else {
        // Se a lista ficou vazia, limpa todos os campos
        setIdAtual(null);
        setQuestao('');
        setOpcaoA('');
        setOpcaoB('');
        setOpcaoC('');
        setOpcaoD('');
        setImagemAtual(null);
      }

      // Agenda a limpeza da mensagem de notificação
      setTimeout(() => setMsg(''), 6000);
    } catch (err) {
      // Exibe mensagem de erro caso ocorra falha
      setMsg(`Erro ao excluir: ${err.message}`);
    }
  };

  // Função auxiliar para renderizar linhas com label e campo de formulário com estilo consistente
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
      {/* Label da linha */}
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
      {/* Contêiner do campo de entrada */}
      <div style={{ flex: '999 1 260px', width: '100%' }}>
        {elemento}
      </div>
    </div>
  );

  // Retorno JSX do componente
  return (
    // Contêiner com estilo padrão do projeto
    <div className='corpoP'>
      {/* Barra superior de cabeçalho */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Janela modal para login administrativo */}
      <Modal
        show={showLogin}
        backdrop="static"
        keyboard={false}
        contentClassName="modal-auth-custom"
      >
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
          {/* Cabeçalho do card de autenticação */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', margin: 0 }}>
              🔒 Acesso Administrativo
            </h3>
            <p style={{ color: '#E1BEE7', fontSize: '13px', margin: '6px 0 0 0', fontWeight: '500' }}>
              Informe suas credenciais para continuar
            </p>
          </div>

          {/* Exibe erro se houver falha na tentativa de login */}
          {error && (
            <Alert variant="danger" style={{ fontSize: '13px', padding: '10px', textAlign: 'center' }}>
              {error}
            </Alert>
          )}

          {/* Formulário com validação */}
          <Form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {/* Campo Usuário */}
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

            {/* Campo Senha */}
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

            {/* Botão de envio */}
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

      {/* Modal para confirmação de remoção de pergunta */}
      <Modal show={showModalExcluir} onHide={() => setShowModalExcluir(false)} centered>
        {/* Cabeçalho do modal */}
        <Modal.Header closeButton style={{ backgroundColor: '#d32f2f', color: '#FFF' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 'bold' }}>Confirmação de Exclusão</Modal.Title>
        </Modal.Header>
        {/* Mensagem alertando o ID que será removido */}
        <Modal.Body style={{ padding: '20px', fontSize: '15px' }}>
          Tem certeza de que deseja <b>deletar permanentemente</b> esta pergunta (ID: {idAtual}) do banco de dados?
        </Modal.Body>
        {/* Botões para cancelar ou efetivar deleção */}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalExcluir(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarExclusao} style={{ fontWeight: 'bold' }}>
            Sim, Deletar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Painel do gerenciador de perguntas (visível após login) */}
      {!showLogin && (
        <section style={{ width: '92%', maxWidth: '850px', margin: 'auto', marginTop: '20px', textAlign: 'center' }}>
          {/* Título da seção */}
          <h1 style={{ color: '#FFF', marginBottom: '15px', fontWeight: 'bold', fontSize: '24px' }}>
            Edição de Perguntas
          </h1>

          {/* Barra de paginação/navegação entre registros se houver itens */}
          {listaQuestoes.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              maxWidth: '850px',
              margin: '0 auto 20px auto',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '10px 14px',
              borderRadius: '8px'
            }}>
              {/* Botões de navegação Anterior e Próximo */}
              <div>
                {indiceAtual > 0 && (
                  <Button variant="light" onClick={registroAnterior} style={{ fontWeight: 'bold', marginRight: '8px', fontSize: '13px' }}>
                    ◀ Anterior
                  </Button>
                )}
                {indiceAtual < listaQuestoes.length - 1 && (
                  <Button variant="light" onClick={proximoRegistro} style={{ fontWeight: 'bold', fontSize: '13px' }}>
                    Próximo ▶
                  </Button>
                )}
              </div>

              {/* Contador de posição atual na listagem */}
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>
                Registro {indiceAtual + 1} de {listaQuestoes.length} (ID: {idAtual})
              </span>

              {/* Botão para solicitar a exclusão da questão ativa */}
              <Button variant="danger" onClick={() => setShowModalExcluir(true)} style={{ fontWeight: 'bold', fontSize: '13px' }}>
                🗑️ Deletar Pergunta
              </Button>
            </div>
          )}

          {/* Renderização condicional do formulário de edição */}
          {listaQuestoes.length > 0 ? (
            <Form onSubmit={handleSalvarEdicao} style={{ width: '100%', boxSizing: 'border-box' }}>
              {/* Campo para o Enunciado da questão */}
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

              {/* Campo para Alternativa A (Biológicas) */}
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

              {/* Campo para Alternativa B (Exatas) */}
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

              {/* Campo para Alternativa C (Humanas) */}
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

              {/* Campo para Alternativa D (Tecnológicas) */}
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

              {/* Campo para envio opcional de nova imagem de ilustração */}
              {renderLinhaForm(
                'Substituir Imagem:',
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ width: '100%', padding: 6, fontSize: 13, boxSizing: 'border-box' }}
                />
              )}

              {/* Seção comparativa visual: imagem atual vs nova imagem selecionada */}
              {renderLinhaForm(
                'Visualização:',
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', textAlign: 'left' }}>
                  {/* Prévia da imagem cadastrada no servidor (com timestamp para evitar cache) */}
                  {imagemAtual && (
                    <div>
                      <span style={{ display: 'block', color: '#00ff55', fontSize: '14px', marginBottom: '4px', fontWeight: 700 }}>
                        Atual:
                      </span>
                      <img
                        src={`http://localhost:3012/${imagemAtual}?t=${new Date().getTime()}`}
                        alt="Imagem cadastrada"
                        style={{ height: '180px', width: '180px', maxWidth: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #00ff55' }}
                      />
                    </div>
                  )}

                  {/* Prévia da nova imagem escolhida antes de salvar */}
                  {previewUrl && (
                    <div>
                      <span style={{ display: 'block', color: '#FFD600', fontSize: '14px', marginBottom: '4px', fontWeight: 700 }}>
                        Nova Foto:
                      </span>
                      <img
                        src={previewUrl}
                        alt="Prévia da nova imagem"
                        style={{ height: '180px', width: '180px', maxWidth: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #FFD600' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Botão para submissão do formulário */}
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
                  Salvar Alterações
                </Button>
              </div>
            </Form>
          ) : (
            // Mensagem exibida caso não haja nenhuma pergunta cadastrada
            <p style={{ color: '#FFF', marginTop: '30px' }}>Nenhum registro encontrado no banco de dados.</p>
          )}

          {/* Caixa de alerta para notificações de sucesso ou erro */}
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

// Exporta o componente Editar
export default Editar;