// ============================================================================
// IMPORTAÇÕES DE MÓDULOS E BIBLIOTECAS
// ============================================================================

// Importa os hooks useState e useRef do React
import React, { useState, useRef } from 'react';
// Importa componentes visuais do pacote React-Bootstrap
import { Modal, Button, Form, Alert } from 'react-bootstrap';
// Importa estilos customizados do projeto
import './estilo.css';
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: BACKUP
// ============================================================================

// Declara o componente funcional de Backup e Restauração
const Backup = () => {
  // Estado que exibe ou oculta a janela modal de autenticação restrita
  const [showLogin, setShowLogin] = useState(true);
  // Estado para armazenar o valor digitado no campo de login
  const [username, setUsername] = useState('');
  // Estado para armazenar o valor digitado no campo de senha
  const [password, setPassword] = useState('');
  // Estado para exibir mensagens de erro durante a autenticação
  const [error, setError] = useState('');

  // Credencial estática esperada para usuário administrativo
  const validUsername = 'etecembu';
  // Credencial estática esperada para senha administrativa
  const validPassword = 'etec@241';

  // Função que valida os dados informados no login
  const handleLogin = () => {
    // Compara o usuário e senha com as constantes pré-definidas
    if (username === validUsername && password === validPassword) {
      // Se corretos, fecha a janela de login liberando a tela
      setShowLogin(false);
      // Limpa qualquer mensagem prévia de erro
      setError('');
    } else {
      // Em caso de divergência, define mensagem de falha
      setError('Usuário ou senha incorretos!');
    }
  };

  // Estado indicador se o download do arquivo de backup está em andamento
  const [baixando, setBaixando] = useState(false);
  // Estado indicador se a restauração do sistema está em andamento
  const [restaurando, setRestaurando] = useState(false);
  // Estado para armazenar o arquivo .zip selecionado pelo usuário
  const [arquivoZip, setArquivoZip] = useState(null);
  // Estado para armazenar o texto da notificação/feedback na tela
  const [msg, setMsg] = useState('');
  // Estado para definir a variante visual do Alert ('info', 'success', 'danger')
  const [msgTipo, setMsgTipo] = useState('info');
  // Estado que controla a abertura do modal de confirmação antes da restauração
  const [showConfirmRestaurar, setShowConfirmRestaurar] = useState(false);
  // Cria uma referência direta ao input do tipo arquivo para manipulação de seu valor
  const fileInputRef = useRef(null);

  // Função assíncrona responsável por baixar o arquivo zip gerado pelo backend
  const handleDownloadBackup = async () => {
    // Ativa o estado de carregamento do download
    setBaixando(true);
    // Limpa alertas anteriores
    setMsg('');

    try {
      // Faz a requisição HTTP GET para a rota de backup do servidor Node
      const resposta = await fetch('http://localhost:3012/backup');
      // Se a resposta retornar código de erro HTTP, dispara exceção
      if (!resposta.ok) throw new Error('Falha ao gerar o arquivo de backup no servidor.');

      // Define um nome padrão para o arquivo caso o cabeçalho não forneça
      let nomeArquivo = 'TesteVocacional_Completo.zip';
      // Lê o cabeçalho Content-Disposition da resposta HTTP
      const disposition = resposta.headers.get('Content-Disposition');
      // Verifica se há especificação de filename no cabeçalho
      if (disposition && disposition.includes('filename=')) {
        // Expressão regular para extrair o nome exato do arquivo enviado
        const correspondencia = disposition.match(/filename="?([^"]+)"?/);
        // Se encontrou o grupo correspondente, atualiza o nome do arquivo
        if (correspondencia && correspondencia[1]) {
          nomeArquivo = correspondencia[1];
        }
      }

      // Converte o corpo da resposta em um objeto binário Blob
      const blob = await resposta.blob();
      // Cria uma URL local temporária na memória apontando para o Blob
      const urlBlob = window.URL.createObjectURL(blob);
      // Cria programaticamente um elemento de âncora <a>
      const link = document.createElement('a');
      // Atribui a URL do blob ao href do link
      link.href = urlBlob;
      // Define o atributo de download com o nome do arquivo final
      link.download = nomeArquivo;
      // Adiciona o elemento temporariamente ao DOM
      document.body.appendChild(link);
      // Simula o clique para iniciar o download no navegador
      link.click();
      // Remove o elemento âncora após a execução do clique
      document.body.removeChild(link);
      // Libera o recurso da memória alocado para a URL do Blob
      window.URL.revokeObjectURL(urlBlob);

      // Define a cor de sucesso para o alerta
      setMsgTipo('success');
      // Exibe a mensagem de sucesso na interface
      setMsg(`Backup completo baixado com sucesso! Arquivo: ${nomeArquivo}`);
    } catch (err) {
      // Em caso de falha na requisição, define tipo de perigo/erro
      setMsgTipo('danger');
      // Exibe a mensagem descritiva do erro capturado
      setMsg(`Erro ao baixar backup: ${err.message}`);
    } finally {
      // Desativa o indicador de download independente do resultado
      setBaixando(false);
    }
  };

  // Função disparada quando um arquivo é selecionado no input de restauração
  const handleFileChange = (e) => {
    // Obtém o primeiro arquivo da lista do input
    const file = e.target.files[0];
    // Se um arquivo foi selecionado
    if (file) {
      // Valida se o arquivo possui a extensão esperada (.zip)
      if (!file.name.endsWith('.zip')) {
        // Alerta de erro caso não seja .zip
        setMsgTipo('danger');
        setMsg('Por favor, selecione um arquivo válido com extensão .zip contendo o banco e as imagens.');
        // Limpa o estado do arquivo
        setArquivoZip(null);
        return;
      }
      // Se for válido, armazena no estado
      setArquivoZip(file);
      // Limpa alertas
      setMsg('');
    }
  };

  // Função assíncrona que envia o arquivo zip para o backend restaurar dados e imagens
  const executarRestauracao = async () => {
    // Fecha a janela modal de confirmação
    setShowConfirmRestaurar(false);

    // Valida se há um arquivo carregado
    if (!arquivoZip) {
      setMsgTipo('danger');
      setMsg('Selecione um arquivo .zip antes de iniciar a recuperação.');
      return;
    }

    // Marca o estado de restauração como ativo
    setRestaurando(true);
    // Limpa mensagens anteriores
    setMsg('');

    // Cria um objeto FormData para envio de multipart/form-data
    const formData = new FormData();
    // Anexa o arquivo .zip com o campo esperado pelo multer no backend
    formData.append('arquivoBackup', arquivoZip);

    try {
      // Envia a requisição POST para a rota de restauração
      const resposta = await fetch('http://localhost:3012/restaurar', {
        method: 'POST',
        body: formData
      });

      // Converte a resposta em formato JSON
      const dados = await resposta.json();
      // Dispara erro se a resposta HTTP não for bem-sucedida
      if (!resposta.ok) throw new Error(dados.message || 'Falha ao restaurar dados.');

      // Alerta de sucesso
      setMsgTipo('success');
      // Apresenta mensagem retornada pelo servidor
      setMsg(dados.message || 'Dados e imagens restaurados com sucesso!');
      // Reseta a referência do arquivo no estado
      setArquivoZip(null);
      // Limpa o valor físico do input para permitir novos uploads
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      // Exibe mensagem de erro caso o processo falhe
      setMsgTipo('danger');
      setMsg(`Erro na recuperação: ${err.message}`);
    } finally {
      // Desativa o indicador de restauração
      setRestaurando(false);
    }
  };

  // Retorno da renderização visual
  return (
    // Contêiner principal com classe de estilo
    <div className='corpoP'>
      {/* Barra superior institucional */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Modal estático para autenticação de administrador */}
      <Modal
        show={showLogin}
        backdrop="static"
        keyboard={false}
        contentClassName="modal-auth-custom"
      >
        {/* Contêiner de estilização do card do formulário de login */}
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
          {/* Cabeçalho do modal com título e subtítulo */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', margin: 0 }}>
              🔒 Acesso Administrativo
            </h3>
            <p style={{ color: '#E1BEE7', fontSize: '13px', margin: '6px 0 0 0', fontWeight: '500' }}>
              Informe suas credenciais para gerenciar backups
            </p>
          </div>

          {/* Exibição condicional de mensagem de erro de autenticação */}
          {error && (
            <Alert variant="danger" style={{ fontSize: '13px', padding: '10px', textAlign: 'center' }}>
              {error}
            </Alert>
          )}

          {/* Formulário com interceptação de submissão pelo Enter */}
          <Form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {/* Campo para inserção do usuário */}
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

            {/* Campo para inserção da senha */}
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

            {/* Botão de envio para validar credenciais */}
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

      {/* Modal de diálogo de confirmação crítica de restauração */}
      <Modal show={showConfirmRestaurar} onHide={() => setShowConfirmRestaurar(false)} centered>
        {/* Cabeçalho de alerta vermelho */}
        <Modal.Header closeButton style={{ backgroundColor: '#d32f2f', color: '#FFF' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 'bold' }}>⚠️ Atenção: Recuperação Completa</Modal.Title>
        </Modal.Header>
        {/* Corpo explicativo com as consequências da operação */}
        <Modal.Body style={{ padding: '20px', fontSize: '15px', color: '#333' }}>
          A restauração <b>substituirá</b> os registros do banco de dados e sobrescreverá as imagens existentes pelos arquivos do pacote <b>{arquivoZip?.name}</b>.<br /><br />
          Deseja prosseguir com a operação?
        </Modal.Body>
        {/* Botões de decisão */}
        <Modal.Footer>
          {/* Cancela a operação e fecha a janela */}
          <Button variant="secondary" onClick={() => setShowConfirmRestaurar(false)}>
            Cancelar
          </Button>
          {/* Confirma e executa a chamada ao endpoint de restauração */}
          <Button variant="danger" onClick={executarRestauracao} style={{ fontWeight: 'bold' }}>
            Sim, Restaurar Backup Completo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Painel exibido apenas se o usuário estiver devidamente autenticado */}
      {!showLogin && (
        <section style={{ width: '92%', maxWidth: '900px', margin: 'auto', marginTop: '25px', textAlign: 'center' }}>
          {/* Título da seção principal */}
          <h1 style={{ color: '#FFF', marginBottom: '20px', fontWeight: 'bold', fontSize: '24px' }}>
            Backup e Recuperação Geral (Banco + Imagens)
          </h1>

          {/* Cartão contêiner translúcido */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '25px',
              boxSizing: 'border-box'
            }}
          >
            {/* Bloco correspondente à geração e download do arquivo zip */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                textAlign: 'left'
              }}
            >
              <h3 style={{ color: '#4A148C', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                💾 1. Gerar Pacote Completo de Backup (.zip)
              </h3>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px', lineHeight: '1.4' }}>
                Gera um arquivo comprimido <code>.zip</code> contendo o script <code>database.sql</code> (dados e estrutura das tabelas) e todo o catálogo de imagens salvas em <code>src/img</code>.
              </p>

              {/* Botão que dispara o download */}
              <Button
                onClick={handleDownloadBackup}
                disabled={baixando}
                style={{
                  fontSize: '15px',
                  padding: '12px 24px',
                  backgroundColor: 'yellow',
                  borderColor: '#fbc02d',
                  color: 'purple',
                  fontWeight: 'bold',
                  cursor: baixando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 5px 0 #d4a017, 0 8px 15px rgba(0, 0, 0, 0.25)',
                  borderTop: '1px solid #fff',
                  width: '100%',
                  maxWidth: '320px'
                }}
              >
                {/* Texto dinâmico de acordo com o estado de download */}
                {baixando ? '⏳ Empacotando Backup...' : '📦 Baixar Backup Completo (.zip)'}
              </Button>
            </div>

            {/* Bloco correspondente à restauração do banco e arquivos */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                textAlign: 'left'
              }}
            >
              <h3 style={{ color: '#4A148C', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                🔄 2. Restaurar Pacote Completo (.zip)
              </h3>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px', lineHeight: '1.4' }}>
                Selecione um arquivo <code>.zip</code> gerado pelo sistema para reescrever as tabelas no MySQL e reestabelecer os arquivos de imagem no servidor.
              </p>

              {/* Linha com campo de upload e botão de ação */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Input de seleção de arquivo zip */}
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  disabled={restaurando}
                  style={{
                    flex: '1 1 240px',
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1.5px dashed #4A148C',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Botão para abrir modal de confirmação */}
                <Button
                  onClick={() => setShowConfirmRestaurar(true)}
                  disabled={!arquivoZip || restaurando}
                  style={{
                    fontSize: '15px',
                    padding: '11px 22px',
                    backgroundColor: arquivoZip ? '#34A853' : '#a5d6a7',
                    borderColor: '#2e7d32',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    cursor: (!arquivoZip || restaurando) ? 'not-allowed' : 'pointer',
                    boxShadow: arquivoZip ? '0 5px 0 #1b5e20, 0 8px 15px rgba(0, 0, 0, 0.25)' : 'none',
                    flex: '1 1 200px',
                    width: '100%'
                  }}
                >
                  {/* Texto dinâmico de acordo com o estado da operação */}
                  {restaurando ? '⏳ Restaurando...' : '♻️ Restaurar Backup'}
                </Button>
              </div>

              {/* Informações detalhadas do arquivo selecionado */}
              {arquivoZip && (
                <span style={{ display: 'block', marginTop: '10px', color: '#2e7d32', fontSize: '13px', fontWeight: '600' }}>
                  ✓ Arquivo selecionado: {arquivoZip.name} ({(arquivoZip.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              )}
            </div>
          </div>

          {/* Alerta de notificação de sucesso ou falha */}
          {msg && (
            <Alert
              variant={msgTipo}
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                maxWidth: '900px',
                margin: '20px auto 0 auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {msg}
            </Alert>
          )}
        </section>
      )}
    </div>
  );
};

// Exporta o componente Backup
export default Backup;