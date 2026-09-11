// ==========================================
// 1. IMPORTAÇÃO DE MÓDULOS E DEPENDÊNCIAS
// ==========================================

// Carrega as variáveis declaradas no arquivo .env para process.env
require('dotenv').config();

// Importa o micro-framework Express para criar e gerenciar o servidor HTTP e rotas
const express = require('express');

// Importa o driver cliente do MySQL para executar comandos e consultas SQL
const mysql = require('mysql');

// Importa o middleware Multer para processamento de requisições multipart/form-data (upload de arquivos)
const multer = require('multer');

// Importa o middleware CORS para permitir requisições vindas de outras origens/portas (como React)
const cors = require('cors');

// Importa o utilitário nativo de caminhos de arquivos e diretórios do Node.js
const path = require('path');

// Importa o módulo nativo do sistema de arquivos (FileSystem) para leitura e escrita em disco
const fs = require('fs');

// Importa a biblioteca archiver para empacotamento e compactação em formato ZIP
const archiverModule = require('archiver');
// Valida se o módulo foi importado como função clássica ou empacotado sob a chave default
const archiver = typeof archiverModule === 'function' ? archiverModule : archiverModule.default;

// Importa a biblioteca adm-zip para leitura, descompactação e extração de arquivos compactados
const AdmZip = require('adm-zip');

// ==========================================
// 2. CONFIGURAÇÃO DE DIRETÓRIOS E STORAGE
// ==========================================

// Determina dinamicamente o caminho da pasta de imagens, verificando se ela está no nível atual ou acima
const uploadDir = fs.existsSync(path.join(__dirname, 'src', 'img'))
  ? path.join(__dirname, 'src', 'img')
  : path.join(__dirname, '..', 'src', 'img');

