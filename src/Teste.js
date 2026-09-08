// Importa os hooks essenciais do React para estado, ciclo de vida e manipulação de referências do DOM
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Importa a folha de estilos CSS personalizada da aplicação
import './index.css';
// Importa a biblioteca Axios para comunicação com o backend Node.js
import axios from 'axios';
// Importa o componente visual do radar de competências em formato de alvo
import GraficoRadar from './GraficoRadar';

// Importa a imagem institucional que se encontra em src/img/Logo.png
import logoEtec from './img/Logo.png';

// Importa o gerador de QR Code em formato vetorial SVG de alta definição
import { QRCodeSVG } from 'qrcode.react';
// Importa o html2canvas para rasterizar o elemento HTML da tela em um Canvas
import html2canvas from 'html2canvas';
// Importa o jsPDF para encapsular o relatório no formato padronizado de folha A4
import jsPDF from 'jspdf';

// Dicionário com as 10 profissões sugeridas para cada vertente avaliada
const listaProfissoes = {
  biologicas: ["Bioquímico", "Biólogo", "Dentista", "Enfermeiro", "Farmacêutico", "Fisioterapeuta", "Médico", "Nutricionista", "Pesquisador", "Veterinário"],
  exatas: ["Analista de Sistemas", "Arquiteto", "Automação Industrial", "Cientista de Dados", "Desenvolvedor de Software", "Economista", "Eletroeletrônica", "Engenheiro", "Físico", "Matemático"],
  humanas: ["Administrador", "Advogado", "Comércio Exterior", "Escritor", "Gestor de Recursos Humanos", "Jornalista", "Logística", "Professor", "Psicólogo", "Sociólogo"],
  tecnologicas: ["Analista de Sistemas", "Arquiteto de Tecnologia", "Automação Industrial", "Cyber Security", "Desenvolvedor Web", "Desenvolvimento de Sistemas", "Eletroeletrônica", "Especialista em Cloud", "Informática", "Redes de Computadores"]
};

// Mapeamento dos identificadores internos para os nomes formais exibidos na interface
const nomesAreas = {
  biologicas: 'Biológicas',
  exatas: 'Exatas',
  humanas: 'Humanas',
  tecnologicas: 'Tecnológicas'
};

// Textos institucionais e educacionais contendo cursos que a Etec TEM e cursos que a Etec NÃO TEM
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

