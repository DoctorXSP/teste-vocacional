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

// Importa a imagem de entrada localizada na pasta ./img/
import imgEntrada from './img/entrada.jpg';

// Importa a imagem padrão (fallback) local da pasta ./img/ para quando a imagem não for encontrada
import imgPadrao from './img/padrao.jpg';

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
  biologicas: ["Bioquímico", "Biólogo", "Dentista", "Enfermeiro", "Farmacêutico", "Fisioterapeuta", "Médico", "Nutricionista", "Pesquisador", "Veterinário"],
  exatas: ["Analista de Sistemas", "Arquiteto", "Automação Industrial", "Cientista de Dados", "Desenvolvedor de Software", "Economista", "Eletroeletrônica", "Engenheiro", "Físico", "Matemático"],
  humanas: ["Administrador", "Advogado", "Comércio Exterior", "Escritor", "Gestor de Recursos Humanos", "Jornalista", "Logística", "Professor", "Psicólogo", "Sociólogo"],
  tecnologicas: ["Analista de Sistemas", "Arquiteto de Tecnologia", "Automação Industrial", "Cyber Security", "Desenvolvedor Web", "Desenvolvimento de Sistemas", "Eletroeletrônica", "Especialista em Cloud", "Informática", "Redes de Computadores"]
};

// Dicionário para mapear as chaves internas para os nomes formais exibidos na interface
const nomesAreas = {
  biologicas: 'Biológicas',
  exatas: 'Exatas',
  humanas: 'Humanas',
  tecnologicas: 'Tecnológicas'
};

