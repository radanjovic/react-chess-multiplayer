import './Modal.css';

const Modal = ({children, type, closeModal, title, message, onOK, winner, numOfMoves, player, onNO, onYES, onShowTable, playerOfferedDraw, whitePlayer, blackPlayer, shouldSelectFigureToSave}) => {

    if (type === 'message') {
        return (
            <div className='backdrop'>
                <div className='modal'>
                    <h1>{title}</h1>
                    <hr />
                    <p>{message}</p>
                    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                        <button onClick={onOK}>OK</button>
                    </div>
                </div>
            </div>
          )
    } else if (type === 'select') {
        if (player === shouldSelectFigureToSave.player) {
            return (
            <div className='backdrop'>
                <div className='modal'>
                    <h1>Select Figure:</h1>
                    <hr />
                    <div className='modalSelectFigure'>
                        {children}
                    </div>
                </div>
            </div>
          )
        } else {
            return (
                <div className='backdrop'>
                <div className='modal'>
                    <h1>Selecting a Figure!</h1>
                    <hr />
                    <p>The other player is selecting a figure to replace his pawn. Please wait.</p>
                </div>
            </div>
            )
        }
        
    } else if (type === 'list') {
        return (
            <div className='backdrop'>
                <div className='modal'>
                    <h1>Moves History</h1>
                    <hr />
                    <div className='modalList'>
                        {children}
                    </div>
                    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                        <button onClick={onOK}>OK</button>
                    </div>
                </div>
            </div>
          )
    } else if (type === 'gameOver') {
        return (
            <div className='backdrop'>
                <div className='modal'>
                    <h1>Game Over !!!</h1>
                    <hr />
                    <h2>The winner is {winner}!</h2>
                    <h2>He won in {numOfMoves} moves!</h2>
                    <h2>Game History: </h2>
                    <div className='modalList'>
                        {children}
                    </div>
                    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                        <button style={{marginRight: 10}} onClick={onShowTable}>Show Final Table</button>
                        <button onClick={onOK}>Play Again</button>
                    </div>
                </div>
            </div>
        )
    } else if (type === 'drawOffer') {
        if (player === playerOfferedDraw) {
            return (
                <div className='backdrop'>
                    <div className='modal'>
                        <h1>Draw is being offered!</h1>
                        <hr />
                        <p>Waiting for answer on your draw offer!</p>
                    </div>
                </div>
            )
        } else {
            return (
                <div className='backdrop'>
                    <div className='modal'>
                        <h1>Draw is being offered!</h1>
                        <hr />
                        <p>{playerOfferedDraw === 'white' ? whitePlayer : blackPlayer} is offering you draw. Do you accept</p>
                        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 10}}>
                            <button className='rejectDraw' onClick={onNO}>NO</button>
                            <button className='acceptDraw' onClick={onYES}>YES</button>
                        </div>
                    </div>
                </div>
            )
        }
        
    } else if (type === 'draw') {
        return (<div className='backdrop'>
                <div className='modal'>
                    <h1>Game Over !!!</h1>
                    <hr />
                    <h2>Draw has been agreed!</h2>
                    <h2>Total number of moves: {numOfMoves}</h2>
                    <h2>Game History: </h2>
                    <div className='modalList'>
                        {children}
                    </div>
                    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                        <button style={{marginRight: 10}} onClick={onShowTable}>Show Final Table</button>
                        <button onClick={onOK}>Play Again</button>
                    </div>
                </div>
            </div>)
    } else if (type === 'settings') {
        return (<div className='backdrop' onClick={onOK}>
                <div className='modal' onClick={(e) => e.stopPropagation()}>
                    <h1>Settings</h1>
                    <hr />
                    {children}
                    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                        <button onClick={onOK}>Close</button>
                    </div>
                </div>
            </div>)
    } else if (type === 'stalemate') {
        return (<div className='backdrop'>
        <div className='modal'>
            <h1>Game Over !!!</h1>
            <hr />
            <h2>Stalemate !</h2>
            <h2>Total number of moves: {numOfMoves}</h2>
            <h2>Game History: </h2>
            <div className='modalList'>
                {children}
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                <button style={{marginRight: 10}} onClick={onShowTable}>Show Final Table</button>
                <button onClick={onOK}>Play Again</button>
            </div>
        </div>
    </div>)
    } else if (type === 'showTable') {
        return (
            <div className='backdrop'>
        <div className='modal'>
            <h1>Final Table</h1>
            <hr />
            {children}
            <br />
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                <button onClick={onOK}>Close</button>
            </div>
        </div>
    </div>
        )
    }
}

export default Modal