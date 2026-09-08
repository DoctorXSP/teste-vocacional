// Carrega as variáveis de ambiente do arquivo .env no process.env
require('dotenv').config();

// Importa o framework Express para roteamento de endpoints HTTP
const express = require('express');
// Importa a biblioteca do driver MySQL para manipulação de dados
const mysql = require('mysql');
// Importa o middleware Multer para recepção e tratamento de uploads multipart
const multer = require('multer');
// Importa o CORS para desbloquear requisições originadas pelo frontend React
const cors = require('cors');
// Importa utilitários de manipulação de diretórios e caminhos do sistema
const path = require('path');
// Importa o módulo de sistema de arquivos nativo do Node.js
const fs = require('fs');

// Correção do archiver: trata CommonJS clássico e empacotamento com propriedade default
const archiverModule = require('archiver');
const archiver = typeof archiverModule === 'function' ? archiverModule : archiverModule.default;

// Importa biblioteca para descompactação de arquivos ZIP
const AdmZip = require('adm-zip');

// Garante o caminho correto da pasta de imagens (seja na raiz ou dentro de backend)
const uploadDir = fs.existsSync(path.join(__dirname, 'src', 'img'))
  ? path.join(__dirname, 'src', 'img')
  : path.join(__dirname, '..', 'src', 'img');

// Cria o diretório de imagens caso ainda não exista no disco
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configura o mecanismo de armazenamento de disco para o Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });

// Cria o pool de conexões com o MySQL utilizando variáveis de ambiente
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin@123',
  database: process.env.DB_NAME || 'testevocacional',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
});

// Testa a conectividade com o banco de dados
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Falha ao conectar ao banco:', err.message);
    return;
  }
  console.log('✅ Conexão com o banco de dados estabelecida via Pool!');
  connection.release();
});

const app = express();

app.use(express.json());
app.use(cors());

// Servir arquivos estáticos das imagens tanto por /src/img quanto na raiz do servidor
app.use('/src/img', express.static(uploadDir));
app.use(express.static(uploadDir));

const PORT = process.env.PORT || 3012;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// Endpoint POST para cadastrar o aluno
app.post('/caduser', (req, res) => {
  const { nome, email, whatsapp } = req.body;

  if (!nome || !email || !whatsapp) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  const query = 'INSERT INTO cadastro (nome, email, whatsapp) VALUES (?, ?, ?)';
  const values = [nome, email, whatsapp];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erro ao inserir usuário:', err);
      return res.status(500).json({ message: 'Erro ao inserir no banco' });
    }
    res.json({
      message: 'Cadastro realizado com sucesso!',
      userId: results.insertId
    });
  });
});

// Endpoint POST para persistir o resultado vocacional
app.post('/salvarResultado', (req, res) => {
  const { userId, biologicas, exatas, humanas, tecnologicas, perfilPredominante } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Identificador do usuário não informado.' });
  }

  const query = `
    UPDATE cadastro 
    SET pontos_biologicas = ?, 
        pontos_exatas = ?, 
        pontos_humanas = ?, 
        pontos_tecnologicas = ?, 
        perfil_predominante = ?
    WHERE id = ?
  `;
  const values = [biologicas, exatas, humanas, tecnologicas, perfilPredominante, userId];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao salvar resultado final:', err);
      return res.status(500).json({ message: 'Erro ao salvar resultado final' });
    }
    res.json({ message: 'Resultado do teste registrado com sucesso!' });
  });
});

// Endpoint GET para buscar todas as questões
app.get('/todasQuestoes', (req, res) => {
  const query = 'SELECT * FROM questoes';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao carregar questões:', err);
      return res.status(500).json({ message: 'Erro ao consultar o banco de dados' });
    }
    res.json(results || []);
  });
});

// Endpoint POST para cadastrar questão
app.post('/insert', upload.single('imagem'), (req, res) => {
  const { questao, opcaoA, opcaoB, opcaoC, opcaoD } = req.body;
  const imagem = req.file ? `src/img/${req.file.filename}` : null;

  if (!questao || !opcaoA || !opcaoB || !opcaoC || !opcaoD) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  const query = 'INSERT INTO questoes (questao, opcaoA, opcaoB, opcaoC, opcaoD, imagem) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [questao, opcaoA, opcaoB, opcaoC, opcaoD, imagem];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao inserir:', err);
      return res.status(500).json({ message: 'Erro ao inserir no banco' });
    }
    res.json({ message: 'Registro inserido com sucesso!' });
  });
});

// Endpoint PUT para atualizar questão
app.put('/update/:id', upload.single('imagem'), (req, res) => {
  const { id } = req.params;
  const { questao, opcaoA, opcaoB, opcaoC, opcaoD } = req.body;
  const novaImagem = req.file ? `src/img/${req.file.filename}` : null;

  let query = '';
  let values = [];

  if (novaImagem) {
    query = 'UPDATE questoes SET questao = ?, opcaoA = ?, opcaoB = ?, opcaoC = ?, opcaoD = ?, imagem = ? WHERE id = ?';
    values = [questao, opcaoA, opcaoB, opcaoC, opcaoD, novaImagem, id];
  } else {
    query = 'UPDATE questoes SET questao = ?, opcaoA = ?, opcaoB = ?, opcaoC = ?, opcaoD = ? WHERE id = ?';
    values = [questao, opcaoA, opcaoB, opcaoC, opcaoD, id];
  }

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao atualizar questão:', err);
      return res.status(500).json({ message: 'Erro ao atualizar no banco de dados' });
    }
    res.json({ message: 'Registro atualizado com sucesso!' });
  });
});