// Verifica se a pasta de uploads calculada realmente existe no disco
if (!fs.existsSync(uploadDir)) {
  // Cria a pasta de destino de forma recursiva caso ela ainda não exista
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define as diretrizes de armazenamento físico do Multer para uploads normais
const storage = multer.diskStorage({
  // Define o diretório onde o arquivo enviado será salvo
  destination: function (req, file, cb) {
    // Retorna o diretório de destino validado sem erros
    cb(null, uploadDir);
  },
  // Gera um nome único para o arquivo para evitar sobrescritas
  filename: function (req, file, cb) {
    // Extrai a extensão original do arquivo (.jpg, .png, etc.)
    const ext = path.extname(file.originalname);
    // Concatena o nome do campo + timestamp atual em milissegundos + extensão
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

// Inicializa a instância do Multer usando as diretrizes em disco configuradas acima
const upload = multer({ storage: storage });

// ==========================================
// 3. CONEXÃO COM O BANCO DE DADOS (POOL)
// ==========================================

// Cria uma piscina (pool) de conexões reutilizáveis com o MySQL
const db = mysql.createPool({
  // Limita o número máximo de conexões simultâneas mantidas abertas
  connectionLimit: 10,
  // Endereço do host do banco (puxa da variável de ambiente ou usa localhost como fallback)
  host: process.env.DB_HOST || 'https://server.ohanaflix.win',
  // Usuário de autenticação do MySQL
  user: process.env.DB_USER || 'admin',
  // Senha de autenticação do MySQL
  password: process.env.DB_PASSWORD || 'admin@123',
  // Nome da base de dados utilizada
  database: process.env.DB_NAME || 'testevocacional',
  // Porta de conexão do serviço MySQL (converte a string para número se fornecida)
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
});

// Realiza um handshake inicial para testar se as credenciais e o servidor estão respondendo
db.getConnection((err, connection) => {
  // Se houver falha de rede ou autenticação, exibe no console
  if (err) {
    console.error('❌ Falha ao conectar ao banco:', err.message);
    return;
  }
  // Exibe mensagem de sucesso caso a conexão tenha sido aberta
  console.log('✅ Conexão com o banco de dados estabelecida via Pool!');
  // Devolve a conexão para o pool liberando-a para as rotas da aplicação
  connection.release();
});

// ==========================================
// 4. INICIALIZAÇÃO E MIDDLEWARES DO EXPRESS
// ==========================================

// Instancia o aplicativo Express
const app = express();

// Habilita o parse automático de corpos de requisições no formato JSON
app.use(express.json());

// Habilita o controle de acesso HTTP (CORS) para todos os domínios
app.use(cors());

// Serve os arquivos do diretório de uploads no caminho público /src/img
app.use('/src/img', express.static(uploadDir));
// Serve os mesmos arquivos estáticos também a partir da raiz da URL pública
app.use(express.static(uploadDir));

// Define a porta onde a aplicação escutará as requisições HTTP
const PORT = process.env.PORT || 3012;

// Inicia o servidor HTTP escutando na porta definida
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// ==========================================
// 5. ROTAS DE CADASTRO E RESULTADOS
// ==========================================

// Endpoint POST /caduser: Registra um novo participante do teste
app.post('/caduser', (req, res) => {
  // Desestrutura os dados do usuário enviados no corpo da requisição
  const { nome, email, whatsapp } = req.body;

  // Valida a presença de todos os campos obrigatórios
  if (!nome || !email || !whatsapp) {
    // Retorna status 400 (Bad Request) se faltar algum dado
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  // Define a consulta SQL parametrizada de inserção
  const query = 'INSERT INTO cadastro (nome, email, whatsapp) VALUES (?, ?, ?)';
  // Agrupa os valores a serem vinculados nos placeholders para prevenir SQL Injection
  const values = [nome, email, whatsapp];

  // Executa a instrução no banco de dados
  db.query(query, values, (err, results) => {
    // Trata eventuais erros de execução da query
    if (err) {
      console.error('Erro ao inserir usuário:', err);
      return res.status(500).json({ message: 'Erro ao inserir no banco' });
    }
    // Retorna mensagem de confirmação e o ID gerado pelo banco
    res.json({
      message: 'Cadastro realizado com sucesso!',
      userId: results.insertId
    });
  });
});

// Endpoint POST /salvarResultado: Atualiza a pontuação e o perfil do usuário
app.post('/salvarResultado', (req, res) => {
  // Desestrutura as notas por área e o identificador do usuário enviados pelo frontend
  const { userId, biologicas, exatas, humanas, tecnologicas, perfilPredominante } = req.body;

  // Valida se o identificador do usuário foi devidamente fornecido
  if (!userId) {
    // Retorna erro se o ID não estiver presente
    return res.status(400).json({ message: 'Identificador do usuário não informado.' });
  }

  // Monta a instrução SQL para atualizar as colunas de pontuação e perfil
  const query = `
    UPDATE cadastro 
    SET pontos_biologicas = ?, 
        pontos_exatas = ?, 
        pontos_humanas = ?, 
        pontos_tecnologicas = ?, 
        perfil_predominante = ?
    WHERE id = ?
  `;
  // Mapeia as variáveis na ordem exata dos placeholders da query
  const values = [biologicas, exatas, humanas, tecnologicas, perfilPredominante, userId];

  // Executa o comando de atualização no banco
  db.query(query, values, (err) => {
    // Trata erros de persistência no banco
    if (err) {
      console.error('Erro ao salvar resultado final:', err);
      return res.status(500).json({ message: 'Erro ao salvar resultado final' });
    }
    // Responde com sucesso ao frontend
    res.json({ message: 'Resultado do teste registrado com sucesso!' });
  });
});

// ==========================================
// 6. ROTAS CRUD DE QUESTÕES
// ==========================================

// Endpoint GET /todasQuestoes: Busca todas as perguntas com ordenação previsível por ID
app.get('/todasQuestoes', (req, res) => {
  // Ordena por id ASC para garantir que a ordem seja constante antes e depois de alterações
  const query = 'SELECT * FROM questoes ORDER BY id ASC';

  // Executa a consulta no banco
  db.query(query, (err, results) => {
    // Trata possíveis falhas de leitura
    if (err) {
      console.error('Erro ao carregar questões:', err);
      return res.status(500).json({ message: 'Erro ao consultar o banco de dados' });
    }
    // Retorna os registros obtidos em JSON
    res.json(results || []);
  });
});

// Endpoint POST /insert: Cria uma nova questão com suporte a upload de imagem
app.post('/insert', upload.single('imagem'), (req, res) => {
  // Extrai o enunciado e as alternativas do formulário
  const { questao, opcaoA, opcaoB, opcaoC, opcaoD } = req.body;
  // Obtém o caminho relativo da imagem se um arquivo foi enviado; caso contrário, define null
  const imagem = req.file ? `src/img/${req.file.filename}` : null;

  // Valida se o texto da questão e as 4 opções foram preenchidos
  if (!questao || !opcaoA || !opcaoB || !opcaoC || !opcaoD) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }

  // Prepara a consulta de inserção com as colunas de opções e imagem
  const query = 'INSERT INTO questoes (questao, opcaoA, opcaoB, opcaoC, opcaoD, imagem) VALUES (?, ?, ?, ?, ?, ?)';
  // Prepara o array de valores na mesma sequência dos campos
  const values = [questao, opcaoA, opcaoB, opcaoC, opcaoD, imagem];

  // Executa a inserção no banco
  db.query(query, values, (err, results) => {
    // Trata erros de gravação
    if (err) {
      console.error('Erro ao inserir:', err);
      return res.status(500).json({ message: 'Erro ao inserir no banco' });
    }
    // Retorna mensagem de confirmação, o ID gerado e o caminho da imagem salva
    res.json({
      message: 'Registro inserido com sucesso!',
      insertId: results.insertId,
      imagemSalva: imagem
    });
  });
});

// Endpoint PUT /update/:id: Modifica os dados e retorna o caminho da nova imagem e ID
app.put('/update/:id', upload.single('imagem'), (req, res) => {
  // Extrai o ID dos parâmetros da URL
  const { id } = req.params;
  // Extrai os campos textuais do corpo da requisição
  const { questao, opcaoA, opcaoB, opcaoC, opcaoD } = req.body;
  // Identifica se uma nova imagem foi enviada no upload
  const novaImagem = req.file ? `src/img/${req.file.filename}` : null;

  // Se uma nova imagem foi enviada, busca a imagem antiga no banco para deletar do disco
  if (novaImagem) {
    // Seleciona a imagem anterior registrada no banco
    const selectQuery = 'SELECT imagem FROM questoes WHERE id = ?';
    db.query(selectQuery, [id], (errBusca, resultsBusca) => {
      // Se encontrou a imagem anterior
      if (!errBusca && resultsBusca && resultsBusca.length > 0) {
        const imagemAntiga = resultsBusca[0].imagem;
        // Se havia imagem salva anteriormente
        if (imagemAntiga) {
          // Extrai o nome do arquivo da imagem antiga
          const nomeArquivoAntigo = path.basename(imagemAntiga);
          // Monta o caminho absoluto no diretório de upload
          const caminhoArquivoAntigo = path.join(uploadDir, nomeArquivoAntigo);
          // Remove o arquivo antigo do disco se existir
          if (fs.existsSync(caminhoArquivoAntigo)) {
            fs.unlink(caminhoArquivoAntigo, (errUnlink) => {
              if (errUnlink) console.warn('Aviso: Não foi possível remover a imagem antiga do disco:', errUnlink.message);
            });
          }
        }
      }

      // Executa o UPDATE no banco atualizando os textos e o novo caminho da imagem
      const query = 'UPDATE questoes SET questao = ?, opcaoA = ?, opcaoB = ?, opcaoC = ?, opcaoD = ?, imagem = ? WHERE id = ?';
      const values = [questao, opcaoA, opcaoB, opcaoC, opcaoD, novaImagem, id];

      db.query(query, values, (err) => {
        // Trata falha na atualização
        if (err) {
          console.error('Erro ao atualizar questão:', err);
          return res.status(500).json({ message: 'Erro ao atualizar no banco de dados' });
        }
        // Retorna sucesso, confirmando o ID atualizado e o novo caminho da imagem
        res.json({
          message: 'Registro e imagem atualizados com sucesso!',
          idAtualizado: Number(id),
          imagemSalva: novaImagem
        });
      });
    });
  } else {
    // Caso não haja nova imagem anexada, atualiza apenas as colunas de texto mantendo a foto atual
    const query = 'UPDATE questoes SET questao = ?, opcaoA = ?, opcaoB = ?, opcaoC = ?, opcaoD = ? WHERE id = ?';
    const values = [questao, opcaoA, opcaoB, opcaoC, opcaoD, id];

    db.query(query, values, (err) => {
      // Trata erros de persistência
      if (err) {
        console.error('Erro ao atualizar questão:', err);
        return res.status(500).json({ message: 'Erro ao atualizar no banco de dados' });
      }
      // Confirma a atualização textual
      res.json({
        message: 'Registro atualizado com sucesso!',
        idAtualizado: Number(id),
        imagemSalva: null
      });
    });
  }
});

// Endpoint DELETE /delete/:id: Remove uma questão pelo seu ID e apaga a foto associada
app.delete('/delete/:id', (req, res) => {
  // Captura o ID da questão a ser apagada a partir da URL
  const { id } = req.params;

  // Busca a imagem associada antes de excluir o registro para não deixar órfãos no disco
  const selectQuery = 'SELECT imagem FROM questoes WHERE id = ?';
  db.query(selectQuery, [id], (errBusca, resultsBusca) => {
    // Se encontrou o registro e há imagem associada
    if (!errBusca && resultsBusca && resultsBusca.length > 0 && resultsBusca[0].imagem) {
      const nomeArquivo = path.basename(resultsBusca[0].imagem);
      const caminhoArquivo = path.join(uploadDir, nomeArquivo);
      // Apaga o arquivo físico do disco
      if (fs.existsSync(caminhoArquivo)) {
        fs.unlink(caminhoArquivo, (errUnlink) => {
          if (errUnlink) console.warn('Aviso: Não foi possível apagar o arquivo do disco:', errUnlink.message);
        });
      }
    }

    // Cria a consulta SQL de exclusão por identificador
    const query = 'DELETE FROM questoes WHERE id = ?';

    // Executa a exclusão no banco
    db.query(query, [id], (err) => {
      // Trata erros de exclusão
      if (err) {
        console.error('Erro ao excluir questão:', err);
        return res.status(500).json({ message: 'Erro ao excluir do banco de dados' });
      }
      // Confirma a remoção do registro
      res.json({ message: 'Registro excluído com sucesso!' });
    });
  });
});

// ==========================================
// 7. CONSULTA GERAL DE USUÁRIOS
// ==========================================

// Endpoint GET /usuarios: Lista todos os candidatos e suas notas
app.get('/usuarios', (req, res) => {
  // Query que busca dados cadastrais e trata nulos com COALESCE para evitar campos vazios
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

  // Dispara a consulta no banco
  db.query(query, (err, results) => {
    // Trata falha na consulta
    if (err) {
      console.error('Erro ao buscar usuários na tabela cadastro:', err);
      return res.status(500).json({ message: 'Erro ao consultar banco de dados' });
    }
    // Retorna a listagem dos candidatos
    res.json(results || []);
  });
});

// ==========================================
// 8. BACKUP COMPLETO (SQL + IMAGENS EM .ZIP)
// ==========================================

// Endpoint GET /backup: Gera um dump SQL e empacota junto com as imagens em um arquivo .zip
app.get('/backup', async (req, res) => {
  // Lista das tabelas que serão exportadas
  const tabelas = ['cadastro', 'questoes'];
  // Nome da base de dados em uso
  const dbName = process.env.DB_NAME || 'testevocacional';
  // Inicia o cabeçalho textual do script SQL
  let sqlDump = `-- Backup do Banco de Dados: ${dbName}\n`;
  // Registra a data e hora local da criação no comentário
  sqlDump += `-- Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
  // Desativa temporariamente a checagem de chaves estrangeiras para evitar erros de importação
  sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  try {
    // Itera sequencialmente sobre cada tabela para extrair estrutura e linhas
    for (const tabela of tabelas) {
      // Cria uma Promise para recuperar a instrução DDL de criação da tabela
      const createTableResult = await new Promise((resolve, reject) => {
        db.query(`SHOW CREATE TABLE \`${tabela}\``, (err, rows) => {
          if (err) return reject(err);
          // Retorna a query de criação que o MySQL produziu
          resolve(rows[0]['Create Table']);
        });
      });

      // Adiciona instrução para remover a tabela caso já exista
      sqlDump += `DROP TABLE IF EXISTS \`${tabela}\`;\n`;
      // Adiciona o DDL com a estrutura da tabela
      sqlDump += `${createTableResult};\n\n`;

      // Cria uma Promise para buscar todos os registros da tabela atual
      const registros = await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM \`${tabela}\``, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });

      // Se a tabela contiver dados, monta os comandos INSERT correspondentes
      if (registros.length > 0) {
        // Percorre cada linha retornada
        for (const row of registros) {
          // Extrai e formata os nomes das colunas com backticks
          const colunas = Object.keys(row).map(c => `\`${c}\``).join(', ');
          // Trata e sanitiza cada valor individualmente
          const valores = Object.values(row).map(val => {
            // Converte valores nulos ou indefinidos para a palavra reservada NULL
            if (val === null || val === undefined) return 'NULL';
            // Valores numéricos são inseridos diretamente sem aspas
            if (typeof val === 'number') return val;
            // Escapa barras invertidas e aspas simples para proteger a sintaxe SQL
            const sanitizado = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            // Retorna o valor envolto em aspas simples
            return `'${sanitizado}'`;
          }).join(', ');

          // Adiciona a instrução INSERT formatada ao script final
          sqlDump += `INSERT INTO \`${tabela}\` (${colunas}) VALUES (${valores});\n`;
        }
        // Adiciona uma quebra de linha ao fim dos registros da tabela
        sqlDump += `\n`;
      }
    }

    // Reativa a verificação de chaves estrangeiras ao final do dump
    sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    // Captura o momento atual para compor o nome do arquivo ZIP
    const agora = new Date();
    // Extrai a data no formato YYYY-MM-DD
    const dataFormatada = agora.toISOString().slice(0, 10);
    // Extrai a hora no formato HH-MM-SS substituindo os dois-pontos
    const horaFormatada = agora.toTimeString().slice(0, 8).replace(/:/g, '-');
    // Constrói o nome do arquivo ZIP final
    const nomeArquivoZip = `TesteVocacional_Completo_${dataFormatada}_${horaFormatada}.zip`;

    // Define o cabeçalho HTTP indicando que a resposta é um arquivo ZIP
    res.setHeader('Content-Type', 'application/zip');
    // Define o cabeçalho que força o navegador a fazer o download com o nome gerado
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivoZip}"`);

    // Inicializa o gerador de arquivos zip com nível máximo de compressão (nível 9)
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Escuta possíveis erros emitidos durante o empacotamento
    archive.on('error', (err) => {
      console.error('Erro na criação do arquivo zip:', err);
      // Se os cabeçalhos ainda não foram enviados, responde com erro 500
      if (!res.headersSent) {
        res.status(500).json({ message: 'Erro ao compactar backup.' });
      }
    });

    // Conecta o fluxo gerador do ZIP diretamente ao stream de resposta HTTP
    archive.pipe(res);

    // 1. Insere o conteúdo do script SQL gerado no arquivo database.sql dentro do ZIP
    archive.append(sqlDump, { name: 'database.sql' });

    // 2. Se a pasta de imagens existir, insere todos os seus arquivos na pasta interna "img/"
    if (fs.existsSync(uploadDir)) {
      archive.directory(uploadDir, 'img');
    }

    // Finaliza o empacotamento e fecha o stream de saída
    await archive.finalize();

  } catch (erro) {
    // Trata exceções gerais ocorridas durante a geração do backup
    console.error('Erro ao gerar backup:', erro);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Erro ao gerar backup do banco de dados.' });
    }
  }
});

