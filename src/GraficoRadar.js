// ============================================================================
// IMPORTAÇÕES DE MÓDULOS E PLUGINS DO CHART.JS E REACT
// ============================================================================

// Importa a biblioteca base do React[cite: 7]
import React from 'react';
// Importa o componente Radar encapsulado para React da react-chartjs-2[cite: 7]
import { Radar } from 'react-chartjs-2';
// Importa os elementos estruturais essenciais da biblioteca Chart.js[cite: 7]
import {
    Chart,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';

// ============================================================================
// REGISTRO DE PLUGINS E ESCALAS
// ============================================================================

// Registra os módulos importados no ciclo de renderização global do Chart.js[cite: 7]
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ============================================================================
// PALETA DE CORES TEMÁTICA
// ============================================================================

// Define as cores sólidas e de preenchimento translúcido para cada perfil vocacional[cite: 7]
const CORES_GOOGLE = {
    // Tom verde representativo da área de Ciências Biológicas[cite: 7]
    biologicas:   { base: '#34A853', fill: 'rgba(52, 168, 83, 0.35)' },
    // Tom azul representativo da área de Ciências Exatas[cite: 7]
    exatas:       { base: '#4285F4', fill: 'rgba(66, 133, 244, 0.35)' },
    // Tom amarelo representativo da área de Ciências Humanas[cite: 7]
    humanas:      { base: '#FBBC05', fill: 'rgba(251, 188, 5, 0.35)' },
    // Tom vermelho representativo da área de Ciências Tecnológicas[cite: 7]
    tecnologicas: { base: '#EA4335', fill: 'rgba(234, 67, 53, 0.35)' }
};

// ============================================================================
// COMPONENTE PRINCIPAL: GRAFICORADAR
// ============================================================================

// Declara o componente funcional recebendo as quatro pontuações vocacionais como propriedades[cite: 7]
const GraficoRadar = ({ biologicas, exatas, humanas, tecnologicas }) => {
    // Objeto contendo os dados e parâmetros de estilo a serem desenhados no canvas[cite: 7]
    const data = {
        // Nomes de cada vértice da teia radar[cite: 7]
        labels: ['Biológicas', 'Exatas', 'Humanas', 'Tecnológicas'],
        // Definição do conjunto de dados da série gráfica[cite: 7]
        datasets: [
            {
                // Rótulo descritivo do conjunto de pontos[cite: 7]
                label: 'Pontuação alcançada',
                // Vetor com os valores numéricos recebidos via props[cite: 7]
                data: [biologicas, exatas, humanas, tecnologicas],
                // Função de retorno de cor dinâmica que desenha um gradiente cônico[cite: 7]
                backgroundColor: (context) => {
                    // Obtém a instância do objeto chart[cite: 7]
                    const chart = context.chart;
                    // Desestrutura o contexto 2D e as coordenadas da área do gráfico[cite: 7]
                    const { ctx, chartArea } = chart;
                    // Retorna nulo caso a área gráfica ainda não esteja calculada[cite: 7]
                    if (!chartArea) return null;

                    // Calcula a coordenada horizontal do centro da área útil[cite: 7]
                    const centerX = (chartArea.left + chartArea.right) / 2;
                    // Calcula a coordenada vertical do centro da área útil[cite: 7]
                    const centerY = (chartArea.top + chartArea.bottom) / 2;

                    // Cria gradiente cônico rotacionado para iniciar no topo (-90 graus)[cite: 7]
                    const conicGrad = ctx.createConicGradient(-Math.PI / 2, centerX, centerY);
                    // Adiciona parada de cor para Biológicas (0% do círculo)[cite: 7]
                    conicGrad.addColorStop(0 / 4, CORES_GOOGLE.biologicas.fill);
                    // Adiciona parada de cor para Exatas (25% do círculo)[cite: 7]
                    conicGrad.addColorStop(1 / 4, CORES_GOOGLE.exatas.fill);
                    // Adiciona parada de cor para Humanas (50% do círculo)[cite: 7]
                    conicGrad.addColorStop(2 / 4, CORES_GOOGLE.humanas.fill);
                    // Adiciona parada de cor para Tecnológicas (75% do círculo)[cite: 7]
                    conicGrad.addColorStop(3 / 4, CORES_GOOGLE.tecnologicas.fill);
                    // Fecha o ciclo do gradiente voltando à cor de Biológicas (100% do círculo)[cite: 7]
                    conicGrad.addColorStop(1, CORES_GOOGLE.biologicas.fill);

                    // Retorna o gradiente configurado[cite: 7]
                    return conicGrad;
                },
                // Cor da linha de contorno do polígono[cite: 7]
                borderColor: '#1a73e8',
                // Espessura do traçado da borda[cite: 7]
                borderWidth: 2.2,
                // Cores dos pontos baseadas em cada categoria temática[cite: 7]
                pointBackgroundColor: [
                    CORES_GOOGLE.biologicas.base,
                    CORES_GOOGLE.exatas.base,
                    CORES_GOOGLE.humanas.base,
                    CORES_GOOGLE.tecnologicas.base
                ],
                // Borda externa dos pontos em branco para contraste[cite: 7]
                pointBorderColor: '#ffffff',
                // Largura do contorno de cada ponto[cite: 7]
                pointBorderWidth: 2,
                // Raio inicial de exibição dos pontos[cite: 7]
                pointRadius: 5,
                // Raio do ponto ampliado ao passar o mouse por cima[cite: 7]
                pointHoverRadius: 7,
                // Cor de fundo do ponto ao passar o mouse[cite: 7]
                pointHoverBackgroundColor: '#ffffff',
                // Espessura da borda do ponto no evento hover[cite: 7]
                pointHoverBorderWidth: 3,
                // Suavização das curvas do polígono[cite: 7]
                tension: 0.12
            }
        ]
    };

    // Configurações de exibição, escalas e plugins do gráfico[cite: 7]
    const options = {
        // Habilita dimensionamento adaptável ao contêiner pai[cite: 7]
        responsive: true,
        // Permite altura personalizada sem prender à proporção rígida[cite: 7]
        maintainAspectRatio: false,
        // Define o layout e margens internas do gráfico[cite: 7]
        layout: {
            // Preenchimento interno para não truncar rótulos ou ícones[cite: 7]
            padding: {
                top: 40,
                bottom: 30,
                left: 30,
                right: 30
            }
        },
        // Configuração dos plugins visuais[cite: 7]
        plugins: {
            // Oculta a legenda tradicional já que o título é autoexplicativo[cite: 7]
            legend: { display: false },
            // Configurações do balão flutuante com dados (tooltip)[cite: 7]
            tooltip: {
                // Cor de fundo escura translúcida[cite: 7]
                backgroundColor: 'rgba(20, 40, 70, 0.92)',
                // Tipografia do título do tooltip[cite: 7]
                titleFont: { size: 13, weight: 'bold' },
                // Tipografia do corpo de texto do tooltip[cite: 7]
                bodyFont: { size: 12 },
                // Espaçamento interno do balão[cite: 7]
                padding: 10,
                // Arredondamento das bordas da caixa de dicas[cite: 7]
                cornerRadius: 8,
                // Customização do formato dos valores no tooltip[cite: 7]
                callbacks: {
                    // Concatena a pontuação com a escala de 100 pontos[cite: 7]
                    label: (context) => ` ${context.raw} pontos / 100`
                }
            }
        },
        // Configuração dos eixos da escala radial[cite: 7]
        scales: {
            // Configura o eixo radial 'r' do radar[cite: 7]
            r: {
                // Valor numérico mínimo da escala[cite: 7]
                min: 0,
                // Valor numérico máximo da escala (limite superior)[cite: 7]
                max: 100,
                // Configuração das linhas diagonais angulares[cite: 7]
                angleLines: {
                    display: true,
                    color: 'rgba(26, 115, 232, 0.32)',
                    lineWidth: 1.5
                },
                // Configura as linhas da grade circular concêntrica[cite: 7]
                grid: {
                    circular: true,
                    color: 'rgba(26, 115, 232, 0.20)',
                    lineWidth: 1.2
                },
                // Configura as marcas numéricas da escala[cite: 7]
                ticks: {
                    // Intervalo de progressão de 20 em 20 pontos[cite: 7]
                    stepSize: 20,
                    // Remove fundo dos números[cite: 7]
                    backdropColor: 'transparent',
                    // Cor do texto dos números na escala[cite: 7]
                    color: '#1a56a6',
                    // Estilo de fonte dos números[cite: 7]
                    font: { size: 10, weight: '600' }
                },
                // Configuração dos textos das categorias em cada extremidade[cite: 7]
                pointLabels: {
                    // Cores individuais para cada texto[cite: 7]
                    color: [
                        CORES_GOOGLE.biologicas.base,
                        CORES_GOOGLE.exatas.base,
                        CORES_GOOGLE.humanas.base,
                        CORES_GOOGLE.tecnologicas.base
                    ],
                    // Tipografia dos rótulos angulares[cite: 7]
                    font: {
                        size: 12,
                        weight: 'bold',
                        family: "'Segoe UI', Roboto, sans-serif"
                    },
                    // Distância entre os rótulos e os círculos da teia[cite: 7]
                    padding: 10
                }
            }
        }
    };

    // Renderização do JSX[cite: 7]
    return (
        // Caixa contêiner branca com bordas arredondadas e sombra suave[cite: 7]
        <div
            style={{
                width: '100%',
                maxWidth: '460px',
                margin: '10px auto',
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                boxSizing: 'border-box',
                position: 'relative'
            }}
        >
            {/* Título descritivo do componente */}
            <h3
                style={{
                    textAlign: 'center',
                    color: '#202124',
                    fontSize: '15px',
                    fontWeight: '700',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.3px'
                }}
            >
                Radar de Aptidões Vocacionais
            </h3>

            {/* Contêiner de altura fixa para abrigar a renderização do Canvas e SVGs sobrepostos */}
            <div style={{ position: 'relative', width: '100%', height: '340px' }}>
                {/* Camada superior que renderiza o gráfico interativo Chart.js[cite: 7] */}
                <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10 }}>
                    <Radar data={data} options={options} />
                </div>

                {/* Camada subjacente que exibe os ícones ilustrativos de cada vértice[cite: 7] */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                >
                    {/* Ícone ilustrativo de Biológicas (Folha) posicionado no topo[cite: 7] */}
                    <div
                        title="Biológicas"
                        style={{
                            position: 'absolute',
                            top: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.biologicas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                        </svg>
                    </div>

                    {/* Ícone ilustrativo de Exatas (Calculadora) posicionado à direita[cite: 7] */}
                    <div
                        title="Exatas"
                        style={{
                            position: 'absolute',
                            top: '48%',
                            right: '12px',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.exatas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="3" />
                            <line x1="8" y1="6" x2="16" y2="6" />
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

                    {/* Ícone ilustrativo de Humanas (Pessoas) posicionado na base[cite: 7] */}
                    <div
                        title="Humanas"
                        style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.humanas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>

                    {/* Ícone ilustrativo de Tecnológicas (Chip/Processador) posicionado à esquerda[cite: 7] */}
                    <div
                        title="Tecnológicas"
                        style={{
                            position: 'absolute',
                            top: '48%',
                            left: '12px',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={CORES_GOOGLE.tecnologicas.base} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

// Exporta o componente GraficoRadar para inclusão em telas de resultado[cite: 7]
export default GraficoRadar;