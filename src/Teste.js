// ============================================================================
// IMPORTAÇÕES DE MÓDULOS E BIBLIOTECAS EXTERNAS
// ============================================================================

// Importa os hooks essenciais do React para estado, efeitos e referências ao DOM[cite: 13]
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Importa os estilos visuais globais[cite: 13]
import './estilo.css';
import './index.css';
// Importa o cliente HTTP axios para requisições com a API[cite: 13]
import axios from 'axios';
// Importa o componente visual do gráfico tipo radar[cite: 13]
import GraficoRadar from './GraficoRadar';
// Importa o logotipo oficial da Etec de Embu das Artes[cite: 13]
import logoEtec from './img/Logo.png';
// Importa a imagem de boas-vindas do teste[cite: 13]
import imgEntrada from './img/entrada.jpg';
// Importa a imagem substituta caso ocorra erro no carregamento de fotos[cite: 13]
import imgPadrao from './img/padrao.jpg';
// Importa o gerador de QR Code em formato SVG vetorial[cite: 13]
import { QRCodeSVG } from 'qrcode.react';
// Importa biblioteca para captura de tela dos elementos DOM em canvas[cite: 13]
import html2canvas from 'html2canvas';
// Importa a biblioteca para geração programática de arquivos PDF[cite: 13]
import jsPDF from 'jspdf';

// ============================================================================
// ESTRUTURAS DE DADOS ESTÁTICAS E CONSTANTES
// ============================================================================

// Dicionário com listas de carreiras sugeridas para cada um dos eixos temáticos[cite: 13]
const listaProfissoes = {
  // Lista de dez profissões sugeridas para a área biológica[cite: 13]
  biologicas: ["Bioquímico", "Biólogo", "Dentista", "Enfermeiro", "Farmacêutico", "Fisioterapeuta", "Médico", "Nutricionista", "Pesquisador", "Veterinário"],
  // Lista de dez profissões sugeridas para a área exata[cite: 13]
  exatas: ["Analista de Sistemas", "Arquiteto", "Automação Industrial", "Cientista de Dados", "Desenvolvedor de Software", "Economista", "Eletroeletrônica", "Engenheiro", "Físico", "Matemático"],
  // Lista de dez profissões sugeridas para a área de humanas[cite: 13]
  humanas: ["Administrador", "Advogado", "Comércio Exterior", "Escritor", "Gestor de Recursos Humanos", "Jornalista", "Logística", "Professor", "Psicólogo", "Sociólogo"],
  // Lista de dez profissões sugeridas para a área de tecnologia[cite: 13]
  tecnologicas: ["Analista de Sistemas", "Arquiteto de Tecnologia", "Automação Industrial", "Cyber Security", "Desenvolvedor Web", "Desenvolvimento de Sistemas", "Eletroeletrônica", "Especialista em Cloud", "Informática", "Redes de Computadores"]
};

// Dicionário de normalização e formatação dos nomes dos eixos com acentuação[cite: 13]
const nomesAreas = {
  biologicas: 'Biológicas',
  exatas: 'Exatas',
  humanas: 'Humanas',
  tecnologicas: 'Tecnológicas'
};

