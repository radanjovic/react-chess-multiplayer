import { useEffect, useState } from 'react';
import './App.css';

import {getTable, getStylesForFieldsWhenNotSelected, getAvailableMoves, getStylesForFieldsWhenSelected, getUpdatedTable, getFigures, checkIfCheck, checkIfStalemate} from './helpers/index';

import Figure from './components/figures/Figure';
import Modal from './components/modal/Modal';
import useGetTime from './hooks/useGetTime';
import useWindowDimensions from './hooks/useWindowDimensions';

import settingsPic from './assets/svg/settings100.svg';
import offerDrawPic from './assets/svg/offerDraw.svg'
import surrenderPic from './assets/svg/surrender.svg'

function App() {
  const [table, setTable] = useState(getTable());
  const [gameOver, setGameOver] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [playAgain, setPlayAgain] = useState(false);
  const [surrender, setSurrender] = useState(null);
  const [draw, setDraw] = useState(false);
  const [offeredDraw, setOfferedDraw] = useState(false);
  const [drawRejected, setDrawRejected] = useState(false);

  const [showTable, setShowTable] = useState(false);

  const [timerType, setTimerType] = useState('10');

  const [movesHistory, setMovesHistory] = useState([]);
  const [showMovesHistory, setShowMovesHistory] = useState(false);

  const [tableColor, setTableColor] = useState(null);

  const [shouldSelectFigureToSave, setShouldSelectFigureToSave] = useState(false);

  const [err, setErr] = useState(null);

  const [availableMoves, setAvailableMoves] = useState(null);
  const [selectedFigure, setSelectedFigure] = useState(null);

  const [whitePlayer, setWhitePlayer] = useState('asdf');
  const [blackPlayer, setBlackPlayer] = useState('jkl');

  const [whitePlayerRemovedFigures, setWhitePlayerRemovedFigures] = useState([]);
  const [blackPlayerRemovedFigures, setBlackPlayerRemovedFigures] = useState([]);

  const [turn, setTurn] = useState('white');

  const [numberOfMoves, setNumberOfMoves] = useState(0);

  const [whitePlayerTime, setWhitePlayerTime] = useState(600);
  const [blackPlayerTime, setBlackPlayerTime] = useState(600);

  const [whitePlayerTimer, setWhitePlayerTimer] = useState(null);
  const [blackPlayerTimer, setBlackPlayerTimer] = useState(null);

  const [check, setCheck] = useState(null);
  const [staleMate, setStaleMate] = useState(null);

  const [showSettings, setShowSettings] = useState(false);

  const {w} = useWindowDimensions();

  const {minutes: whiteMinutes, seconds: whiteSeconds} = useGetTime(whitePlayerTime);
  const {minutes: blackMinutes, seconds: blackSeconds} = useGetTime(blackPlayerTime);


  useEffect(() => {
    if (whitePlayerTime <= 0 && !gameOver) {
      setGameOver({winner: 'black', reason: 'White player ran out of time!'});
    }
    if (blackPlayerTime <= 0 && !gameOver) {
      setGameOver({winner: 'white', reason: 'Black player ran out of time!'});
    }
  }, [whitePlayerTime, gameOver, blackPlayerTime]);

  useEffect(() => {
    if (gameOver && !playAgain) {
      clearInterval(whitePlayerTimer);
      clearInterval(blackPlayerTimer);
      setBlackPlayerTimer(null);
      setWhitePlayerTimer(null);
    }

    if ((gameOver || draw || staleMate) && playAgain) {
      setTable(getTable());

      setMovesHistory([]);
      setShowMovesHistory(false);
      setShouldSelectFigureToSave(false);
      setErr(null);
      setAvailableMoves(null);
      setSelectedFigure(null);
      setWhitePlayerRemovedFigures([]);
      setBlackPlayerRemovedFigures([]);
      setTurn('white');
      setNumberOfMoves(0);
      setWhitePlayerTime(600);
      setBlackPlayerTime(600);
      setWhitePlayerTimer(null);
      setBlackPlayerTimer(null);
      setTimerType('10');
      setSurrender(null);
      setDraw(false);
      setOfferedDraw(false);
      setDrawRejected(null);
      setCheck(null);
      setStaleMate(null);
      setShowSettings(false);
      setShowTable(false);

      setWhitePlayer('asdf');
      setBlackPlayer('jkl');

      setGameOver(false);
      setGameStart(false);
      setPlayAgain(false);
    }
  }, [gameOver, playAgain, draw]);

  useEffect(() => {
    if (surrender) {
      if (surrender === 'white') {
        setGameOver({winner: 'black', reason: 'White player surrendered the game!'});
      } else if (surrender === 'black') {
        setGameOver({winner: 'white', reason: 'Black player surrendered the game!'});
      }
    }
  }, [surrender]);

  const selectFigure = (field) => {
    if (!field) {
      return;
    }
    if (!selectedFigure) {
      if (!field.figure) {
        return;
      }
      const {figure, player} = field.figure;

      if (!player || !figure) {
        return;
      }
  
      if ((player === 'white' && turn !== 'white') || (player === 'black' && turn !== 'black')) {
        return;
      }

      setSelectedFigure(field);
      setAvailableMoves(getAvailableMoves(table, field, false, true));
      return;
    } else {
      const position = field.id;

      if (selectedFigure === field) {
        setSelectedFigure(null);
        setAvailableMoves(null);
        return;
      }

      if (selectedFigure && (!availableMoves || availableMoves.length === 0)) {
        return;
      }

      if (selectedFigure && availableMoves && availableMoves.length > 0) {
        if (!availableMoves.includes(position)) {
          return;
        }

        const {newTable, removedFigure, error, move, selectFigureToSave, gameOver, selfCheck} = getUpdatedTable(table, selectedFigure, field);

        if (error) {
          setErr(error);
          setSelectedFigure(null);
          setAvailableMoves(null);
          return;
        }

        if (selfCheck) {
          setErr(`By moving your figure there, you expose your king to your opponent's figure! Please select a different move!`);
          setSelectedFigure(null);
          setAvailableMoves(null);
          return;
        }

        if (newTable) {
          setTable(newTable);
          try {
            const CHECK = checkIfCheck(newTable);
            if (CHECK) {
              setCheck(CHECK);
            } else {
              setCheck(null);
            }
          } catch(err) {
            console.log('Check error: ', err);
          }
          
        }

        if (removedFigure) {
          if (removedFigure.player === 'white') {
            setWhitePlayerRemovedFigures(prev => [...prev, removedFigure]);
          } else if (removedFigure.player === 'black') {
            setBlackPlayerRemovedFigures(prev => [...prev, removedFigure]);
          }
        }
        if (move) {
          setMovesHistory(prev => [...prev, move])
        }
        setSelectedFigure(null);
        setAvailableMoves(null);
        setNumberOfMoves(prev => prev+1);

        if (gameOver) {
          setGameOver(gameOver);
          return;
        }

        if (selectFigureToSave) {
          clearInterval(blackPlayerTimer);
          setBlackPlayerTimer(null);
          clearInterval(whitePlayerTimer);
          setWhitePlayerTimer(null);
          setShouldSelectFigureToSave(selectFigureToSave);
        }

        if (turn === 'white') {
          setTurn('black');
          if (!gameStart) {
            setGameStart(true);
          }
        } else if (turn === 'black') {
          setTurn('white');
          if (!gameStart) {
            setGameStart(true);
          }
        }
        return;
      }
    }
  }

  useEffect(() => {
    if (!check) {
      let stalemate = checkIfStalemate(table);
      if (stalemate) {
        setStaleMate(stalemate);
      }
    }
  }, [table, check]);

  useEffect(() => {
    return () => {
      if (blackPlayerTimer) {
        clearInterval(blackPlayerTimer);
      }
      if (whitePlayerTimer) {
        clearInterval(whitePlayerTimer);
      }
    }
  }, []);

  useEffect(() => {
    if (gameStart && !shouldSelectFigureToSave) {
      if (turn === 'white') {
        if (timerType === '3+2') {
            setBlackPlayerTime(prev => prev + 2);
        } else if (timerType === '5+3') {
            setBlackPlayerTime(prev => prev + 3);
        }
        clearInterval(blackPlayerTimer);
        setBlackPlayerTimer(null);
        setWhitePlayerTimer(setInterval(() => {setWhitePlayerTime(prev => prev - 1)}, 1000));
        return () => {clearInterval(whitePlayerTimer)}
      } else if (turn === 'black') {
        if (timerType === '3+2') {
            setWhitePlayerTime(prev => prev + 2);
        } else if (timerType === '5+3') {
            setWhitePlayerTime(prev => prev + 3);
        }
        clearInterval(whitePlayerTimer);
        setWhitePlayerTimer(null);
        setBlackPlayerTimer(setInterval(() => {setBlackPlayerTime(prev => prev - 1)}, 1000));
        return () => {clearInterval(blackPlayerTimer)}
      }
    }
    
  }, [turn, gameStart, timerType, shouldSelectFigureToSave]);

  const saveFigure = (figure) => {
    if (!shouldSelectFigureToSave) {
      return;
    }
    const {player, id} = shouldSelectFigureToSave;
    const newTable = table.map(field => {
      if (field.id === id) {
        let obj = {
          letter: field.letter,
          number: field.number,
          id: field.id,
          className: field.className,
          figure: figure
        }
        return obj;
      } else {
        return field
      }});
    let CHECK = checkIfCheck(newTable);
    if (!CHECK) {
      setCheck(null);
    } else {
      setCheck(CHECK);
    }
    setTable(newTable);
    setShouldSelectFigureToSave(null);
  }

  const changeTimerType = (type) => {
    if (gameStart) {
      return;
    }
    setTimerType(type);
  }

  useEffect(() => {
    if (timerType === '10') {
      setWhitePlayerTime(600);
      setBlackPlayerTime(600);
    } else if (timerType === '5+3') {
      setWhitePlayerTime(300);
      setBlackPlayerTime(300);
    } else if (timerType === '3+2') {
      setWhitePlayerTime(180);
      setBlackPlayerTime(180);
    }
  }, [timerType]);

  const handleSurrender = (player) => {
    setSurrender(player);
  }

  const handleDraw = (player) => {
    if (turn === 'white') {
      clearInterval(whitePlayerTimer);
      setWhitePlayerTimer(null);
    } else if (turn === 'black') {
      clearInterval(blackPlayerTimer);
      setWhitePlayerTimer(null);
    }
    setOfferedDraw(player);
  }

  const handleRejectDraw = () => {
    if (turn === 'white') {
      clearInterval(blackPlayerTimer);
      setBlackPlayerTimer(null);
      setWhitePlayerTimer(setInterval(() => {setWhitePlayerTime(prev => prev - 1)}, 1000));
    } else if (turn === 'black') {
      clearInterval(whitePlayerTimer);
      setWhitePlayerTimer(null);
      setBlackPlayerTimer(setInterval(() => {setBlackPlayerTime(prev => prev - 1)}, 1000));
    }
    setDrawRejected({player: offeredDraw});
    setDraw(false);
    setOfferedDraw(null);
  }

  const handleAcceptDraw = () => {
    setDrawRejected(null);
    setOfferedDraw(false);
    setDraw(true);
  }

  return (
    <>
      <div className='appContainer'>
        {showSettings && <Modal type={'settings'} onOK={() => setShowSettings(false)}>
        <div className='settingsModalWrapper'>
        <div className='modalTimerType'>
          <div>Select Timer Type:</div>
          <div className='modalTimerTypeButtonContainer'>
            <button disabled={gameStart} onClick={() => changeTimerType('3+2')}>Timer: 3+2</button>
            <button disabled={gameStart} onClick={() => changeTimerType('5+3')}>Timer: 5+3</button>
            <button disabled={gameStart} onClick={() => changeTimerType('10')}>Timer: 10</button>
          </div>
        </div>
        <div className='modalTableColor'>
          <div>Select table colors:</div>
          <div className='modalTableColorButtonContainer'>
            <button onClick={() => setTableColor({black: '#000000', white: '#FFFFFF'})}>
            <span style={{backgroundColor: '#FFFFFF'}}></span>
            <span style={{backgroundColor: '#000000'}}></span>
          </button>
          <button onClick={() => setTableColor({black: '#8B4513', white: '#F3E5AB'})}>
            <span style={{backgroundColor: '#F3E5AB'}}></span>
            <span style={{backgroundColor: '#8B4513'}}></span>
          </button>
          <button onClick={() => setTableColor({black: '#00008B', white: '#F0FFFF'})}>
            <span style={{backgroundColor: '#F0FFFF'}}></span>
            <span style={{backgroundColor: '#00008B'}}></span>
          </button>
          <button onClick={() => setTableColor({black: '#355E3B', white: '#ECFFDC'})}>
            <span style={{backgroundColor: '#ECFFDC'}}></span>
            <span style={{backgroundColor: '#355E3B'}}></span>
          </button>
          <button onClick={() => setTableColor({black: '#8B008B', white: '#DDA0DD'})}>
            <span style={{backgroundColor: '#DDA0DD'}}></span>
            <span style={{backgroundColor: '#8B008B'}}></span>
          </button>
          </div>
          
        </div>
        <div className='modalWhitePlayerRemovedFigures'>
          <div>White player's captured figures:</div>
          {whitePlayerRemovedFigures && whitePlayerRemovedFigures.length < 1 ? <p style={{textAlign: 'center', fontSize: 12}}>No captured figures yet.</p> : <div style={{maxWidth: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}} >
            {whitePlayerRemovedFigures.map((figure, i) => <Figure key={i} figure={figure.figure} player={figure.player} />)}
          </div>}
          </div>
        <div className='modalBlackPlayerRemovedFigures'>
          <div>Black player's captured figures:</div>
          {blackPlayerRemovedFigures && blackPlayerRemovedFigures.length < 1 ? <p style={{textAlign: 'center', fontSize: 12}}>No captured figures yet.</p> : <div style={{maxWidth: 360, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}} >
          {blackPlayerRemovedFigures.map((figure, i) => <Figure key={i} figure={figure.figure} player={figure.player} />)}
          </div>}
        </div>
        <div className='modalMovesHistory'>
          <div>Moves History: </div>
          {movesHistory.length === 0 
          ? <p style={{textAlign: 'center', fontSize: 12}}>No moves yet!</p>
          :<ul>
            {movesHistory.map((move, i) => <li style={{maxWidth: 300}} key={i}>{i+1}. {move}</li>)}
          </ul>}
        </div>
        </div>
        </Modal>}
        {offeredDraw && <Modal type={'drawOffer'} player={offeredDraw} onNO={handleRejectDraw} onYES={handleAcceptDraw} />}
        {gameOver && <Modal onShowTable={() => setShowTable(true)} onOK={() => setPlayAgain(true)} type={'gameOver'} winner={gameOver.winner} numOfMoves={numberOfMoves}>
        {movesHistory.length === 0 
          ? <p>No moves were made!</p>
          :<ul>
            {movesHistory.map((move, i) => <li key={i}>{i+1}. {move}</li>)}
          </ul>}
        <p style={{textAlign: 'center', color: 'red', fontSize: 16}}>{gameOver.reason}</p>
        </Modal>}
        {err && <Modal type={'message'} title='Error!' message={err} onOK={() => setErr(null)} />}
        {drawRejected && <Modal type={'message'} title='Draw Rejected!' message={drawRejected.player === 'white' ? 'Black player rejected draw offer! The game continues.' : 'White player rejected draw offer! The game continues.'} onOK={() => setDrawRejected(null)} />}
        {draw && <Modal onShowTable={() => setShowTable(true)} type={'draw'} onOK={() => setPlayAgain(true)} numOfMoves={numberOfMoves}>
        {movesHistory.length === 0 
          ? <p>No moves were made!</p>
          :<ul>
            {movesHistory.map((move, i) => <li key={i}>{i+1}. {move}</li>)}
          </ul>}
          <p style={{textAlign: 'center', color: 'red', fontSize: 16}}>Players agreed to a draw!</p>
        </Modal>}
        {staleMate && <Modal onShowTable={() => setShowTable(true)} type={'stalemate'} onOK={() => setPlayAgain(true)} numOfMoves={numberOfMoves}>
        {movesHistory.length === 0 
          ? <p>No moves were made!</p>
          :<ul>
            {movesHistory.map((move, i) => <li key={i}>{i+1}. {move}</li>)}
          </ul>}
          <p style={{textAlign: 'center', color: 'red', fontSize: 16}}>{staleMate === 'white' ? 'White player ran out of moves, and is not under check!' : 'Black player ran out of moves, and is not under check!'}</p>
        </Modal>}
        {showMovesHistory && <Modal type='list' onOK={() => setShowMovesHistory(false)}>
          {movesHistory.length === 0 
          ? <p>No moves yet!</p>
          :<ul>
            {movesHistory.map((move, i) => <li key={i}>{i+1}. {move}</li>)}
          </ul>}
        </Modal>}
        {shouldSelectFigureToSave && <Modal type='select'>
          {shouldSelectFigureToSave.player === 'white' && getFigures('white').map(figure => <div key={figure.figure} onClick={() => saveFigure(figure)}><Figure figure={figure.figure} player={figure.player} /></div>)}
          {shouldSelectFigureToSave.player === 'black' && getFigures('black').map(figure => <div key={figure.figure} onClick={() => saveFigure(figure)}><Figure figure={figure.figure} player={figure.player} /></div>)}
        </Modal>}
        {(w && w >= 900) &&<div className='numberOfMoves'>
          <h5>Total number</h5>
          <h5>of moves:</h5>
          <p>{numberOfMoves}</p>
        </div>}
        {whitePlayerRemovedFigures && whitePlayerRemovedFigures.length > 0 && (w && w >= 900) && <div className='whitePlayerRemovedFigures'>
          {whitePlayerRemovedFigures.map((figure, i) => <Figure key={i} figure={figure.figure} player={figure.player} />)}
        </div>}
        {blackPlayerRemovedFigures && blackPlayerRemovedFigures.length > 0 && (w && w >= 900) && <div className='blackPlayerRemovedFigures'>
          {blackPlayerRemovedFigures.map((figure, i) => <Figure key={i} figure={figure.figure} player={figure.player} />)}
        </div>}
        {(w && w >= 900) && <div className='tableColor'>
          <button onClick={() => setTableColor({black: '#000000', white: '#FFFFFF'})}>
            <span style={{backgroundColor: '#FFFFFF'}}></span>
            <span style={{backgroundColor: '#000000'}}></span>
          </button>
          <button onClick={() => setTableColor({black: '#8B4513', white: '#F3E5AB'})}>
            <span style={{backgroundColor: '#F3E5AB'}}></span>
            <span style={{backgroundColor: '#8B4513'}}></span>
          </button>
          <button onClick={() => setTableColor({black: '#00008B', white: '#F0FFFF'})}>
            <span style={{backgroundColor: '#F0FFFF'}}></span>
            <span style={{backgroundColor: '#00008B'}}></span>
          </button>
          <button onClick={() => setTableColor({black: '#355E3B', white: '#ECFFDC'})}>
            <span style={{backgroundColor: '#ECFFDC'}}></span>
            <span style={{backgroundColor: '#355E3B'}}></span>
          </button>
          <button onClick={() => setTableColor({black: '#8B008B', white: '#DDA0DD'})}>
            <span style={{backgroundColor: '#DDA0DD'}}></span>
            <span style={{backgroundColor: '#8B008B'}}></span>
          </button>
        </div>}
        {(w && w >= 900) && <div className='movesHistory'>
          <button disabled={!gameStart} onClick={() => setShowMovesHistory(true)}>Moves History</button>
        </div>}
        {(w && w >= 900) && <div className='timerType'>
          <button disabled={gameStart} onClick={() => changeTimerType('3+2')}>Timer: 3+2</button>
          <button disabled={gameStart} onClick={() => changeTimerType('5+3')}>Timer: 5+3</button>
          <button disabled={gameStart} onClick={() => changeTimerType('10')}>Timer: 10</button>
        </div>}
        {(w && w >= 900) && <div className='timer'>
            <div className='whitePlayerTimer'>
              <h5>White Player:</h5>
              <p>{whiteMinutes} : {whiteSeconds}</p>
            </div>
            <div className='blackPlayerTimer'>
              <h5>Black Player:</h5>
              <p>{blackMinutes} : {blackSeconds}</p>
            </div>
        </div>}
        {(w && w >= 900) && <div className='surrenderButton'>
          <button disabled={!gameStart} onClick={() => handleSurrender(turn)}>Surrender</button>
        </div>}
        {(w && w >= 900) && <div className='offerDraw'>
          <button disabled={!gameStart} onClick={() => handleDraw(turn)}>Offer Draw</button>
        </div>}
        {w && w <= 900 && <div className='settingsContainer'>
          <div className='miniTimerDiv'>
            <div>White player: <span>{whiteMinutes}</span> : <span>{whiteSeconds}</span>
            </div>
            <div>Black player: <span>{blackMinutes}</span> : <span>{blackSeconds}</span>
            </div>
          </div>
          <div className='iconsDiv'>
            <div onClick={() => setShowSettings(true)} id='settings'><img src={settingsPic} alt='settings pic' /></div>
            <div id='surrender'><button disabled={!gameStart} onClick={() => handleSurrender(turn)}><img src={surrenderPic} alt='surrender pic' /></button></div>
            <div id='offerDraw'><button disabled={!gameStart} onClick={() => handleDraw(turn)}><img src={offerDrawPic} alt='offer draw pic' /></button></div>
          </div>
        </div>}
        {showTable && <Modal type={'showTable'} onOK={() => setShowTable(false)}>
        <div className='tableContainer'>{table.map((field, i) => <div 
          key={field.id} 
          className={`${field.className} ${getStylesForFieldsWhenNotSelected(selectedFigure, turn, field)}`} 
          onClick={() => selectFigure(field)}
          style={tableColor && {backgroundColor: `${field.className === 'white' ? tableColor.white : tableColor.black}`}}
        >
          <div className='tableFieldIdentifier'>{field.id}</div>
          <div className='tableIconContainer'>{field.figure && <Figure figure={field.figure.figure} player={field.figure.player} check={check && check === field.figure.player && field.figure.figure === 'king' ? true : false} />}</div>
          <div className={`${getStylesForFieldsWhenSelected(selectedFigure, field, availableMoves)}`}></div>
        </div>)}</div>
        </Modal>}
        <div className='tableContainer'>{table.map((field, i) => <div 
          key={field.id} 
          className={`${field.className} ${getStylesForFieldsWhenNotSelected(selectedFigure, turn, field)}`} 
          onClick={() => selectFigure(field)}
          style={tableColor && {backgroundColor: `${field.className === 'white' ? tableColor.white : tableColor.black}`}}
        >
          <div className='tableFieldIdentifier'>{field.id}</div>
          <div className='tableIconContainer'>{field.figure && <Figure figure={field.figure.figure} player={field.figure.player} check={check && check === field.figure.player && field.figure.figure === 'king' ? true : false} />}</div>
          <div className={`${getStylesForFieldsWhenSelected(selectedFigure, field, availableMoves)}`}></div>
        </div>)}</div>
      </div>
    </>
  );
}

export default App;
