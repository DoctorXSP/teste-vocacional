// ============================================================================
// IMPORTAÇÕES DE MÓDULOS E PLUGINS DO CHART.JS E REACT
// ============================================================================

// Importa a biblioteca base do React para construção do componente funcional
import React from 'react';

// Importa o componente visual de Radar provido pelo wrapper react-chartjs-2
import { Radar } from 'react-chartjs-2';

// Importa os elementos e módulos matemáticos essenciais do Chart.js para gráficos de teia radial
import {
    Chart,              // Instância central de configuração do Chart.js
    RadialLinearScale,  // Escala linear radial responsável pelos eixos em teia circular
    PointElement,       // Renderizador dos marcadores/pontos nos vértices
    LineElement,        // Renderizador das linhas que interligam os pontos
    Filler,             // Módulo responsável por pintar a área fechada interna do polígono
    Tooltip,            // Caixa de diálogo flutuante ao passar o cursor sobre as notas
    Legend              // Módulo gerador de legendas descritivas
} from 'chart.js';

// ============================================================================
// REGISTRO DE PLUGINS E ESCALAS
// ============================================================================

// Registra todos os módulos utilitários diretamente no núcleo do Chart.js
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ============================================================================
// PALETA DE CORES TEMÁTICA
// ============================================================================

// Dicionário com as cores base e de preenchimento (com canal alpha de transparência) para cada eixo
const CORES_GOOGLE = {
    // Biológicas: Tom verde oficial com preenchimento em 35% de opacidade
    biologicas:   { base: '#34A853', fill: 'rgba(52, 168, 83, 0.35)' },
    // Exatas: Tom azul institucional com preenchimento em 35% de opacidade
    exatas:       { base: '#4285F4', fill: 'rgba(66, 133, 244, 0.35)' },
    // Humanas: Tom amarelo com preenchimento em 35% de opacidade
    humanas:      { base: '#FBBC05', fill: 'rgba(251, 188, 5, 0.35)' },
    // Tecnológicas: Tom vermelho com preenchimento em 35% de opacidade
    tecnologicas: { base: '#EA4335', fill: 'rgba(234, 67, 53, 0.35)' }
};

// ============================================================================
// COMPONENTE PRINCIPAL: GRAFICORADAR
// ============================================================================