// Textos educativos detalhando a relação entre o perfil e os cursos da Etec[cite: 13]
const textosEducacionais = {
  // Orientações para o estudante com perfil em Biológicas[cite: 13]
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

  // Orientações para o estudante com perfil em Exatas[cite: 13]
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

  // Orientações para o estudante com perfil em Humanas[cite: 13]
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

  // Orientações para o estudante com perfil em Tecnologia[cite: 13]
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

// Função utilitária que implementa o algoritmo de Fisher-Yates para embaralhar arrays[cite: 13]
function embaralharArray(array) {
  // Clona o vetor original para evitar efeitos colaterais de mutação direta[cite: 13]
  const arr = [...array];
  // Percorre o array de trás para frente trocando elementos aleatoriamente[cite: 13]
  for (let i = arr.length - 1; i > 0; i--) {
    // Sorteia um índice entre 0 e i[cite: 13]
    const j = Math.floor(Math.random() * (i + 1));
    // Efetua a troca de posições desestruturando os valores[cite: 13]
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Retorna o array completamente embaralhado[cite: 13]
  return arr;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

// Declara o componente funcional Teste recebendo as informações do usuário logado[cite: 13]
function Teste({ usuario }) {
  // Controla se a tela atual exibe as instruções iniciais[cite: 13]
  const [emInstrucoes, setEmInstrucoes] = useState(true);
  // Armazena a contagem total de questões cadastradas na base de dados[cite: 13]
  const [totalQuestoesBanco, setTotalQuestoesBanco] = useState(0);
  // Controla o efeito hover visual do botão de início[cite: 13]
  const [hoverBtnInicio, setHoverBtnInicio] = useState(false);

  // Armazena a seleção de dez questões sorteadas para esta rodada[cite: 13]
  const [sessaoQuestoes, setSessaoQuestoes] = useState([]);
  // Índice da questão atualmente em exibição (de 0 a 9)[cite: 13]
  const [indiceAtual, setIndiceAtual] = useState(0);
  // Objeto completo com dados da questão atual[cite: 13]
  const [questao, setQuestao] = useState(null);
  // Lista com as alternativas da questão em ordem aleatória[cite: 13]
  const [opcoesEmbaralhadas, setOpcoesEmbaralhadas] = useState([]);
  // Armazena o identificador da alternativa sobre a qual o cursor do mouse está posicionado[cite: 13]
  const [opcaoAtivaId, setOpcaoAtivaId] = useState(null);

  // Pontuação acumulada na área de Ciências Biológicas[cite: 13]
  const [biologicas, setBiologicas] = useState(0);
  // Pontuação acumulada na área de Ciências Exatas[cite: 13]
  const [exatas, setExatas] = useState(0);
  // Pontuação acumulada na área de Ciências Humanas[cite: 13]
  const [humanas, setHumanas] = useState(0);
  // Pontuação acumulada na área de Ciências Tecnológicas[cite: 13]
  const [tecnologicas, setTecnologicas] = useState(0);

  // Define se o usuário respondeu todas as dez questões[cite: 13]
  const [finalizado, setFinalizado] = useState(false);
  // Indica se houve empate de maior nota entre duas ou mais áreas[cite: 13]
  const [houveEmpate, setHouveEmpate] = useState(false);
  // Vetor que guarda as áreas que empataram em primeiro lugar[cite: 13]
  const [areasEmpatadas, setAreasEmpatadas] = useState([]);
  // Lista com as 10 profissões selecionadas para recomendação[cite: 13]
  const [profissoesRecomendadas, setProfissoesRecomendadas] = useState([]);
  // Bloco HTML com o parecer e análise sobre os cursos da Etec[cite: 13]
  const [textoFinal, setTextoFinal] = useState("");
  // Estado que indica se o relatório PDF está sendo gerado[cite: 13]
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // Referência ao elemento HTML do relatório para captura com html2canvas[cite: 13]
  const relatorioRef = useRef(null);

  // Efeito responsável por buscar as questões da API e preparar o sorteio de dez itens[cite: 13]
  useEffect(() => {
    // Declara função assíncrona interna[cite: 13]
    const carregarTodasAsQuestoes = async () => {
      try {
        // Faz requisição para buscar todas as questões salvas[cite: 13]
        const response = await axios.get("http://localhost:3012/todasQuestoes");
        // Obtém o corpo da resposta com o array de questões[cite: 13]
        const todas = response.data;

        // Se houver questões cadastradas[cite: 13]
        if (Array.isArray(todas) && todas.length > 0) {
          // Atualiza o total de itens existentes no banco[cite: 13]
          setTotalQuestoesBanco(todas.length);

          // Embaralha o acervo original[cite: 13]
          let embaralhadas = embaralharArray(todas);
          // Vetor que armazenará as dez questões da sessão[cite: 13]
          let listaFinal10 = [];

          // Garante a composição de exatamente 10 questões, repetindo o sorteio se necessário[cite: 13]
          while (listaFinal10.length < 10) {
            for (let q of embaralhadas) {
              if (listaFinal10.length < 10) {
                listaFinal10.push(q);
              }
            }
            embaralhadas = embaralharArray(todas);
          }

          // Salva a lista de dez questões no estado[cite: 13]
          setSessaoQuestoes(listaFinal10);
          // Inicializa o apontador no primeiro item[cite: 13]
          setIndiceAtual(0);
        }
      } catch (error) {
        // Exibe erro no console em caso de indisponibilidade da API[cite: 13]
        console.error("Erro ao carregar acervo de questões:", error);
      }
    };

    // Executa a função de busca ao montar o componente[cite: 13]
    carregarTodasAsQuestoes();
  }, []); // Executado apenas na montagem[cite: 13]

  // Efeito que atualiza a questão corrente e embaralha suas quatro opções a cada mudança de índice[cite: 13]
  useEffect(() => {
    // Verifica se há questões carregadas e se o índice está dentro do intervalo de 0 a 9[cite: 13]
    if (sessaoQuestoes.length > 0 && indiceAtual < 10) {
      // Obtém a questão da posição corrente[cite: 13]
      const questaoAtual = sessaoQuestoes[indiceAtual];
      // Define a questão no estado[cite: 13]
      setQuestao(questaoAtual);

      // Mapeia as alternativas associando cada uma à respectiva função de soma de pontos[cite: 13]
      const opcoes = [
        { id: 'bio', texto: questaoAtual.opcaoA, setPontuacao: setBiologicas },
        { id: 'exa', texto: questaoAtual.opcaoB, setPontuacao: setExatas },
        { id: 'hum', texto: questaoAtual.opcaoC, setPontuacao: setHumanas },
        { id: 'tec', texto: questaoAtual.opcaoD, setPontuacao: setTecnologicas }
      ];

      // Salva as quatro opções embaralhadas aleatoriamente no estado[cite: 13]
      setOpcoesEmbaralhadas(embaralharArray(opcoes));
    }
  }, [sessaoQuestoes, indiceAtual]); // Disparado quando as questões ou o índice mudarem[cite: 13]

  // Função acionada ao clicar em uma alternativa de resposta[cite: 13]
  const registrarEscolha = (setPontuacao) => {
    // Incrementa 10 pontos na área correspondente da alternativa escolhida[cite: 13]
    setPontuacao(prev => prev + 10);

    // Avança para a próxima questão ou finaliza o teste[cite: 13]
    setIndiceAtual(prevIndice => {
      const proximo = prevIndice + 1;
      // Se alcançou a décima questão, marca o teste como concluído[cite: 13]
      if (proximo >= 10) {
        setFinalizado(true);
      }
      return proximo;
    });
  };

  // Função memorizada que calcula o resultado vocacional e salva os dados na API[cite: 13]
  const determinarProfissoes = useCallback(async () => {
    // Mapeia as pontuações obtidas nas quatro vertentes[cite: 13]
    const valores = { biologicas, exatas, humanas, tecnologicas };
    // Ordena as pontuações da maior para a menor[cite: 13]
    const ordenado = Object.entries(valores).sort((a, b) => b[1] - a[1]);

    // Identifica a maior pontuação alcançada[cite: 13]
    const pontuacaoMaxima = ordenado[0][1];
    // Filtra todas as áreas que alcançaram a pontuação máxima (maior que zero)[cite: 13]
    const categoriasVencedoras = ordenado
      .filter(([_, pontuacao]) => pontuacao === pontuacaoMaxima && pontuacao > 0)
      .map(([categoria]) => categoria);

    // Identifica se ocorreu empate em primeiro lugar[cite: 13]
    const ehEmpate = categoriasVencedoras.length > 1;
    // Atualiza o estado de empate[cite: 13]
    setHouveEmpate(ehEmpate);
    // Salva a lista de áreas empatadas[cite: 13]
    setAreasEmpatadas(categoriasVencedoras);

    // Array que armazenará as dez profissões recomendadas[cite: 13]
    let listaProfissoesCalculada = [];

    // Se houve empate técnico[cite: 13]
    if (ehEmpate) {
      // Divide a cota de sugestões igualmente entre as áreas que empataram[cite: 13]
      const qtdPorArea = Math.floor(10 / categoriasVencedoras.length);
      // Cria conjunto Set para prevenir repetições de profissões[cite: 13]
      const conjuntoUnico = new Set();

      // Itera sobre as áreas empatadas coletando carreiras proporcionalmente[cite: 13]
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

      // Completa com profissões remanescentes das áreas vencedoras até somar dez[cite: 13]
      for (let cat of categoriasVencedoras) {
        for (let prof of listaProfissoes[cat]) {
          if (conjuntoUnico.size < 10) {
            conjuntoUnico.add(prof);
          }
        }
      }

      // Converte o Set em Array[cite: 13]
      listaProfissoesCalculada = Array.from(conjuntoUnico);

      // Concatena as análises e cursos de todas as vertentes que empataram[cite: 13]
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

      // Salva o texto educativo combinado[cite: 13]
      setTextoFinal(textoCombinado);
    } else {
      // Caso haja apenas uma categoria vencedora sem empate[cite: 13]
      const categoriaUnica = categoriasVencedoras[0] || ordenado[0][0];
      // Seleciona dez carreiras dessa área[cite: 13]
      listaProfissoesCalculada = listaProfissoes[categoriaUnica].slice(0, 10);
      // Salva o texto educativo individual dessa área[cite: 13]
      setTextoFinal(textosEducacionais[categoriaUnica]);
    }

    // Atualiza a lista de carreiras a exibir[cite: 13]
    setProfissoesRecomendadas(listaProfissoesCalculada);

    // Se houver um aluno ativo identificado com ID[cite: 13]
    if (usuario && usuario.id) {
      // Formata o nome do perfil predominante separando por barra caso haja empate[cite: 13]
      const perfilParaGravar = categoriasVencedoras.map(cat => nomesAreas[cat]).join(' / ');
      try {
        // Envia as notas e perfil final para o backend registrar no banco de dados[cite: 13]
        await axios.post("http://localhost:3012/salvarResultado", {
          userId: usuario.id,
          biologicas,
          exatas,
          humanas,
          tecnologicas,
          perfilPredominante: perfilParaGravar
        });
      } catch (err) {
        // Exibe erro no console em caso de falha de gravação[cite: 13]
        console.error("Erro ao registrar resultado no banco:", err);
      }
    }
  }, [biologicas, exatas, humanas, tecnologicas, usuario]); // Dependências do cálculo[cite: 13]

  // Efeito disparado assim que o questionário é finalizado para computar resultados[cite: 13]
  useEffect(() => {
    // Se o teste chegou ao final[cite: 13]
    if (finalizado) {
      // Executa o cálculo e análise vocacional[cite: 13]
      determinarProfissoes();
    }
  }, [finalizado, determinarProfissoes]); // Dispara na mudança de status de finalizado[cite: 13]

  // Função assíncrona responsável por capturar o relatório e exportar como PDF[cite: 13]
  const gerarPDF = async () => {
    // Valida se a referência ao DOM existe[cite: 13]
    if (!relatorioRef.current) return;
    // Ativa status de geração de arquivo[cite: 13]
    setGerandoPDF(true);

    try {
      // Obtém o elemento HTML referenciado[cite: 13]
      const elemento = relatorioRef.current;
      // Converte o elemento visual em canvas gráfico via html2canvas[cite: 13]
      const canvas = await html2canvas(elemento, {
        scale: 2, // Aumenta resolução para impressão nítida[cite: 13]
        useCORS: true, // Permite carregar imagens externas se configurado CORS[cite: 13]
        backgroundColor: '#ffffff', // Fundo branco padrão para folha[cite: 13]
        ignoreElements: (el) => el.classList.contains('no-print-pdf') // Omite botões da impressão[cite: 13]
      });

      // Exporta o canvas para imagem em formato PNG codificada em Base64[cite: 13]
      const imgData = canvas.toDataURL('image/png');
      // Cria o documento PDF em orientação retrato (p), milímetros (mm) e formato A4[cite: 13]
      const pdf = new jsPDF('p', 'mm', 'a4');
      // Obtém a largura da página A4[cite: 13]
      const paginaLargura = pdf.internal.pageSize.getWidth();
      // Obtém a altura da página A4[cite: 13]
      const paginaAltura = pdf.internal.pageSize.getHeight();

      // Calcula a altura proporcional da imagem renderizada na largura do PDF[cite: 13]
      const imagemAltura = (canvas.height * paginaLargura) / canvas.width;
      // Controla a altura de conteúdo que ainda falta adicionar[cite: 13]
      let alturaRestante = imagemAltura;
      // Posição vertical corrente de desenho na página[cite: 13]
      let posicaoY = 0;

      // Adiciona a primeira folha com a imagem do canvas[cite: 13]
      pdf.addImage(imgData, 'PNG', 0, posicaoY, paginaLargura, imagemAltura);
      // Subtrai a altura consumida pela primeira página[cite: 13]
      alturaRestante -= paginaAltura;

      // Cria páginas subsequentes caso o relatório exceda uma única folha A4[cite: 13]
      while (alturaRestante > 0) {
        // Desloca o topo de desenho para a próxima seção[cite: 13]
        posicaoY -= paginaAltura;
        // Adiciona nova folha ao PDF[cite: 13]
        pdf.addPage();
        // Desenha a imagem deslocada[cite: 13]
        pdf.addImage(imgData, 'PNG', 0, posicaoY, paginaLargura, imagemAltura);
        // Subtrai mais uma folha da altura restante[cite: 13]
        alturaRestante -= paginaAltura;
      }

      // Normaliza o nome do arquivo substituindo espaços em branco por sublinhados[cite: 13]
      const nomeLimpo = usuario?.nome ? usuario.nome.trim().replace(/\s+/g, '_') : 'Aluno';
      // Inicia o download automático do PDF com nome formatado[cite: 13]
      pdf.save(`Resultado_Vocacional_${nomeLimpo}.pdf`);
    } catch (erro) {
      // Exibe mensagem caso haja falha na geração do PDF[cite: 13]
      console.error('Erro ao gerar o PDF:', erro);
    } finally {
      // Desativa o indicador de processamento do PDF[cite: 13]
      setGerandoPDF(false);
    }
  };

  // Renderização da interface do componente[cite: 13]
  return (
    // Contêiner principal com fundo roxo[cite: 13]
    <div className='corpoP'>
      {/* Barra de cabeçalho fixa com o título da aplicação[cite: 13] */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      {/* Seção central que abraça as três etapas sequenciais[cite: 13] */}
      <section style={{ width: '95%', maxWidth: '1180px', margin: 'auto', marginTop: '20px', textAlign: 'center' }}>
        
        {/* ====================================================================
            ETAPA 1: INSTRUÇÕES INICIAIS (FLEX RESPONSIVO)[cite: 13]
        ==================================================================== */}
        {emInstrucoes ? (
          // Card branco com as instruções e introdução do teste[cite: 13]
          <div style={{
            margin: '0 auto 30px auto',
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            color: '#212529',
            boxSizing: 'border-box'
          }}>
            {/* Título de abertura do teste[cite: 13] */}
            <h2 style={{
              color: '#1a73e8',
              fontSize: '22px',
              fontWeight: '800',
              marginBottom: '18px',
              textShadow: 'none'
            }}>
              Descubra Seu Futuro Profissional: Teste Vocacional Dinâmico ETEC
            </h2>

            {/* Layout em duas colunas responsivas[cite: 13] */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: '24px',
              textAlign: 'left'
            }}>
              {/* Coluna da Imagem e Botão de Ação[cite: 13] */}
              <div style={{
                flex: '1 1 320px',
                maxWidth: '400px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '0 auto'
              }}>
                {/* Imagem de apresentação[cite: 13] */}
                <img
                  src={imgEntrada}
                  alt="Ilustração Representativa - Teste Vocacional ETEC"
                  onError={(e) => {
                    // Fallback para imagem padrão se houver erro de carregamento[cite: 13]
                    e.target.onerror = null;
                    e.target.src = imgPadrao;
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '380px',
                    height: 'auto',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    border: '3px solid #FFF',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                    display: 'block'
                  }}
                />

                {/* Botão que avança para as perguntas do teste[cite: 13] */}
                <button
                  onClick={() => setEmInstrucoes(false)}
                  onMouseEnter={() => setHoverBtnInicio(true)}
                  onMouseLeave={() => setHoverBtnInicio(false)}
                  style={{
                    width: '100%',
                    maxWidth: '380px',
                    marginTop: '16px',
                    // Efeito degradê com transição visual no hover[cite: 13]
                    background: hoverBtnInicio
                      ? 'linear-gradient(180deg, #34A853 0%, #2e7d32 100%)'
                      : 'linear-gradient(180deg, #1a73e8 0%, #1557b0 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: hoverBtnInicio
                      ? '0 6px 0 #1b5e20, 0 10px 20px rgba(0,0,0,0.35)'
                      : '0 5px 0 #0d47a1, 0 8px 15px rgba(0,0,0,0.25)',
                    transform: hoverBtnInicio ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'all 0.15s ease-in-out',
                    outline: 'none'
                  }}
                >
                  🚀 Começar Meu Teste Vocacional
                </button>
              </div>

              {/* Coluna com as orientações em texto[cite: 13] */}
              <div style={{
                flex: '2 1 320px',
                fontSize: '14px',
                fontWeight: 'normal',
                lineHeight: '1.45',
                color: '#333'
              }}>
                {/* Informações sobre o banco de questões[cite: 13] */}
                <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#1f2937' }}>
                  Este teste foi estruturado sobre um acervo com{' '}
                  <b>
                    {totalQuestoesBanco > 0 ? `${totalQuestoesBanco} questões cadastradas` : 'dezenas de questões dinâmicas'}
                  </b>
                  . A cada rodada, nosso algoritmo realiza um sorteio aleatório de situações cotidianas para mapear suas reais afinidades.
                </p>

                {/* Bloco de representatividade e neutralidade[cite: 13] */}
                <div style={{
                  backgroundColor: '#f0f7ff',
                  borderLeft: '4px solid #1a73e8',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <b style={{ color: '#1557b0', fontSize: '13.5px' }}>👥 Representatividade e Inclusão:</b>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#2d3748' }}>
                    Todas as perguntas são <b>unissex, neutras e abertas</b> para todos os perfis. As imagens são <b>meramente ilustrativas</b>.
                  </p>
                </div>

                {/* Bloco detalhando as entregas do relatório final[cite: 13] */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  borderLeft: '4px solid #16a34a',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <b style={{ color: '#166534', fontSize: '13.5px' }}>📊 O que você recebe no seu Relatório Final:</b>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '12.5px', color: '#1f2937' }}>
                    <li><b>Pontuação por Eixos:</b> Nível de afinidade em <i>Biológicas</i>, <i>Exatas</i>, <i>Humanas</i> e <i>Tecnológicas</i> com <b>Gráfico de Radar</b>.</li>
                    <li><b>10 Carreiras Recomendadas:</b> Amostragem direcionada ao seu perfil.</li>
                    <li><b>Conexão com a ETEC de Embu:</b> Mapeamento detalhado dos cursos gratuitos.</li>
                    <li><b>Exportação em PDF:</b> Relatório diagramado para salvar no celular ou imprimir.</li>
                  </ul>
                </div>

                {/* Bloco de incentivo para inscrição na Etec[cite: 13] */}
                <div style={{
                  backgroundColor: '#fef2f2',
                  borderLeft: '4px solid #ef4444',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <b style={{ color: '#b91c1c', fontSize: '13.5px' }}>🎓 Venha Estudar na ETEC de Embu das Artes!</b>
                  <span style={{ fontSize: '12px', color: '#4b5563', display: 'block', marginTop: '3px' }}>
                    O ensino público e gratuito do Centro Paula Souza oferece alta empregabilidade. Inscreva-se no <b>Vestibulinho</b>!
                  </span>
                </div>

                {/* Alerta e aviso legal[cite: 13] */}
                <div style={{
                  backgroundColor: '#fffdf0',
                  borderLeft: '4px solid #f59e0b',
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontSize: '11.5px', color: '#78350f', display: 'block' }}>
                    ⚠️ <i><b>Aviso:</b> Este teste não é uma sentença definitiva, servindo como apoio e orientação reflexiva de carreira.</i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : !finalizado ? (
          /* ====================================================================
              ETAPA 2: QUESTÕES (FLEX RESPONSIVO COM PILHA VERTICAL NO SMARTPHONE)[cite: 13]
          ==================================================================== */
          questao ? (
            // Contêiner com a questão corrente[cite: 13]
            <div style={{ maxWidth: '900px', margin: 'auto' }}>
              {/* Contador de progresso[cite: 13] */}
              <p style={{ color: '#DDD', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>
                Questão {indiceAtual + 1} de 10
              </p>
              
              {/* Enunciado da questão[cite: 13] */}
              <h2 style={{ color: '#FFF', fontSize: '20px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '16px' }}>
                {questao.questao}
              </h2>

              {/* Bloco flexível com a foto da questão e as 4 opções de resposta[cite: 13] */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px'
              }}>
                {/* Imagem ilustrativa da pergunta[cite: 13] */}
                <img
                  src={questao.imagem ? `http://localhost:3012/${questao.imagem}` : imgPadrao}
                  alt="Ilustração da questão"
                  onError={(e) => {
                    // Fallback para a foto padrão caso ocorra falha ao carregar a imagem cadastrada[cite: 13]
                    e.target.onerror = null;
                    e.target.src = imgPadrao;
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '360px',
                    height: 'auto',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    border: '3px solid #FFF',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                    display: 'block'
                  }}
                />

                {/* Coluna com os botões das alternativas[cite: 13] */}
                <div style={{ flex: '1 1 280px', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  {/* Mapeamento das quatro opções embaralhadas[cite: 13] */}
                  {opcoesEmbaralhadas.map(opcao => {
                    // Verifica se o botão específico está sob foco/hover[cite: 13]
                    const isHovered = opcaoAtivaId === opcao.id;

                    return (
                      // Botão representando uma alternativa de resposta[cite: 13]
                      <button
                        key={opcao.id}
                        onClick={() => registrarEscolha(opcao.setPontuacao)}
                        onMouseEnter={() => setOpcaoAtivaId(opcao.id)}
                        onMouseLeave={() => setOpcaoAtivaId(null)}
                        style={{
                          textAlign: 'left',
                          background: isHovered
                            ? 'linear-gradient(180deg, #ffffff 0%, #f0f0f5 100%)'
                            : 'linear-gradient(180deg, #f8f9fa 0%, #e2e4ea 100%)',
                          color: '#212529',
                          margin: '8px 0',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '15px',
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
                          outline: 'none',
                          width: '100%'
                        }}
                      >
                        {opcao.texto}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // Mensagem provisória enquanto os dados da questão carregam[cite: 13]
            <p style={{ color: '#FFF' }}>Carregando questão...</p>
          )
        ) : (
          /* ====================================================================
              ETAPA 3: RELATÓRIO FINAL VOCACIONAL[cite: 13]
          ==================================================================== */
          <div>
            {/* Card com o relatório completo vinculado via ref para exportação em PDF[cite: 13] */}
            <div
              ref={relatorioRef}
              style={{
                width: '100%',
                maxWidth: '850px',
                margin: '0 auto 30px auto',
                backgroundColor: '#ffffff',
                color: '#202124',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                boxSizing: 'border-box'
              }}
            >
              {/* Logotipo da instituição no topo do laudo[cite: 13] */}
              <div style={{ width: '100%', marginBottom: '14px', textAlign: 'center' }}>
                <img
                  src={logoEtec}
                  alt="Logo Etec de Embu"
                  style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }}
                />
              </div>

              {/* Seção de identificação do participante[cite: 13] */}
              <div style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '8px', marginBottom: '14px', textAlign: 'left' }}>
                <h2 style={{ color: '#1a73e8', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                  Relatório Individual de Aptidão Vocacional
                </h2>
                {/* Nome do estudante avaliado[cite: 13] */}
                {usuario?.nome && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555' }}>
                    Candidato(a): <b>{usuario.nome}</b>
                  </p>
                )}
              </div>

              {/* Bloco superior com a lista de carreiras sugeridas e o gráfico de radar[cite: 13] */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                width: '100%',
                gap: '15px',
                marginBottom: '15px'
              }}>
                {/* Coluna da esquerda: lista de recomendações[cite: 13] */}
                <div style={{ flex: '1 1 280px', width: '100%', textAlign: 'left', boxSizing: 'border-box' }}>
                  {/* Aviso contextual caso tenha havido empate de pontuações[cite: 13] */}
                  {houveEmpate ? (
                    <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>⚖️ Empate Técnico!</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', lineHeight: '1.35' }}>
                        Suas respostas atingiram a mesma pontuação nas áreas de <b>{areasEmpatadas.map(a => nomesAreas[a]).join(' e ')}</b>.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 8px 0', color: '#111' }}>
                      Carreiras recomendadas:
                    </p>
                  )}

                  {/* Lista de itens das 10 profissões selecionadas[cite: 13] */}
                  <ul style={{ marginLeft: '12px', paddingLeft: '12px', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    {profissoesRecomendadas.map((profissao, index) => (
                      <li key={index}>{profissao}</li>
                    ))}
                  </ul>
                </div>

                {/* Coluna da direita: renderização visual do gráfico de radar com as pontuações[cite: 13] */}
                <div style={{ flex: '1 1 320px', width: '100%', display: 'flex', justifyContent: 'center', boxSizing: 'border-box' }}>
                  <GraficoRadar biologicas={biologicas} exatas={exatas} humanas={humanas} tecnologicas={tecnologicas} />
                </div>
              </div>

              {/* Bloco inferior com o parecer didático dos cursos disponíveis[cite: 13] */}
              <div style={{ width: '100%', textAlign: 'left', marginBottom: '16px', borderTop: '1px solid #e0e0e0', paddingTop: '12px' }}>
                <h4 style={{ color: '#202124', fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Análise do Resultado e Guia de Cursos da Etec de Embu:
                </h4>
                {/* Renderização do HTML informativo gerado pela regra de negócio[cite: 13] */}
                <div
                  style={{ fontSize: '12.5px', fontWeight: 'normal', textAlign: 'justify', lineHeight: '1.5', color: '#333' }}
                  dangerouslySetInnerHTML={{ __html: textoFinal }}
                />
              </div>

              {/* Rodapé institucional com link, botão de PDF e QR Code para inscrição[cite: 13] */}
              <div
                style={{
                  marginTop: '15px',
                  paddingTop: '12px',
                  borderTop: '2px dashed #d1d5db',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '15px',
                  textAlign: 'left'
                }}
              >
                {/* Informações e chamadas para ação[cite: 13] */}
                <div style={{ flex: '1 1 260px' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#EA4335', fontSize: '15px', fontWeight: 'bold' }}>
                    Se inscreva no Vestibulinho da ETEC de Embu!
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#444', lineHeight: '1.3' }}>
                    Acesse o portal oficial para conferir os períodos de inscrição, cursos do Novotec e vagas abertas:
                  </p>
                  
                  {/* Botões operacionais (ocultados na exportação do PDF via classe no-print-pdf)[cite: 13] */}
                  <div className="no-print-pdf" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {/* Link para o site do Vestibulinho[cite: 13] */}
                    <a
                      href="https://vestibulinho.etec.sp.gov.br/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#1a73e8',
                        color: '#ffffff',
                        padding: '9px 14px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '12.5px',
                        fontWeight: 'bold',
                        boxShadow: '0 3px 0 #0d47a1'
                      }}
                    >
                      🔗 Inscrição Vestibulinho
                    </a>

                    {/* Botão que dispara a rotina html2canvas + jsPDF[cite: 13] */}
                    <button
                      onClick={gerarPDF}
                      disabled={gerandoPDF}
                      style={{
                        backgroundColor: '#34A853',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '9px 14px',
                        fontSize: '12.5px',
                        fontWeight: 'bold',
                        cursor: gerandoPDF ? 'not-allowed' : 'pointer',
                        boxShadow: '0 3px 0 #1b5e20'
                      }}
                    >
                      {gerandoPDF ? 'Gerando...' : '📄 Salvar PDF'}
                    </button>
                  </div>
                </div>

                {/* Contêiner com o QR Code vetorial[cite: 13] */}
                <div style={{ textAlign: 'center', margin: '0 auto', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  {/* Componente gerador de QR Code apontando para o site do Vestibulinho[cite: 13] */}
                  <QRCodeSVG
                    value="https://vestibulinho.etec.sp.gov.br/"
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                  {/* Texto de orientação para leitura do código via celular[cite: 13] */}
                  <span style={{ display: 'block', maxWidth: '160px', fontSize: '10.5px', color: '#202124', marginTop: '6px', fontWeight: 'bold', lineHeight: '1.2' }}>
                    aponte a câmera e se inscreva no vestibulinho
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

// Exporta o componente Teste como padrão[cite: 13]
export default Teste;