// Algoritmo Fisher-Yates para embaralhamento sem viés
function embaralharArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Declaração do componente funcional Teste
function Teste({ usuario }) {
  const [sessaoQuestoes, setSessaoQuestoes] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [questao, setQuestao] = useState(null);
  const [opcoesEmbaralhadas, setOpcoesEmbaralhadas] = useState([]);

  // Estado para controlar o botão que está com hover ou ativo (para o efeito de relevo dinâmico)
  const [opcaoAtivaId, setOpcaoAtivaId] = useState(null);

  const [biologicas, setBiologicas] = useState(0);
  const [exatas, setExatas] = useState(0);
  const [humanas, setHumanas] = useState(0);
  const [tecnologicas, setTecnologicas] = useState(0);

  const [finalizado, setFinalizado] = useState(false);
  const [houveEmpate, setHouveEmpate] = useState(false);
  const [areasEmpatadas, setAreasEmpatadas] = useState([]);
  const [profissoesRecomendadas, setProfissoesRecomendadas] = useState([]);
  const [textoFinal, setTextoFinal] = useState("");
  const [gerandoPDF, setGerandoPDF] = useState(false);

  const relatorioRef = useRef(null);

  // Carrega as questões do banco e monta a fila única de 10 perguntas
  useEffect(() => {
    const carregarTodasAsQuestoes = async () => {
      try {
        console.log("Baixando acervo completo de questões...");
        const response = await axios.get("http://localhost:3012/todasQuestoes");
        const todas = response.data;

        if (Array.isArray(todas) && todas.length > 0) {
          let embaralhadas = embaralharArray(todas);
          let listaFinal10 = [];

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

  // Prepara a questão atual e embaralha as opções
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

  // Registra a pontuação e avança
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

  // Apura os resultados vocacionais, resolve empates e salva no banco de dados
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

  useEffect(() => {
    if (finalizado) {
      determinarProfissoes();
    }
  }, [finalizado, determinarProfissoes]);

  // Função assíncrona para gerar o PDF multipáginas com paginação contínua e quebra de A4
  const gerarPDF = async () => {
    if (!relatorioRef.current) return;
    setGerandoPDF(true);

    try {
      const elemento = relatorioRef.current;

      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        // Oculta os botões interativos para não aparecerem no documento impresso
        ignoreElements: (el) => el.classList.contains('no-print-pdf')
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const paginaLargura = pdf.internal.pageSize.getWidth();   // 210 mm
      const paginaAltura = pdf.internal.pageSize.getHeight();    // 297 mm

      // Calcula a altura da imagem proporcional à largura da página A4
      const imagemAltura = (canvas.height * paginaLargura) / canvas.width;
      let alturaRestante = imagemAltura;
      let posicaoY = 0;

      // Adiciona a primeira página
      pdf.addImage(imgData, 'PNG', 0, posicaoY, paginaLargura, imagemAltura);
      alturaRestante -= paginaAltura;

      // Adiciona páginas complementares enquanto houver conteúdo além da primeira folha
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

  return (
    <div className='corpoP'>
      <div className='barraSuperior'>
        <h1 className='barraTexto'>Teste de Aptidão Vocacional</h1>
      </div>

      <section style={{ width: '95%', margin: 'auto', marginTop: '25px', textAlign: 'center', fontSize: '16pt', fontWeight: 'bold' }}>
        {!finalizado ? (
          questao ? (
            <>
              <p style={{ color: '#DDD', fontSize: '13pt', marginBottom: '10px' }}>
                Questão {indiceAtual + 1} de 10
              </p>
              
              <h2 style={{ color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{questao.questao}</h2>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
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
          <div>
            {/* CONTÊINER DO RELATÓRIO A4 (800px) */}
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
              {/* 1. LOGO DA ETEC: 100% da largura útil no topo */}
              <div style={{ width: '100%', marginBottom: '14px', textAlign: 'center' }}>
                <img
                  src={logoEtec}
                  alt="Logo Etec de Embu"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
                />
              </div>

              {/* 2. CABEÇALHO DO RELATÓRIO */}
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

              {/* 3. BLOCO SUPERIOR: 40% Profissões e 60% Gráfico de Radar alinhados ao topo */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: '20px', marginBottom: '20px' }}>
                
                {/* Lado Esquerdo: 40% da largura para as profissões e empate */}
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

                {/* Lado Direito: 60% da largura para o Gráfico de Radar alinhado ao topo */}
                <div style={{ width: '60%', flex: '0 0 60%', alignSelf: 'flex-start', display: 'flex', justifyContent: 'center', boxSizing: 'border-box' }}>
                  <GraficoRadar biologicas={biologicas} exatas={exatas} humanas={humanas} tecnologicas={tecnologicas} />
                </div>
              </div>

              {/* 4. BLOCO INFERIOR: Resultado Detalhado + Cursos que TEM e NÃO TEM na Etec (100% da largura útil) */}
              <div style={{ width: '100%', textAlign: 'left', marginBottom: '18px', borderTop: '1px solid #e0e0e0', paddingTop: '14px' }}>
                <h4 style={{ color: '#202124', fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  Análise do Resultado e Guia de Cursos da Etec de Embu:
                </h4>
                <div
                  style={{ fontSize: '13px', fontWeight: 'normal', textAlign: 'justify', lineHeight: '1.5', color: '#333' }}
                  dangerouslySetInnerHTML={{ __html: textoFinal }}
                />
              </div>

              {/* 5. RODAPÉ DO RELATÓRIO: Inscrição, Botão de PDF e QR Code em tamanho 200px */}
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
                {/* Lado Esquerdo: Chamada institucional + Botão Inscrever + Botão PDF abaixo */}
                <div style={{ flex: 1, paddingRight: '20px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#EA4335', fontSize: '16px', fontWeight: 'bold' }}>
                    Se inscreva no Vestibulinho da ETEC de Embu!
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#444', lineHeight: '1.3' }}>
                    Acesse o portal oficial para conferir os períodos de inscrição, cursos do Novotec e vagas abertas:
                  </p>
                  
                  {/* Bloco de botões marcado com a classe .no-print-pdf (ignorado na exportação) */}
                  <div className="no-print-pdf">
                    {/* Botão de Inscrição */}
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

                    {/* Botão de Salvar PDF abaixo do botão de inscrição */}
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

                {/* Lado Direito: QR Code dobrado (200px) com a legenda solicitada */}
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

// Exporta o componente Teste como exportação padrão
export default Teste;