// Endpoint DELETE para excluir questão
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM questoes WHERE id = ?';

  db.query(query, [id], (err) => {
    if (err) {
      console.error('Erro ao excluir questão:', err);
      return res.status(500).json({ message: 'Erro ao excluir do banco de dados' });
    }
    res.json({ message: 'Registro excluído com sucesso!' });
  });
});

// Endpoint GET /usuarios
app.get('/usuarios', (req, res) => {
  const query = `
    SELECT 
      id, 
      nome, 
      email, 
      whatsapp, 
      COALESCE(pontos_biologicas, 0) AS biologicas,
      COALESCE(pontos_exatas, 0) AS exatas,
      COALESCE(pontos_humanas, 0) AS humanas,
      COALESCE(pontos_tecnologicas, 0) AS tecnologicas,
      COALESCE(perfil_predominante, 'Não finalizado') AS perfilPredominante
    FROM cadastro
    ORDER BY id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários na tabela cadastro:', err);
      return res.status(500).json({ message: 'Erro ao consultar banco de dados' });
    }
    res.json(results || []);
  });
});

// ==========================================
// ROTAS DE BACKUP E RESTAURAÇÃO COMPLETA (ZIP)
// ==========================================

// Endpoint GET para gerar e baixar o arquivo .zip com SQL + imagens
app.get('/backup', async (req, res) => {
  const tabelas = ['cadastro', 'questoes'];
  const dbName = process.env.DB_NAME || 'testevocacional';
  let sqlDump = `-- Backup do Banco de Dados: ${dbName}\n`;
  sqlDump += `-- Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
  sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  try {
    for (const tabela of tabelas) {
      const createTableResult = await new Promise((resolve, reject) => {
        db.query(`SHOW CREATE TABLE \`${tabela}\``, (err, rows) => {
          if (err) return reject(err);
          resolve(rows[0]['Create Table']);
        });
      });

      sqlDump += `DROP TABLE IF EXISTS \`${tabela}\`;\n`;
      sqlDump += `${createTableResult};\n\n`;

      const registros = await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM \`${tabela}\``, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });

      if (registros.length > 0) {
        for (const row of registros) {
          const colunas = Object.keys(row).map(c => `\`${c}\``).join(', ');
          const valores = Object.values(row).map(val => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            const sanitizado = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return `'${sanitizado}'`;
          }).join(', ');

          sqlDump += `INSERT INTO \`${tabela}\` (${colunas}) VALUES (${valores});\n`;
        }
        sqlDump += `\n`;
      }
    }

    sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    const agora = new Date();
    const dataFormatada = agora.toISOString().slice(0, 10);
    const horaFormatada = agora.toTimeString().slice(0, 8).replace(/:/g, '-');
    const nomeArquivoZip = `TesteVocacional_Completo_${dataFormatada}_${horaFormatada}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivoZip}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      console.error('Erro na criação do arquivo zip:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Erro ao compactar backup.' });
      }
    });

    archive.pipe(res);

    // 1. Adiciona o script SQL gerado ao ZIP
    archive.append(sqlDump, { name: 'database.sql' });

    // 2. Adiciona o conteúdo do diretório de imagens ao ZIP
    if (fs.existsSync(uploadDir)) {
      archive.directory(uploadDir, 'img');
    }

    await archive.finalize();

  } catch (erro) {
    console.error('Erro ao gerar backup:', erro);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Erro ao gerar backup do banco de dados.' });
    }
  }
});

// Middleware multer em memória para receber o upload do arquivo .zip
const uploadMemoria = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // limite de 50MB
});

// Endpoint POST para restaurar o banco e imagens a partir do arquivo .zip
app.post('/restaurar', uploadMemoria.single('arquivoBackup'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo ZIP foi enviado.' });
  }

  try {
    const zip = new AdmZip(req.file.buffer);
    const zipEntries = zip.getEntries();

    // 1. Identifica e lê o script SQL
    const sqlEntry = zipEntries.find(entry => entry.entryName === 'database.sql' || entry.name.endsWith('.sql'));

    if (!sqlEntry) {
      return res.status(400).json({ message: 'O arquivo .zip não contém um script SQL válido.' });
    }

    const conteudoSql = sqlEntry.getData().toString('utf8');

    // 2. Extrai as imagens contidas na pasta img/ para o diretório uploadDir
    zipEntries.forEach(entry => {
      if (!entry.isDirectory && (entry.entryName.startsWith('img/') || entry.entryName.startsWith('img\\'))) {
        const nomeArquivoImagem = path.basename(entry.entryName);
        if (nomeArquivoImagem) {
          const destinoFinal = path.join(uploadDir, nomeArquivoImagem);
          fs.writeFileSync(destinoFinal, entry.getData());
        }
      }
    });

    // 3. Executa as instruções SQL em sequência
    const comandos = conteudoSql
      .split(/;\s*[\r\n]+/)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    db.getConnection((err, connection) => {
      if (err) {
        console.error('Erro ao obter conexão para restauração:', err);
        return res.status(500).json({ message: 'Erro de conexão com o banco de dados.' });
      }

      let executados = 0;
      const executarProximo = (indice) => {
        if (indice >= comandos.length) {
          connection.release();
          return res.json({
            message: `Restauração concluída com sucesso! (${executados} comandos SQL e imagens restauradas)`
          });
        }

        connection.query(comandos[indice], (queryErr) => {
          if (queryErr) {
            console.error(`Erro ao executar comando ${indice}:`, queryErr.message);
          } else {
            executados++;
          }
          executarProximo(indice + 1);
        });
      };

      executarProximo(0);
    });

  } catch (err) {
    console.error('Erro ao processar restauração do arquivo zip:', err);
    return res.status(500).json({ message: `Erro ao descompactar ou processar o backup: ${err.message}` });
  }
});