// Importa o React para criação e renderização do componente
import React from 'react';
// Importa o componente visual Radar da biblioteca react-chartjs-2
import { Radar } from 'react-chartjs-2';
// Importa os módulos e plugins essenciais do Chart.js necessários para a teia/radar
import {
    Chart,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';

// Registra formalmente as escalas e elementos gráficos no núcleo do Chart.js
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Paleta de cores oficiais inspirada na identidade visual do Google para cada uma das 4 áreas
const CORES_GOOGLE = {
    // Biológicas: Verde com preenchimento translúcido
    biologicas:   { base: '#34A853', fill: 'rgba(52, 168, 83, 0.35)' },
    // Exatas: Azul institucional com preenchimento translúcido
    exatas:       { base: '#4285F4', fill: 'rgba(66, 133, 244, 0.35)' },
    // Humanas: Amarelo com preenchimento translúcido
    humanas:      { base: '#FBBC05', fill: 'rgba(251, 188, 5, 0.35)' },
    // Tecnológicas: Vermelho com preenchimento translúcido
    tecnologicas: { base: '#EA4335', fill: 'rgba(234, 67, 53, 0.35)' }
};

// Declaração do componente funcional GraficoRadar recebendo as pontuações apuradas
const GraficoRadar = ({ biologicas, exatas, humanas, tecnologicas }) => {
    // Estrutura de dados consumida pelo componente Chart.js
    const data = {
        // Rótulos externos dos 4 vértices do radar
        labels: ['Biológicas', 'Exatas', 'Humanas', 'Tecnológicas'],
        // Conjunto de dados contendo os valores e customizações visuais
        datasets: [
            {
                // Identificador do conjunto de dados
                label: 'Pontuação alcançada',
                // Vetor com as notas de 0 a 100 de cada área na ordem dos rótulos
                data: [biologicas, exatas, humanas, tecnologicas],
                // Função dinâmica que cria um gradiente cônico ligando suavemente cada quadrante à sua cor correspondente
                backgroundColor: (context) => {
                    // Obtém a instância gráfica do Chart.js
                    const chart = context.chart;
                    // Extrai o contexto 2D do Canvas e a área geométrica delimitada
                    const { ctx, chartArea } = chart;
                    // Retorna nulo se o canvas ainda não foi calculado na montagem
                    if (!chartArea) return null;

                    // Calcula a coordenada X do centro exato do alvo
                    const centerX = (chartArea.left + chartArea.right) / 2;
                    // Calcula a coordenada Y do centro exato do alvo
                    const centerY = (chartArea.top + chartArea.bottom) / 2;

                    // Cria o gradiente cônico partindo do topo (-90 graus ou -PI/2 radianos)
                    const conicGrad = ctx.createConicGradient(-Math.PI / 2, centerX, centerY);
                    // Aplica o tom verde para Biológicas (quadrante superior)
                    conicGrad.addColorStop(0 / 4, CORES_GOOGLE.biologicas.fill);
                    // Aplica o tom azul para Exatas (quadrante direito)
                    conicGrad.addColorStop(1 / 4, CORES_GOOGLE.exatas.fill);
                    // Aplica o tom amarelo para Humanas (quadrante inferior)
                    conicGrad.addColorStop(2 / 4, CORES_GOOGLE.humanas.fill);
                    // Aplica o tom vermelho para Tecnológicas (quadrante esquerdo)
                    conicGrad.addColorStop(3 / 4, CORES_GOOGLE.tecnologicas.fill);
                    // Fecha o ciclo no topo retornando ao verde
                    conicGrad.addColorStop(1, CORES_GOOGLE.biologicas.fill);

                    // Retorna o gradiente pronto para pintura
                    return conicGrad;
                },
                // Cor da borda perimetral que envolve os pontos apurados
                borderColor: '#1a73e8',
                // Espessura do traço perimetral
                borderWidth: 2.2,
                // Cores individuais de cada ponto vértice correspondente à sua área
                pointBackgroundColor: [
                    CORES_GOOGLE.biologicas.base,
                    CORES_GOOGLE.exatas.base,
                    CORES_GOOGLE.humanas.base,
                    CORES_GOOGLE.tecnologicas.base
                ],
                // Borda branca nos pontos para criar efeito de relevo e separação do fundo
                pointBorderColor: '#ffffff',
                // Espessura da borda branca dos pontos
                pointBorderWidth: 2,
                // Raio do ponto no estado normal
                pointRadius: 6,
                // Raio do ponto quando o mouse passa por cima (hover)
                pointHoverRadius: 8,
                // Fundo do ponto quando sobreposto pelo cursor
                pointHoverBackgroundColor: '#ffffff',
                // Espessura da borda no hover
                pointHoverBorderWidth: 3,
                // Suavização da curvatura da linha entre os pontos
                tension: 0.12
            }
        ]
    };

    // Opções de configuração dos eixos, escalas e layout
    const options = {
        // Habilita dimensionamento automático responsivo
        responsive: true,
        // Libera a altura e largura para preencher o contêiner pai
        maintainAspectRatio: false,
        // Espaçamento interno garantindo margem para os textos e ícones não vazarem
        layout: {
            padding: {
                top: 48,
                bottom: 35,
                left: 45,
                right: 45
            }
        },
        // Configuração de plugins visuais
        plugins: {
            // Oculta a legenda padrão superior para um layout limpo
            legend: { display: false },
            // Estilização do balão de informação flutuante (tooltip)
            tooltip: {
                // Fundo escuro azulado com alta opacidade
                backgroundColor: 'rgba(20, 40, 70, 0.92)',
                // Tamanho e peso da fonte do título do tooltip
                titleFont: { size: 14, weight: 'bold' },
                // Tamanho da fonte do corpo do tooltip
                bodyFont: { size: 13 },
                // Espaçamento interno do balão
                padding: 10,
                // Cantos arredondados do balão
                cornerRadius: 8,
                // Formatação personalizada da informação numérica
                callbacks: {
                    label: (context) => ` ${context.raw} pontos / 100`
                }
            }
        },
        // Definições de escala da teia radial
        scales: {
            r: {
                // Pontuação mínima do eixo
                min: 0,
                // Pontuação máxima do eixo
                max: 100,
                // Linhas radiais (eixos em cruz)
                angleLines: {
                    display: true,
                    // Cor azul suave para não poluir
                    color: 'rgba(26, 115, 232, 0.32)',
                    // Espessura da linha divisória dos quadrantes
                    lineWidth: 1.5
                },
                // Configuração das linhas de grade que formam os níveis de deslocamento
                grid: {
                    // Mantém círculos concêntricos perfeitos simulando um alvo de precisão
                    circular: true,
                    // Cor azul suave das circunferências
                    color: 'rgba(26, 115, 232, 0.20)',
                    // Espessura dos anéis do alvo
                    lineWidth: 1.2
                },
                // Configuração dos números de marcação da escala (0 a 100)
                ticks: {
                    // Passo de 20 em 20 pontos
                    stepSize: 20,
                    // Fundo transparente atrás dos números
                    backdropColor: 'transparent',
                    // Cor azul médio para os números da escala
                    color: '#1a56a6',
                    // Fonte em negrito para facilitar leitura rápida
                    font: { size: 11, weight: '600' }
                },
                // Rótulos com os nomes das áreas vocacionais nos extremos
                pointLabels: {
                    // Atribui a cor temática do Google para o texto de cada área
                    color: [
                        CORES_GOOGLE.biologicas.base,
                        CORES_GOOGLE.exatas.base,
                        CORES_GOOGLE.humanas.base,
                        CORES_GOOGLE.tecnologicas.base
                    ],
                    // Tipografia dos rótulos externos
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Segoe UI', Roboto, sans-serif"
                    },
                    // Distância entre o final da teia e o texto
                    padding: 12
                }
            }
        }
    };

    // Estrutura JSX com o radar e a camada sobreposta contendo os ícones SVG
    return (
        // Caixa do card com alinhamento ao topo, sombra leve e cantos arredondados
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
            {/* Título visual do gráfico de radar */}
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

            {/* Contêiner de posicionamento relativo que abriga o Canvas e a camada absoluta dos SVGs */}
            <div style={{ position: 'relative', width: '100%', height: '380px' }}>
                
                {/* Instância do Gráfico Radar em Canvas */}
                <Radar data={data} options={options} />

                {/* CAMADA SUPERIOR EM Z-INDEX 10: Ícones SVG com tamanho duplo (44px) */}
                <div
                    style={{
                        position: 'absolute',
                        top: 15,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none', // Garante que tooltips e interações do gráfico continuem responsivos
                        zIndex: 10
                    }}
                >
                    {/* 1. BIOLÓGICAS (Topo - Acima do texto "Biológicas" em verde) */}
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
                        {/* Ícone SVG de Folha / Vida Biológica (44x44) */}
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.biologicas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                        </svg>
                    </div>

                    {/* 2. EXATAS (Direita - Acima do texto "Exatas" em azul: Ícone de Calculadora) */}
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
                        {/* Ícone SVG de Calculadora (44x44) */}
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.exatas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            {/* Corpo externo da calculadora */}
                            <rect x="4" y="2" width="16" height="20" rx="3" />
                            {/* Visor digital */}
                            <line x1="8" y1="6" x2="16" y2="6" />
                            {/* Teclas numéricas e operadores */}
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

                    {/* 3. HUMANAS (Base - Imediatamente ao lado esquerdo do texto "Humanas" em amarelo) */}
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
                        {/* Ícone SVG de Pessoas e Comunidade (44x44) */}
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.humanas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>

                    {/* 4. TECNOLÓGICAS (Esquerda - Acima do texto "Tecnológicas" em vermelho) */}
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
                        {/* Ícone SVG de Processador / Microchip (44x44) */}
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

// Exporta o componente GraficoRadar como padrão do arquivo
export default GraficoRadar;