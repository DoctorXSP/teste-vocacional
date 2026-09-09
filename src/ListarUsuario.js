// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, HOOKS E COMPONENTES
// ============================================================================

// Importa o React e os hooks para estados (useState), ciclo de vida (useEffect) e otimização (useCallback, useMemo)
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Importa os componentes visuais utilitários da biblioteca react-bootstrap
import { Modal, Button, Form, Alert, Table } from 'react-bootstrap';

// Importa a folha de estilos CSS global com classes personalizadas da aplicação
import './index.css';

// ============================================================================
// CONSTANTES E PALETA DE CORES
// ============================================================================

// Dicionário com as cores de identidade visual de cada uma das 4 áreas avaliadas
const CORES_AREAS = {
  biologicas: '#34A853',   // Tom verde oficial para Biológicas
  exatas: '#4285F4',       // Tom azul oficial para Exatas
  humanas: '#FBBC05',      // Tom amarelo oficial para Humanas
  tecnologicas: '#EA4335'  // Tom vermelho oficial para Tecnológicas
};

// ============================================================================
// COMPONENTE PRINCIPAL: LISTARUSUARIO
// ============================================================================

// Declaração do componente funcional ListarUsuario para visualização e gestão dos resultados dos alunos
const ListarUsuario = () => {
  // --------------------------------------------------------------------------
  // ESTADOS DE AUTENTICAÇÃO E ACESSO RESTRITO
  // --------------------------------------------------------------------------

  // Estado que gerencia se a janela modal de login administrativo deve ser exibida (inicia travada como true)
  const [showLogin, setShowLogin] = useState(true);

  // Estado que armazena a string do nome de usuário digitado no campo de login
  const [username, setUsername] = useState('');

  // Estado que armazena a string da senha digitada no campo de login
  const [password, setPassword] = useState('');

  // Estado que guarda mensagens de erro na autenticação caso as credenciais estejam erradas
  const [error, setError] = useState('');

  // Usuário padrão configurado para autorização de acesso ao relatório
  const validUsername = 'etecembu';

  // Senha padrão configurada para autorização de acesso ao relatório
  const validPassword = 'etec@241';

  // Função que confronta os dados digitados com as credenciais administrativas pré-estabelecidas
  const handleLogin = () => {
    // Compara se o usuário e a senha coincidem exatamente com o padrão definido
    if (username === validUsername && password === validPassword) {
      // Fecha a janela modal e libera a visualização da tabela
      setShowLogin(false);
      // Limpa qualquer mensagem prévia de erro
      setError('');
    } else {
      // Notifica o operador que as credenciais são inválidas
      setError('Usuário ou senha incorretos!');
    }
  };

  // --------------------------------------------------------------------------
  // ESTADOS DE CONTROLE DE DADOS E FEEDBACK
  // --------------------------------------------------------------------------

  // Vetor que guarda a relação bruta de usuários e pontuações retornada pelo servidor
  const [usuarios, setUsuarios] = useState([]);

  // Estado booleano que indica se a consulta assíncrona ao servidor está em andamento
  const [carregando, setCarregando] = useState(false);

  // Estado que armazena mensagens textuais de erro ou retorno para o operador
  const [msg, setMsg] = useState('');

  // Estado que armazena a string do filtro de busca em tempo real por nome do candidato
  const [buscaNome, setBuscaNome] = useState('');

  // Estado que indica qual coluna da tabela está controlando a ordenação atual (padrão: 'id')
  const [colunaOrdenacao, setColunaOrdenacao] = useState('id');

  // Estado que indica o sentido da ordenação atual: ascendente ('asc') ou descendente ('desc')
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('desc');

  // --------------------------------------------------------------------------
  // FUNÇÕES DE COMUNICAÇÃO ASSÍNCRONA (GET)
  // --------------------------------------------------------------------------

  // Função assíncrona memorizada com useCallback para requisitar a lista de candidatos do backend
  const carregarUsuarios = useCallback(async () => {
    // Ativa o estado de carregamento para atualizar o botão e prevenir requisições concorrentes
    setCarregando(true);
    try {
      // Dispara a requisição HTTP GET para o endpoint de listagem de usuários
      const resposta = await fetch('http://localhost:3012/usuarios');

      // Dispara exceção caso a resposta do servidor indique falha (status fora do intervalo 200-299)
      if (!resposta.ok) throw new Error('Falha ao buscar usuários do servidor');

      // Converte o corpo da resposta em formato JSON para um vetor de objetos JavaScript
      const dados = await resposta.json();

      // Alimenta o estado com o array de usuários recebido
      setUsuarios(dados);
    } catch (err) {
      // Registra a mensagem de erro no estado para exibição visual
      setMsg(`Erro ao carregar lista: ${err.message}`);
    } finally {
      // Desativa a flag de carregamento após a conclusão ou falha da requisição
      setCarregando(false);
    }
  }, []); // Sem dependências externas móveis, função com referência estável

  // Efeito executado assim que a autenticação é concluída para baixar os registros
  useEffect(() => {
    // Só dispara a consulta caso o operador já tenha passado pela tela de login
    if (!showLogin) {
      carregarUsuarios();
    }
  }, [showLogin, carregarUsuarios]); // Monitora a liberação do login e a referência da função

  // --------------------------------------------------------------------------
  // LÓGICA DE ORDENAÇÃO E ÍCONES DE STATUS
  // --------------------------------------------------------------------------

  // Função executada ao clicar no cabeçalho de qualquer coluna para definir ou alternar ordenação
  const manipularOrdenacao = (coluna) => {
    // Se o usuário clicou na mesma coluna que já estava ordenando
    if (colunaOrdenacao === coluna) {
      // Inverte a direção: se era ascendente vira descendente, e vice-versa
      setDirecaoOrdenacao(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Se clicou em uma nova coluna, define ela como critério ativo
      setColunaOrdenacao(coluna);
      // Reseta a direção inicial para ordem crescente (ascendente)
      setDirecaoOrdenacao('asc');
    }
  };

  // Função auxiliar para renderizar o ícone visual correspondente ao estado de ordenação
  const renderIconeOrdenacao = (coluna) => {
    // Se a coluna avaliada não for a coluna ativa na ordenação, exibe seta neutra e discreta
    if (colunaOrdenacao !== coluna) return <span style={{ opacity: 0.35, marginLeft: '4px', fontSize: '11px' }}>↕</span>;
    // Se a coluna for a ativa, exibe o indicador em destaque amarelo apontando para cima ou para baixo
    return (
      <span style={{ color: 'yellow', fontWeight: 'bold', marginLeft: '4px', fontSize: '11px' }}>
        {direcaoOrdenacao === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  // --------------------------------------------------------------------------
  // PROCESSAMENTO MEMORIZADO: FILTRO E ORDENAÇÃO (USEMEMO)
  // --------------------------------------------------------------------------

  // useMemo recalcula a lista derivada apenas se os usuários, termo de busca ou ordenação mudarem
  const usuariosFiltradosEOrdenados = useMemo(() => {
    // 1. Aplica o filtro de busca textual sobre o nome do candidato
    let resultado = usuarios.filter(user => {
      // Trata o nome do candidato como minúsculo evitando quebras com valores nulos
      const nomeCompleto = (user.nome || '').toLowerCase();
      // Verifica se a sequência informada na busca está contida no nome
      return nomeCompleto.includes(buscaNome.toLowerCase().trim());
    });

    // 2. Ordena os registros filtrados de acordo com a coluna e direção selecionadas
    resultado.sort((a, b) => {
      // Obtém o valor da propriedade no primeiro objeto
      let valorA = a[colunaOrdenacao];
      // Obtém o valor da propriedade no segundo objeto
      let valorB = b[colunaOrdenacao];

      // Sanitiza valores nulos ou indefinidos transformando-os em strings vazias
      if (valorA === null || valorA === undefined) valorA = '';
      if (valorB === null || valorB === undefined) valorB = '';

      // Tratamento para ordenação matemática quando ambos os valores forem números (ex: notas ou ID)
      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return direcaoOrdenacao === 'asc' ? valorA - valorB : valorB - valorA;
      }

      // Tratamento textual: converte para minúsculas para comparação sem distinção de caixa
      const textoA = valorA.toString().toLowerCase();
      const textoB = valorB.toString().toLowerCase();

      // Comparação lexicográfica padrão para strings
      if (textoA < textoB) return direcaoOrdenacao === 'asc' ? -1 : 1;
      if (textoA > textoB) return direcaoOrdenacao === 'asc' ? 1 : -1;
      return 0;
    });

    // Retorna a listagem final processada
    return resultado;
  }, [usuarios, buscaNome, colunaOrdenacao, direcaoOrdenacao]); // Dependências do cálculo memoizado

  // ==========================================================================
  // RENDERIZAÇÃO DO COMPONENTE (JSX)
  // ==========================================================================

  return (
    // Contêiner principal com a classe de fundo roxo padronizado da aplicação
    <div className='corpoP'>
      {/* Barra superior de cabeçalho com o título institucional */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL BLOQUEANTE DE LOGIN ADMINISTRATIVO                             */}
      {/* -------------------------------------------------------------------- */}
      <Modal
        show={showLogin}                      // Condiciona a exibição ao estado showLogin
        centered                              // Centraliza verticalmente a janela na tela
        backdrop="static"                     // Impede que o clique fora da janela feche a modal
        keyboard={false}                      // Desativa a tecla ESC para evitar saída sem login
        contentClassName="modal-auth-custom"  // Remove molduras e sombras padrões do Bootstrap
      >
        {/* Contêiner estilizado com cantos arredondados e fundo roxo institucional */}
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
          {/* Cabeçalho centralizado com ícone e texto orientativo */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '21px', fontWeight: '700', margin: 0 }}>
              🔒 Acesso Administrativo
            </h3>
            <p style={{ color: '#E1BEE7', fontSize: '13px', margin: '8px 0 0 0', fontWeight: '500' }}>
              Informe suas credenciais para visualizar os candidatos
            </p>
          </div>

          {/* Alerta de erro de autenticação exibido caso os dados estejam incorretos */}
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

          {/* Formulário de autenticação */}
          <Form
            onSubmit={(e) => {
              e.preventDefault(); // Previne o reload padrão do navegador ao pressionar Enter
              handleLogin();      // Aciona a rotina de validação
            }}
          >
            {/* Campo de entrada para o nome de usuário */}
            <Form.Group controlId="formUsername" style={{ marginBottom: '16px', textAlign: 'left' }}>
              <Form.Label style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                Usuário:
              </Form.Label>
              <Form.Control
                type="text"
                autoFocus                                    // Foca o campo imediatamente na abertura
                placeholder="Informe o usuário"
                value={username}                             // Valor amarrado ao estado username
                onChange={(e) => setUsername(e.target.value)}// Atualiza o estado a cada tecla digitada
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

            {/* Campo de entrada para a senha */}
            <Form.Group controlId="formPassword" style={{ marginBottom: '24px', textAlign: 'left' }}>
              <Form.Label style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                Senha:
              </Form.Label>
              <Form.Control
                type="password"                              // Oculta os caracteres digitados
                placeholder="Informe a senha"
                value={password}                             // Valor amarrado ao estado password
                onChange={(e) => setPassword(e.target.value)}// Atualiza o estado a cada tecla digitada
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

            {/* Botão de envio para validação das credenciais */}
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
      {/* PAINEL PRINCIPAL DE USUÁRIOS (LIBERADO APÓS LOGIN)                   */}
      {/* -------------------------------------------------------------------- */}
      {!showLogin && (
        <section style={{ width: '70%', maxWidth: '1300px', margin: 'auto', marginTop: '25px', textAlign: 'center' }}>
          {/* Título da seção do relatório em branco */}
          <h1 style={{ color: '#FFF', marginBottom: '18px', fontWeight: 'bold' }}>
            Relatório Geral de Usuários e Resultados
          </h1>

          {/* Barra de Filtros, Busca Dinâmica e Controles de Ação */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '14px 20px',
              borderRadius: '10px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Bloco à esquerda: Campo de busca rápida por Nome */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '0 0 450px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', marginRight: '12px', fontSize: '15px' }}>
                🔍 Buscar por Nome:
              </label>
              <Form.Control
                type="text"
                placeholder="Digite o nome do candidato..."
                value={buscaNome}                             // Valor amarrado ao estado buscaNome
                onChange={(e) => setBuscaNome(e.target.value)}// Filtra a lista instantaneamente
                style={{
                  padding: '8px 14px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  border: '1px solid #FFF',
                  outline: 'none'
                }}
              />
            </div>

            {/* Bloco à direita: Contagem de resultados e botão de sincronização */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Totalizador de registros exibidos em relação ao banco geral */}
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '15px' }}>
                Total: <b>{usuariosFiltradosEOrdenados.length}</b> de {usuarios.length} usuários
              </span>

              {/* Botão para recarregar manualmente os dados da API */}
              <Button
                variant="light"
                onClick={carregarUsuarios}
                disabled={carregando}                         // Desabilita enquanto a requisição estiver ocorrendo
                style={{
                  fontWeight: 'bold',
                  backgroundColor: 'yellow',
                  borderColor: 'yellow',
                  color: 'purple',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                {carregando ? 'Atualizando...' : '🔄 Atualizar'}
              </Button>
            </div>
          </div>

          {/* Alerta de erro caso ocorra falha na busca dos dados */}
          {msg && (
            <Alert variant="danger" style={{ fontWeight: 'bold' }}>
              {msg}
            </Alert>
          )}

          {/* Contêiner com fundo branco e cantos arredondados envolvendo a tabela de dados */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              marginBottom: '40px',
              margin: '0 auto',
              alignItems: 'center'
            }}
          >
            {/* Tabela do Bootstrap com listras alternadas (striped), efeito hover e responsividade */}
            <Table responsive hover striped style={{ margin: 'auto', fontSize: '13.5px', textAlign: 'center' }}>
              {/* Cabeçalho estilizado com fundo escuro e textos clicáveis para ordenação */}
              <thead style={{ backgroundColor: '#2b1055', color: '#ffffff', userSelect: 'none' }}>
                <tr style={{ verticalAlign: 'middle' }}>
                  {/* Coluna 1: ID */}
                  <th
                    onClick={() => manipularOrdenacao('id')}
                    style={{ cursor: 'pointer', padding: '14px 10px', textAlign: 'center', width: '70px' }}
                  >
                    ID {renderIconeOrdenacao('id')}
                  </th>

                  {/* Coluna 2: Nome */}
                  <th
                    onClick={() => manipularOrdenacao('nome')}
                    style={{ cursor: 'pointer', padding: '14px 12px', textAlign: 'center' }}
                  >
                    Nome do Candidato {renderIconeOrdenacao('nome')}
                  </th>

                  {/* Coluna 3: E-mail */}
                  <th
                    onClick={() => manipularOrdenacao('email')}
                    style={{ cursor: 'pointer', padding: '14px 12px', textAlign: 'center' }}
                  >
                    E-mail {renderIconeOrdenacao('email')}
                  </th>

                  {/* Coluna 4: Biológicas (com ícone SVG de Folha em verde) */}
                  <th
                    onClick={() => manipularOrdenacao('biologicas')}
                    style={{ cursor: 'pointer', padding: '14px 8px', textAlign: 'center', color: CORES_AREAS.biologicas }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {/* Vetor SVG de Folha (Biológicas) */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CORES_AREAS.biologicas} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                      </svg>
                      <span>Biológicas</span>
                      {renderIconeOrdenacao('biologicas')}
                    </div>
                  </th>

                  {/* Coluna 5: Exatas (com ícone SVG de Calculadora em azul) */}
                  <th
                    onClick={() => manipularOrdenacao('exatas')}
                    style={{ cursor: 'pointer', padding: '14px 8px', textAlign: 'center', color: CORES_AREAS.exatas }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {/* Vetor SVG de Calculadora (Exatas) */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CORES_AREAS.exatas} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="3" />
                        <line x1="8" y1="6" x2="16" y2="6" />
                        <line x1="16" y1="14" x2="16" y2="18" />
                        <path d="M16 10h.01" />
                        <path d="M12 10h.01" />
                        <path d="M8 10h.01" />
                        <path d="M12 14h.01" />
                        <path d="M8 14h.01" />
                        <path d="M12 18h.01" />
                        <path d="M8 18h.01" />
                      </svg>
                      <span>Exatas</span>
                      {renderIconeOrdenacao('exatas')}
                    </div>
                  </th>

                  {/* Coluna 6: Humanas (com ícone SVG de Pessoas em amarelo) */}
                  <th
                    onClick={() => manipularOrdenacao('humanas')}
                    style={{ cursor: 'pointer', padding: '14px 8px', textAlign: 'center', color: CORES_AREAS.humanas }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {/* Vetor SVG de Pessoas (Humanas) */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CORES_AREAS.humanas} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span>Humanas</span>
                      {renderIconeOrdenacao('humanas')}
                    </div>
                  </th>

                  {/* Coluna 7: Tecnológicas (com ícone SVG de Microchip em vermelho) */}
                  <th
                    onClick={() => manipularOrdenacao('tecnologicas')}
                    style={{ cursor: 'pointer', padding: '14px 8px', textAlign: 'center', color: CORES_AREAS.tecnologicas }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {/* Vetor SVG de Microchip (Tecnológicas) */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CORES_AREAS.tecnologicas} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="4" width="16" height="16" rx="2"/>
                        <rect x="9" y="9" width="6" height="6"/>
                        <path d="M9 1v3"/>
                        <path d="M15 1v3"/>
                        <path d="M9 20v3"/>
                        <path d="M15 20v3"/>
                        <path d="M20 9h3"/>
                        <path d="M20 14h3"/>
                        <path d="M1 9h3"/>
                        <path d="M1 14h3"/>
                      </svg>
                      <span>Tecnológicas</span>
                      {renderIconeOrdenacao('tecnologicas')}
                    </div>
                  </th>

                  {/* Coluna 8: Perfil Predominante */}
                  <th
                    onClick={() => manipularOrdenacao('perfilPredominante')}
                    style={{ cursor: 'pointer', padding: '14px 12px', textAlign: 'center' }}
                  >
                    Perfil Predominante {renderIconeOrdenacao('perfilPredominante')}
                  </th>
                </tr>
              </thead>

              {/* Corpo da tabela com iteração dos dados dos candidatos */}
              <tbody>
                {/* Verifica se a lista filtrada contém registros */}
                {usuariosFiltradosEOrdenados.length > 0 ? (
                  // Mapeia cada usuário para uma linha da tabela
                  usuariosFiltradosEOrdenados.map((user) => (
                    <tr key={user.id} style={{ verticalAlign: 'middle' }}>
                      {/* Exibe o identificador numérico */}
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{user.id}</td>

                      {/* Exibe o nome do candidato */}
                      <td style={{ textAlign: 'center', fontWeight: '600', color: '#111' }}>{user.nome}</td>

                      {/* Exibe o e-mail ou traço caso nulo */}
                      <td style={{ textAlign: 'center', color: '#555' }}>{user.email || '-'}</td>

                      {/* Exibe a pontuação de Biológicas com cor temática verde */}
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: CORES_AREAS.biologicas }}>
                        {user.biologicas} pts
                      </td>

                      {/* Exibe a pontuação de Exatas com cor temática azul */}
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: CORES_AREAS.exatas }}>
                        {user.exatas} pts
                      </td>

                      {/* Exibe a pontuação de Humanas com tom amarelado/âmbar escurecido para legibilidade */}
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#d97706' }}>
                        {user.humanas} pts
                      </td>

                      {/* Exibe a pontuação de Tecnológicas com cor temática vermelha */}
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: CORES_AREAS.tecnologicas }}>
                        {user.tecnologicas} pts
                      </td>

                      {/* Exibe a pílula (badge) de perfil predominante com tratamento de cor para empates */}
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            // Se contiver barra '/' indica empate: exibe pílula amarelada; caso contrário, azulada
                            backgroundColor: user.perfilPredominante?.includes('/') ? '#fff3cd' : '#e8f0fe',
                            color: user.perfilPredominante?.includes('/') ? '#856404' : '#1a73e8',
                            border: `1px solid ${user.perfilPredominante?.includes('/') ? '#ffeeba' : '#d2e3fc'}`
                          }}
                        >
                          {user.perfilPredominante || 'Sem Teste'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Mensagem informativa exibida quando a busca não retorna resultados ou não há dados
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#777', fontSize: '15px' }}>
                      {buscaNome ? `Nenhum candidato encontrado com o termo "${buscaNome}".` : 'Nenhum usuário cadastrado no sistema.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </section>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTAÇÃO DO COMPONENTE
// ============================================================================

// Exporta o componente ListarUsuario como exportação padrão para integração no App.js
export default ListarUsuario;