// Dicionário com blocos de texto HTML formatados contendo a análise vocacional e a grade de cursos da Etec
const textosEducacionais = {
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

// Função utilitária baseada no algoritmo Fisher-Yates para embaralhar os elementos de um vetor
function embaralharArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

function Teste({ usuario }) {
  // Estado que controla a exibição da tela inicial de orientações
  const [emInstrucoes, setEmInstrucoes] = useState(true);

  // Estado que armazena a contagem exata de questões registradas no banco
  const [totalQuestoesBanco, setTotalQuestoesBanco] = useState(0);

  // Estado de controle de hover para o botão principal de Início
  const [hoverBtnInicio, setHoverBtnInicio] = useState(false);

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
  const [biologicas, setBiologicas] = useState(0);
  const [exatas, setExatas] = useState(0);
  const [humanas, setHumanas] = useState(0);
  const [tecnologicas, setTecnologicas] = useState(0);

  // Estados de controle e resultado final
  const [finalizado, setFinalizado] = useState(false);
  const [houveEmpate, setHouveEmpate] = useState(false);
  const [areasEmpatadas, setAreasEmpatadas] = useState([]);
  const [profissoesRecomendadas, setProfissoesRecomendadas] = useState([]);
  const [textoFinal, setTextoFinal] = useState("");
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // Referência vinculada ao nó DOM da div do relatório impresso
  const relatorioRef = useRef(null);

  // ============================================================================
  // CICLOS DE VIDA E EFEITOS (USEEFFECT)
  // ============================================================================

  // Efeito disparado na montagem do componente para carregar todas as questões do banco
  useEffect(() => {
    const carregarTodasAsQuestoes = async () => {
      try {
        console.log("Baixando acervo completo de questões...");
        const response = await axios.get("http://localhost:3012/todasQuestoes");
        const todas = response.data;

        if (Array.isArray(todas) && todas.length > 0) {
          // Guarda o tamanho real do acervo de perguntas usando .length
          setTotalQuestoesBanco(todas.length);

          let embaralhadas = embaralharArray(todas);
          let listaFinal10 = [];

          // Garante a montagem de um conjunto de 10 perguntas mesmo se houver menos cadastradas
          while (listaFinal10.length < 10) {
            for (let q of embaralhadas) {
              if (listaFinal10.length < 10) {
                listaFinal10.push(q);
              }
            }
            embaralhadas = embaralharArray(todas);
          }

          setSessaoQuestoes(listaFinal10);
          setIndiceAtual(0);
        }
      } catch (error) {
        console.error("Erro ao carregar acervo de questões:", error);
      }
    };

    carregarTodasAsQuestoes();
  }, []);

  // Efeito que monitora o índice da questão ativa para carregar os dados e embaralhar as 4 opções
  useEffect(() => {
    if (sessaoQuestoes.length > 0 && indiceAtual < 10) {
      const questaoAtual = sessaoQuestoes[indiceAtual];
      setQuestao(questaoAtual);

      const opcoes = [
        { id: 'bio', texto: questaoAtual.opcaoA, setPontuacao: setBiologicas },
        { id: 'exa', texto: questaoAtual.opcaoB, setPontuacao: setExatas },
        { id: 'hum', texto: questaoAtual.opcaoC, setPontuacao: setHumanas },
        { id: 'tec', texto: questaoAtual.opcaoD, setPontuacao: setTecnologicas }
      ];

      setOpcoesEmbaralhadas(embaralharArray(opcoes));
    }
  }, [sessaoQuestoes, indiceAtual]);

  // ============================================================================
  // FUNÇÕES DE LÓGICA E PROCESSAMENTO DO TESTE
  // ============================================================================

  // Registra a pontuação de 10 pontos na área escolhida e avança o índice
  const registrarEscolha = (setPontuacao) => {
    setPontuacao(prev => prev + 10);

    setIndiceAtual(prevIndice => {
      const proximo = prevIndice + 1;
      if (proximo >= 10) {
        setFinalizado(true);
      }
      return proximo;
    });
  };

  // Avalia as pontuações máximas, identifica empates, carrega profissões e salva no backend
  const determinarProfissoes = useCallback(async () => {
    const valores = { biologicas, exatas, humanas, tecnologicas };
    const ordenado = Object.entries(valores).sort((a, b) => b[1] - a[1]);

    const pontuacaoMaxima = ordenado[0][1];
    const categoriasVencedoras = ordenado
      .filter(([_, pontuacao]) => pontuacao === pontuacaoMaxima && pontuacao > 0)
      .map(([categoria]) => categoria);

    const ehEmpate = categoriasVencedoras.length > 1;
    setHouveEmpate(ehEmpate);
    setAreasEmpatadas(categoriasVencedoras);

    let listaProfissoesCalculada = [];

    if (ehEmpate) {
      const qtdPorArea = Math.floor(10 / categoriasVencedoras.length);
      const conjuntoUnico = new Set();

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

      for (let cat of categoriasVencedoras) {
        for (let prof of listaProfissoes[cat]) {
          if (conjuntoUnico.size < 10) {
            conjuntoUnico.add(prof);
          }
        }
      }

      listaProfissoesCalculada = Array.from(conjuntoUnico);

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

      setTextoFinal(textoCombinado);
    } else {
      const categoriaUnica = categoriasVencedoras[0] || ordenado[0][0];
      listaProfissoesCalculada = listaProfissoes[categoriaUnica].slice(0, 10);
      setTextoFinal(textosEducacionais[categoriaUnica]);
    }

    setProfissoesRecomendadas(listaProfissoesCalculada);

    // Se o objeto usuário estiver presente, persiste o resultado no banco MySQL
    if (usuario && usuario.id) {
      const perfilParaGravar = categoriasVencedoras.map(cat => nomesAreas[cat]).join(' / ');
      try {
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
  }, [biologicas, exatas, humanas, tecnologicas, usuario]);

  // Efeito disparado no momento em que o teste é finalizado para processar os resultados
  useEffect(() => {
    if (finalizado) {
      determinarProfissoes();
    }
  }, [finalizado, determinarProfissoes]);

  // ============================================================================
  // EXPORTAÇÃO E GERAÇÃO DO RELATÓRIO EM PDF
  // ============================================================================

  // Gera o arquivo PDF paginado utilizando html2canvas e jsPDF
  const gerarPDF = async () => {
    if (!relatorioRef.current) return;
    setGerandoPDF(true);

    try {
      const elemento = relatorioRef.current;
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        ignoreElements: (el) => el.classList.contains('no-print-pdf')
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const paginaLargura = pdf.internal.pageSize.getWidth();
      const paginaAltura = pdf.internal.pageSize.getHeight();

      const imagemAltura = (canvas.height * paginaLargura) / canvas.width;
      let alturaRestante = imagemAltura;
      let posicaoY = 0;

      pdf.addImage(imgData, 'PNG', 0, posicaoY, paginaLargura, imagemAltura);
      alturaRestante -= paginaAltura;

      while (alturaRestante > 0) {
        posicaoY -= paginaAltura;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, posicaoY, paginaLargura, imagemAltura);
        alturaRestante -= paginaAltura;
      }

      const nomeLimpo = usuario?.nome ? usuario.nome.trim().replace(/\s+/g, '_') : 'Aluno';
      pdf.save(`Resultado_Vocacional_${nomeLimpo}.pdf`);
    } catch (erro) {
      console.error('Erro ao gerar o PDF:', erro);
    } finally {
      setGerandoPDF(false);
    }
  };

  // ============================================================================
  // RENDERIZAÇÃO DO COMPONENTE VISUAL (JSX)
  // ============================================================================

  return (
    // Contêiner principal estrutural
    <div className='corpoP'>
      {/* Barra superior de identificação */}
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      <section style={{ width: '95%', margin: 'auto', marginTop: '25px', textAlign: 'center', fontSize: '16pt', fontWeight: 'bold' }}>
        
        {/* ====================================================================
            ETAPA 1: TELA INICIAL (IMAGEM FIXADA AO TOPO + BOTÃO LOGO ABAIXO)
        ==================================================================== */}
        {emInstrucoes ? (
          <div style={{
            maxWidth: '1180px',
            margin: '0 auto 30px auto',
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            color: '#212529',
            boxSizing: 'border-box'
          }}>
            {/* Título de engajamento */}
            <h2 style={{
              color: '#1a73e8',
              fontSize: '23pt',
              fontWeight: '800',
              marginBottom: '20px',
              textShadow: 'none'
            }}>
              Descubra Seu Futuro Profissional: Teste Vocacional Dinâmico ETEC
            </h2>

            {/* Layout flex: alinhamento ao topo com align-items: flex-start */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: '30px',
              textAlign: 'left'
            }}>
              {/* ------------------------------------------------------------------
                  COLUNA ESQUERDA: FIXA AO TOPO NA ROLAGEM (STICKY)
                  Contém a imagem 400x400 e o botão de ação logo abaixo
              ------------------------------------------------------------------ */}
              <div style={{
                flexShrink: 0,
                width: '400px',
                position: 'sticky',
                top: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* Imagem de entrada vinda de ./img/entrada.jpg, com fallback para imgPadrao caso falhe */}
                <img
                  src={imgEntrada}
                  alt="Ilustração Representativa - Teste Vocacional ETEC"
                  onError={(e) => {
                    // Remove o manipulador para evitar loop infinito caso a própria imagem padrão falhe
                    e.target.onerror = null;
                    // Define o caminho do arquivo padrão local importado da pasta ./img/
                    e.target.src = imgPadrao;
                  }}
                  style={{
                    width: '400px',
                    height: '400px',
                    objectFit: 'cover',
                    border: '3px solid #FFF',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                    display: 'block'
                  }}
                />

                {/* Botão posicionado logo abaixo da imagem */}
                <button
                  onClick={() => setEmInstrucoes(false)}
                  onMouseEnter={() => setHoverBtnInicio(true)}
                  onMouseLeave={() => setHoverBtnInicio(false)}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    background: hoverBtnInicio
                      ? 'linear-gradient(180deg, #34A853 0%, #2e7d32 100%)'
                      : 'linear-gradient(180deg, #1a73e8 0%, #1557b0 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    fontSize: '13pt',
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

              {/* COLUNA DIREITA: Texto explicativo com contagem dinâmica */}
              <div style={{
                flex: 1,
                fontSize: '11.5pt',
                fontWeight: 'normal',
                lineHeight: '1.45',
                color: '#333'
              }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '12pt', color: '#1f2937' }}>
                  Este teste foi estruturado sobre um acervo com{' '}
                  <b>
                    {totalQuestoesBanco > 0 ? `${totalQuestoesBanco} questões cadastradas` : 'dezenas de questões dinâmicas'}
                  </b>
                  . A cada rodada, nosso algoritmo realiza um sorteio aleatório de situações cotidianas para mapear com clareza suas reais afinidades, estilo de resolução de problemas e tomada de decisão.
                </p>

                {/* Bloco de inclusão e representatividade */}
                <div style={{
                  backgroundColor: '#f0f7ff',
                  borderLeft: '4px solid #1a73e8',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <b style={{ color: '#1557b0', fontSize: '11pt' }}>👥 Representatividade e Inclusão:</b>
                  <p style={{ margin: '4px 0 0 0', fontSize: '10.5pt', color: '#2d3748' }}>
                    Todas as perguntas são <b>unissex, neutras e abertas</b> para ambos os sexos e para todas as faixas etárias. As ilustrações são <b>meramente ilustrativas</b> e focadas na valorização da diversidade e representatividade em todos os ambientes profissionais, sem qualquer indução de resposta correta.
                  </p>
                </div>

                {/* Bloco detalhando o que é entregue ao final */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  borderLeft: '4px solid #16a34a',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <b style={{ color: '#166534', fontSize: '11pt' }}>📊 O que você recebe no seu Relatório Final:</b>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '10.5pt', color: '#1f2937' }}>
                    <li><b>Pontuação por Eixos:</b> Nível de afinidade em <i>Biológicas</i>, <i>Exatas</i>, <i>Humanas</i> e <i>Tecnológicas</i> com <b>Gráfico de Radar Interativo</b>.</li>
                    <li><b>10 Carreiras Recomendadas:</b> Uma amostragem de profissões que se encaixam no seu perfil preponderante.</li>
                    <li><b>Conexão com a ETEC de Embu:</b> Mapeamento detalhado dos cursos técnicos gratuitos (Novotec/M-TEC e Modulares Noturnos) que potencializam sua formação na região.</li>
                    <li><b>Versão para Impressão e PDF:</b> Geração de um documento A4 diagramado para salvar no celular, computador ou imprimir.</li>
                  </ul>
                </div>

                {/* Incentivo de participação no vestibulinho */}
                <div style={{
                  backgroundColor: '#fef2f2',
                  borderLeft: '4px solid #ef4444',
                  padding: '9px 13px',
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}>
                  <b style={{ color: '#b91c1c', fontSize: '11pt' }}>🎓 Venha Estudar na ETEC de Embu das Artes!</b>
                  <span style={{ fontSize: '10pt', color: '#4b5563', display: 'block', marginTop: '3px' }}>
                    O ensino público e gratuito do Centro Paula Souza oferece alta empregabilidade e sólida preparação para o mercado de trabalho e para os maiores vestibulares. Não deixe de se inscrever no <b>Vestibulinho</b> e dar o salto inicial na sua carreira!
                  </span>
                </div>

                {/* Isenção ética de responsabilidade */}
                <div style={{
                  backgroundColor: '#fffdf0',
                  borderLeft: '4px solid #f59e0b',
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontSize: '9.5pt', color: '#78350f', display: 'block' }}>
                    ⚠️ <i><b>Aviso de Orientação Vocacional:</b> Como todo instrumento de autoavaliação, este teste não é 100% eficaz nem uma sentença definitiva. Ele deve ser utilizado exclusivamente como apoio e orientação reflexiva, tendo em vista que preferências e aptidões amadurecem e mudam ao longo da vida. As profissões indicadas são uma pequena amostragem de partida dentre as centenas de opções existentes em cada grande eixo.</i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : !finalizado ? (
          /* ====================================================================
              ETAPA 2: FLUXO DE PERGUNTAS (10 QUESTÕES)
          ==================================================================== */
          questao ? (
            <>
              {/* Contador de questão */}
              <p style={{ color: '#DDD', fontSize: '13pt', marginBottom: '10px' }}>
                Questão {indiceAtual + 1} de 10
              </p>
              
              {/* Enunciado da pergunta */}
              <h2 style={{ color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{questao.questao}</h2>

              {/* Contêiner com a ilustração e as alternativas */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
                
                {/* 
                  Renderização da imagem da questão:
                  - Se a questão tiver imagem cadastrada, monta o caminho da API.
                  - Caso não exista imagem cadastrada na questão ou ocorra erro de carregamento (404/indisponível),
                    utiliza diretamente a imagem local importada da pasta img/padrao.jpg
                */}
                <img
                  src={questao.imagem ? `http://localhost:3012/${questao.imagem}` : imgPadrao}
                  alt="Ilustração da questão"
                  onError={(e) => {
                    // Remove o manipulador para evitar loop caso a imagem padrão também encontre problemas
                    e.target.onerror = null;
                    // Substitui o endereço quebrado pelo caminho da imagem padrão local importada
                    e.target.src = imgPadrao;
                  }}
                  style={{
                    width: '400px',
                    height: '400px',
                    objectFit: 'cover',
                    border: '3px solid #FFF',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                    marginRight: '25px',
                    display: 'block'
                  }}
                />

                {/* Botões das alternativas embaralhadas */}
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', width: '100%' }}>
                  {opcoesEmbaralhadas.map(opcao => {
                    const isHovered = opcaoAtivaId === opcao.id;

                    return (
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
            <p>Carregando questão...</p>
          )
        ) : (
          /* ====================================================================
              ETAPA 3: RELATÓRIO VOCACIONAL FINAL E EXPORTAÇÃO EM PDF
          ==================================================================== */
          <div>
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
              {/* 1. Logotipo institucional */}
              <div style={{ width: '100%', marginBottom: '14px', textAlign: 'center' }}>
                <img
                  src={logoEtec}
                  alt="Logo Etec de Embu"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
                />
              </div>

              {/* 2. Cabeçalho com identificação do candidato */}
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

              {/* 3. Bloco superior: 40% Lista e 60% Radar */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: '20px', marginBottom: '20px' }}>
                <div style={{ width: '40%', flex: '0 0 40%', textAlign: 'left', boxSizing: 'border-box' }}>
                  {houveEmpate ? (
                    <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 'bold' }}>⚖️ Empate Técnico Identificado!</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', lineHeight: '1.35' }}>
                        Suas respostas atingiram a mesma pontuação nas áreas de <b>{areasEmpatadas.map(a => nomesAreas[a]).join(' e ')}</b>. Você tem vocação interdisciplinar e pode cursar qualquer uma das áreas!
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontWeight: 'bold', fontSize: '15px', margin: '0 0 8px 0', color: '#111' }}>
                      Carreiras recomendadas para o seu perfil:
                    </p>
                  )}

                  <ul style={{ marginLeft: '12px', paddingLeft: '12px', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    {profissoesRecomendadas.map((profissao, index) => (
                      <li key={index}>{profissao}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ width: '60%', flex: '0 0 60%', alignSelf: 'flex-start', display: 'flex', justifyContent: 'center', boxSizing: 'border-box' }}>
                  <GraficoRadar biologicas={biologicas} exatas={exatas} humanas={humanas} tecnologicas={tecnologicas} />
                </div>
              </div>

              {/* 4. Bloco inferior: Análise e comparação com os cursos da Etec */}
              <div style={{ width: '100%', textAlign: 'left', marginBottom: '18px', borderTop: '1px solid #e0e0e0', paddingTop: '14px' }}>
                <h4 style={{ color: '#202124', fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  Análise do Resultado e Guia de Cursos da Etec de Embu:
                </h4>
                <div
                  style={{ fontSize: '13px', fontWeight: 'normal', textAlign: 'justify', lineHeight: '1.5', color: '#333' }}
                  dangerouslySetInnerHTML={{ __html: textoFinal }}
                />
              </div>

              {/* 5. Rodapé: Inscrição, botões de ação e QR Code */}
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
                <div style={{ flex: 1, paddingRight: '20px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#EA4335', fontSize: '16px', fontWeight: 'bold' }}>
                    Se inscreva no Vestibulinho da ETEC de Embu!
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#444', lineHeight: '1.3' }}>
                    Acesse o portal oficial para conferir os períodos de inscrição, cursos do Novotec e vagas abertas:
                  </p>
                  
                  <div className="no-print-pdf">
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