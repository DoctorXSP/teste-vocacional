// ============================================================================
// IMPORTAÇÕES DE MÓDULOS E BIBLIOTECAS EXTERNAS
// ============================================================================

// Importa o React base e os hooks essenciais para manipulação de estado, ciclo de vida e DOM
import React, { useState, useEffect, useCallback, useRef } from 'react';

// Importa o arquivo de folha de estilos padrão da aplicação
import './index.css';

// Importa o cliente HTTP Axios para requisições de API junto ao backend
import axios from 'axios';

// Importa o componente gráfico customizado do tipo Radar/Teia para exibir as 4 vertentes
import GraficoRadar from './GraficoRadar';

// Importa a imagem do logotipo da instituição
import logoEtec from './img/Logo.png';

// Importa o componente visual gerador de QR Code em formato SVG de alta resolução
import { QRCodeSVG } from 'qrcode.react';

// Importa a biblioteca html2canvas para renderizar a árvore do DOM em uma tela canvas bitmap
import html2canvas from 'html2canvas';

// Importa a biblioteca jsPDF para geração de documentos PDF para impressão/download
import jsPDF from 'jspdf';

// ============================================================================
// ESTRUTURAS DE DADOS ESTÁTICAS E CONSTANTES
// ============================================================================

// Objeto com as 10 sugestões de carreira/profissão para cada uma das 4 áreas avaliadas
const listaProfissoes = {
  // Lista de carreiras sugeridas para o perfil Biológicas e Saúde
  biologicas: ["Bioquímico", "Biólogo", "Dentista", "Enfermeiro", "Farmacêutico", "Fisioterapeuta", "Médico", "Nutricionista", "Pesquisador", "Veterinário"],
  // Lista de carreiras sugeridas para o perfil de Ciências Exatas, Engenharia e Cálculos
  exatas: ["Analista de Sistemas", "Arquiteto", "Automação Industrial", "Cientista de Dados", "Desenvolvedor de Software", "Economista", "Eletroeletrônica", "Engenheiro", "Físico", "Matemático"],
  // Lista de carreiras sugeridas para o perfil de Humanas, Gestão, Comunicação e Sociais
  humanas: ["Administrador", "Advogado", "Comércio Exterior", "Escritor", "Gestor de Recursos Humanos", "Jornalista", "Logística", "Professor", "Psicólogo", "Sociólogo"],
  // Lista de carreiras sugeridas para o perfil de Tecnologia da Informação, Redes e Eletrônica
  tecnologicas: ["Analista de Sistemas", "Arquiteto de Tecnologia", "Automação Industrial", "Cyber Security", "Desenvolvedor Web", "Desenvolvimento de Sistemas", "Eletroeletrônica", "Especialista em Cloud", "Informática", "Redes de Computadores"]
};

// Dicionário para mapear as chaves internas para os nomes formais exibidos na interface
const nomesAreas = {
  biologicas: 'Biológicas',     // Nome legível para a chave biologicas
  exatas: 'Exatas',             // Nome legível para a chave exatas
  humanas: 'Humanas',           // Nome legível para a chave humanas
  tecnologicas: 'Tecnológicas'  // Nome legível para a chave tecnologicas
};

