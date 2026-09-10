// ============================================================================
// IMPORTAÇÕES DE PACOTES E MÓDULOS EXTERNOS
// ============================================================================

// Importa o React e os hooks para ciclo de vida (useEffect), memoização (useCallback) e estados (useState)
import React, { useState, useEffect, useCallback } from 'react';

// Importa os componentes gráficos pré-construídos do Bootstrap para janelas modais, botões, campos e avisos
import { Modal, Button, Form, Alert } from 'react-bootstrap';

// Importa a folha de estilos CSS global da aplicação
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: EDITAR
// ============================================================================

// Declaração do componente funcional Editar
const Editar = () => {
  // --------------------------------------------------------------------------
  // ESTADOS DE AUTENTICAÇÃO E ACESSO RESTRITO
  // --------------------------------------------------------------------------

  // Estado que determina se a modal de autenticação inicial deve estar aberta (inicia travada como true)
  const [showLogin, setShowLogin] = useState(true);

  // Estado que registra o texto digitado no campo de identificação de usuário
  const [username, setUsername] = useState('');

  // Estado que registra o texto digitado no campo de senha de acesso
  const [password, setPassword] = useState('');

  // Estado que armazena mensagens de advertência caso o login falhe
  const [error, setError] = useState('');

  // Usuário pré-definido no código para liberar acesso ao painel de edição
  const validUsername = 'etecembu';

  // Senha pré-definida no código para liberar acesso ao painel de edição
  const validPassword = 'etec@241';

  // Função que faz o confronto das credenciais inseridas com os dados estáticos
  const handleLogin = () => {
    // Verifica se usuário e senha coincidem exatamente com o padrão definido
    if (username === validUsername && password === validPassword) {
      // Fecha a janela modal de login e libera a visão do painel
      setShowLogin(false);
      // Limpa qualquer mensagem de erro que estivesse ativa
      setError('');
    } else {
      // Exibe mensagem de credenciais inválidas para o operador
      setError('Usuário ou senha incorretos!');
    }
  };

  // --------------------------------------------------------------------------
  // ESTADOS DE CONTROLE DE DADOS DAS QUESTÕES
  // --------------------------------------------------------------------------

  // Armazena a lista com todas as perguntas vindas do banco de dados MySQL
  const [listaQuestoes, setListaQuestoes] = useState([]);

  // Armazena o ponteiro/posição da questão que está sendo exibida no momento
  const [indiceAtual, setIndiceAtual] = useState(0);

  // --------------------------------------------------------------------------
  // ESTADOS DOS CAMPOS DO REGISTRO EM EDIÇÃO
  // --------------------------------------------------------------------------

  // Guarda o identificador (ID) primário do registro carregado na tela
  const [idAtual, setIdAtual] = useState(null);

  // Guarda o enunciado da questão carregado para edição
  const [questao, setQuestao] = useState('');

  // Guarda o texto da Opção A (perfil de Biológicas)
  const [opcaoA, setOpcaoA] = useState('');

  // Guarda o texto da Opção B (perfil de Exatas)
  const [opcaoB, setOpcaoB] = useState('');

  // Guarda o texto da Opção C (perfil de Humanas)
  const [opcaoC, setOpcaoC] = useState('');

  // Guarda o texto da Opção D (perfil de Tecnológicas)
  const [opcaoD, setOpcaoD] = useState('');

  // Guarda o caminho relativo da imagem já salva no servidor
  const [imagemAtual, setImagemAtual] = useState(null);

  // Guarda o novo arquivo de imagem selecionado pelo usuário no input de arquivo
  const [novaImagem, setNovaImagem] = useState(null);

  // Guarda a URL temporária criada para pré-visualizar a nova foto antes do envio
  const [previewUrl, setPreviewUrl] = useState(null);

  // --------------------------------------------------------------------------
  // ESTADOS DE ALERTA E JANELAS AUXILIARES
  // --------------------------------------------------------------------------

  // Guarda mensagens textuais de retorno para avisar o usuário (sucesso, erro, etc.)
  const [msg, setMsg] = useState('');

  // Controla se a modal de confirmação de exclusão deve ser exibida na tela
  const [showModalExcluir, setShowModalExcluir] = useState(false);

  // --------------------------------------------------------------------------
  // FUNÇÕES DE CARREGAMENTO E NAVEGAÇÃO
  // --------------------------------------------------------------------------

  // Função memorizada com useCallback para preencher os estados com a questão do índice indicado
  const carregarRegistro = useCallback((indice, lista) => {
    // Checa se a lista existe, tem itens e se o índice solicitado está dentro dos limites válidos
    if (lista && lista.length > 0 && indice >= 0 && indice < lista.length) {
      // Extrai o objeto da questão na posição informada
      const item = lista[indice];

      // Atualiza o índice corrente ativo
      setIndiceAtual(indice);
      // Define o ID do registro no estado
      setIdAtual(item.id);
      // Preenche o enunciado da questão
      setQuestao(item.questao);
      // Preenche o texto da Opção A
      setOpcaoA(item.opcaoA);
      // Preenche o texto da Opção B
      setOpcaoB(item.opcaoB);
      // Preenche o texto da Opção C
      setOpcaoC(item.opcaoC);
      // Preenche o texto da Opção D
      setOpcaoD(item.opcaoD);
      // Preenche o caminho da imagem cadastrada no servidor
      setImagemAtual(item.imagem);
      // Limpa qualquer arquivo novo selecionado anteriormente no input
      setNovaImagem(null);
      // Limpa a URL temporária de pré-visualização para mostrar apenas a imagem oficial
      setPreviewUrl(null);
    }
  }, []); // Sem dependências dinâmicas externas, função estável

  // Função assíncrona memorizada para recuperar todo o acervo da API
  // Recebe opcionalmente idParaFocar para não resetar sempre para a primeira pergunta
  const carregarTodas = useCallback(async (idParaFocar = null) => {
    try {
      // Faz requisição HTTP GET para a rota que devolve todas as questões cadastradas
      const resposta = await fetch('http://localhost:3012/todasQuestoes');

      // Dispara erro caso o status HTTP não seja de sucesso
      if (!resposta.ok) throw new Error('Erro ao buscar lista de questões');

      // Converte o corpo da resposta para objeto JSON
      const dados = await resposta.json();

      // Atualiza a lista geral com o acervo completo retornado do banco
      setListaQuestoes(dados);

      // Se houver ao menos um registro retornado
      if (dados.length > 0) {
        let indiceAlvo = 0; // Padrão: primeiro registro

        // Se um ID específico foi solicitado (ex: o que acabou de ser salvo)
        if (idParaFocar !== null) {
          // Procura o índice do registro que possui o mesmo ID
          const indiceEncontrado = dados.findIndex(item => item.id === idParaFocar);
          // Se encontrou o registro, foca nele; caso contrário mantém o primeiro
          if (indiceEncontrado !== -1) {
            indiceAlvo = indiceEncontrado;
          }
        }

        // Carrega o registro no índice determinado nos campos do formulário
        carregarRegistro(indiceAlvo, dados);
      }
    } catch (err) {
      // Em caso de falha de conexão ou no backend, informa o erro ao usuário
      setMsg(`Erro ao carregar registros: ${err.message}`);
    }
  }, [carregarRegistro]); // Depende da estabilidade de carregarRegistro

  // Efeito que monitora o término do login para realizar o download dos dados
  useEffect(() => {
    // Só faz a requisição das questões se o usuário já estiver autenticado
    if (!showLogin) {
      carregarTodas();
    }
  }, [showLogin, carregarTodas]); // Executa quando o estado showLogin mudar para falso

  // Função que avança para o registro anterior na lista
  const registroAnterior = () => {
    // Só permite voltar se não estiver no primeiro elemento (índice maior que 0)
    if (indiceAtual > 0) {
      // Calcula o índice anterior
      const novoIndice = indiceAtual - 1;
      // Carrega os dados da questão anterior nos campos
      carregarRegistro(novoIndice, listaQuestoes);
      // Reseta qualquer mensagem de feedback na tela
      setMsg('');
    }
  };

  // Função que avança para o próximo registro na lista
  const proximoRegistro = () => {
    // Só permite avançar se o índice for menor que o último item da lista
    if (indiceAtual < listaQuestoes.length - 1) {
      // Calcula o próximo índice
      const novoIndice = indiceAtual + 1;
      // Carrega os dados da próxima questão nos campos
      carregarRegistro(novoIndice, listaQuestoes);
      // Reseta qualquer mensagem de feedback na tela
      setMsg('');
    }
  };

  // --------------------------------------------------------------------------
  // MANIPULAÇÃO DE ARQUIVOS E IMAGENS
  // --------------------------------------------------------------------------

  // Função acionada quando o operador escolhe um novo arquivo de imagem
  const handleImageChange = (e) => {
    // Captura o primeiro arquivo selecionado no input
    const file = e.target.files[0];

    // Se o arquivo for válido
    if (file) {
      // Armazena o arquivo no estado para posterior envio via FormData
      setNovaImagem(file);
      // Cria e armazena uma URL temporária de objeto para exibir prévia em tempo real
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --------------------------------------------------------------------------
  // OPERAÇÕES CRUD (UPDATE E DELETE)
  // --------------------------------------------------------------------------

  // Função assíncrona responsável por enviar as modificações via PUT com FormData
  const handleSalvarEdicao = async (e) => {
    // Interrompe o recarregamento automático da página ao submeter o formulário
    e.preventDefault();

    // Salva o ID do registro que está sendo alterado para focar nele após o recarregamento
    const idSalvo = idAtual;

    // Cria a estrutura multipart FormData para suportar texto e envio binário de imagem
    const formData = new FormData();
    formData.append('questao', questao); // Anexa o enunciado modificado
    formData.append('opcaoA', opcaoA);   // Anexa o texto da Opção A
    formData.append('opcaoB', opcaoB);   // Anexa o texto da Opção B
    formData.append('opcaoC', opcaoC);   // Anexa o texto da Opção C
    formData.append('opcaoD', opcaoD);   // Anexa o texto da Opção D

    // Se o operador escolheu um novo arquivo, anexa a imagem no campo 'imagem'
    if (novaImagem) {
      formData.append('imagem', novaImagem);
    }

    try {
      // Envia a requisição PUT para o endpoint com o ID do registro atual
      const resposta = await fetch(`http://localhost:3012/update/${idSalvo}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      // Lança erro caso o backend não confirme a atualização com sucesso
      if (!resposta.ok) throw new Error('Falha ao atualizar registro no servidor');

      // Define a mensagem de sucesso para o operador
      setMsg('Alterações salvas com sucesso!');

      // Recarrega todos os registros focando no ID salvo por último (trazendo a nova imagem)
      await carregarTodas(idSalvo);

      // Agenda a limpeza da mensagem de confirmação após 6 segundos
      setTimeout(() => setMsg(''), 6000);
    } catch (err) {
      // Exibe a mensagem de falha ao salvar
      setMsg(`Erro ao salvar: ${err.message}`);
    }
  };

  // Função assíncrona que confirma e executa a exclusão definitiva do registro ativo
  const confirmarExclusao = async () => {
    // Fecha a janela modal de confirmação de exclusão
    setShowModalExcluir(false);

    try {
      // Envia a requisição HTTP DELETE contendo o ID do registro a ser apagado
      const resposta = await fetch(`http://localhost:3012/delete/${idAtual}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      // Lança erro se a exclusão for rejeitada pelo servidor
      if (!resposta.ok) throw new Error('Falha ao excluir registro do banco');

      // Informa o sucesso da exclusão
      setMsg('Registro excluído com sucesso!');

      // Remove localmente a questão apagada da lista filtrando pelo ID
      const novaLista = listaQuestoes.filter(item => item.id !== idAtual);
      // Atualiza o estado da lista
      setListaQuestoes(novaLista);

      // Se ainda sobrarem registros após a remoção
      if (novaLista.length > 0) {
        // Recalcula o novo índice para não apontar para posição inexistente
        const proximoIndice = indiceAtual >= novaLista.length ? novaLista.length - 1 : indiceAtual;
        // Recarrega os campos com o registro restante na nova posição
        carregarRegistro(proximoIndice, novaLista);
      } else {
        // Se a lista ficou vazia, limpa todos os campos da interface
        setIdAtual(null);
        setQuestao('');
        setOpcaoA('');
        setOpcaoB('');
        setOpcaoC('');
        setOpcaoD('');
        setImagemAtual(null);
      }

      // Agenda a remoção da mensagem após 6 segundos
      setTimeout(() => setMsg(''), 6000);
    } catch (err) {
      // Informa o erro de exclusão ao operador
      setMsg(`Erro ao excluir: ${err.message}`);
    }
  };

  // ==========================================================================
  // RENDERIZAÇÃO VISUAL DO COMPONENTE (JSX)
  // ==========================================================================

  return (
    // Contêiner principal envolvendo todo o layout do componente com fundo padrão roxo
    <div className='corpoP'>
      {/* Barra superior institucional da aplicação */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL DE LOGIN ADMINISTRATIVO BLOQUEANTE                             */}
      {/* -------------------------------------------------------------------- */}
      <Modal
        show={showLogin}                      // Exibição condicionada ao estado de autenticação
        centered                              // Centraliza a janela verticalmente
        backdrop="static"                     // Impede que clique fora feche a tela
        keyboard={false}                      // Desativa a tecla Esc
        contentClassName="modal-auth-custom"  // Classe de personalização visual
      >
        {/* Caixa interna customizada com fundo roxo escuro e cantos arredondados */}
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
          {/* Cabeçalho centralizado com ícone e instrução */}
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

          {/* Exibição condicional de mensagem de erro de autenticação */}
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

          {/* Formulário de autenticação com tratamento do evento Enter */}
          <Form
            onSubmit={(e) => {
              e.preventDefault(); // Evita o recarregamento padrão da página
              handleLogin();      // Aciona a validação de credenciais
            }}
          >
            {/* Campo para inserção do usuário */}
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
                autoFocus                                            // Posiciona o cursor automaticamente ao abrir
                placeholder="Informe o usuário"
                value={username}                                     // Valor amarrado ao estado
                onChange={(e) => setUsername(e.target.value)}        // Atualiza o estado ao digitar
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

            {/* Campo para inserção da senha */}
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
                type="password"                                      // Mascara os caracteres digitados
                placeholder="Informe a senha"
                value={password}                                     // Valor amarrado ao estado
                onChange={(e) => setPassword(e.target.value)}        // Atualiza o estado ao digitar
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

            {/* Botão de envio para validação do formulário */}
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
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE PERGUNTA                         */}
      {/* -------------------------------------------------------------------- */}
      <Modal show={showModalExcluir} onHide={() => setShowModalExcluir(false)} centered>
        {/* Cabeçalho da modal com cor vermelha indicando ação destrutiva */}
        <Modal.Header closeButton style={{ backgroundColor: '#d32f2f', color: '#FFF' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 'bold' }}>Confirmação de Exclusão</Modal.Title>
        </Modal.Header>
        {/* Corpo com a advertência e identificador da pergunta a deletar */}
        <Modal.Body style={{ padding: '20px', fontSize: '15px' }}>
          Tem certeza de que deseja <b>deletar permanentemente</b> esta pergunta (ID: {idAtual}) do banco de dados?
        </Modal.Body>
        {/* Rodapé com botões de cancelamento e exclusão definitiva */}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalExcluir(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarExclusao} style={{ fontWeight: 'bold' }}>
            Sim, Deletar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* -------------------------------------------------------------------- */}
      {/* PAINEL PRINCIPAL DE EDIÇÃO (EXIBIDO APÓS O LOGIN)                   */}
      {/* -------------------------------------------------------------------- */}
      {!showLogin && (
        <section style={{ width: '85%', margin: 'auto', marginTop: '25px', textAlign: 'center' }}>
          {/* Título principal da página de edição */}
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
              {/* Contêiner com os botões de navegação anterior/próximo */}
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

              {/* Informação do número do registro atual em relação ao total e o ID no banco */}
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '16px' }}>
                Registro {indiceAtual + 1} de {listaQuestoes.length} (ID: {idAtual})
              </span>

              {/* Botão para disparar a janela de confirmação de exclusão */}
              <Button
                variant="danger"
                onClick={() => setShowModalExcluir(true)}
                style={{ fontWeight: 'bold' }}
              >
                🗑️ Deletar Pergunta
              </Button>
            </div>
          )}

          {/* Formulário com labels fixas à esquerda (220px) e inputs alinhados */}
          {listaQuestoes.length > 0 ? (
            <Form onSubmit={handleSalvarEdicao} style={{ display: 'inline-block', width: '100%', maxWidth: '850px' }}>
              
              {/* Linha 1: Enunciado da questão */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                  Questão:
                </label>
                <Form.Control
                  as="textarea"                                               // Renderiza como área de texto de múltiplas linhas
                  value={questao}                                             // Vinculado ao estado questao
                  onChange={e => setQuestao(e.target.value)}                  // Atualiza o estado
                  placeholder="Digite o enunciado da questão..."
                  style={{ flex: '1', height: 65, padding: 8, fontSize: 13 }}
                  required                                                    // Campo de preenchimento obrigatório
                />
              </div>

              {/* Linha 2: Opção A (perfil Biológicas) */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                  Opção A (Biológicas):
                </label>
                <Form.Control
                  type="text"
                  value={opcaoA}                                              // Vinculado ao estado opcaoA
                  onChange={e => setOpcaoA(e.target.value)}                   // Atualiza o estado
                  placeholder="Alternativa para o perfil Biológicas"
                  style={{ flex: '1', padding: 8, fontSize: 13 }}
                  required                                                    // Campo de preenchimento obrigatório
                />
              </div>

              {/* Linha 3: Opção B (perfil Exatas) */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                  Opção B (Exatas):
                </label>
                <Form.Control
                  type="text"
                  value={opcaoB}                                              // Vinculado ao estado opcaoB
                  onChange={e => setOpcaoB(e.target.value)}                   // Atualiza o estado
                  placeholder="Alternativa para o perfil Exatas"
                  style={{ flex: '1', padding: 8, fontSize: 13 }}
                  required                                                    // Campo de preenchimento obrigatório
                />
              </div>

              {/* Linha 4: Opção C (perfil Humanas) */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                  Opção C (Humanas):
                </label>
                <Form.Control
                  type="text"
                  value={opcaoC}                                              // Vinculado ao estado opcaoC
                  onChange={e => setOpcaoC(e.target.value)}                   // Atualiza o estado
                  placeholder="Alternativa para o perfil Humanas"
                  style={{ flex: '1', padding: 8, fontSize: 13 }}
                  required                                                    // Campo de preenchimento obrigatório
                />
              </div>

              {/* Linha 5: Opção D (perfil Tecnológicas) */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                  Opção D (Tecnológicas):
                </label>
                <Form.Control
                  type="text"
                  value={opcaoD}                                              // Vinculado ao estado opcaoD
                  onChange={e => setOpcaoD(e.target.value)}                   // Atualiza o estado
                  placeholder="Alternativa para o perfil Tecnológicas"
                  style={{ flex: '1', padding: 8, fontSize: 13 }}
                  required                                                    // Campo de preenchimento obrigatório
                />
              </div>

              {/* Linha 6: Campo para substituição de arquivo de imagem */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <label style={{ color: '#FFF', fontWeight: 'bold', flex: '0 0 220px', textAlign: 'left', fontSize: '15px' }}>
                  Substituir Imagem:
                </label>
                <Form.Control
                  type="file"                                                 // Entrada de arquivos
                  accept="image/*"                                            // Restringe a seleção a formatos de imagens
                  onChange={handleImageChange}                                // Dispara a leitura do arquivo e prévia
                  style={{ flex: '1', padding: 6, fontSize: 13 }}
                />
              </div>

              {/* Linha 7: Área de visualização comparativa da foto atual e da nova imagem */}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
                {/* Rótulo lateral fixo */}
                <div style={{ flex: '0 0 220px', textAlign: 'left', color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>
                  Visualização:
                </div>
                {/* Contêiner de imagens lado a lado */}
                <div style={{ flex: '1', display: 'flex', gap: '20px', textAlign: 'left' }}>
                  {/* Foto salva atualmente no servidor */}
                  {imagemAtual && (
                    <div>
                      <span style={{ display: 'block', color: '#FFF', fontSize: '16px', marginBottom: '4px', fontWeight: 700 }}>Atual:</span>
                      <img
                        /* Adiciona cache-buster timestamp para forçar atualização imediata da imagem no navegador */
                        src={`http://localhost:3012/${imagemAtual}?t=${new Date().getTime()}`}
                        alt="Imagem cadastrada"
                        style={{ height: '250px', width: '250px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #FFF' }}
                      />
                    </div>
                  )}

                  {/* Prévia da nova imagem escolhida pelo operador antes de enviar */}
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

              {/* Linha 8: Botão para enviar e salvar as alterações */}
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
            // Mensagem caso o banco de questões esteja completamente sem registros
            <p style={{ color: '#FFF', marginTop: '30px' }}>Nenhum registro encontrado no banco de dados.</p>
          )}

          {/* Mensagem de alerta com feedback dinâmico para operações de edição e exclusão */}
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

// ============================================================================
// EXPORTAÇÃO DO COMPONENTE
// ============================================================================

// Exporta o componente Editar como padrão para uso no roteamento do React
export default Editar;