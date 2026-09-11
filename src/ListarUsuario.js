// ============================================================================
// IMPORTAÇÕES DE MÓDULOS, HOOKS E COMPONENTES
// ============================================================================

// Importa o React e hooks essenciais para manipulação de estados, efeitos e memorização
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Importa componentes estruturais e visuais do React-Bootstrap
import { Modal, Button, Form, Alert, Table } from 'react-bootstrap';
// Importa as folhas de estilos do projeto
import './estilo.css';
import './index.css';

// ============================================================================
// CONSTANTES E PALETA DE CORES
// ============================================================================

// Define a paleta padrão de cores para cada eixo avaliado no teste vocacional
const CORES_AREAS = {
  // Cor verde institucional representativa da área de Biológicas
  biologicas: '#34A853',
  // Cor azul institucional representativa da área de Exatas
  exatas: '#4285F4',
  // Cor amarela/âmbar representativa da área de Humanas
  humanas: '#FBBC05',
  // Cor vermelha institucional representativa da área de Tecnologia
  tecnologicas: '#EA4335'
};

// ============================================================================
// COMPONENTE PRINCIPAL: LISTARUSUARIO
// ============================================================================

// Declara o componente funcional responsável pelo relatório de participantes
const ListarUsuario = () => {
  // Estado que define a visibilidade da janela modal de autenticação restrita
  const [showLogin, setShowLogin] = useState(true);
  // Estado para armazenar o nome de usuário digitado no login
  const [username, setUsername] = useState('');
  // Estado para armazenar a senha digitada no login
  const [password, setPassword] = useState('');
  // Estado para mensagens de feedback em caso de credenciais incorretas
  const [error, setError] = useState('');

  // Usuário padrão com privilégio de acesso
  const validUsername = 'etecembu';
  // Senha padrão configurada para o painel
  const validPassword = 'etec@241';

  // Função responsável pela validação do login administrativo
  const handleLogin = () => {
    // Compara os campos preenchidos com os valores válidos
    if (username === validUsername && password === validPassword) {
      // Fecha a janela de autenticação
      setShowLogin(false);
      // Limpa mensagem de erro prévia
      setError('');
    } else {
      // Exibe mensagem de erro na interface do modal
      setError('Usuário ou senha incorretos!');
    }
  };

  // Estado que armazena a lista de candidatos retornada pelo backend
  const [usuarios, setUsuarios] = useState([]);
  // Estado que indica se a consulta assíncrona está em execução
  const [carregando, setCarregando] = useState(false);
  // Estado para mensagens de erro ao se comunicar com a API
  const [msg, setMsg] = useState('');
  // Estado que armazena o termo digitado no filtro de busca por nome
  const [buscaNome, setBuscaNome] = useState('');
  // Estado que armazena o nome da coluna usada para ordenação ativa da tabela
  const [colunaOrdenacao, setColunaOrdenacao] = useState('id');
  // Estado que define se a ordenação atual é ascendente ('asc') ou descendente ('desc')
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('desc');

  // Função assíncrona memorizada para consultar a lista de usuários no banco de dados
  const carregarUsuarios = useCallback(async () => {
    // Sinaliza início do carregamento de dados
    setCarregando(true);
    try {
      // Realiza a requisição GET para o endpoint de usuários
      const resposta = await fetch('http://localhost:3012/usuarios');
      // Lança exceção caso a resposta do servidor não seja 200 OK
      if (!resposta.ok) throw new Error('Falha ao buscar usuários do servidor');
      // Converte o corpo da resposta em objeto JSON
      const dados = await resposta.json();
      // Armazena a listagem no estado
      setUsuarios(dados);
    } catch (err) {
      // Armazena o erro capturado para exibição
      setMsg(`Erro ao carregar lista: ${err.message}`);
    } finally {
      // Finaliza o status de carregamento independente do desfecho
      setCarregando(false);
    }
  }, []); // Sem dependências mutáveis para preservar a referência

  // Efeito disparado para buscar dados assim que a autenticação é bem-sucedida
  useEffect(() => {
    // Se o modal de login foi ultrapassado
    if (!showLogin) {
      // Executa a busca inicial da base de dados
      carregarUsuarios();
    }
  }, [showLogin, carregarUsuarios]); // Reexecuta caso showLogin mude

  // Função que altera a coluna ativa ou inverte o sentido da ordenação
  const manipularOrdenacao = (coluna) => {
    // Se clicou na coluna que já estava ativa
    if (colunaOrdenacao === coluna) {
      // Inverte o sentido entre ascendente e descendente
      setDirecaoOrdenacao(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Se clicou em uma nova coluna, define ela e inicia com ordem ascendente
      setColunaOrdenacao(coluna);
      setDirecaoOrdenacao('asc');
    }
  };

  // Função auxiliar para renderizar setas indicadoras de ordenação no cabeçalho
  const renderIconeOrdenacao = (coluna) => {
    // Se não for a coluna ativa no momento, renderiza ícone neutro e apagado
    if (colunaOrdenacao !== coluna) return <span style={{ opacity: 0.35, marginLeft: '4px', fontSize: '11px' }}>↕</span>;
    // Retorna seta indicando o sentido selecionado
    return (
      <span style={{ color: 'yellow', fontWeight: 'bold', marginLeft: '4px', fontSize: '11px' }}>
        {direcaoOrdenacao === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  // Função que identifica o perfil predominante (usando o campo do banco ou calculando pelas notas)
  const obterPerfilDoUsuario = (user) => {
    if (user.perfilPredominante && String(user.perfilPredominante).trim() !== '') {
      return user.perfilPredominante;
    }

    const bio = Number(user.biologicas) || 0;
    const exa = Number(user.exatas) || 0;
    const hum = Number(user.humanas) || 0;
    const tec = Number(user.tecnologicas) || 0;

    // Se todas as notas forem 0 ou ausentes
    if (bio === 0 && exa === 0 && hum === 0 && tec === 0) {
      return 'Sem Teste';
    }

    const areas = [
      { nome: 'Tecnológicas', valor: tec },
      { nome: 'Biológicas', valor: bio },
      { nome: 'Exatas', valor: exa },
      { nome: 'Humanas', valor: hum }
    ];

    const maiorNota = Math.max(...areas.map(a => a.valor));
    const maiores = areas.filter(a => a.valor === maiorNota);

    // Se houver mais de uma área na liderança, temos empate
    if (maiores.length > 1) {
      return maiores.map(m => m.nome).join(' / ');
    }

    return maiores[0].nome;
  };

  // Função que define as cores e contornos específicos de cada balão
  const obterEstiloBadge = (perfil) => {
    if (!perfil || perfil === 'Sem Teste') {
      return {
        backgroundColor: '#F1F3F4',
        color: '#5F6368',
        border: '1px solid #DADCE0'
      };
    }

    // Normaliza o texto removendo acentos e convertendo para minúsculas
    const textoLimpo = perfil
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    // Empate: ocre na fonte e bege escuro no em torno
    if (textoLimpo.includes('/') || textoLimpo.includes('empate')) {
      return {
        backgroundColor: '#D7CCC8',
        color: '#5D4037',
        border: '1px solid #BCAAA4'
      };
    }

    // Tecnológicas: vermelho na fonte e vermelho mais claro no em torno
    if (textoLimpo.includes('tecnol') || textoLimpo.includes('ti')) {
      return {
        backgroundColor: '#FCE8E6',
        color: '#D93025',
        border: '1px solid #FAD2CF'
      };
    }

    // Biológicas: verde na fonte e verde mais claro no em torno
    if (textoLimpo.includes('biol')) {
      return {
        backgroundColor: '#E6F4EA',
        color: '#137333',
        border: '1px solid #CEEAD6'
      };
    }

    // Exatas: azul na fonte e azul mais claro no em torno
    if (textoLimpo.includes('exat')) {
      return {
        backgroundColor: '#E8F0FE',
        color: '#1A73E8',
        border: '1px solid #D2E3FC'
      };
    }

    // Humanas: amarelo canário vívido na fonte e amarelo mais claro no em torno
    if (textoLimpo.includes('human')) {
      return {
        backgroundColor: '#FEF9C3',
        color: '#CA8A04',
        border: '1px solid #FDE047'
      };
    }

    return {
      backgroundColor: '#F1F3F4',
      color: '#5F6368',
      border: '1px solid #DADCE0'
    };
  };

  // Hook useMemo para filtrar e ordenar a lista de participantes sem recomputações desnecessárias
  const usuariosFiltradosEOrdenados = useMemo(() => {
    // Aplica o filtro baseado no nome digitado no campo de pesquisa
    let resultado = usuarios.filter(user => {
      // Normaliza o nome do usuário para minúsculas
      const nomeCompleto = (user.nome || '').toLowerCase();
      // Verifica se o texto pesquisado está contido no nome
      return nomeCompleto.includes(buscaNome.toLowerCase().trim());
    });

    // Ordena o array filtrado com base na coluna e sentido selecionados
    resultado.sort((a, b) => {
      // Se a coluna for perfilPredominante, usa o perfil calculado para ordenar
      let valorA = colunaOrdenacao === 'perfilPredominante' ? obterPerfilDoUsuario(a) : a[colunaOrdenacao];
      let valorB = colunaOrdenacao === 'perfilPredominante' ? obterPerfilDoUsuario(b) : b[colunaOrdenacao];

      // Trata valores nulos ou indefinidos substituindo por string vazia
      if (valorA === null || valorA === undefined) valorA = '';
      if (valorB === null || valorB === undefined) valorB = '';

      // Realiza comparação numérica direta caso ambos os campos sejam números
      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return direcaoOrdenacao === 'asc' ? valorA - valorB : valorB - valorA;
      }

      // Converte para texto em caixa baixa para comparação lexicográfica
      const textoA = valorA.toString().toLowerCase();
      const textoB = valorB.toString().toLowerCase();

      // Compara alfabeticamente considerando ascendente ou descendente
      if (textoA < textoB) return direcaoOrdenacao === 'asc' ? -1 : 1;
      if (textoA > textoB) return direcaoOrdenacao === 'asc' ? 1 : -1;
      return 0;
    });

    // Retorna o vetor filtrado e ordenado final
    return resultado;
  }, [usuarios, buscaNome, colunaOrdenacao, direcaoOrdenacao]); // Recalcula se qualquer uma dessas variáveis alterar

  // Renderização da interface JSX
  return (
    // Contêiner principal da página com classe de estilo global
    <div className='corpoP'>
      {/* Barra superior de identificação da aplicação */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Modal estático de autenticação administrativa */}
      <Modal
        show={showLogin}
        backdrop="static"
        keyboard={false}
        contentClassName="modal-auth-custom"
      >
        {/* Contêiner de estilização do card do formulário */}
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
          {/* Cabeçalho do formulário de autenticação */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', margin: 0 }}>
              🔒 Acesso Administrativo
            </h3>
            <p style={{ color: '#E1BEE7', fontSize: '13px', margin: '6px 0 0 0', fontWeight: '500' }}>
              Informe suas credenciais para visualizar os candidatos
            </p>
          </div>

          {/* Exibição condicional de mensagem de erro */}
          {error && (
            <Alert variant="danger" style={{ fontSize: '13px', padding: '10px', textAlign: 'center' }}>
              {error}
            </Alert>
          )}

          {/* Formulário com interceptação de evento de envio */}
          <Form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {/* Campo de entrada para Usuário */}
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

            {/* Campo de entrada para Senha */}
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

            {/* Botão de envio para validar as credenciais */}
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

      {/* Seção principal exibida apenas após autenticação */}
      {!showLogin && (
        <section style={{ width: '94%', maxWidth: '1300px', margin: 'auto', marginTop: '20px', textAlign: 'center' }}>
          {/* Título do relatório */}
          <h1 style={{ color: '#FFF', marginBottom: '18px', fontWeight: 'bold', fontSize: '24px' }}>
            Relatório Geral de Usuários e Resultados
          </h1>

          {/* Barra com ferramentas de filtro e atualização */}
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
            {/* Campo de pesquisa por nome do participante */}
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

            {/* Contador de resultados e botão para recarregar dados */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flex: '1 1 240px' }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>
                Total: <b>{usuariosFiltradosEOrdenados.length}</b> de {usuarios.length}
              </span>

              {/* Botão de atualização manual da lista */}
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

          {/* Alerta exibido em caso de falha de requisição */}
          {msg && (
            <Alert variant="danger" style={{ fontWeight: 'bold' }}>
              {msg}
            </Alert>
          )}

          {/* Div da tabela utilizando a classe responsiva (70% no desktop, 100% no celular, scroll X e Y) */}
          <div className="tabela-container">
            {/* Tabela estilizada do React-Bootstrap */}
            <Table responsive hover striped style={{ margin: 0, fontSize: '13px', textAlign: 'center' }}>
              {/* Cabeçalho da tabela com gatilhos de ordenação ao clicar */}
              <thead style={{ backgroundColor: '#2b1055', color: '#ffffff', userSelect: 'none' }}>
                <tr style={{ verticalAlign: 'middle' }}>
                  {/* Cabeçalho da coluna ID */}
                  <th onClick={() => manipularOrdenacao('id')} style={{ cursor: 'pointer', padding: '12px 8px', width: '60px' }}>
                    ID {renderIconeOrdenacao('id')}
                  </th>
                  {/* Cabeçalho da coluna Nome */}
                  <th onClick={() => manipularOrdenacao('nome')} style={{ cursor: 'pointer', padding: '12px 10px' }}>
                    Nome {renderIconeOrdenacao('nome')}
                  </th>
                  {/* Cabeçalho da coluna E-mail */}
                  <th onClick={() => manipularOrdenacao('email')} style={{ cursor: 'pointer', padding: '12px 10px' }}>
                    E-mail {renderIconeOrdenacao('email')}
                  </th>
                  {/* Cabeçalho da coluna Biológicas */}
                  <th onClick={() => manipularOrdenacao('biologicas')} style={{ cursor: 'pointer', padding: '12px 8px', color: CORES_AREAS.biologicas }}>
                    Biológicas {renderIconeOrdenacao('biologicas')}
                  </th>
                  {/* Cabeçalho da coluna Exatas */}
                  <th onClick={() => manipularOrdenacao('exatas')} style={{ cursor: 'pointer', padding: '12px 8px', color: CORES_AREAS.exatas }}>
                    Exatas {renderIconeOrdenacao('exatas')}
                  </th>
                  {/* Cabeçalho da coluna Humanas */}
                  <th onClick={() => manipularOrdenacao('humanas')} style={{ cursor: 'pointer', padding: '12px 8px', color: CORES_AREAS.humanas }}>
                    Humanas {renderIconeOrdenacao('humanas')}
                  </th>
                  {/* Cabeçalho da coluna Tecnológicas */}
                  <th onClick={() => manipularOrdenacao('tecnologicas')} style={{ cursor: 'pointer', padding: '12px 8px', color: CORES_AREAS.tecnologicas }}>
                    Tecnológicas {renderIconeOrdenacao('tecnologicas')}
                  </th>
                  {/* Cabeçalho da coluna Perfil Predominante */}
                  <th onClick={() => manipularOrdenacao('perfilPredominante')} style={{ cursor: 'pointer', padding: '12px 10px' }}>
                    Perfil Predominante {renderIconeOrdenacao('perfilPredominante')}
                  </th>
                </tr>
              </thead>
              {/* Corpo da tabela com mapeamento dos registros */}
              <tbody>
                {/* Condicional que verifica se há dados a serem mostrados */}
                {usuariosFiltradosEOrdenados.length > 0 ? (
                  usuariosFiltradosEOrdenados.map((user) => {
                    // Obtém o perfil final (seja da API ou calculado pelas notas)
                    const perfilFinal = obterPerfilDoUsuario(user);
                    const estiloBadge = obterEstiloBadge(perfilFinal);

                    return (
                      <tr key={user.id} style={{ verticalAlign: 'middle' }}>
                        {/* Exibe o identificador único */}
                        <td style={{ fontWeight: 'bold' }}>{user.id}</td>
                        {/* Exibe o nome do candidato */}
                        <td style={{ fontWeight: '600', color: '#111', textAlign: 'left', paddingLeft: '14px' }}>{user.nome}</td>
                        {/* Exibe o e-mail ou hífen caso esteja em branco */}
                        <td style={{ color: '#555', textAlign: 'left' }}>{user.email || '-'}</td>
                        {/* Pontuação alcançada em Biológicas */}
                        <td style={{ fontWeight: 'bold', color: CORES_AREAS.biologicas }}>{user.biologicas} pts</td>
                        {/* Pontuação alcançada em Exatas */}
                        <td style={{ fontWeight: 'bold', color: CORES_AREAS.exatas }}>{user.exatas} pts</td>
                        {/* Pontuação alcançada em Humanas */}
                        <td style={{ fontWeight: 'bold', color: '#d97706' }}>{user.humanas} pts</td>
                        {/* Pontuação alcançada em Tecnológicas */}
                        <td style={{ fontWeight: 'bold', color: CORES_AREAS.tecnologicas }}>{user.tecnologicas} pts</td>
                        {/* Badge com o perfil predominante e estilos personalizados */}
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              ...estiloBadge
                            }}
                          >
                            {perfilFinal}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  /* Linha única informando que nenhum resultado atende à busca */
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

// Exporta o componente ListarUsuario
export default ListarUsuario;