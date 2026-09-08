// Importa o React e hooks para controle de estado e manipulação de referências
import React, { useState, useRef } from 'react';
// Importa os componentes do Bootstrap para modais, botões, formulários e alertas
import { Modal, Button, Form, Alert } from 'react-bootstrap';
// Importa a folha de estilos padrão da aplicação
import './index.css';

// Declaração do componente funcional Backup
const Backup = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validUsername = 'etecembu';
  const validPassword = 'etec@241';

  const handleLogin = () => {
    if (username === validUsername && password === validPassword) {
      setShowLogin(false);
      setError('');
    } else {
      setError('Usuário ou senha incorretos!');
    }
  };

  const [baixando, setBaixando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [arquivoZip, setArquivoZip] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState('info');

  const [showConfirmRestaurar, setShowConfirmRestaurar] = useState(false);
  const fileInputRef = useRef(null);

  // Download do arquivo .zip (SQL + Imagens)
  const handleDownloadBackup = async () => {
    setBaixando(true);
    setMsg('');

    try {
      const resposta = await fetch('http://localhost:3012/backup');
      if (!resposta.ok) throw new Error('Falha ao gerar o arquivo de backup no servidor.');

      let nomeArquivo = 'TesteVocacional_Completo.zip';
      const disposition = resposta.headers.get('Content-Disposition');
      if (disposition && disposition.includes('filename=')) {
        const correspondencia = disposition.match(/filename="?([^"]+)"?/);
        if (correspondencia && correspondencia[1]) {
          nomeArquivo = correspondencia[1];
        }
      }

      const blob = await resposta.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      setMsgTipo('success');
      setMsg(`Backup completo baixado com sucesso! Arquivo: ${nomeArquivo}`);
    } catch (err) {
      setMsgTipo('danger');
      setMsg(`Erro ao baixar backup: ${err.message}`);
    } finally {
      setBaixando(false);
    }
  };

  // Seleciona o arquivo .zip para restaurar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        setMsgTipo('danger');
        setMsg('Por favor, selecione um arquivo válido com extensão .zip contendo o banco e as imagens.');
        setArquivoZip(null);
        return;
      }
      setArquivoZip(file);
      setMsg('');
    }
  };

  // Executa a restauração enviando o .zip para o backend
  const executarRestauracao = async () => {
    setShowConfirmRestaurar(false);
    if (!arquivoZip) {
      setMsgTipo('danger');
      setMsg('Selecione um arquivo .zip antes de iniciar a recuperação.');
      return;
    }

    setRestaurando(true);
    setMsg('');

    const formData = new FormData();
    formData.append('arquivoBackup', arquivoZip);

    try {
      const resposta = await fetch('http://localhost:3012/restaurar', {
        method: 'POST',
        body: formData
      });

      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.message || 'Falha ao restaurar dados.');

      setMsgTipo('success');
      setMsg(dados.message || 'Dados e imagens restaurados com sucesso!');
      setArquivoZip(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setMsgTipo('danger');
      setMsg(`Erro na recuperação: ${err.message}`);
    } finally {
      setRestaurando(false);
    }
  };

  return (
    <div className='corpoP'>
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

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
              Informe suas credenciais para gerenciar backups
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

      <Modal show={showConfirmRestaurar} onHide={() => setShowConfirmRestaurar(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#d32f2f', color: '#FFF' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 'bold' }}>⚠️ Atenção: Recuperação Completa</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px', fontSize: '15px', color: '#333' }}>
          A restauração <b>substituirá</b> os registros do banco de dados e sobrescreverá as imagens existentes pelos arquivos do pacote <b>{arquivoZip?.name}</b>.<br /><br />
          Deseja prosseguir com a operação?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmRestaurar(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={executarRestauracao}
            style={{ fontWeight: 'bold' }}
          >
            Sim, Restaurar Backup Completo
          </Button>
        </Modal.Footer>
      </Modal>

      {!showLogin && (
        <section style={{ width: '85%', maxWidth: '900px', margin: 'auto', marginTop: '30px', textAlign: 'center' }}>
          <h1 style={{ color: '#FFF', marginBottom: '25px', fontWeight: 'bold' }}>
            Backup e Recuperação Geral (Banco + Imagens)
          </h1>

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
              <h3 style={{ color: '#4A148C', fontSize: '19px', fontWeight: 'bold', marginBottom: '8px' }}>
                💾 1. Gerar Pacote Completo de Backup (.zip)
              </h3>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '18px', lineHeight: '1.4' }}>
                Gera um arquivo comprimido <code>.zip</code> contendo o script <code>database.sql</code> (dados e estrutura das tabelas) e todo o catálogo de imagens salvas em <code>src/img</code>.
              </p>

              <Button
                onClick={handleDownloadBackup}
                disabled={baixando}
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
              <h3 style={{ color: '#4A148C', fontSize: '19px', fontWeight: 'bold', marginBottom: '8px' }}>
                🔄 2. Restaurar Pacote Completo (.zip)
              </h3>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '18px', lineHeight: '1.4' }}>
                Selecione um arquivo <code>.zip</code> gerado pelo sistema para reescrever as tabelas no MySQL e reestabelecer os arquivos de imagem no servidor.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  disabled={restaurando}
                  style={{
                    flex: '1',
                    minWidth: '260px',
                    padding: '10px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1.5px dashed #4A148C'
                  }}
                />

                <Button
                  onClick={() => setShowConfirmRestaurar(true)}
                  disabled={!arquivoZip || restaurando}
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

              {arquivoZip && (
                <span style={{ display: 'block', marginTop: '10px', color: '#2e7d32', fontSize: '13px', fontWeight: '600' }}>
                  ✓ Arquivo selecionado: {arquivoZip.name} ({(arquivoZip.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              )}
            </div>
          </div>

          {msg && (
            <Alert
              variant={msgTipo}
              style={{
                fontSize: '15px',
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

export default Backup;