// Declaração do componente funcional que recebe as quatro pontuações vocacionais como propriedades
const GraficoRadar = ({ biologicas, exatas, humanas, tecnologicas }) => {
    // ------------------------------------------------------------------------
    // CONSTRUÇÃO E ESTRUTURAÇÃO DO DATASET
    // ------------------------------------------------------------------------

    // Estrutura de dados consumida pelo motor de renderização do Chart.js
    const data = {
        // Nomes formais dos 4 eixos radiais posicionados ao redor do alvo
        labels: ['Biológicas', 'Exatas', 'Humanas', 'Tecnológicas'],
        // Coleção de conjuntos de dados plotados na teia
        datasets: [
            {
                // Rótulo de identificação do conjunto de pontos
                label: 'Pontuação alcançada',
                // Vetor numérico contendo as notas apuradas em cada área avaliada
                data: [biologicas, exatas, humanas, tecnologicas],
                // Função de callback dinâmica para gerar o preenchimento em gradiente cônico
                backgroundColor: (context) => {
                    // Extrai o objeto gráfico do contexto da chamada
                    const chart = context.chart;
                    // Desestrutura o contexto 2D do elemento Canvas e suas dimensões calculadas
                    const { ctx, chartArea } = chart;
                    // Se o layout do gráfico ainda não terminou de calcular o canvas, retorna nulo
                    if (!chartArea) return null;

                    // Calcula o ponto de ancoragem horizontal central do alvo
                    const centerX = (chartArea.left + chartArea.right) / 2;
                    // Calcula o ponto de ancoragem vertical central do alvo
                    const centerY = (chartArea.top + chartArea.bottom) / 2;

                    // Inicializa o gradiente cônico com rotação iniciando no topo (-90 graus ou -PI/2)
                    const conicGrad = ctx.createConicGradient(-Math.PI / 2, centerX, centerY);
                    // Ponto 0/4 (0 graus - topo): Aplica a cor translúcida de Biológicas
                    conicGrad.addColorStop(0 / 4, CORES_GOOGLE.biologicas.fill);
                    // Ponto 1/4 (90 graus - direita): Aplica a cor translúcida de Exatas
                    conicGrad.addColorStop(1 / 4, CORES_GOOGLE.exatas.fill);
                    // Ponto 2/4 (180 graus - base): Aplica a cor translúcida de Humanas
                    conicGrad.addColorStop(2 / 4, CORES_GOOGLE.humanas.fill);
                    // Ponto 3/4 (270 graus - esquerda): Aplica a cor translúcida de Tecnológicas
                    conicGrad.addColorStop(3 / 4, CORES_GOOGLE.tecnologicas.fill);
                    // Ponto 1 (360 graus - topo): Fecha o ciclo angular retornando ao verde de Biológicas
                    conicGrad.addColorStop(1, CORES_GOOGLE.biologicas.fill);

                    // Retorna o gradiente pronto para compor o preenchimento do polígono
                    return conicGrad;
                },
                // Cor da linha de borda perimetral que interliga os pontos
                borderColor: '#1a73e8',
                // Espessura do traço perimetral em pixels
                borderWidth: 2.2,
                // Vetor definindo a cor de preenchimento de cada vértice conforme sua respectiva área
                pointBackgroundColor: [
                    CORES_GOOGLE.biologicas.base,
                    CORES_GOOGLE.exatas.base,
                    CORES_GOOGLE.humanas.base,
                    CORES_GOOGLE.tecnologicas.base
                ],
                // Cor da borda externa dos pontos (branca para criar separação visual)
                pointBorderColor: '#ffffff',
                // Espessura da borda dos marcadores em pixels
                pointBorderWidth: 2,
                // Raio do marcador no estado estático
                pointRadius: 6,
                // Raio do marcador ampliado quando o cursor passa por cima (hover)
                pointHoverRadius: 8,
                // Cor de fundo do marcador durante a interação de foco
                pointHoverBackgroundColor: '#ffffff',
                // Espessura da borda externa do ponto durante a sobreposição do cursor
                pointHoverBorderWidth: 3,
                // Tensão da curva spline que interliga os vértices (0.12 para curvatura sutil)
                tension: 0.12
            }
        ]
    };

    // ------------------------------------------------------------------------
    // OPÇÕES DE CONFIGURAÇÃO DO CHART.JS
    // ------------------------------------------------------------------------

    // Configuração de escalas, plugins, responsividade e layout interno
    const options = {
        // Redimensiona o gráfico automaticamente ao alterar a largura do dispositivo
        responsive: true,
        // Permite que o gráfico preencha a altura estipulada pelo elemento pai
        maintainAspectRatio: false,
        // Margens internas de respiro para que textos e ícones não sofram cortes
        layout: {
            padding: {
                top: 48,    // Espaçamento superior
                bottom: 35, // Espaçamento inferior
                left: 45,   // Espaçamento à esquerda
                right: 45   // Espaçamento à direita
            }
        },
        // Configuração dos plugins integrados
        plugins: {
            // Desativa a legenda convencional para manter o layout limpo
            legend: { display: false },
            // Customização da caixa de dica de contexto (tooltip)
            tooltip: {
                // Define tom escuro azulado translúcido para a caixa de aviso
                backgroundColor: 'rgba(20, 40, 70, 0.92)',
                // Configuração tipográfica do título do balão flutuante
                titleFont: { size: 14, weight: 'bold' },
                // Configuração tipográfica do texto descritivo
                bodyFont: { size: 13 },
                // Espaçamento interno da caixa flutuante em pixels
                padding: 10,
                // Arredondamento dos cantos do balão de informação
                cornerRadius: 8,
                // Formatação textual customizada exibida no corpo do tooltip
                callbacks: {
                    label: (context) => ` ${context.raw} pontos / 100`
                }
            }
        },
        // Definições detalhadas da escala radial ('r')
        scales: {
            r: {
                // Pontuação mínima exibida na escala
                min: 0,
                // Pontuação limite máxima admitida no eixo
                max: 100,
                // Linhas perpendiculares que partem do centro em cruz
                angleLines: {
                    display: true,                          // Habilita a visualização das retas angulares
                    color: 'rgba(26, 115, 232, 0.32)',      // Tonalidade azul suave das retas
                    lineWidth: 1.5                          // Espessura do traçado em pixels
                },
                // Linhas circulares concêntricas que delimitam os níveis da escala
                grid: {
                    circular: true,                         // Desenha anéis circulares concêntricos perfeitos
                    color: 'rgba(26, 115, 232, 0.20)',      // Cor azul translúcida dos anéis
                    lineWidth: 1.2                          // Espessura dos círculos em pixels
                },
                // Numerações de marcação ao longo dos eixos
                ticks: {
                    stepSize: 20,                           // Intervalo de progressão de 20 em 20 pontos
                    backdropColor: 'transparent',            // Torna o fundo do texto dos números transparente
                    color: '#1a56a6',                       // Cor da tipografia dos números da escala
                    font: { size: 11, weight: '600' }       // Estilo e espessura da fonte dos marcadores numéricos
                },
                // Textos descritivos das áreas situados nas extremidades externas
                pointLabels: {
                    // Mapeia as cores temáticas para cada um dos textos externos
                    color: [
                        CORES_GOOGLE.biologicas.base,
                        CORES_GOOGLE.exatas.base,
                        CORES_GOOGLE.humanas.base,
                        CORES_GOOGLE.tecnologicas.base
                    ],
                    // Tipografia aplicada aos rótulos dos eixos
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Segoe UI', Roboto, sans-serif"
                    },
                    // Afastamento em pixels entre a última circunferência e o texto
                    padding: 12
                }
            }
        }
    };

    // ------------------------------------------------------------------------
    // RENDERIZAÇÃO DO COMPONENTE VISUAL (JSX)
    // ------------------------------------------------------------------------

    return (
        // Contêiner em formato de cartão com cantos arredondados e sombra sutil
        <div
            style={{
                width: '100%',
                maxWidth: '460px',
                margin: '0',
                alignSelf: 'flex-start',
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                boxSizing: 'border-box',
                position: 'relative'
            }}
        >
            {/* Cabeçalho textual do card de visualização gráfica */}
            <h3
                style={{
                    textAlign: 'center',
                    color: '#202124',
                    fontSize: '16px',
                    fontWeight: '700',
                    margin: '0 0 4px 0',
                    letterSpacing: '-0.3px'
                }}
            >
                Radar de Aptidões Vocacionais
            </h3>

            {/* Contêiner de posicionamento relativo que abriga o Canvas e a camada absoluta de ícones */}
            <div style={{ position: 'relative', width: '100%', height: '380px' }}>
                
                {/* Elemento Canvas gerenciado pelo Chart.js para o gráfico de teia com prioridade de sobreposição */}
                <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10 }}>
                    <Radar data={data} options={options} />
                </div>

                {/* Camada sobreposta transparente com os ícones vetoriais de cada área */}
                <div
                    style={{
                        position: 'absolute',
                        top: 15,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none', // Permite que os eventos do mouse passem direto para o canvas
                        zIndex: 1               // Nível de camada posicionado abaixo das janelas flutuantes do canvas
                    }}
                >
                    {/* 1. Ícone da vertente de Biológicas (Posicionado no topo central) */}
                    <div
                        title="Biológicas"
                        style={{
                            position: 'absolute',
                            top: '19px',
                            left: 'calc(50% + 20px)',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {/* Vetor SVG estilizado representando folha / vida orgânica (44x44) */}
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.biologicas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                        </svg>
                    </div>

                    {/* 2. Ícone da vertente de Exatas (Posicionado na lateral direita) */}
                    <div
                        title="Exatas"
                        style={{
                            position: 'absolute',
                            top: '44%',
                            right: '55px',
                            transform: 'translateY(-100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {/* Vetor SVG estilizado de uma calculadora digital (44x44) */}
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.exatas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            {/* Moldura externa do corpo da calculadora */}
                            <rect x="4" y="2" width="16" height="20" rx="3" />
                            {/* Visor digital superior */}
                            <line x1="8" y1="6" x2="16" y2="6" />
                            {/* Teclado e teclas numéricas */}
                            <line x1="16" y1="14" x2="16" y2="18" />
                            <path d="M16 10h.01" />
                            <path d="M12 10h.01" />
                            <path d="M8 10h.01" />
                            <path d="M12 14h.01" />
                            <path d="M8 14h.01" />
                            <path d="M12 18h.01" />
                            <path d="M8 18h.01" />
                        </svg>
                    </div>

                    {/* 3. Ícone da vertente de Humanas (Posicionado na base inferior) */}
                    <div
                        title="Humanas"
                        style={{
                            position: 'absolute',
                            bottom: '45px',
                            left: 'calc(50% - 5px)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {/* Vetor SVG representando grupo social / pessoas (44x44) */}
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.humanas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>

                    {/* 4. Ícone da vertente de Tecnológicas (Posicionado na lateral esquerda) */}
                    <div
                        title="Tecnológicas"
                        style={{
                            position: 'absolute',
                            top: '44%',
                            left: '75px',
                            transform: 'translateY(-100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {/* Vetor SVG representando microprocessador / circuito integrado (44x44) */}
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.tecnologicas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                    </div>

                </div>
            </div>
        </div>
    );
};

// ============================================================================
// EXPORTAÇÃO DO COMPONENTE
// ============================================================================

// Exporta o componente GraficoRadar como padrão para ser integrado no relatório vocacional
export default GraficoRadar;