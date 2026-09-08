import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Registra os elementos necessários para o gráfico
Chart.register(ArcElement, Tooltip, Legend);

const GraficoHabilidades = ({ biologicas, exatas, humanas, tecnologicas }) => {
    const data = {
        labels: ['Biológicas', 'Exatas', 'Humanas', 'Tecnológicas'],
        datasets: [
            {
                data: [biologicas, exatas, humanas, tecnologicas],
                backgroundColor: ['#4CAF50', '#008CBA', '#f39c12', '#9b59b6'],
                hoverBackgroundColor: ['#45a049', '#007bb5', '#d68910', '#8e44ad']
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false
    };

    return (
        <div style={{ width: '50%', margin: 'auto' }}>
            <h2 style={{ textAlign: 'center', color: '#FFF' }}>Distribuição das Habilidades</h2>
            <Pie data={data} options={options} />
        </div>
    );
};

export default GraficoHabilidades;