// ============================================================================
// IMPORTAÇÕES DE MÓDULOS E COMPONENTES DE VISUALIZAÇÃO
// ============================================================================

// Importa a biblioteca base do React para construção de componentes funcionais
import React from 'react';

// Importa o componente Pie (gráfico de pizza) integrado do wrapper react-chartjs-2
import { Pie } from 'react-chartjs-2';

// Importa a instância central do Chart.js e os módulos essenciais para renderização do gráfico de pizza
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// ============================================================================
// REGISTRO DE COMPONENTES DO CHART.JS
// ============================================================================

// Registra os elementos no núcleo do Chart.js:
// - ArcElement: responsável por desenhar os arcos/fatias da pizza;
// - Tooltip: exibe os valores e detalhes ao passar o cursor sobre as fatias;
// - Legend: gera a legenda descritiva com os nomes das categorias.
Chart.register(ArcElement, Tooltip, Legend);

// ============================================================================
// COMPONENTE PRINCIPAL: GRAFICOHABILIDADES
// ============================================================================

// Declaração do componente funcional GraficoHabilidades recebendo as 4 pontuações via desestruturação de props
const GraficoHabilidades = ({ biologicas, exatas, humanas, tecnologicas }) => {
    // ------------------------------------------------------------------------
    // ESTRUTURAÇÃO DOS DADOS DO GRÁFICO (DATASET)
    // ------------------------------------------------------------------------

    // Define o objeto de dados consumido pelo componente Pie do Chart.js
    const data = {
        // Rótulos que identificam cada uma das 4 áreas avaliadas
        labels: ['Biológicas', 'Exatas', 'Humanas', 'Tecnológicas'],
        // Coleção de conjuntos de dados a serem plotados no gráfico
        datasets: [
            {
                // Mapeia os valores numéricos recebidos via props na mesma ordem dos labels
                data: [biologicas, exatas, humanas, tecnologicas],
                // Paleta de cores base de cada fatia (Biológicas: verde, Exatas: azul, Humanas: laranja, Tecnológicas: roxo)
                backgroundColor: ['#4CAF50', '#008CBA', '#f39c12', '#9b59b6'],
                // Paleta de cores aplicadas quando o cursor do mouse passa sobre cada fatia (hover)
                hoverBackgroundColor: ['#45a049', '#007bb5', '#d68910', '#8e44ad']
            }
        ]
    };

    // ------------------------------------------------------------------------
    // OPÇÕES DE CONFIGURAÇÃO DO GRÁFICO
    // ------------------------------------------------------------------------

    // Define as opções gerais de comportamento e responsividade do gráfico
    const options = {
        // Torna o gráfico fluido, adaptando seu tamanho dinamicamente à largura do contêiner-pai
        responsive: true,
        // Desativa a trava da proporção padrão para respeitar a altura e largura definidas no contêiner
        maintainAspectRatio: false
    };

    // ------------------------------------------------------------------------
    // RENDERIZAÇÃO DO COMPONENTE (JSX)
    // ------------------------------------------------------------------------

    return (
        // Contêiner centralizado ocupando metade da largura da tela/seção pai
        <div style={{ width: '50%', margin: 'auto' }}>
            {/* Título informativo da seção do gráfico com texto centralizado em branco */}
            <h2 style={{ textAlign: 'center', color: '#FFF' }}>Distribuição das Habilidades</h2>
            {/* Renderiza o gráfico de pizza repassando os dados estruturados e as opções de exibição */}
            <Pie data={data} options={options} />
        </div>
    );
};

// ============================================================================
// EXPORTAÇÃO DO COMPONENTE
// ============================================================================

// Exporta o componente GraficoHabilidades por padrão para uso em outras telas da aplicação
export default GraficoHabilidades;