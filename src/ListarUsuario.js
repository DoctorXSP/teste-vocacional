// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, HOOKS E COMPONENTES
// ============================================================================

// Importa o React e hooks essenciais para manipulação de estados, efeitos e memorização[cite: 14]
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Importa componentes estruturais e visuais do React-Bootstrap[cite: 14]
import { Modal, Button, Form, Alert, Table } from 'react-bootstrap';
// Importa as folhas de estilos do projeto[cite: 14]
import './estilo.css';
import './index.css';

// ============================================================================
// CONSTANTES E PALETA DE CORES
// ============================================================================

// Define a paleta padrão de cores para cada eixo avaliado no teste vocacional[cite: 14]
const CORES_AREAS = {
  // Cor verde institucional representativa da área de Biológicas[cite: 14]
  biologicas: '#34A853',
  // Cor azul institucional representativa da área de Exatas[cite: 14]
  exatas: '#4285F4',
  // Cor amarela/âmbar representativa da área de Humanas[cite: 14]
  humanas: '#FBBC05',
  // Cor vermelha institucional representativa da área de Tecnologia[cite: 14]
  tecnologicas: '#EA4335'
};

// ============================================================================
// COMPONENTE PRINCIPAL: LISTARUSUARIO
// ============================================================================

// Declara o componente funcional responsável pelo relatório de participantes[cite: 14]
const ListarUsuario = () => {
  // Estado que define a visibilidade da janela modal de autenticação restrita[cite: 14]
  const [showLogin, setShowLogin] = useState(true);
  // Estado para armazenar o nome de usuário digitado no login[cite: 14]
  const [username, setUsername] = useState('');
  // Estado para armazenar a senha digitada no login[cite: 14]
  const [password, setPassword] = useState('');
  // Estado para mensagens de feedback em caso de credenciais incorretas[cite: 14]
  const [error, setError] = useState('');

  // Usuário padrão com privilégio de acesso[cite: 14]
  const validUsername = 'etecembu';
  // Senha padrão configurada para o painel[cite: 14]
  const validPassword = 'etec@241';

  // Função responsável pela validação do login administrativo[cite: 14]
  const handleLogin = () => {
    // Compara os campos preenchidos com os valores válidos[cite: 14]
    if (username === validUsername && password === validPassword) {
      // Fecha a janela de autenticação[cite: 14]
      setShowLogin(false);
      // Limpa mensagem de erro prévia[cite: 14]
      setError('');
    } else {
      // Exibe mensagem de erro na interface do modal[cite: 14]
      setError('Usuário ou senha incorretos!');
    }
  };

  // Estado que armazena a lista de candidatos retornada pelo backend[cite: 14]
  const [usuarios, setUsuarios] = useState([]);
  // Estado que indica se a consulta assíncrona está em execução[cite: 14]
  const [carregando, setCarregando] = useState(false);
  // Estado para mensagens de erro ao se comunicar com a API[cite: 14]
  const [msg, setMsg] = useState('');
  // Estado que armazena o termo digitado no filtro de busca por nome[cite: 14]
  const [buscaNome, setBuscaNome] = useState('');
  // Estado que armazena o nome da coluna usada para ordenação ativa da tabela[cite: 14]
  const [colunaOrdenacao, setColunaOrdenacao] = useState('id');
  // Estado que define se a ordenação atual é ascendente ('asc') ou descendente ('desc')[cite: 14]
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('desc');

  // Função assíncrona memorizada para consultar a lista de usuários no banco de dados[cite: 14]
  const carregarUsuarios = useCallback(async () => {
    // Sinaliza início do carregamento de dados[cite: 14]
    setCarregando(true);
    try {
      // Realiza a requisição GET para o endpoint de usuários[cite: 14]
      const resposta = await fetch('http://localhost:3012/usuarios');
      // Lança exceção caso a resposta do servidor não seja 200 OK[cite: 14]
      if (!resposta.ok) throw new Error('Falha ao buscar usuários do servidor');
      // Converte o corpo da resposta em objeto JSON[cite: 14]
      const dados = await resposta.json();
      // Armazena a listagem no estado[cite: 14]
      setUsuarios(dados);
    } catch (err) {
      // Armazena o erro capturado para exibição[cite: 14]
      setMsg(`Erro ao carregar lista: ${err.message}`);
    } finally {
      // Finaliza o status de carregamento independente do desfecho[cite: 14]
      setCarregando(false);
    }
  }, []); // Sem dependências mutáveis para preservar a referência[cite: 14]

  // Efeito disparado para buscar dados assim que a autenticação é bem-sucedida[cite: 14]
  useEffect(() => {
    // Se o modal de login foi ultrapassado[cite: 14]
    if (!showLogin) {
      // Executa a busca inicial da base de dados[cite: 14]
      carregarUsuarios();
    }
  }, [showLogin, carregarUsuarios]); // Reexecuta caso showLogin mude[cite: 14]

  // Função que altera a coluna ativa ou inverte o sentido da ordenação[cite: 14]
  const manipularOrdenacao = (coluna) => {
    // Se clicou na coluna que já estava ativa[cite: 14]
    if (colunaOrdenacao === coluna) {
      // Inverte o sentido entre ascendente e descendente[cite: 14]
      setDirecaoOrdenacao(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Se clicou em uma nova coluna, define ela e inicia com ordem ascendente[cite: 14]
      setColunaOrdenacao(coluna);
      setDirecaoOrdenacao('asc');
    }
  };

  // Função auxiliar para renderizar setas indicadoras de ordenação no cabeçalho[cite: 14]
  const renderIconeOrdenacao = (coluna) => {
    // Se não for a coluna ativa no momento, renderiza ícone neutro e apagado[cite: 14]
    if (colunaOrdenacao !== coluna) return <span style={{ opacity: 0.35, marginLeft: '4px', fontSize: '11px' }}>↕</span>;
    // Retorna seta indicando o sentido selecionado[cite: 14]
    return (
      <span style={{ color: 'yellow', fontWeight: 'bold', marginLeft: '4px', fontSize: '11px' }}>
        {direcaoOrdenacao === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  // Hook useMemo para filtrar e ordenar a lista de participantes sem recomputações desnecessárias[cite: 14]
  const usuariosFiltradosEOrdenados = useMemo(() => {
    // Aplica o filtro baseado no nome digitado no campo de pesquisa[cite: 14]
    let resultado = usuarios.filter(user => {
      // Normaliza o nome do usuário para minúsculas[cite: 14]
      const nomeCompleto = (user.nome || '').toLowerCase();
      // Verifica se o texto pesquisado está contido no nome[cite: 14]
      return nomeCompleto.includes(buscaNome.toLowerCase().trim());
    });

    // Ordena o array filtrado com base na coluna e sentido selecionados[cite: 14]
    resultado.sort((a, b) => {
      // Extrai os valores das propriedades a comparar[cite: 14]
      let valorA = a[colunaOrdenacao];
      let valorB = b[colunaOrdenacao];

      // Trata valores nulos ou indefinidos substituindo por string vazia[cite: 14]
      if (valorA === null || valorA === undefined) valorA = '';
      if (valorB === null || valorB === undefined) valorB = '';

      // Realiza comparação numérica direta caso ambos os campos sejam números[cite: 14]
      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return direcaoOrdenacao === 'asc' ? valorA - valorB : valorB - valorA;
      }

      // Converte para texto em caixa baixa para comparação lexicográfica[cite: 14]
      const textoA = valorA.toString().toLowerCase();
      const textoB = valorB.toString().toLowerCase();

      // Compara alfabeticamente considerando ascendente ou descendente[cite: 14]
      if (textoA < textoB) return direcaoOrdenacao === 'asc' ? -1 : 1;
      if (textoA > textoB) return direcaoOrdenacao === 'asc' ? 1 : -1;
      return 0;
    });

    // Retorna o vetor filtrado e ordenado final[cite: 14]
    return resultado;
  }, [usuarios, buscaNome, colunaOrdenacao, direcaoOrdenacao]); // Recalcula se qualquer uma dessas variáveis alterar[cite: 14]

  // Renderização da interface JSX[cite: 14]
  return (
    // Contêiner principal da página com classe de estilo global[cite: 14]
    <div className='corpoP'>
      {/* Barra superior de identificação da aplicação[cite: 14] */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Modal estático de autenticação administrativa[cite: 14] */}
      <Modal
        show={showLogin}
        backdrop="static"
        keyboard={false}
        contentClassName="modal-auth-custom"
      >
        {/* Contêiner de estilização do card do formulário[cite: 14] */}
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
          {/* Cabeçalho do formulário de autenticação[cite: 14] */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', margin: 0 }}>
              🔒 Acesso Administrativo
            </h3>
            <p style={{ color: '#E1BEE7', fontSize: '13px', margin: '6px 0 0 0', fontWeight: '500' }}>
              Informe suas credenciais para visualizar os candidatos
            </p>
          </div>

          {/* Exibição condicional de mensagem de erro[cite: 14] */}
          {error && (
            <Alert variant="danger" style={{ fontSize: '13px', padding: '10px', textAlign: 'center' }}>
              {error}
            </Alert>
          )}

          {/* Formulário com interceptação de evento de envio[cite: 14] */}
          <Form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {/* Campo de entrada para Usuário[cite: 14] */}
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

            {/* Campo de entrada para Senha[cite: 14] */}
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

            {/* Botão de envio para validar as credenciais[cite: 14] */}
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

      {/* Seção principal exibida apenas após autenticação[cite: 14] */}
      {!showLogin && (
        <section style={{ width: '94%', maxWidth: '1300px', margin: 'auto', marginTop: '20px', textAlign: 'center' }}>
          {/* Título do relatório[cite: 14] */}
          <h1 style={{ color: '#FFF', marginBottom: '18px', fontWeight: 'bold', fontSize: '24px' }}>
            Relatório Geral de Usuários e Resultados
          </h1>

          {/* Barra com ferramentas de filtro e atualização[cite: 14] */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Campo de pesquisa por nome do participante[cite: 14] */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 280px', width: '100%' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
                🔍 Buscar:
              </label>
              <Form.Control
                type="text"
                placeholder="Digite o nome do candidato..."
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  border: '1px solid #FFF',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>

            {/* Contador de resultados e botão para recarregar dados[cite: 14] */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flex: '1 1 240px' }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>
                Total: <b>{usuariosFiltradosEOrdenados.length}</b> de {usuarios.length}
              </span>

              {/* Botão de atualização manual da lista[cite: 14] */}
              <Button
                variant="light"
                onClick={carregarUsuarios}
                disabled={carregando}
                style={{
                  fontWeight: 'bold',
                  backgroundColor: 'yellow',
                  borderColor: 'yellow',
                  color: 'purple',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  fontSize: '13px',
                  padding: '6px 14px'
                }}
              >
                {carregando ? 'Atualizando...' : '🔄 Atualizar'}
              </Button>
            </div>
          </div>

          {/* Alerta exibido em caso de falha de requisição[cite: 14] */}
          {msg && (
            <Alert variant="danger" style={{ fontWeight: 'bold' }}>
              {msg}
            </Alert>
          )}

          {/* Div da tabela utilizando a classe responsiva (70% no desktop, 100% no celular, scroll X e Y) */}
          <div className="tabela-container">
            {/* Tabela estilizada do React-Bootstrap[cite: 14] */}
            <Table responsive hover striped style={{ margin: 0, fontSize: '13px', textAlign: 'center' }}>
              {/* Cabeçalho da tabela com gatilhos de ordenação ao clicar[cite: 14] */}
              <thead style={{ backgroundColor: '#2b1055', color: '#ffffff', userSelect: 'none' }}>
                <tr style={{ verticalAlign: 'middle' }}>
                  {/* Cabeçalho da coluna ID[cite: 14] */}
                  <th onClick={() => manipularOrdenacao('id')} style={{ cursor: 'pointer', padding: '12px 8px', width: '60px' }}>
                    ID {renderIconeOrdenacao('id')}
                  </th>
                  {/* Cabeçalho da coluna Nome[cite: 14] */}
                  <th onClick={() => manipularOrdenacao('nome')} style={{ cursor: 'pointer', padding: '12px 10px' }}>
                    Nome {renderIconeOrdenacao('nome')}
                  </th>
                  {/* Cabeçalho da coluna E-mail[cite: 14] */}
                  <th onClick={() => manipularOrdenacao('email')} style={{ cursor: 'pointer', padding: '12px 10px' }}>
                    E-mail {renderIconeOrdenacao('email')}
                  </th>
                  {/* Cabeçalho da coluna Biológicas[cite: 14] */}
                  <th onClick={() => manipularOrdenacao('biologicas')} style={{ cursor: 'pointer', padding: '12px 8px', color: CORES_AREAS.biologicas }}>
                    Biológicas {renderIconeOrdenacao('biologicas')}
                  </th>
                  {/* Cabeçalho da coluna Exatas[cite: 14] */}
                  <th onClick={() => manipularOrdenacao('exatas')} style={{ cursor: 'pointer', padding: '12px 8px', color: CORES_AREAS.exatas }}>
                    Exatas {renderIconeOrdenacao('exatas')}
                  </th>
                  {/* Cabeçalho da coluna Humanas[cite: 14] */}
                  <th onClick={() => manipularOrdenacao('humanas')} style={{ cursor: 'pointer', padding: '12px 8px', color: CORES_AREAS.humanas }}>
                    Humanas {renderIconeOrdenacao('humanas')}
                  </th>
                  {/* Cabeçalho da coluna Tecnológicas[cite: 14] */}
                  <th onClick={() => manipularOrdenacao('tecnologicas')} style={{ cursor: 'pointer', padding: '12px 8px', color: CORES_AREAS.tecnologicas }}>
                    Tecnológicas {renderIconeOrdenacao('tecnologicas')}
                  </th>
                  {/* Cabeçalho da coluna Perfil Predominante[cite: 14] */}
                  <th onClick={() => manipularOrdenacao('perfilPredominante')} style={{ cursor: 'pointer', padding: '12px 10px' }}>
                    Perfil Predominante {renderIconeOrdenacao('perfilPredominante')}
                  </th>
                </tr>
              </thead>
              {/* Corpo da tabela com mapeamento dos registros[cite: 14] */}
              <tbody>
                {/* Condicional que verifica se há dados a serem mostrados[cite: 14] */}
                {usuariosFiltradosEOrdenados.length > 0 ? (
                  // Itera sobre a lista filtrada gerando as linhas correspondentes[cite: 14]
                  usuariosFiltradosEOrdenados.map((user) => (
                    <tr key={user.id} style={{ verticalAlign: 'middle' }}>
                      {/* Exibe o identificador único[cite: 14] */}
                      <td style={{ fontWeight: 'bold' }}>{user.id}</td>
                      {/* Exibe o nome do candidato[cite: 14] */}
                      <td style={{ fontWeight: '600', color: '#111', textAlign: 'left', paddingLeft: '14px' }}>{user.nome}</td>
                      {/* Exibe o e-mail ou hífen caso esteja em branco[cite: 14] */}
                      <td style={{ color: '#555', textAlign: 'left' }}>{user.email || '-'}</td>
                      {/* Pontuação alcançada em Biológicas[cite: 14] */}
                      <td style={{ fontWeight: 'bold', color: CORES_AREAS.biologicas }}>{user.biologicas} pts</td>
                      {/* Pontuação alcançada em Exatas[cite: 14] */}
                      <td style={{ fontWeight: 'bold', color: CORES_AREAS.exatas }}>{user.exatas} pts</td>
                      {/* Pontuação alcançada em Humanas[cite: 14] */}
                      <td style={{ fontWeight: 'bold', color: '#d97706' }}>{user.humanas} pts</td>
                      {/* Pontuação alcançada em Tecnológicas[cite: 14] */}
                      <td style={{ fontWeight: 'bold', color: CORES_AREAS.tecnologicas }}>{user.tecnologicas} pts</td>
                      {/* Badge com o perfil predominante[cite: 14] */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            // Destaca com amarelo em caso de empate (barra '/') ou azul claro padrão[cite: 14]
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
                  // Linha única informando que nenhum resultado atende à busca[cite: 14]
                  <tr>
                    <td colSpan="8" style={{ padding: '24px', color: '#777', fontSize: '14px' }}>
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

// Exporta o componente ListarUsuario[cite: 14]
export default ListarUsuario;