// ==========================================
// 9. RESTAURAÇÃO COMPLETA (UPLOAD DE ZIP)
// ==========================================

// Configura uma instância do Multer que armazena o upload temporariamente na memória RAM
const uploadMemoria = multer({
  storage: multer.memoryStorage(),
  // Estabelece o limite máximo de tamanho de arquivo aceito (50 Megabytes)
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Endpoint POST /restaurar: Processa o upload de um arquivo .zip contendo database.sql e imagens
app.post('/restaurar', uploadMemoria.single('arquivoBackup'), (req, res) => {
  // Verifica se o arquivo foi recebido no corpo da requisição multipart
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo ZIP foi enviado.' });
  }

  try {
    // Instancia o AdmZip passando o buffer do arquivo recebido na memória
    const zip = new AdmZip(req.file.buffer);
    // Recupera a lista de todos os arquivos e pastas contidos no pacote ZIP
    const zipEntries = zip.getEntries();

    // 1. Procura pela entrada correspondente ao script SQL
    const sqlEntry = zipEntries.find(entry => entry.entryName === 'database.sql' || entry.name.endsWith('.sql'));

    // Rejeita a requisição se nenhum script SQL for localizado dentro do ZIP
    if (!sqlEntry) {
      return res.status(400).json({ message: 'O arquivo .zip não contém um script SQL válido.' });
    }

    // Converte os bytes do arquivo SQL encontrado para texto legível em UTF-8
    const conteudoSql = sqlEntry.getData().toString('utf8');

    // 2. Itera sobre os arquivos do ZIP para extrair as imagens para o disco
    zipEntries.forEach(entry => {
      // Checa se a entrada é um arquivo e se está localizada na pasta "img/"
      if (!entry.isDirectory && (entry.entryName.startsWith('img/') || entry.entryName.startsWith('img\\'))) {
        // Extrai apenas o nome base do arquivo, ignorando diretórios intermediários
        const nomeArquivoImagem = path.basename(entry.entryName);
        if (nomeArquivoImagem) {
          // Define o caminho absoluto final do arquivo na pasta de uploads
          const destinoFinal = path.join(uploadDir, nomeArquivoImagem);
          // Escreve os bytes da imagem diretamente no disco
          fs.writeFileSync(destinoFinal, entry.getData());
        }
      }
    });

    // 3. Divide o arquivo SQL em comandos individuais usando o delimitador ";"
    const comandos = conteudoSql
      .split(/;\s*[\r\n]+/)
      // Remove espaços extras ao redor de cada instrução
      .map(cmd => cmd.trim())
      // Filtra entradas vazias ou comentários puros do SQL
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    // Obtém uma conexão dedicada do pool para executar as instruções sequencialmente
    db.getConnection((err, connection) => {
      // Trata erro de alocação de conexão
      if (err) {
        console.error('Erro ao obter conexão para restauração:', err);
        return res.status(500).json({ message: 'Erro de conexão com o banco de dados.' });
      }

      // Contador de comandos executados com sucesso
      let executados = 0;

      // Função recursiva para garantir a execução dos comandos SQL em ordem estrita
      const executarProximo = (indice) => {
        // Se o índice atingiu o total de comandos, encerra o processo
        if (indice >= comandos.length) {
          // Devolve a conexão de volta ao pool
          connection.release();
          // Retorna a resposta final com o total de operações executadas
          return res.json({
            message: `Restauração concluída com sucesso! (${executados} comandos SQL e imagens restauradas)`
          });
        }

        // Executa o comando SQL atual no banco
        connection.query(comandos[indice], (queryErr) => {
          // Se houver erro de sintaxe/execução no comando específico, registra no log
          if (queryErr) {
            console.error(`Erro ao executar comando ${indice}:`, queryErr.message);
          } else {
            // Incrementa o contador de sucesso
            executados++;
          }
          // Avança recursivamente para a próxima instrução
          executarProximo(indice + 1);
        });
      };

      // Inicia a execução sequencial a partir do primeiro comando (índice 0)
      executarProximo(0);
    });

  } catch (err) {
    // Trata erros de descompactação de arquivos corrompidos ou falhas gerais
    console.error('Erro ao processar restauração do arquivo zip:', err);
    return res.status(500).json({ message: `Erro ao descompactar ou processar o backup: ${err.message}` });
  }
});

// Endpoint GET /totalQuestoes: Retorna a quantidade exata de perguntas cadastradas no banco
app.get('/totalQuestoes', (req, res) => {
  // Query de contagem simples
  const query = 'SELECT COUNT(*) AS total FROM questoes';

  // Executa a contagem no banco de dados
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao contar questões:', err);
      return res.status(500).json({ message: 'Erro ao consultar banco de dados' });
    }
    // Retorna o total encontrado no formato { total: X }
    res.json({ total: results[0]?.total || 0 });
  });
});