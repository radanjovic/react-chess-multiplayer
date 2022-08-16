import blackPawn from '../../assets/svg/pawn-black.svg';
import whitePawn from '../../assets/svg/pawn-white.svg';

import blackRook from '../../assets/svg/rook-black.svg';
import whiteRook from '../../assets/svg/rook-white.svg';

import blackKnight from '../../assets/svg/knight-black.svg';
import whiteKnight from '../../assets/svg/knight-white.svg';

import blackBishop from '../../assets/svg/bishop-black.svg';
import whiteBishop from '../../assets/svg/bishop-white.svg';

import blackQueen from '../../assets/svg/queen-black.svg';
import whiteQueen from '../../assets/svg/queen-white.svg';

import blackKing from '../../assets/svg/king-black.svg';
import whiteKing from '../../assets/svg/king-white.svg';

import './Figure.css';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { useEffect, useState } from 'react';

const Img = ({src, check}) => {
    const {w} = useWindowDimensions();
    const [dimension, setDimension] = useState(80);
    useEffect(() => {
        if (w >= 1350) {
            setDimension(80);
        } else if (w >= 1200 && w < 1350) {
            setDimension(70);
        } else if (w >= 1050 && w < 1200) {
            setDimension(60);
        } else if (w >= 900 && w < 1050) {
            setDimension(45);
        } else if (w >= 700 && w < 900) {
            setDimension(50);
        } else if (w >= 500 && w < 700) {
            setDimension(40);
        } else if ( w < 500) {
            setDimension(30);
        }
    }, [w]);

    return <div className={`${check ? 'figureUnderCheck' : ''}`} ><img width={dimension} height={dimension} src={src} alt='chess figure' /></div>
}


const Figure = ({figure, player, check}) => {
    if (!figure || !player) {
        return <div></div>
    }
    if (player === 'white') {
        if (figure === 'pawn') {
            return <Img src={whitePawn} />
        } else if (figure === 'rook') {
            return <Img src={whiteRook} />
        } else if (figure === 'knight') {
            return <Img src={whiteKnight} />
        } else if (figure === 'bishop') {
            return <Img src={whiteBishop} />
        } else if (figure === 'queen') {
            return <Img src={whiteQueen} />
        } else if (figure === 'king') {
            return <Img src={whiteKing} check={check} />
        }
    } else if (player === 'black') {
        if (figure === 'pawn') {
            return <Img src={blackPawn} />
        } else if (figure === 'rook') {
            return <Img src={blackRook} />
        } else if (figure === 'knight') {
            return <Img src={blackKnight} />
        } else if (figure === 'bishop') {
            return <Img src={blackBishop} />
        } else if (figure === 'queen') {
            return <Img src={blackQueen} />
        } else if (figure === 'king') {
            return <Img src={blackKing} check={check} />
        }
    }
}

export default Figure