// Dicionário com blocos de texto HTML formatados contendo a análise vocacional e a grade de cursos da Etec
const textosEducacionais = {
  // Bloco explicativo com cursos presentes e ausentes para quem pontuar em Biológicas
  biologicas: `
    <p style="margin: 0 0 10px 0;">
      <b>Resultado do Teste:</b> Seu perfil demonstrou maior afinidade com a área de <b>Biológicas e Saúde</b>, evidenciando interesse por organismos vivos, bem-estar humano, processos químicos e preservação ambiental.
    </p>

    <div style="background-color: #f8f9fa; border-left: 4px solid #34A853; padding: 10px 12px; margin-bottom: 12px; border-radius: 4px;">
      <b style="color: #2e7d32; font-size: 14px;">❌ Cursos da área de Biológicas que a Etec de Embu NÃO OFERECE:</b><br/>
      <span style="font-size: 12.5px; color: #444;">
        A unidade de Embu das Artes <b>não dispõe</b> de cursos técnicos ou do Novotec voltados especificamente à saúde e biologia (como <i>Técnico em Enfermagem, Farmácia, Nutrição e Dietética, Análises Clínicas, Veterinária ou Biotecnologia</i>).
      </span>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 10px 12px; margin-bottom: 12px; border-radius: 4px;">
      <b style="color: #15803d; font-size: 14px;">✅ Cursos que a Etec de Embu TEM e como eles ajudam sua carreira:</b><br/>
      <span style="font-size: 12.5px; color: #333;">
        Nossa equipe docente possui alta formação em Biologia e Química no Ensino Médio, preparando você com excelência para vestibulares em Medicina, Odontologia e Biomedicina. Além disso, clínicas e hospitais exigem cada vez mais gestão e informática:<br/>
        • <b>Para quem está no 9º ano (Novotec / M-TEC - Médio + Técnico):</b> <i>Administração (Manhã/Tarde), Informática (Tarde) ou Desenvolvimento de Sistemas (Noite)</i>.<br/>
        • <b>Para quem tem o Ensino Médio ou cursa a partir do 2º ano (Técnicos Gratuitos):</b> <i>Técnico em Administração (Noite), Técnico em Logística (Noite) e Técnico em Informática (Tarde)</i> para atuar no controle hospitalar e de insumos farmacêuticos.
      </span>
    </div>
  `,

  // Bloco explicativo com cursos presentes e ausentes para quem pontuar em Exatas
  exatas: `
    <p style="margin: 0 0 10px 0;">
      <b>Resultado do Teste:</b> Seu resultado evidenciou forte raciocínio lógico-matemático e grande vocação para a área de <b>Exatas, Indústria, Gestão e Tecnologia</b>.
    </p>

    <div style="background-color: #f0f7ff; border-left: 4px solid #4285F4; padding: 10px 12px; margin-bottom: 12px; border-radius: 4px;">
      <b style="color: #1a73e8; font-size: 14px;">✅ Cursos do eixo de Exatas, TI, Gestão e Indústria que a Etec de Embu TEM:</b><br/>
      <span style="font-size: 12.5px; color: #333;">
        • <b>Novotec / M-TEC (Ensino Médio Integrado - Para alunos do 9º ano):</b><br/>
        - <i>Técnico em Automação Industrial</i> (Tarde)<br/>
        - <i>Técnico em Redes de Computadores</i> (Manhã)<br/>
        - <i>Técnico em Informática</i> (Tarde)<br/>
        - <i>Técnico em Desenvolvimento de Sistemas</i> (Noite)<br/>
        - <i>Técnico em Administração</i> (Manhã e Tarde)<br/><br/>
        • <b>Cursos Técnicos Modulares Gratuitos (Para quem está a partir do 2º ano ou já concluiu o Ensino Médio):</b><br/>
        - <i>Técnico em Eletroeletrônica</i> (Noite)<br/>
        - <i>Técnico em Desenvolvimento de Sistemas</i> (Noite)<br/>
        - <i>Técnico em Informática</i> (Tarde)<br/>
        - <i>Técnico em Administração</i> (Noite)<br/>
        - <i>Técnico em Comércio Exterior</i> (Noite)<br/>
        - <i>Técnico em Logística</i> (Noite)
      </span>
    </div>

    <div style="background-color: #fdf2f2; border-left: 4px solid #ef4444; padding: 10px 12px; margin-bottom: 12px; border-radius: 4px;">
      <b style="color: #b91c1c; font-size: 14px;">❌ Cursos da área de Exatas que a unidade NÃO POSSUI no momento:</b><br/>
      <span style="font-size: 12.5px; color: #444;">
        A Etec de Embu <b>não oferece</b> cursos como <i>Técnico em Mecânica, Mecatrônica, Edificações/Construção Civil, Agrimensura, Química Industrial ou Mineração</i>, mas nossos cursos de Automação e Eletroeletrônica fornecem as bases exatas fundamentais para quem quer cursar essas Engenharias no ensino superior.
      </span>
    </div>
  `,

  // Bloco explicativo com cursos presentes e ausentes para quem pontuar em Humanas
  humanas: `
    <p style="margin: 0 0 10px 0;">
      <b>Resultado do Teste:</b> Seu perfil revelou destacada facilidade para <b>Humanas e Ciências Sociais Aplicadas</b>, com excelente potencial de liderança, inteligência emocional, negociação e trabalho em equipe.
    </p>

    <div style="background-color: #fffdf0; border-left: 4px solid #FBBC05; padding: 10px 12px; margin-bottom: 12px; border-radius: 4px;">
      <b style="color: #b45309; font-size: 14px;">✅ Cursos do eixo de Humanas e Gestão de Negócios que a Etec de Embu TEM:</b><br/>
      <span style="font-size: 12.5px; color: #333;">
        • <b>Novotec / M-TEC (Ensino Médio Integrado - Para concluintes do 9º ano):</b><br/>
        - <i>Ensino Médio com Habilitação Técnica em Administração</i> (Manhã e Tarde)<br/><br/>
        • <b>Cursos Técnicos Modulares Gratuitos (Para alunos a partir do 2º ano ou com Ensino Médio completo):</b><br/>
        - <i>Técnico em Administração</i> (Noite) - Foco em gestão empresarial e liderança de pessoas.<br/>
        - <i>Técnico em Comércio Exterior</i> (Noite) - Relações internacionais, legislação aduaneira e negociação global.<br/>
        - <i>Técnico em Logística</i> (Noite) - Gestão de operações, cadeias de suprimentos e atendimento comunitário.
      </span>
    </div>

    <div style="background-color: #fef2f2; border-left: 4px solid #f87171; padding: 10px 12px; margin-bottom: 12px; border-radius: 4px;">
      <b style="color: #dc2626; font-size: 14px;">❌ Cursos da área de Humanas que a Etec de Embu NÃO TEM:</b><br/>
      <span style="font-size: 12.5px; color: #444;">
        A unidade <b>não oferece</b> cursos como <i>Técnico em Serviços Jurídicos, Marketing Digital, Recursos Humanos puro, Secretariado, Turismo, Tradução ou Design Gráfico</i>, tampouco faculdades de Direito, Psicologia ou Letras, mas a formação em Administração e Comércio Exterior contempla módulos diretos de Direito, Gestão de Pessoas e Relações Internacionais.
      </span>
    </div>
  `,

  // Bloco explicativo com cursos presentes e ausentes para quem pontuar em Tecnológicas
  tecnologicas: `
    <p style="margin: 0 0 10px 0;">
      <b>Resultado do Teste:</b> Seu teste indicou afinidade máxima com o eixo de <b>Tecnologia da Informação e Transformação Digital</b>, perfil indispensável para as profissões do futuro.
    </p>

    <div style="background-color: #fef2f2; border-left: 4px solid #EA4335; padding: 10px 12px; margin-bottom: 12px; border-radius: 4px;">
      <b style="color: #c5221f; font-size: 14px;">✅ Cursos do eixo de Tecnologia e Automação que a Etec de Embu TEM:</b><br/>
      <span style="font-size: 12.5px; color: #333;">
        • <b>Novotec / M-TEC (Ensino Médio Integrado - Para concluintes do 9º ano):</b><br/>
        - <i>Técnico em Desenvolvimento de Sistemas</i> (Noite) - Programação, bancos de dados e sistemas web/mobile.<br/>
        - <i>Técnico em Redes de Computadores</i> (Manhã) - Infraestrutura, conectividade e roteamento.<br/>
        - <i>Técnico em Informática</i> (Tarde) - Suporte, manutenção, aplicações corporativas e lógica de sistemas.<br/>
        - <i>Técnico em Automação Industrial</i> (Tarde) - Robótica, circuitos, sensores e controle de processos.<br/><br/>
        • <b>Cursos Técnicos Modulares Gratuitos (A partir do 2º ano ou Ensino Médio concluído):</b><br/>
        - <i>Técnico em Desenvolvimento de Sistemas</i> (Noite)<br/>
        - <i>Técnico em Informática</i> (Tarde)<br/>
        - <i>Técnico em Eletroeletrônica</i> (Noite)
      </span>
    </div>

    <div style="background-color: #f9fafb; border-left: 4px solid #9ca3af; padding: 10px 12px; margin-bottom: 12px; border-radius: 4px;">
      <b style="color: #4b5563; font-size: 14px;">❌ Cursos do eixo de Tecnologia que a unidade NÃO TEM:</b><br/>
      <span style="font-size: 12.5px; color: #444;">
        A Etec de Embu <b>não oferece</b> cursos de nicho como <i>Técnico em Desenvolvimento de Jogos Digitais, Cibersegurança/Defesa Cibernética específica, Inteligência Artificial pura, Manutenção de Aeronaves ou Telecomunicações</i>. Entretanto, os cursos de TI da escola ensinam os fundamentos de algoritmos, redes e lógica exigidos por todas essas áreas avançadas.
      </span>
    </div>
  `
};

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Função que implementa o algoritmo de Fisher-Yates para embaralhar itens de uma lista aleatoriamente sem viés
function embaralharArray(array) {
  // Cria uma cópia superficial do vetor recebido para evitar efeitos colaterais no vetor original
  const arr = [...array];
  // Itera regressivamente a partir do último elemento até o segundo índice
  for (let i = arr.length - 1; i > 0; i--) {
    // Sorteia um índice aleatório inteiro entre zero e a posição i atual
    const j = Math.floor(Math.random() * (i + 1));
    // Realiza a desestruturação para permutar os valores de posição entre i e j
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Retorna o array completamente reorganizado de maneira pseudoaleatória
  return arr;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

// Definição da função do componente React Teste recebendo os dados do usuário conectado
function Teste({ usuario }) {
  // Estado que armazena as 10 questões sorteadas e preparadas para a rodada do teste
  const [sessaoQuestoes, setSessaoQuestoes] = useState([]);
  // Estado que indica qual o índice da pergunta ativa (de 0 a 9)
  const [indiceAtual, setIndiceAtual] = useState(0);
  // Estado que armazena os dados da questão corrente sendo visualizada
  const [questao, setQuestao] = useState(null);
  // Estado que armazena a lista de alternativas com texto e função pontuadora embaralhadas
  const [opcoesEmbaralhadas, setOpcoesEmbaralhadas] = useState([]);

  // Estado auxiliar para controlar qual botão está em hover/ativo para animações de relevo
  const [opcaoAtivaId, setOpcaoAtivaId] = useState(null);

  // Estados acumuladores de pontuação para cada uma das 4 áreas
  const [biologicas, setBiologicas] = useState(0);     // Pontuação total em Biológicas
  const [exatas, setExatas] = useState(0);             // Pontuação total em Exatas
  const [humanas, setHumanas] = useState(0);           // Pontuação total em Humanas
  const [tecnologicas, setTecnologicas] = useState(0); // Pontuação total em Tecnológicas

  // Estados de controle e resultado final
  const [finalizado, setFinalizado] = useState(false);                     // Flag que indica se o aluno respondeu as 10 perguntas
  const [houveEmpate, setHouveEmpate] = useState(false);                   // Flag que indica se houve empate no primeiro lugar
  const [areasEmpatadas, setAreasEmpatadas] = useState([]);                 // Lista com as áreas que empataram na liderança
  const [profissoesRecomendadas, setProfissoesRecomendadas] = useState([]); // Lista com as 10 carreiras apuradas no relatório
  const [textoFinal, setTextoFinal] = useState("");                         // Bloco de texto em HTML explicativo do resultado
  const [gerandoPDF, setGerandoPDF] = useState(false);                     // Flag de carregamento enquanto o PDF é processado

  // Referência vinculada ao nó DOM da div do relatório impresso
  const relatorioRef = useRef(null);

  // ============================================================================
  // CICLOS DE VIDA E EFEITOS (USEEFFECT)
  // ============================================================================

  // Efeito executado na montagem do componente para buscar as perguntas do backend
  useEffect(() => {
    // Função assíncrona interna para requisitar e sortear as 10 perguntas
    const carregarTodasAsQuestoes = async () => {
      try {
        // Log informativo no console do navegador
        console.log("Baixando acervo completo de questões...");
        // Requisita todas as questões cadastradas na rota do servidor
        const response = await axios.get("http://localhost:3012/todasQuestoes");
        // Extrai a listagem de dados do corpo da resposta
        const todas = response.data;

        // Valida se a resposta é um vetor não vazio
        if (Array.isArray(todas) && todas.length > 0) {
          // Embaralha o acervo geral de questões
          let embaralhadas = embaralharArray(todas);
          // Cria o vetor de destino que conterá rigorosamente 10 questões
          let listaFinal10 = [];

          // Laço de segurança para garantir o preenchimento de 10 itens mesmo com poucas perguntas no banco
          while (listaFinal10.length < 10) {
            // Percorre as perguntas embaralhadas
            for (let q of embaralhadas) {
              // Se ainda não atingiu o limite de 10 perguntas, insere a questão
              if (listaFinal10.length < 10) {
                listaFinal10.push(q);
              }
            }
            // Se o acervo original tiver menos que 10, reembaralha para novo ciclo
            embaralhadas = embaralharArray(todas);
          }

          // Salva as 10 perguntas selecionadas no estado
          setSessaoQuestoes(listaFinal10);
          // Inicializa o ponteiro de questão no índice 0
          setIndiceAtual(0);
        }
      } catch (error) {
        // Registra eventuais falhas de conexão ou rede no console
        console.error("Erro ao carregar acervo de questões:", error);
      }
    };

    // Executa a rotina de busca de questões
    carregarTodasAsQuestoes();
  }, []); // Executa apenas uma vez no carregamento inicial do componente

  // Efeito que monitora o avanço das questões para preparar a pergunta e reembaralhar as opções
  useEffect(() => {
    // Verifica se existem perguntas carregadas e se o teste ainda não passou da décima questão
    if (sessaoQuestoes.length > 0 && indiceAtual < 10) {
      // Obtém o objeto da questão correspondente à posição atual
      const questaoAtual = sessaoQuestoes[indiceAtual];
      // Atualiza o estado da questão atual em tela
      setQuestao(questaoAtual);

      // Constrói o array com as alternativas, amarrando cada texto ao seu respectivo setter de pontuação
      const opcoes = [
        { id: 'bio', texto: questaoAtual.opcaoA, setPontuacao: setBiologicas },
        { id: 'exa', texto: questaoAtual.opcaoB, setPontuacao: setExatas },
        { id: 'hum', texto: questaoAtual.opcaoC, setPontuacao: setHumanas },
        { id: 'tec', texto: questaoAtual.opcaoD, setPontuacao: setTecnologicas }
      ];

      // Embaralha as 4 alternativas para que as posições dos botões fiquem dinâmicas
      setOpcoesEmbaralhadas(embaralharArray(opcoes));
    }
  }, [sessaoQuestoes, indiceAtual]); // Disparado sempre que o índice da questão ou a lista for alterada

  // ============================================================================
  // FUNÇÕES DE LÓGICA E PROCESSAMENTO DO TESTE
  // ============================================================================

  // Função responsável por contabilizar a pontuação da opção escolhida e navegar para a próxima questão
  const registrarEscolha = (setPontuacao) => {
    // Incrementa a pontuação da área associada ao botão clicado em 10 pontos
    setPontuacao(prev => prev + 10);

    // Atualiza o índice da questão de forma atômica baseada no valor prévio
    setIndiceAtual(prevIndice => {
      // Calcula o próximo índice
      const proximo = prevIndice + 1;
      // Se alcançou ou ultrapassou a décima pergunta (índice 10), marca o teste como finalizado
      if (proximo >= 10) {
        setFinalizado(true);
      }
      // Retorna o índice incrementado
      return proximo;
    });
  };

  // Função memorizada com useCallback para apurar as pontuações, resolver desempates e enviar ao banco
  const determinarProfissoes = useCallback(async () => {
    // Agrupa os valores de pontuação de todas as áreas
    const valores = { biologicas, exatas, humanas, tecnologicas };
    // Converte em pares [chave, valor] e ordena de forma decrescente pela pontuação
    const ordenado = Object.entries(valores).sort((a, b) => b[1] - a[1]);

    // Obtém o maior valor de pontuação obtido
    const pontuacaoMaxima = ordenado[0][1];
    // Filtra todas as áreas que alcançaram essa pontuação máxima e que sejam maiores que zero
    const categoriasVencedoras = ordenado
      .filter(([_, pontuacao]) => pontuacao === pontuacaoMaxima && pontuacao > 0)
      .map(([categoria]) => categoria);

    // Identifica se ocorreu empate (quando mais de uma área obteve a pontuação máxima)
    const ehEmpate = categoriasVencedoras.length > 1;
    // Atualiza o estado indicando se houve empate
    setHouveEmpate(ehEmpate);
    // Armazena as chaves das áreas empatadas
    setAreasEmpatadas(categoriasVencedoras);

    // Vetor que guardará as 10 profissões selecionadas para exibição no relatório
    let listaProfissoesCalculada = [];

    // Tratamento caso ocorra empate entre duas ou mais áreas
    if (ehEmpate) {
      // Calcula quantas profissões cada área vencedora deve ceder igualmente para fechar 10
      const qtdPorArea = Math.floor(10 / categoriasVencedoras.length);
      // Cria uma coleção Set para evitar nomes de profissões duplicadas
      const conjuntoUnico = new Set();

      // Primeira passada: distribui as profissões igualmente entre as áreas empatadas
      categoriasVencedoras.forEach(cat => {
        const carreirasDaArea = listaProfissoes[cat];
        let adicionadas = 0;
        for (let prof of carreirasDaArea) {
          if (adicionadas < qtdPorArea && !conjuntoUnico.has(prof)) {
            conjuntoUnico.add(prof);
            adicionadas++;
          }
        }
      });

      // Segunda passada: completa a lista até atingir 10 itens caso a divisão inteira deixe sobra
      for (let cat of categoriasVencedoras) {
        for (let prof of listaProfissoes[cat]) {
          if (conjuntoUnico.size < 10) {
            conjuntoUnico.add(prof);
          }
        }
      }

      // Converte o Set de volta em um array comum
      listaProfissoesCalculada = Array.from(conjuntoUnico);

      // Concatena as mensagens e cursos de todas as vertentes que empataram
      const textoCombinado = categoriasVencedoras
        .map(cat => `
          <div style="margin-top: 14px; padding-top: 10px; border-top: 2px dashed #ccc;">
            <h4 style="color: #1a73e8; margin: 0 0 6px 0; font-size: 15px;">
              Análise e Cursos para a vertente de ${nomesAreas[cat]}:
            </h4>
            ${textosEducacionais[cat]}
          </div>
        `)
        .join('');

      // Salva o texto combinado no estado
      setTextoFinal(textoCombinado);
    } else {
      // Caso haja vitória isolada de uma única área
      const categoriaUnica = categoriasVencedoras[0] || ordenado[0][0];
      // Pega as 10 profissões da área vencedora
      listaProfissoesCalculada = listaProfissoes[categoriaUnica].slice(0, 10);
      // Define o texto informativo padrão correspondente à área única
      setTextoFinal(textosEducacionais[categoriaUnica]);
    }

    // Salva a lista calculada de profissões no estado
    setProfissoesRecomendadas(listaProfissoesCalculada);

    // Se o usuário estiver autenticado e possuir ID, grava as notas no backend
    if (usuario && usuario.id) {
      // Monta a string legível do perfil (ex: "Tecnológicas / Exatas")
      const perfilParaGravar = categoriasVencedoras.map(cat => nomesAreas[cat]).join(' / ');
      try {
        // Envia requisição POST para persistir o resultado vocacional na base
        await axios.post("http://localhost:3012/salvarResultado", {
          userId: usuario.id,
          biologicas,
          exatas,
          humanas,
          tecnologicas,
          perfilPredominante: perfilParaGravar
        });
        console.log("Resultado vocacional gravado com sucesso no banco!");
      } catch (err) {
        console.error("Erro ao registrar resultado no banco:", err);
      }
    }
  }, [biologicas, exatas, humanas, tecnologicas, usuario]); // Dependências da função memorizada

  // Efeito que aciona o cálculo das profissões assim que o teste for finalizado
  useEffect(() => {
    if (finalizado) {
      determinarProfissoes();
    }
  }, [finalizado, determinarProfissoes]);

  // ============================================================================
  // EXPORTAÇÃO E GERAÇÃO DO RELATÓRIO EM PDF
  // ============================================================================

  // Função assíncrona responsável por capturar o relatório e convertê-lo em PDF multipáginas
  const gerarPDF = async () => {
    // Interrompe se o elemento referenciado do relatório não existir no DOM
    if (!relatorioRef.current) return;
    // Ativa o estado de carregamento do botão
    setGerandoPDF(true);

    try {
      // Pega a referência do nó HTML do relatório
      const elemento = relatorioRef.current;

      // Rasteriza o elemento HTML em um Canvas com escala dobrada (alta nitidez)
      const canvas = await html2canvas(elemento, {
        scale: 2,                                                  // Resolução dobrada para melhor legibilidade
        useCORS: true,                                             // Habilita carregar imagens de outros domínios
        backgroundColor: '#ffffff',                                // Define fundo branco para a página
        ignoreElements: (el) => el.classList.contains('no-print-pdf') // Ignora elementos com a classe de não impressão
      });

      // Converte o canvas para imagem em formato PNG base64
      const imgData = canvas.toDataURL('image/png');
      // Instancia o objeto jsPDF em orientação retrato ('p'), unidade milímetros ('mm') e padrão 'a4'
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Obtém a largura da página A4 em milímetros (210mm)
      const paginaLargura = pdf.internal.pageSize.getWidth();
      // Obtém a altura da página A4 em milímetros (297mm)
      const paginaAltura = pdf.internal.pageSize.getHeight();

      // Calcula a altura correspondente da imagem mantendo a proporção em relação à largura útil
      const imagemAltura = (canvas.height * paginaLargura) / canvas.width;
      // Variável de controle com a altura total restante para impressão
      let alturaRestante = imagemAltura;
      // Coordenada vertical Y de inserção no PDF
      let posicaoY = 0;

      // Adiciona a primeira fatia da imagem na primeira página do PDF
      pdf.addImage(imgData, 'PNG', 0, posicaoY, paginaLargura, imagemAltura);
      // Abate a altura da folha já impressa
      alturaRestante -= paginaAltura;

      // Laço para adicionar novas páginas enquanto houver conteúdo excedente
      while (alturaRestante > 0) {
        posicaoY -= paginaAltura; // Desloca a coordenada Y para cima para imprimir a próxima seção
        pdf.addPage();            // Cria uma nova folha no PDF
        pdf.addImage(imgData, 'PNG', 0, posicaoY, paginaLargura, imagemAltura); // Renderiza a imagem deslocada
        alturaRestante -= paginaAltura; // Abate a altura processada
      }

      // Sanitiza o nome do estudante para uso seguro no arquivo de download
      const nomeLimpo = usuario?.nome ? usuario.nome.trim().replace(/\s+/g, '_') : 'Aluno';
      // Dispara o download automático do arquivo com o nome personalizado
      pdf.save(`Resultado_Vocacional_${nomeLimpo}.pdf`);
    } catch (erro) {
      console.error('Erro ao gerar o PDF:', erro);
    } finally {
      // Desativa o estado de carregamento do botão
      setGerandoPDF(false);
    }
  };

  // ============================================================================
  // RENDERIZAÇÃO DO COMPONENTE VISUAL (JSX)
  // ============================================================================

  return (
    // Contêiner principal envolvendo todo o layout do componente
    <div className='corpoP'>
      {/* Barra superior com o título da aplicação */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Seção central dinâmica onde alternam as questões ou o relatório final */}
      <section style={{ width: '95%', margin: 'auto', marginTop: '25px', textAlign: 'center', fontSize: '16pt', fontWeight: 'bold' }}>
        {/* Renderização condicional: se o teste não terminou, exibe as perguntas; caso contrário, exibe o relatório */}
        {!finalizado ? (
          // Exibe a questão caso os dados estejam carregados
          questao ? (
            <>
              {/* Contador exibindo o número da pergunta atual */}
              <p style={{ color: '#DDD', fontSize: '13pt', marginBottom: '10px' }}>
                Questão {indiceAtual + 1} de 10
              </p>
              
              {/* Enunciado da pergunta */}
              <h2 style={{ color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{questao.questao}</h2>

              {/* Contêiner com a ilustração e as opções de resposta */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
                {/* Renderiza a imagem ilustrativa da questão caso exista */}
                {questao.imagem && (
                  <img
                    src={`http://localhost:3012/${questao.imagem}`}
                    alt="Ilustração da questão"
                    style={{
                      width: '400px',
                      height: '400px',
                      objectFit: 'cover',
                      border: '3px solid #FFF',
                      borderRadius: '16px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                      marginRight: '25px'
                    }}
                  />
                )}

                {/* Coluna com os botões das alternativas embaralhadas */}
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', width: '100%' }}>
                  {opcoesEmbaralhadas.map(opcao => {
                    // Verifica se a opção atual é a que está sob efeito de hover
                    const isHovered = opcaoAtivaId === opcao.id;

                    return (
                      // Botão de resposta interativo com efeito 3D e relevo dinâmico
                      <button
                        key={opcao.id}
                        onClick={() => registrarEscolha(opcao.setPontuacao)} // Registra pontuação e avança
                        onMouseEnter={() => setOpcaoAtivaId(opcao.id)}      // Ativa efeito de hover
                        onMouseLeave={() => setOpcaoAtivaId(null)}          // Desativa efeito de hover
                        style={{
                          textAlign: 'left',
                          background: isHovered
                            ? 'linear-gradient(180deg, #ffffff 0%, #f0f0f5 100%)'
                            : 'linear-gradient(180deg, #f8f9fa 0%, #e2e4ea 100%)',
                          color: '#212529',
                          margin: '10px 0',
                          padding: '14px 18px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '14pt',
                          fontWeight: '600',
                          borderTop: '1px solid #ffffff',
                          borderLeft: '1px solid #ffffff',
                          borderRight: '1px solid #b8bac2',
                          borderBottom: '1px solid #9e9fa8',
                          boxShadow: isHovered
                            ? '0 6px 0 #9294a0, 0 10px 20px rgba(0, 0, 0, 0.35)'
                            : '0 5px 0 #a2a4af, 0 6px 14px rgba(0, 0, 0, 0.28)',
                          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                          transition: 'all 0.15s ease-in-out',
                          outline: 'none'
                        }}
                      >
                        {opcao.texto}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            // Mensagem de espera caso os dados da questão ainda estejam carregando
            <p>Carregando questão...</p>
          )
        ) : (
          // ====================================================================
          // RELATÓRIO VOCACIONAL COMPLETO APÓS A CONCLUSÃO DO TESTE
          // ====================================================================
          <div>
            {/* Contêiner principal com largura de 800px para enquadramento perfeito em impressão A4 */}
            <div
              ref={relatorioRef}
              style={{
                width: '800px',
                margin: '0 auto 30px auto',
                backgroundColor: '#ffffff',
                color: '#202124',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                boxSizing: 'border-box'
              }}
            >
              {/* 1. Logotipo institucional ocupando a largura do topo */}
              <div style={{ width: '100%', marginBottom: '14px', textAlign: 'center' }}>
                <img
                  src={logoEtec}
                  alt="Logo Etec de Embu"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
                />
              </div>

              {/* 2. Cabeçalho formal com identificação do aluno e título do documento */}
              <div style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '10px', marginBottom: '16px', textAlign: 'left' }}>
                <h2 style={{ color: '#1a73e8', margin: 0, fontSize: '21px', fontWeight: 'bold' }}>
                  Relatório Individual de Aptidão Vocacional
                </h2>
                {usuario?.nome && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#555' }}>
                    Candidato(a): <b>{usuario.nome}</b>
                  </p>
                )}
              </div>

              {/* 3. Bloco superior: 40% para a lista de profissões e 60% para o Radar */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: '20px', marginBottom: '20px' }}>
                
                {/* Lado Esquerdo (40%): alerta de empate ou cabeçalho e listagem de carreiras */}
                <div style={{ width: '40%', flex: '0 0 40%', textAlign: 'left', boxSizing: 'border-box' }}>
                  {houveEmpate ? (
                    // Exibição em caso de empate entre áreas
                    <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 'bold' }}>⚖️ Empate Técnico Identificado!</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', lineHeight: '1.35' }}>
                        Suas respostas atingiram a mesma pontuação nas áreas de <b>{areasEmpatadas.map(a => nomesAreas[a]).join(' e ')}</b>. Você tem vocação interdisciplinar e pode cursar qualquer uma das áreas!
                      </p>
                    </div>
                  ) : (
                    // Exibição padrão para área única
                    <p style={{ fontWeight: 'bold', fontSize: '15px', margin: '0 0 8px 0', color: '#111' }}>
                      Carreiras recomendadas para o seu perfil:
                    </p>
                  )}

                  {/* Lista ordenada com as 10 profissões recomendadas */}
                  <ul style={{ marginLeft: '12px', paddingLeft: '12px', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    {profissoesRecomendadas.map((profissao, index) => (
                      <li key={index}>{profissao}</li>
                    ))}
                  </ul>
                </div>

                {/* Lado Direito (60%): Gráfico de radar vocacional */}
                <div style={{ width: '60%', flex: '0 0 60%', alignSelf: 'flex-start', display: 'flex', justifyContent: 'center', boxSizing: 'border-box' }}>
                  <GraficoRadar biologicas={biologicas} exatas={exatas} humanas={humanas} tecnologicas={tecnologicas} />
                </div>
              </div>

              {/* 4. Bloco inferior: Análise e comparação com os cursos que a Etec oferece e não oferece */}
              <div style={{ width: '100%', textAlign: 'left', marginBottom: '18px', borderTop: '1px solid #e0e0e0', paddingTop: '14px' }}>
                <h4 style={{ color: '#202124', fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  Análise do Resultado e Guia de Cursos da Etec de Embu:
                </h4>
                {/* Inserção dinâmica do conteúdo HTML com base no resultado apurado */}
                <div
                  style={{ fontSize: '13px', fontWeight: 'normal', textAlign: 'justify', lineHeight: '1.5', color: '#333' }}
                  dangerouslySetInnerHTML={{ __html: textoFinal }}
                />
              </div>

              {/* 5. Rodapé: Chamada para inscrição, botões de ação e QR Code */}
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '14px',
                  borderTop: '2px dashed #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left'
                }}
              >
                {/* Lado esquerdo do rodapé: chamadas e botões (ocultos na impressão via .no-print-pdf) */}
                <div style={{ flex: 1, paddingRight: '20px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#EA4335', fontSize: '16px', fontWeight: 'bold' }}>
                    Se inscreva no Vestibulinho da ETEC de Embu!
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#444', lineHeight: '1.3' }}>
                    Acesse o portal oficial para conferir os períodos de inscrição, cursos do Novotec e vagas abertas:
                  </p>
                  
                  {/* Bloco de botões de navegação e exportação */}
                  <div className="no-print-pdf">
                    {/* Botão de redirecionamento externo para a página do vestibulinho */}
                    <div style={{ marginBottom: '10px' }}>
                      <a
                        href="https://vestibulinho.etec.sp.gov.br/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#1a73e8',
                          color: '#ffffff',
                          padding: '9px 18px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          boxShadow: '0 3px 0 #0d47a1, 0 4px 10px rgba(0,0,0,0.2)'
                        }}
                      >
                        🔗 Acessar Inscrição no Vestibulinho
                      </a>
                    </div>

                    {/* Botão que aciona a exportação direta do elemento em documento PDF */}
                    <div>
                      <button
                        onClick={gerarPDF}
                        disabled={gerandoPDF}
                        style={{
                          backgroundColor: '#34A853',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '9px 18px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: gerandoPDF ? 'not-allowed' : 'pointer',
                          boxShadow: '0 3px 0 #1b5e20, 0 4px 10px rgba(0,0,0,0.2)'
                        }}
                      >
                        {gerandoPDF ? 'Gerando Relatório PDF...' : '📄 Salvar Relatório em PDF'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lado direito do rodapé: exibição do QR Code vetorial de 200px com legenda */}
                <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <QRCodeSVG
                    value="https://vestibulinho.etec.sp.gov.br/"
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                  <span style={{ display: 'block', maxWidth: '200px', fontSize: '11.5px', color: '#202124', marginTop: '8px', fontWeight: 'bold', lineHeight: '1.25' }}>
                    aponte a camera e se inscreva no vestibulinho da ETEC de Embu
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// Exportação padrão do componente Teste para utilização em outras rotas da aplicação
export default Teste;