import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { API_ENDPOINT } from './constants';
import io from 'socket.io-client';

import {getTable, getStylesForFieldsWhenNotSelected, getAvailableMoves, getStylesForFieldsWhenSelected, getUpdatedTable, getFigures, checkIfCheck, checkIfStalemate, getStylesForFieldsWhenNotSelected_endTable} from './helpers/index';

import Figure from './components/figures/Figure';
import Modal from './components/modal/Modal';
import useGetTime from './hooks/useGetTime';
import useWindowDimensions from './hooks/useWindowDimensions';

import settingsPic from './assets/svg/settings100.svg';
import offerDrawPic from './assets/svg/offerDraw.svg';
import surrenderPic from './assets/svg/surrender.svg';

const socket = io(API_ENDPOINT);

function App() {
  const [table, setTable] = useState(getTable());
  const [gameOver, setGameOver] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [playAgain, setPlayAgain] = useState(false);
  const [surrender, setSurrender] = useState(null);
  const [draw, setDraw] = useState(false);
  const [offeredDraw, setOfferedDraw] = useState(false);
  const [drawRejected, setDrawRejected] = useState(false);

  const [room, setRoom] = useState(null);
  const [player, setPlayer] = useState(null);
  const [id, setId] = useState(null);

  const [showTable, setShowTable] = useState(false);

  const [timerType, setTimerType] = useState('10');

  const [movesHistory, setMovesHistory] = useState([]);
  const [showMovesHistory, setShowMovesHistory] = useState(false);

  const [tableColor, setTableColor] = useState(null);

  const [shouldSelectFigureToSave, setShouldSelectFigureToSave] = useState(false);

  const [err, setErr] = useState(null);
  const [message, setMessage] = useState(null);

  const [availableMoves, setAvailableMoves] = useState(null);
  const [selectedFigure, setSelectedFigure] = useState(null);

  const [whitePlayer, setWhitePlayer] = useState(null);
  const [blackPlayer, setBlackPlayer] = useState(null);

  const [whitePlayerRemovedFigures, setWhitePlayerRemovedFigures] = useState([]);
  const [blackPlayerRemovedFigures, setBlackPlayerRemovedFigures] = useState([]);

  const [turn, setTurn] = useState('white');

  const [numberOfMoves, setNumberOfMoves] = useState(0);

  const [whitePlayerTime, setWhitePlayerTime] = useState(600);
  const [blackPlayerTime, setBlackPlayerTime] = useState(600);

  // const [whitePlayerTimer, setWhitePlayerTimer] = useState(null);
  // const [blackPlayerTimer, setBlackPlayerTimer] = useState(null);

  const whitePlayerTimer = useRef();
  const blackPlayerTimer = useRef();

  const [check, setCheck] = useState(null);
  const [staleMate, setStaleMate] = useState(null);

  const [showSettings, setShowSettings] = useState(false);

  const [createRoomInput, setCreateRoomInput] = useState('');
  const [createNameInput, setCreateNameInput] = useState('');
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [joinNameInput, setJoinNameInput] = useState('');

  const {w} = useWindowDimensions();

  const {minutes: whiteMinutes, seconds: whiteSeconds} = useGetTime(whitePlayerTime);
  const {minutes: blackMinutes, seconds: blackSeconds} = useGetTime(blackPlayerTime);


  const resetIntervals = () => {
    clearInterval(whitePlayerTimer.current);
    whitePlayerTimer.current = null;

    clearInterval(blackPlayerTimer.current);
    blackPlayerTimer.current = null;
  }

  const createWhitePlayerTimer = () => {
    whitePlayerTimer.current = setInterval(() => {
      setWhitePlayerTime(prev => prev - 1);
    }, 1000)
  }

  const createBlackPlayerTimer = () => {
    blackPlayerTimer.current = setInterval(() => {
      setBlackPlayerTime(prev => prev - 1);
    }, 1000)
  }

  useEffect(() => {
    socket.on('connect', () => {
      setMessage({title: 'Connected!', message: 'You are now connected to server!'});
      setTimeout(() => {
        setMessage(null);
      }, 1000);
    });

    socket.on('error', ({error}) => {
      setErr(error);
    });

    socket.on('roomCreated', ({name, room, player, id}) => {
      setWhitePlayer(name);
      setRoom(room);
      setPlayer(player);
      setId(id);
    });

    socket.on('roomJoined', ({name, room, player, id, otherPlayerName}) => {
      console.log(otherPlayerName);
      setBlackPlayer(name);
      setRoom(room);
      setPlayer(player);
      setId(id);
      if (!whitePlayer) {
        setWhitePlayer(otherPlayerName);
      }
    });

    socket.on('otherPlayerJoined', ({name}) => {
      console.log(name);
      if (!blackPlayer) {
        setBlackPlayer(name);
      }
    });

    socket.on('newMove', (data) => {
      if (!data) {
        return;
      }

      setAvailableMoves(null);
      setSelectedFigure(null);

      data.table && setTable(data.table);
      data.check ? setCheck(data.check) : setCheck(null);
      if (data.removedFigure) {
        let removedFigure = data.removedFigure;
        if (removedFigure.player === 'white') {
          setWhitePlayerRemovedFigures(prev => [...prev, removedFigure]);
        } else if (removedFigure.player === 'black') {
          setBlackPlayerRemovedFigures(prev => [...prev, removedFigure]);
        }
      }
      if (data.move) {
        setMovesHistory(prev => [...prev, data.move]);
        setNumberOfMoves(prev => prev+1);
      }
      if (data.selectFigureToSave) {
        resetIntervals();
        setShouldSelectFigureToSave(data.selectFigureToSave);
      }
      data.turn && setTurn(data.turn)
      data.gameStart && setGameStart(data.gameStart);
    });

    socket.on('gameOver', ({gameOver}) => {
      setGameOver(gameOver);
    });

    socket.on('playAgain', ({playAgain}) => {
      setPlayAgain(playAgain);
    });

    socket.on('timerType', ({type}) => {
      setTimerType(type);
      if (player === 'white') {
        setMessage({title: 'Timer Type Changed!', message: `${blackPlayer} changed the timer type!`});
        setTimeout(() => {
          setMessage(null);
        }, 1500);
      } else if (player === 'black') {
        setMessage({title: 'Timer Type Changed!', message: `${whitePlayer} changed the timer type!`});
        setTimeout(() => {
          setMessage(null);
        }, 1500);
      }
    });

    socket.on('drawOffered', ({player}) => {
      resetIntervals();
      setOfferedDraw(player);
    });

    socket.on('acceptDraw', ({draw}) => {
      setDrawRejected(null);
      setOfferedDraw(false);
      setDraw(true);
    });

    socket.on('rejectDraw', ({player}) => {
      resetIntervals();
      if (player === 'white') {
        // setWhitePlayerTimer(setInterval(() => {setWhitePlayerTime(prev => prev - 1)}, 1000));
        createWhitePlayerTimer();
      } else if (player === 'black') {
        // setBlackPlayerTimer(setInterval(() => {setBlackPlayerTime(prev => prev - 1)}, 1000));
        createBlackPlayerTimer();
      }
      setDrawRejected({player});
      setDraw(false);
      setOfferedDraw(null);
    });

    socket.on('figureSaved', (data) => {
      data.table && setTable(data.table);
      data.check ? setCheck(data.check) : setCheck(null);
      setShouldSelectFigureToSave(null);
    });

    socket.on('disconnect', () => {
      reset(true);
      setMessage({title: 'Disconnected!', message: 'You have been disconnected from the server, and your game is aborted!'});
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    });

    socket.on('otherPlayerDisconnected', () => {
      reset(true);
      setMessage({title: 'Disconnected!', message: 'The other player from your room has been disconnected from the server, and your game is aborted!'});
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('otherPlayerJoined');
      socket.off('otherPlayerDisconnected');
      socket.off('newMove');
      socket.off('gameOver');
      socket.off('playAgain');
      socket.off('timerTyper');
      socket.off('drawOffered');
      socket.off('rejectDraw');
      socket.off('figureSaved');
    }
  }, []);

  useEffect(() => {
    if (whitePlayerTime <= 0 && !gameOver) {
      setGameOver({winner: blackPlayer, reason: `${whitePlayer} ran out of time!`});
      // socket.emit('gameOver', {winner: 'black', reason: 'White player ran out of time!'});
    }
    if (blackPlayerTime <= 0 && !gameOver) {
      setGameOver({winner: whitePlayer, reason: `${blackPlayer} ran out of time!`});
      // socket.emit('gameOver', {winner: 'white', reason: 'Black player ran out of time!'});
    }
  }, [whitePlayerTime, gameOver, blackPlayerTime]);

  useEffect(() => {
    if (gameOver && !playAgain) {
      resetIntervals();
    }

    if ((gameOver || draw || staleMate) && playAgain) {
      reset(false);
    }
  }, [gameOver, playAgain, draw]);

  const reset = useCallback((fullReset) => {
    resetIntervals();

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
    // setWhitePlayerTimer(null);
    // setBlackPlayerTimer(null);
    setTimerType('10');
    setSurrender(null);
    setDraw(false);
    setOfferedDraw(false);
    setDrawRejected(null);
    setCheck(null);
    setStaleMate(null);
    setShowSettings(false);
    setShowTable(false);
    setMessage(null);

    setCreateNameInput('');
    setCreateRoomInput('');
    setJoinNameInput('');
    setJoinRoomInput('');

    setGameOver(false);
    setGameStart(false);
    setPlayAgain(false);

    if (fullReset) {
      setId(null);
      setWhitePlayer(null);
      setBlackPlayer(null);
      setRoom(null);
      setPlayer(null);
    }
  }, []);

  // const resetTimers = useCallback(() => {
  //   clearInterval(blackPlayerTimer);
  //   clearInterval(whitePlayerTimer);
  //   setBlackPlayerTimer(null);
  //   setWhitePlayerTimer(null);
  // }, [blackPlayerTimer, whitePlayerTimer]);

  useEffect(() => {
    if (surrender) {
      if (surrender === 'white') {
        let obj = {winner: blackPlayer, reason: `${whitePlayer} surrendered the game`}
        setGameOver(obj);
        socket.emit('gameOver', {gameOver: obj});
      } else if (surrender === 'black') {
        let obj = {winner: whitePlayer, reason: `${blackPlayer} surrendered the game`}
        setGameOver(obj);
        socket.emit('gameOver', {gameOver: obj});
      }
    }
  }, [surrender]);

  const selectFigure = (field) => {
    let PLAYER = player;
    if (!field) {
      return;
    }

    if (!selectedFigure) {
      if (!field.figure) {
        return;
      }

      if (field?.figure?.player !== PLAYER) {
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

        let obj = {}

        if (newTable) {
          setTable(newTable);
          obj.table = newTable;
          try {
            const CHECK = checkIfCheck(newTable);
            if (CHECK) {
              obj.check = CHECK;
              setCheck(CHECK);
            } else {
              setCheck(null);
            }
          } catch(err) {
            console.log('Check error: ', err);
          }
          
        }

        if (removedFigure) {
          obj.removedFigure = removedFigure;
          if (removedFigure.player === 'white') {
            setWhitePlayerRemovedFigures(prev => [...prev, removedFigure]);
          } else if (removedFigure.player === 'black') {
            setBlackPlayerRemovedFigures(prev => [...prev, removedFigure]);
          }
        }
        if (move) {
          obj.move = move;
          setMovesHistory(prev => [...prev, move])
        }
        setSelectedFigure(null);
        setAvailableMoves(null);
        setNumberOfMoves(prev => prev+1);

        if (gameOver) {
          let GO;
          if (gameOver.winner === 'white') {
            GO = {};
            GO.winner = whitePlayer;
            GO.reason = gameOver.reason.replace('Black player', blackPlayer);
          } else if (gameOver.winner === 'black') {
            GO = {};
            GO.winner = blackPlayer;
            GO.reason = gameOver.reason.replace('White player', whitePlayer);
          }
          setGameOver(GO);
          socket.emit('gameOver', {gameOver: GO});
          return;
        }

        if (selectFigureToSave) {
          resetIntervals();
          setShouldSelectFigureToSave(selectFigureToSave);
          obj.selectFigureToSave = selectFigureToSave;
        }

        if (turn === 'white') {
          obj.turn = 'black'
          setTurn('black');
          if (!gameStart) {
            obj.gameStart = true;
            setGameStart(true);
          }
        } else if (turn === 'black') {
          obj.turn = 'white';
          setTurn('white');
          if (!gameStart) {
            obj.gameStart = true;
            setGameStart(true);
          }
        }
        socket.emit('madeMove', obj);
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
      resetIntervals();
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
        resetIntervals();
        // setWhitePlayerTimer(setInterval(() => {setWhitePlayerTime(prev => prev - 1)}, 1000));
        createWhitePlayerTimer();
        return () => {resetIntervals()}
      } else if (turn === 'black') {
        if (timerType === '3+2') {
            setWhitePlayerTime(prev => prev + 2);
        } else if (timerType === '5+3') {
            setWhitePlayerTime(prev => prev + 3);
        }
        resetIntervals();
        // setBlackPlayerTimer(setInterval(() => {setBlackPlayerTime(prev => prev - 1)}, 1000));
        createBlackPlayerTimer();
        return () => {resetIntervals()}
      }
    }
    
  }, [turn, gameStart, timerType, shouldSelectFigureToSave]);

  const saveFigure = (figure) => {
    if (!shouldSelectFigureToSave) {
      return;
    }
    const {player, id} = shouldSelectFigureToSave;
    let obj = {}
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
    obj.table = newTable;
    let CHECK = checkIfCheck(newTable);
    obj.check = CHECK;
    if (!CHECK) {
      setCheck(null);
    } else {
      setCheck(CHECK);
    }
    setTable(newTable);
    setShouldSelectFigureToSave(null);
    socket.emit('figureSaved', obj);
  }

  const changeTimerType = (type) => {
    if (gameStart) {
      return;
    }
    setTimerType(type);
    socket.emit('timerType', {type});
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

  const handleSurrender = () => {
    setSurrender(player);
  }

  const handleDraw = () => {
    let PLAYER = player;
    if (player !== turn) {
      return;
    }
    resetIntervals();
    setOfferedDraw(PLAYER);
    socket.emit('drawOffered', {player: PLAYER});
  }

  const handleRejectDraw = () => {
    resetIntervals();
    if (turn === 'white') {
      // setWhitePlayerTimer(setInterval(() => {setWhitePlayerTime(prev => prev - 1)}, 1000));
      createWhitePlayerTimer();
    } else if (turn === 'black') {
      // setBlackPlayerTimer(setInterval(() => {setBlackPlayerTime(prev => prev - 1)}, 1000));
      createBlackPlayerTimer();
    }
    setDrawRejected({player: offeredDraw});
    setDraw(false);
    setOfferedDraw(null);
    socket.emit('rejectDraw', {player: offeredDraw});
  }

  const handleAcceptDraw = () => {
    setDrawRejected(null);
    setOfferedDraw(false);
    setDraw(true);
    socket.emit('acceptDraw', {draw: true});
  }

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!createNameInput || createNameInput === '' || !createRoomInput || createRoomInput === '' || createNameInput.trim() === '' || createRoomInput.trim() === '') {
      setErr('Name and room are required!');
      return;
    }
    socket.emit('createRoom', {name: createNameInput, room: createRoomInput});
    setCreateNameInput('');
    setCreateRoomInput('');
    return;
  }

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinNameInput || joinNameInput === '' || !joinRoomInput || joinRoomInput === '' || joinNameInput.trim() === '' || joinRoomInput.trim() === '') {
      setErr('Name and room are required!');
      return;
    }
    socket.emit('joinRoom', {name: joinNameInput, room: joinRoomInput});
    setJoinNameInput('');
    setJoinRoomInput('');
    return;
  }

  const handleCreateNameInputChange = (e) => {
    let value = e.target.value.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9 ]/g, '');
    setCreateNameInput(value);
  }
  const handleCreateRoomInputChange = (e) => {
    let value = e.target.value.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9 ]/g, '');
    setCreateRoomInput(value);
  }
  const handleJoinNameInputChange = (e) => {
    let value = e.target.value.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9 ]/g, '');
    setJoinNameInput(value);
  }
  const handleJoinRoomInputChange = (e) => {
    let value = e.target.value.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9 ]/g, '');
    setJoinRoomInput(value);
  }

  const handlePlayAgain = () => {
    setPlayAgain(true);
    socket.emit('playAgain', {playAgain: true});
  }

  if (!player && !whitePlayer && !blackPlayer && !room) {
    return (<>
      <div className='appContainerWithImage'>
        {message && <Modal type={'message'} title={message.title} message={message.message} />}
        {err && <Modal type={'message'} title='Error!' message={err} onOK={() => setErr(null)} />}
        <div className='appFormContainer'>
          <form onSubmit={handleCreateRoom} className='createRoomForm'>
            <h2>Create Room</h2>
            <input type='text' value={createNameInput} onChange={handleCreateNameInputChange} placeholder='Your Name' />
            <input type='text' value={createRoomInput} onChange={handleCreateRoomInputChange} placeholder='Room Name' />
            <button disabled={!createNameInput || createNameInput === '' || createNameInput.trim() === '' || !createRoomInput || createRoomInput === '' || createRoomInput.trim() === ''} type='submit'>Create</button>
          </form>

          <form onSubmit={handleJoinRoom} className='joinRoomForm'>
            <h2>Join Room</h2>
            <input type='text' value={joinNameInput} onChange={handleJoinNameInputChange} placeholder='Your Name' />
            <input type='text' value={joinRoomInput} onChange={handleJoinRoomInputChange}
            placeholder='Room Name' />
            <button disabled={!joinNameInput || joinNameInput === '' || joinNameInput.trim() === '' || !joinRoomInput || joinRoomInput === '' || joinRoomInput.trim() === ''} type='submit'>Join</button>
          </form>
        </div>
      </div>
    </>)
  } 
  
  if (whitePlayer && room && !blackPlayer) {
    return (<>
    <div className='appContainerWithImage'>
      {message && <Modal type={'message'} title={message.title} message={message.message} />}
      {err && <Modal type={'message'} title='Error!' message={err} onOK={() => setErr(null)} />}
        <div className='waitingForOtherPlayer'>
          <h1>Invite a friend to join your room!</h1>
          <h2>Room name:</h2>
          <h2>{room}</h2>
        </div>
      </div>
    </>)
  }

  return (
    <>
      <div className='appContainer'>
        {message && <Modal type={'message'} title={message.title} message={message.message} />}
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
          <button onClick={() => setTableColor({black: '#8B008B', white: '#FFD1FF'})}>
            <span style={{backgroundColor: '#FFD1FF'}}></span>
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
        {offeredDraw && <Modal type={'drawOffer'} player={player} playerOfferedDraw={offeredDraw} whitePlayer={whitePlayer} blackPlayer={blackPlayer} onNO={handleRejectDraw} onYES={handleAcceptDraw} />}
        {gameOver && <Modal onShowTable={() => setShowTable(true)} onOK={handlePlayAgain} type={'gameOver'} winner={gameOver.winner} numOfMoves={numberOfMoves}>
        {movesHistory.length === 0 
          ? <p>No moves were made!</p>
          :<ul>
            {movesHistory.map((move, i) => <li key={i}>{i+1}. {move}</li>)}
          </ul>}
        <p style={{textAlign: 'center', color: 'red', fontSize: 16}}>{gameOver.reason}</p>
        </Modal>}
        {err && <Modal type={'message'} title='Error!' message={err} onOK={() => setErr(null)} />}
        {drawRejected && <Modal type={'message'} title='Draw Rejected!' message={drawRejected.player === 'white' ? player === 'black' ? 'You rejected draw offer! The game continues.' : `${blackPlayer} rejected your draw offer! The game continues` : player === 'white' ? 'You rejected draw offer! The game continues.' : `${whitePlayer} rejected your draw offer! The game continues`} onOK={() => setDrawRejected(null)} />}
        {draw && <Modal onShowTable={() => setShowTable(true)} type={'draw'} onOK={handlePlayAgain} numOfMoves={numberOfMoves}>
        {movesHistory.length === 0 
          ? <p>No moves were made!</p>
          :<ul>
            {movesHistory.map((move, i) => <li key={i}>{i+1}. {move}</li>)}
          </ul>}
          <p style={{textAlign: 'center', color: 'red', fontSize: 16}}>Players agreed to a draw!</p>
        </Modal>}
        {staleMate && <Modal onShowTable={() => setShowTable(true)} type={'stalemate'} onOK={handlePlayAgain} numOfMoves={numberOfMoves}>
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
        {shouldSelectFigureToSave && <Modal type='select' player={player} shouldSelectFigureToSave={shouldSelectFigureToSave}>
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
              <h5>{whitePlayer}:</h5>
              <p>{whiteMinutes} : {whiteSeconds}</p>
            </div>
            <div className='blackPlayerTimer'>
              <h5>{blackPlayer}:</h5>
              <p>{blackMinutes} : {blackSeconds}</p>
            </div>
        </div>}
        {(w && w >= 900) && <div className='surrenderButton'>
          <button disabled={!gameStart} onClick={handleSurrender}>Surrender</button>
        </div>}
        {(w && w >= 900) && <div className='offerDraw'>
          <button disabled={!gameStart || (player !== turn)} onClick={handleDraw}>Offer Draw</button>
        </div>}
        {w && w <= 900 && <div className='settingsContainer'>
          <div className='miniTimerDiv'>
            <div>{whitePlayer}: <span>{whiteMinutes}</span> : <span>{whiteSeconds}</span>
            </div>
            <div>{blackPlayer}: <span>{blackMinutes}</span> : <span>{blackSeconds}</span>
            </div>
          </div>
          <div className='iconsDiv'>
            <div onClick={() => setShowSettings(true)} id='settings'><img src={settingsPic} alt='settings pic' /></div>
            <div id='surrender'><button disabled={!gameStart} onClick={handleSurrender}><img src={surrenderPic} alt='surrender pic' /></button></div>
            <div id='offerDraw'><button disabled={!gameStart} onClick={handleDraw}><img src={offerDrawPic} alt='offer draw pic' /></button></div>
          </div>
        </div>}
        {showTable && <Modal type={'showTable'} onOK={() => setShowTable(false)}>
        <div className='tableContainer'>{table.map((field, i) => <div 
          key={field.id} 
          className={`${field.className} ${getStylesForFieldsWhenNotSelected_endTable(field)}`} 
          style={tableColor && {backgroundColor: `${field.className === 'white' ? tableColor.white : tableColor.black}`}}
        >
          <div className='tableFieldIdentifier'>{field.id}</div>
          <div className='tableIconContainer'>{field.figure && <Figure figure={field.figure.figure} player={field.figure.player} check={check && check === field.figure.player && field.figure.figure === 'king' ? true : false} />}</div>
        </div>)}</div>
        </Modal>}
        <div className='tableContainer'>{table.map((field, i) => <div 
          key={field.id} 
          className={`${field.className} ${getStylesForFieldsWhenNotSelected(selectedFigure, turn, field, player)}`} 
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
