// Importa o React e os hooks necessários para controle de estado, ciclo de vida e memoização
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Importa os componentes do Bootstrap para modais, formulários, alertas e tabela
import { Modal, Button, Form, Alert, Table } from 'react-bootstrap';
// Importa a folha de estilos padrão da aplicação
import './index.css';

// Paleta de cores oficiais de cada vertente
const CORES_AREAS = {
  biologicas: '#34A853',
  exatas: '#4285F4',
  humanas: '#FBBC05',
  tecnologicas: '#EA4335'
};

// Declaração do componente funcional ListarUsuario
const ListarUsuario = () => {
  // Estado para controlar a exibição do modal de autenticação
  const [showLogin, setShowLogin] = useState(true);
  // Estados para as credenciais digitadas
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Usuário e senha padrão administrativo
  const validUsername = 'etecembu';
  const validPassword = 'etec@241';

  // Validação das credenciais do painel
  const handleLogin = () => {
    if (username === validUsername && password === validPassword) {
      setShowLogin(false);
      setError('');
    } else {
      setError('Usuário ou senha incorretos!');
    }
  };

  // Estados para a lista de usuários e feedbacks
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState('');

  // Estado para o filtro de busca textual por nome
  const [buscaNome, setBuscaNome] = useState('');

  // Estados para controle de ordenação dinâmica das colunas
  const [colunaOrdenacao, setColunaOrdenacao] = useState('id');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('desc');

  // Função assíncrona para buscar os usuários no backend
  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await fetch('http://localhost:3012/usuarios');
      if (!resposta.ok) throw new Error('Falha ao buscar usuários do servidor');
      const dados = await resposta.json();
      setUsuarios(dados);
    } catch (err) {
      setMsg(`Erro ao carregar lista: ${err.message}`);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Carrega os registros assim que o login é efetuado
  useEffect(() => {
    if (!showLogin) {
      carregarUsuarios();
    }
  }, [showLogin, carregarUsuarios]);

  // Alterna a coluna ou inverte a direção da ordenação
  const manipularOrdenacao = (coluna) => {
    if (colunaOrdenacao === coluna) {
      setDirecaoOrdenacao(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setColunaOrdenacao(coluna);
      setDirecaoOrdenacao('asc');
    }
  };

  // Ícone indicador da direção de ordenação (▲ ou ▼)
  const renderIconeOrdenacao = (coluna) => {
    if (colunaOrdenacao !== coluna) return <span style={{ opacity: 0.35, marginLeft: '4px', fontSize: '11px' }}>↕</span>;
    return (
      <span style={{ color: 'yellow', fontWeight: 'bold', marginLeft: '4px', fontSize: '11px' }}>
        {direcaoOrdenacao === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  // Processa a filtragem por nome e a ordenação dinâmica
  const usuariosFiltradosEOrdenados = useMemo(() => {
    let resultado = usuarios.filter(user => {
      const nomeCompleto = (user.nome || '').toLowerCase();
      return nomeCompleto.includes(buscaNome.toLowerCase().trim());
    });

    resultado.sort((a, b) => {
      let valorA = a[colunaOrdenacao];
      let valorB = b[colunaOrdenacao];

      if (valorA === null || valorA === undefined) valorA = '';
      if (valorB === null || valorB === undefined) valorB = '';

      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return direcaoOrdenacao === 'asc' ? valorA - valorB : valorB - valorA;
      }

      const textoA = valorA.toString().toLowerCase();
      const textoB = valorB.toString().toLowerCase();

      if (textoA < textoB) return direcaoOrdenacao === 'asc' ? -1 : 1;
      if (textoA > textoB) return direcaoOrdenacao === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [usuarios, buscaNome, colunaOrdenacao, direcaoOrdenacao]);

  return (
    <div className='corpoP'>
      {/* Barra superior de identificação */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Caixa do modal administrativo */}
      <Modal
        show={showLogin}
        centered
        backdrop="static"
        keyboard={false}
        contentClassName="modal-auth-custom"
      >
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
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '21px', fontWeight: '700', margin: 0 }}>
              🔒 Acesso Administrativo
            </h3>
            <p style={{ color: '#E1BEE7', fontSize: '13px', margin: '8px 0 0 0', fontWeight: '500' }}>
              Informe suas credenciais para visualizar os candidatos
            </p>
          </div>

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

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <Form.Group controlId="formUsername" style={{ marginBottom: '16px', textAlign: 'left' }}>
              <Form.Label style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', display: 'block' }}>
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

            <Form.Group controlId="formPassword" style={{ marginBottom: '24px', textAlign: 'left' }}>
              <Form.Label style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', display: 'block' }}>
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

      {/* Conteúdo Principal exibido após a autenticação */}
      {!showLogin && (
        <section style={{ width: '70%', maxWidth: '1300px', margin: 'auto', marginTop: '25px', textAlign: 'center' }}>
          <h1 style={{ color: '#FFF', marginBottom: '18px', fontWeight: 'bold' }}>
            Relatório Geral de Usuários e Resultados
          </h1>

          {/* Barra de Filtros e Busca Dinâmica */}
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
            {/* Campo de busca por Nome */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '0 0 450px' }}>
              <label style={{ color: '#FFF', fontWeight: 'bold', marginRight: '12px', fontSize: '15px' }}>
                🔍 Buscar por Nome:
              </label>
              <Form.Control
                type="text"
                placeholder="Digite o nome do candidato..."
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                style={{
                  padding: '8px 14px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  border: '1px solid #FFF',
                  outline: 'none'
                }}
              />
            </div>

            {/* Contador de registros e botão de atualizar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '15px' }}>
                Total: <b>{usuariosFiltradosEOrdenados.length}</b> de {usuarios.length} usuários
              </span>

              <Button
                variant="light"
                onClick={carregarUsuarios}
                disabled={carregando}
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

          {/* Mensagem de Feedback */}
          {msg && (
            <Alert variant="danger" style={{ fontWeight: 'bold' }}>
              {msg}
            </Alert>
          )}

          {/* Tabela Centralizada com Ícones SVG nos Títulos */}
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
            <Table responsive hover striped style={{ margin: 'auto', fontSize: '13.5px', textAlign: 'center' }}>
              <thead style={{ backgroundColor: '#2b1055', color: '#ffffff', userSelect: 'none' }}>
                <tr style={{ verticalAlign: 'middle' }}>
                  {/* ID */}
                  <th
                    onClick={() => manipularOrdenacao('id')}
                    style={{ cursor: 'pointer', padding: '14px 10px', textAlign: 'center', width: '70px' }}
                  >
                    ID {renderIconeOrdenacao('id')}
                  </th>

                  {/* Nome */}
                  <th
                    onClick={() => manipularOrdenacao('nome')}
                    style={{ cursor: 'pointer', padding: '14px 12px', textAlign: 'center' }}
                  >
                    Nome do Candidato {renderIconeOrdenacao('nome')}
                  </th>

                  {/* E-mail */}
                  <th
                    onClick={() => manipularOrdenacao('email')}
                    style={{ cursor: 'pointer', padding: '14px 12px', textAlign: 'center' }}
                  >
                    E-mail {renderIconeOrdenacao('email')}
                  </th>

                  {/* 1. BIOLÓGICAS (Ícone SVG Folha à esquerda) */}
                  <th
                    onClick={() => manipularOrdenacao('biologicas')}
                    style={{ cursor: 'pointer', padding: '14px 8px', textAlign: 'center', color: CORES_AREAS.biologicas }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CORES_AREAS.biologicas} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                      </svg>
                      <span>Biológicas</span>
                      {renderIconeOrdenacao('biologicas')}
                    </div>
                  </th>

                  {/* 2. EXATAS (Ícone SVG Calculadora à esquerda) */}
                  <th
                    onClick={() => manipularOrdenacao('exatas')}
                    style={{ cursor: 'pointer', padding: '14px 8px', textAlign: 'center', color: CORES_AREAS.exatas }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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

                  {/* 3. HUMANAS (Ícone SVG Pessoas à esquerda) */}
                  <th
                    onClick={() => manipularOrdenacao('humanas')}
                    style={{ cursor: 'pointer', padding: '14px 8px', textAlign: 'center', color: CORES_AREAS.humanas }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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

                  {/* 4. TECNOLÓGICAS (Ícone SVG Microchip à esquerda) */}
                  <th
                    onClick={() => manipularOrdenacao('tecnologicas')}
                    style={{ cursor: 'pointer', padding: '14px 8px', textAlign: 'center', color: CORES_AREAS.tecnologicas }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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

                  {/* Perfil Predominante */}
                  <th
                    onClick={() => manipularOrdenacao('perfilPredominante')}
                    style={{ cursor: 'pointer', padding: '14px 12px', textAlign: 'center' }}
                  >
                    Perfil Predominante {renderIconeOrdenacao('perfilPredominante')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltradosEOrdenados.length > 0 ? (
                  usuariosFiltradosEOrdenados.map((user) => (
                    <tr key={user.id} style={{ verticalAlign: 'middle' }}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{user.id}</td>
                      <td style={{ textAlign: 'center', fontWeight: '600', color: '#111' }}>{user.nome}</td>
                      <td style={{ textAlign: 'center', color: '#555' }}>{user.email || '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: CORES_AREAS.biologicas }}>
                        {user.biologicas} pts
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: CORES_AREAS.exatas }}>
                        {user.exatas} pts
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#d97706' }}>
                        {user.humanas} pts
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: CORES_AREAS.tecnologicas }}>
                        {user.tecnologicas} pts
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
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

export default ListarUsuario;