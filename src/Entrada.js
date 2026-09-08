import styles from './estilo.css';
import React, { useState } from 'react';
import prof from './img/foto.jpg';
import logo from './img/Logo.png';
import './index.css';
import Iniciar from './Iniciar';

const Entrada = () => {
    // Estado para controlar a tela atual
    const [pagina, alterarPagina] = useState('Entrada');

    // Função que altera a página quando o botão é clicado
    const mudarPagina = (nomePagina) => {
        alterarPagina(nomePagina);
    };

    // Renderiza condicionalmente os componentes com base no estado `pagina`
    return pagina === 'Entrada' ? (
        <div className="Entrada">
            {/* Barra superior com título */}
            <div className='barraSuperior' style={styles.barraSuperior}>
                <h1 className='barraTexto' style={styles.barraTexto}>Teste de Aptidão Vocacional</h1>
            </div>

            {/* Exibição da imagem principal */}
            <div className='corpo' style={styles.corpo}>
                <img src={prof} alt="Imagem de perfil" />
            </div>

            {/* Texto explicativo sobre o teste */}
            <div className='corpo' style={styles.corpo}>
                <p>Este teste consiste em 10 questões de múltipla escolha e, com base no percentual de suas respostas, apresentará as profissões que mais se aproximam do seu perfil psicológico.
                Lembre-se: este é apenas um indicativo aproximado e pode servir como um guia inicial para sua reflexão sobre possíveis carreiras.
                Clique no botão abaixo para começar! 
                </p>
            </div>

            {/* Botão para iniciar o teste, alterando a página para "Iniciar" */}
            <div className='corpo' style={styles.corpo}>
                <button className='btnPrincipal' onClick={() => mudarPagina('Iniciar')}>COMEÇAR</button>
            </div>

            {/* Exibição da logo */}
            <div className='corpo' style={styles.corpo}>
                <img src={logo} style={styles.logo} alt="Logo do teste" />
            </div>
        </div>
    ) : (
        <Iniciar /> // Renderiza o componente Iniciar quando a página é alterada
    );
};

export default Entrada;