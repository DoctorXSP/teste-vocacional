// ============================================================================
// IMPORTAÇÕES DE MÓDULOS E BIBLIOTECAS
// ============================================================================

// Importa o React e os hooks useState (controle de estados) e useRef (referência direta a nós do DOM)
import React, { useState, useRef } from 'react';

// Importa os componentes visuais utilitários do pacote react-bootstrap
import { Modal, Button, Form, Alert } from 'react-bootstrap';

// Importa a folha de estilo CSS personalizada global da aplicação
import './index.css';

// ============================================================================
// COMPONENTE PRINCIPAL: BACKUP
// ============================================================================

// Declara o componente funcional Backup
const Backup = () => {
  // --------------------------------------------------------------------------
  // ESTADOS DE AUTENTICAÇÃO E ACESSO ADMINISTRATIVO
  // --------------------------------------------------------------------------

  // Estado que controla se a janela modal de login está visível (inicia travada como true)
  const [showLogin, setShowLogin] = useState(true);

  // Estado que armazena o texto digitado no campo de usuário
  const [username, setUsername] = useState('');

  // Estado que armazena o texto digitado no campo de senha
  const [password, setPassword] = useState('');

  // Estado que armazena mensagens de erro na validação de credenciais
  const [error, setError] = useState('');

  // Define o usuário esperado para liberar o acesso ao painel
  const validUsername = 'etecembu';

  // Define a senha esperada para autenticação no painel
  const validPassword = 'etec@241';

  // Função disparada para validar o usuário e senha informados
  const handleLogin = () => {
    // Compara se o usuário e a senha conferem exatamente com as credenciais fixas
    if (username === validUsername && password === validPassword) {
      // Fecha a janela modal de login se corretas
      setShowLogin(false);
      // Limpa qualquer mensagem prévia de erro de login
      setError('');
    } else {
      // Define a mensagem de falha caso as credenciais estejam erradas
      setError('Usuário ou senha incorretos!');
    }
  };

  // --------------------------------------------------------------------------
  // ESTADOS DE OPERAÇÃO (DOWNLOAD, RESTAURAÇÃO E MENSAGENS)
  // --------------------------------------------------------------------------

  // Estado que indica se o backup está sendo gerado e baixado (para loading/disable)
  const [baixando, setBaixando] = useState(false);

  // Estado que indica se a restauração está em andamento no servidor
  const [restaurando, setRestaurando] = useState(false);

  // Estado que armazena o arquivo .zip selecionado pelo usuário no input de arquivo
  const [arquivoZip, setArquivoZip] = useState(null);

  // Estado que guarda a mensagem de feedback operacional exibida em tela
  const [msg, setMsg] = useState('');

  // Estado que define a cor/estilo do Alert ('success', 'danger', 'info', etc.)
  const [msgTipo, setMsgTipo] = useState('info');

  // Estado que controla a exibição da janela modal de confirmação de restauração
  const [showConfirmRestaurar, setShowConfirmRestaurar] = useState(false);

  // Referência vinculada diretamente ao input de seleção de arquivo para permitir reset de valor
  const fileInputRef = useRef(null);

  // --------------------------------------------------------------------------
  // LÓGICA DE DOWNLOAD DO PACOTE DE BACKUP (.ZIP)
  // --------------------------------------------------------------------------

  // Função assíncrona responsável por solicitar e baixar o pacote .zip (SQL + Imagens)
  const handleDownloadBackup = async () => {
    // Ativa o estado de carregamento do botão de download
    setBaixando(true);
    // Limpa alertas anteriores na tela
    setMsg('');

    try {
      // Envia uma requisição HTTP GET para o endpoint de backup do servidor Node.js
      const resposta = await fetch('http://localhost:3012/backup');

      // Se a resposta HTTP não for bem-sucedida (status fora da faixa 200-299), lança uma exceção
      if (!resposta.ok) throw new Error('Falha ao gerar o arquivo de backup no servidor.');

      // Define um nome padrão para o arquivo caso o cabeçalho não traga o nome original
      let nomeArquivo = 'TesteVocacional_Completo.zip';

      // Recupera o cabeçalho Content-Disposition da resposta do servidor
      const disposition = resposta.headers.get('Content-Disposition');

      // Verifica se o cabeçalho existe e possui a propriedade filename definida
      if (disposition && disposition.includes('filename=')) {
        // Expressão regular para extrair o nome do arquivo delimitado com ou sem aspas
        const correspondencia = disposition.match(/filename="?([^"]+)"?/);
        // Se capturou o nome com sucesso, atualiza a variável nomeArquivo
        if (correspondencia && correspondencia[1]) {
          nomeArquivo = correspondencia[1];
        }
      }

      // Converte o corpo da resposta em um objeto binário Blob
      const blob = await resposta.blob();

      // Cria uma URL temporária vinculada ao Blob carregado na memória do navegador
      const urlBlob = window.URL.createObjectURL(blob);

      // Cria dinamicamente uma tag âncora <a> invisível no documento
      const link = document.createElement('a');

      // Define o link de destino como a URL temporária do Blob
      link.href = urlBlob;

      // Atribui o nome do arquivo para o atributo download da tag
      link.download = nomeArquivo;

      // Anexa temporariamente o link ao corpo da página HTML
      document.body.appendChild(link);

      // Simula o clique no link para acionar a janela de download nativa do navegador
      link.click();

      // Remove a tag do documento após o clique
      document.body.removeChild(link);

      // Libera o recurso da memória alocado para a URL temporária do Blob
      window.URL.revokeObjectURL(urlBlob);

      // Define o estilo de alerta como sucesso (verde)
      setMsgTipo('success');

      // Exibe mensagem informando que o download foi concluído
      setMsg(`Backup completo baixado com sucesso! Arquivo: ${nomeArquivo}`);
    } catch (err) {
      // Define o estilo de alerta como perigo/erro (vermelho)
      setMsgTipo('danger');

      // Informa o texto do erro capturado na exceção
      setMsg(`Erro ao baixar backup: ${err.message}`);
    } finally {
      // Finaliza o estado de download, reabilitando os botões
      setBaixando(false);
    }
  };

  // --------------------------------------------------------------------------
  // LÓGICA DE SELEÇÃO E VALIDAÇÃO DO ARQUIVO .ZIP
  // --------------------------------------------------------------------------

  // Função acionada quando o usuário escolhe um arquivo no seletor de arquivos
  const handleFileChange = (e) => {
    // Obtém o primeiro arquivo da lista selecionada
    const file = e.target.files[0];

    // Se houver um arquivo selecionado
    if (file) {
      // Valida se o arquivo termina obrigatoriamente com a extensão .zip
      if (!file.name.endsWith('.zip')) {
        // Define o alerta em vermelho
        setMsgTipo('danger');
        // Define a mensagem de advertência sobre a extensão incorreta
        setMsg('Por favor, selecione um arquivo válido com extensão .zip contendo o banco e as imagens.');
        // Reseta o estado do arquivo para nulo
        setArquivoZip(null);
        // Interrompe a execução
        return;
      }

      // Armazena o arquivo .zip válido no estado
      setArquivoZip(file);

      // Limpa qualquer mensagem de erro prévia
      setMsg('');
    }
  };

  // --------------------------------------------------------------------------
  // LÓGICA DE RESTAURAÇÃO DO PACOTE NO SERVIDOR
  // --------------------------------------------------------------------------

  // Função assíncrona que envia o arquivo .zip via POST multipart/form-data para restaurar os dados
  const executarRestauracao = async () => {
    // Fecha a janela modal de confirmação
    setShowConfirmRestaurar(false);

    // Validação de segurança: verifica se há um arquivo .zip anexado
    if (!arquivoZip) {
      // Define o alerta em vermelho caso falte o arquivo
      setMsgTipo('danger');
      // Exibe o aviso para o operador selecionar o arquivo
      setMsg('Selecione um arquivo .zip antes de iniciar a recuperação.');
      // Interrompe o processamento
      return;
    }

    // Ativa o estado de carregamento da restauração
    setRestaurando(true);

    // Limpa as mensagens em exibição
    setMsg('');

    // Cria uma nova instância de FormData para empacotar o arquivo binário
    const formData = new FormData();

    // Anexa o arquivo .zip com o campo esperado pelo multer no backend ('arquivoBackup')
    formData.append('arquivoBackup', arquivoZip);

    try {
      // Envia a requisição POST assíncrona para o endpoint de restauração
      const resposta = await fetch('http://localhost:3012/restaurar', {
        method: 'POST', // Método de envio HTTP
        body: formData   // Corpo da requisição com o arquivo binário anexado
      });

      // Converte a resposta do backend para formato JSON
      const dados = await resposta.json();

      // Se o status da requisição indicar erro, lança exceção com a mensagem da API
      if (!resposta.ok) throw new Error(dados.message || 'Falha ao restaurar dados.');

      // Define o alerta de retorno como sucesso (verde)
      setMsgTipo('success');

      // Exibe a mensagem de sucesso retornada pelo backend ou texto alternativo
      setMsg(dados.message || 'Dados e imagens restaurados com sucesso!');

      // Reseta o arquivo selecionado no estado
      setArquivoZip(null);

      // Limpa visualmente o valor do input do formulário via referência
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      // Define o alerta em estilo de perigo (vermelho)
      setMsgTipo('danger');

      // Exibe os detalhes da falha durante a restauração
      setMsg(`Erro na recuperação: ${err.message}`);
    } finally {
      // Finaliza o estado de restauração, reativando os botões
      setRestaurando(false);
    }
  };

  // ==========================================================================
  // RENDERIZAÇÃO VISUAL DO COMPONENTE (JSX)
  // ==========================================================================

  return (
    // Contêiner base estrutural da página
    <div className='corpoP'>
      {/* Barra de cabeçalho fixa superior */}
      <div className='barraSuperior'>
        {/* Título principal do cabeçalho da aplicação */}
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL 1: AUTENTICAÇÃO ADMINISTRATIVA OBRIGATÓRIA                     */}
      {/* -------------------------------------------------------------------- */}
      <Modal
        show={showLogin}                      // Exibição amarrada ao estado showLogin
        centered                              // Posiciona no centro vertical da tela
        backdrop="static"                     // Impede fechamento ao clicar fora da modal
        keyboard={false}                      // Desabilita fechamento via tecla ESC
        contentClassName="modal-auth-custom"  // Classe CSS utilitária
      >
        {/* Caixa de diálogo estilizada com fundo roxo e bordas arredondadas */}
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
          {/* Cabeçalho textual da janela de login */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '21px', fontWeight: '700', margin: 0 }}>
              🔒 Acesso Administrativo
            </h3>
            <p style={{ color: '#E1BEE7', fontSize: '13px', margin: '8px 0 0 0', fontWeight: '500' }}>
              Informe suas credenciais para gerenciar backups
            </p>
          </div>

          {/* Alerta de erro de autenticação caso as credenciais estejam erradas */}
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
              e.preventDefault(); // Previne o reload padrão do navegador ao submeter
              handleLogin();      // Executa o método de verificação de login
            }}
          >
            {/* Campo de entrada para o nome de usuário */}
            <Form.Group controlId="formUsername" style={{ marginBottom: '16px', textAlign: 'left' }}>
              <Form.Label style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                Usuário:
              </Form.Label>
              <Form.Control
                type="text"
                autoFocus                                    // Foca automaticamente no campo ao abrir
                placeholder="Informe o usuário"
                value={username}                             // Valor amarrado ao estado username
                onChange={(e) => setUsername(e.target.value)}// Atualiza o estado conforme digitação
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
                onChange={(e) => setPassword(e.target.value)}// Atualiza o estado conforme digitação
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

            {/* Botão de envio para validar as credenciais */}
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
      {/* MODAL 2: CONFIRMAÇÃO CRÍTICA DE RESTAURAÇÃO                          */}
      {/* -------------------------------------------------------------------- */}
      <Modal
        show={showConfirmRestaurar}                   // Controlado pelo estado showConfirmRestaurar
        onHide={() => setShowConfirmRestaurar(false)} // Fecha a modal ao cancelar
        centered                                      // Centraliza no meio da tela
      >
        {/* Cabeçalho da modal com cor vermelha de advertência */}
        <Modal.Header closeButton style={{ backgroundColor: '#d32f2f', color: '#FFF' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 'bold' }}>⚠️ Atenção: Recuperação Completa</Modal.Title>
        </Modal.Header>
        {/* Corpo com a mensagem de alerta sobre a sobrescrita dos dados */}
        <Modal.Body style={{ padding: '20px', fontSize: '15px', color: '#333' }}>
          A restauração <b>substituirá</b> os registros do banco de dados e sobrescreverá as imagens existentes pelos arquivos do pacote <b>{arquivoZip?.name}</b>.<br /><br />
          Deseja prosseguir com a operação?
        </Modal.Body>
        {/* Rodapé com botões de cancelamento e confirmação definitiva */}
        <Modal.Footer>
          {/* Botão para desistir e fechar a modal */}
          <Button variant="secondary" onClick={() => setShowConfirmRestaurar(false)}>
            Cancelar
          </Button>
          {/* Botão vermelho que dispara a rotina executarRestauracao */}
          <Button
            variant="danger"
            onClick={executarRestauracao}
            style={{ fontWeight: 'bold' }}
          >
            Sim, Restaurar Backup Completo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* -------------------------------------------------------------------- */}
      {/* PAINEL ADMINISTRATIVO (RENDERIZADO APENAS APÓS SUCESSO NO LOGIN)     */}
      {/* -------------------------------------------------------------------- */}
      {!showLogin && (
        <section style={{ width: '85%', maxWidth: '900px', margin: 'auto', marginTop: '30px', textAlign: 'center' }}>
          {/* Título de boas-vindas da seção de backup */}
          <h1 style={{ color: '#FFF', marginBottom: '25px', fontWeight: 'bold' }}>
            Backup e Recuperação Geral (Banco + Imagens)
          </h1>

          {/* Cartão contêiner translúcido envolvendo as seções */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '30px'
            }}
          >
            {/* SEÇÃO 1: EXPORTAR BACKUP */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '25px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                textAlign: 'left'
              }}
            >
              {/* Título da seção de download */}
              <h3 style={{ color: '#4A148C', fontSize: '19px', fontWeight: 'bold', marginBottom: '8px' }}>
                💾 1. Gerar Pacote Completo de Backup (.zip)
              </h3>
              {/* Descrição dos itens englobados no pacote .zip */}
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '18px', lineHeight: '1.4' }}>
                Gera um arquivo comprimido <code>.zip</code> contendo o script <code>database.sql</code> (dados e estrutura das tabelas) e todo o catálogo de imagens salvas em <code>src/img</code>.
              </p>

              {/* Botão de disparo do download do backup com feedback visual */}
              <Button
                onClick={handleDownloadBackup}
                disabled={baixando}                                         // Desabilita enquanto o arquivo está sendo gerado
                style={{
                  fontSize: '16px',
                  padding: '12px 28px',
                  backgroundColor: 'yellow',
                  borderColor: '#fbc02d',
                  color: 'purple',
                  fontWeight: 'bold',
                  cursor: baixando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 5px 0 #d4a017, 0 8px 15px rgba(0, 0, 0, 0.25)',
                  borderTop: '1px solid #fff',
                  transition: 'all 0.1s ease'
                }}
              >
                {baixando ? '⏳ Empacotando Backup...' : '📦 Baixar Backup Completo (.zip)'}
              </Button>
            </div>

            {/* SEÇÃO 2: RESTAURAR BACKUP */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                textAlign: 'left'
              }}
            >
              {/* Título da seção de restauração */}
              <h3 style={{ color: '#4A148C', fontSize: '19px', fontWeight: 'bold', marginBottom: '8px' }}>
                🔄 2. Restaurar Pacote Completo (.zip)
              </h3>
              {/* Descrição dos efeitos colaterais da importação */}
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '18px', lineHeight: '1.4' }}>
                Selecione um arquivo <code>.zip</code> gerado pelo sistema para reescrever as tabelas no MySQL e reestabelecer os arquivos de imagem no servidor.
              </p>

              {/* Contêiner em flexbox alinhando o campo de arquivo e o botão */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                {/* Campo input para seleção do arquivo .zip local */}
                <Form.Control
                  ref={fileInputRef}                    // Vincula a referência do DOM para manipulação
                  type="file"                           // Tipo do controle: arquivo
                  accept=".zip"                         // Restringe a seleção a arquivos .zip
                  onChange={handleFileChange}           // Executa a validação ao selecionar
                  disabled={restaurando}                // Bloqueia durante a restauração
                  style={{
                    flex: '1',
                    minWidth: '260px',
                    padding: '10px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1.5px dashed #4A148C'
                  }}
                />

                {/* Botão que abre a janela modal de confirmação */}
                <Button
                  onClick={() => setShowConfirmRestaurar(true)}
                  disabled={!arquivoZip || restaurando} // Só habilita se houver .zip e não estiver restaurando
                  style={{
                    fontSize: '16px',
                    padding: '11px 26px',
                    backgroundColor: arquivoZip ? '#34A853' : '#a5d6a7',
                    borderColor: '#2e7d32',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    cursor: (!arquivoZip || restaurando) ? 'not-allowed' : 'pointer',
                    boxShadow: arquivoZip ? '0 5px 0 #1b5e20, 0 8px 15px rgba(0, 0, 0, 0.25)' : 'none',
                    transition: 'all 0.1s ease'
                  }}
                >
                  {restaurando ? '⏳ Restaurando...' : '♻️ Restaurar Backup'}
                </Button>
              </div>

              {/* Exibe o nome e tamanho em megabytes do arquivo selecionado */}
              {arquivoZip && (
                <span style={{ display: 'block', marginTop: '10px', color: '#2e7d32', fontSize: '13px', fontWeight: '600' }}>
                  ✓ Arquivo selecionado: {arquivoZip.name} ({(arquivoZip.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              )}
            </div>
          </div>

          {/* Bloco de alerta geral para mensagens operacionais de sucesso ou falha */}
          {msg && (
            <Alert
              variant={msgTipo}     // Tipo dinâmico do alerta ('success', 'danger', etc.)
              style={{
                fontSize: '15px',
                fontWeight: 'bold',
                maxWidth: '900px',
                margin: '20px auto 0 auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {msg}                 {/* Texto descritivo da mensagem */}
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

// Exporta o componente Backup por padrão para uso em roteadores ou outros componentes
export default Backup;