export const getFigures = (player) => {
    let arr = [];
    // arr.push({player, figure: 'pawn'});
    arr.push({player, figure: 'rook'});
    arr.push({player, figure: 'knight'});
    arr.push({player, figure: 'bishop'});
    arr.push({player, figure: 'queen'});
    return arr;
}

export const getTable = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

    let table = []

    numbers.reverse().forEach(number => {
        letters.forEach(letter => {
            let obj = {letter, number};

            obj.id = `${letter}${number}`;

            if (letter === 'A') {
                number % 2 === 0 ? obj.className = 'black' : obj.className = 'white'
            } else if (letter === 'B') {
                number % 2 === 0 ? obj.className = 'white' : obj.className = 'black'
            } else if (letter === 'C') {
                number % 2 === 0 ? obj.className = 'black' : obj.className = 'white'
            } else if (letter === 'D') {
                number % 2 === 0 ? obj.className = 'white' : obj.className = 'black'
            } else if (letter === 'E') {
                number % 2 === 0 ? obj.className = 'black' : obj.className = 'white'
            } else if (letter === 'F') {
                number % 2 === 0 ? obj.className = 'white' : obj.className = 'black'
            } else if (letter === 'G') {
                number % 2 === 0 ? obj.className = 'black' : obj.className = 'white'
            } else if (letter === 'H') {
                number % 2 === 0 ? obj.className = 'white' : obj.className = 'black'
            }

            if (number === 2) {
                obj.figure = {
                    player: 'white',
                    figure: 'pawn'
                }
            } else if (number === 1) {
                if (letter === 'A' || letter === 'H') {
                    obj.figure = {
                        player: 'white',
                        figure: 'rook'
                    }
                } else if (letter === 'B' || letter === 'G') {
                    obj.figure = {
                        player: 'white',
                        figure: 'knight'
                    }
                } else if (letter === 'C' || letter === 'F') {
                    obj.figure = {
                        player: 'white',
                        figure: 'bishop'
                    }
                } else if (letter === 'D') {
                    obj.figure = {
                        player: 'white',
                        figure: 'queen'
                    }
                } else if (letter === 'E') {
                    obj.figure = {
                        player: 'white',
                        figure: 'king',
                        underChess: false
                    }
                }
            } else if (number === 7) {
                obj.figure = {
                    player: 'black',
                    figure: 'pawn'
                }
            } else if (number === 8) {
                if (letter === 'A' || letter === 'H') {
                    obj.figure = {
                        player: 'black',
                        figure: 'rook'
                    }
                } else if (letter === 'B' || letter === 'G') {
                    obj.figure = {
                        player: 'black',
                        figure: 'knight'
                    }
                } else if (letter === 'C' || letter === 'F') {
                    obj.figure = {
                        player: 'black',
                        figure: 'bishop'
                    }
                } else if (letter === 'D') {
                    obj.figure = {
                        player: 'black',
                        figure: 'queen'
                    }
                } else if (letter === 'E') {
                    obj.figure = {
                        player: 'black',
                        figure: 'king',
                        underChess: false
                    }
                }
            }

            table.push(obj);
        });
    });

    return table;
}

export  const getStylesForFieldsWhenNotSelected = (selectedFigure, turn, field, player) => {
    if (selectedFigure || !field.figure) {
      return '';
    }
    if (field.figure.player === 'white') {
        if (player === 'black') {
            return 'cannot-select';
        }
      if (turn === 'white') {
        return 'can-select';
      } else {
        return 'cannot-select';
      }
    } else if (field.figure.player === 'black') {
        if (player === 'white') {
            return 'cannot-select';
        }
      if (turn === 'black') {
        return 'can-select';
      } else {
        return 'cannot-select';
      }
    }
}

export  const getStylesForFieldsWhenNotSelected_endTable = (field) => {
    if (!field.figure) {
        return '';
    } else {
        return 'cannot-select';
    }
}

export const getStylesForFieldsWhenSelected = (selectedFigure, field, availableMoves) => {
    if (!selectedFigure) {
        return 'not-visible';
    }
    if (selectedFigure === field) {
        return 'selected-field can-select';
    }
    if (!availableMoves || availableMoves.length === 0) {
        return 'not-available-field cannot-select';
    }
    if (availableMoves && availableMoves.length > 0 ) {
        if (availableMoves.includes(field.id)) {
            return 'available-field can-select';
        } else {
            return 'not-available-field cannot-select';
        }
    }
}

// String.fromCharCode(x); -> get char from code
// String.charCodeAt(x); -> get code from char

// ASCII :
// A => 65
// H => 72

export const getAvailableMoves = (table, field, recursion = false, initialRun = false) => {
    if (!table || !field) {
        return;
    }
    const {player, figure} = field.figure;
    const {letter, number} = field;
    const position = field.id;
    const letterCode = letter.charCodeAt(0);

    let availableMoves = [];

    const takenByTeam = [];
    const takenByOpponent = [];

    const attackingFigures = [];

    table.forEach(tableField => {
        if (tableField.figure) {
            if (tableField.figure.player === player) {
                takenByTeam.push(tableField.id);
            } else {
                takenByOpponent.push(tableField.id);
                attackingFigures.push(tableField);
            }
        }
    });


    if (figure === 'pawn') {
        if (player === 'white') {
            if (number !== 8 && letter !== 'H' && takenByOpponent.includes(`${String.fromCharCode(letterCode+1)}${number+1}`)) {
                availableMoves.push(`${String.fromCharCode(letterCode+1)}${number+1}`);
            }
            if (number !== 8 && letter !== 'A' && takenByOpponent.includes(`${String.fromCharCode(letterCode-1)}${number+1}`)) {
                availableMoves.push(`${String.fromCharCode(letterCode-1)}${number+1}`);
            }
            if (recursion) {
                let moves = [];
                number !== 8 && letter !== 'H' && moves.push(`${String.fromCharCode(letterCode+1)}${number+1}`);
                number !== 8 && letter !== 'A' && moves.push(`${String.fromCharCode(letterCode-1)}${number+1}`);
                return moves;
            }
            if (takenByTeam.includes(`${letter}${number+1}`) || takenByOpponent.includes(`${letter}${number+1}`)) {
                return availableMoves;
            } else {
                if (number !== 8) {
                    availableMoves.push(`${letter}${number+1}`);
                }
                if (number === 2) {
                    if (takenByTeam.includes(`${letter}${number+2}`) || takenByOpponent.includes(`${letter}${number+2}`)) {
                        return availableMoves;
                    } else {
                        availableMoves.push(`${letter}${number+2}`);
                    }
                }
            }
        } else if (player === 'black') {
            if (number !== 1 && letter !== 'H' && takenByOpponent.includes(`${String.fromCharCode(letterCode+1)}${number-1}`)) {
                availableMoves.push(`${String.fromCharCode(letterCode+1)}${number-1}`);
            }
            if (number !== 1 && letter !== 'A' && takenByOpponent.includes(`${String.fromCharCode(letterCode-1)}${number-1}`)) {
                availableMoves.push(`${String.fromCharCode(letterCode-1)}${number-1}`);
            }
            if (recursion) {
                let moves = [];
                number !== 1 && letter !== 'H' && moves.push(`${String.fromCharCode(letterCode+1)}${number-1}`);
                number !== 1 && letter !== 'A' && moves.push(`${String.fromCharCode(letterCode-1)}${number-1}`);
                return moves;
            }
            if (takenByTeam.includes(`${letter}${number-1}`) || takenByOpponent.includes(`${letter}${number-1}`)) {
                return availableMoves;
            } else {
                if (number !== 1) {
                    availableMoves.push(`${letter}${number-1}`);
                }
                if (number === 7) {
                    if (takenByTeam.includes(`${letter}${number-2}`) || takenByOpponent.includes(`${letter}${number-2}`)) {
                        return availableMoves;
                    } else {
                        availableMoves.push(`${letter}${number-2}`);
                    }
                }
            }
        }
    } else if (figure === 'rook') {
        if (number !== 8) {
            for (let i = number+1; i < 9; i++) {
                if (takenByTeam.includes(`${letter}${i}`)) {
                    break;
                } else {
                    availableMoves.push(`${letter}${i}`)
                }
                if (takenByOpponent.includes(`${letter}${i}`)) {
                    availableMoves.push(`${letter}${i}`);
                    break;
                }
            }
        }

        if (number !== 1) {
            for (let i = number-1; i > 0; i--) {
                if (takenByTeam.includes(`${letter}${i}`)) {
                    break;
                } else {
                    availableMoves.push(`${letter}${i}`)
                }
                if (takenByOpponent.includes(`${letter}${i}`)) {
                    availableMoves.push(`${letter}${i}`);
                    break;
                }
            }
        }
        
        if (letter !== 'H') {
            for (let i = letterCode+1; i < 73; i++) {
                if (takenByTeam.includes(`${String.fromCharCode(i)}${number}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(i)}${number}`)
                }
                if (takenByOpponent.includes(`${String.fromCharCode(i)}${number}`)) {
                    availableMoves.push(`${String.fromCharCode(i)}${number}`);
                    break;
                }
            }
        }
        
        if (letter !== 'A') {
            for (let i = letterCode-1; i > 64; i--) {
                if (takenByTeam.includes(`${String.fromCharCode(i)}${number}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(i)}${number}`)
                }
                if (takenByOpponent.includes(`${String.fromCharCode(i)}${number}`)) {
                    availableMoves.push(`${String.fromCharCode(i)}${number}`);
                    break;
                }
            }
        }
        
        
    } else if (figure === 'knight') {
        let availableJumps = [];
        if (!['G', 'H'].includes(letter)) {
            if (number !== 8) {
                availableJumps.push(`${String.fromCharCode(letterCode+2)}${number+1}`);
            }
            if (number !== 1) {
                availableJumps.push(`${String.fromCharCode(letterCode+2)}${number-1}`);
            }
        }
        if (!['A', 'B'].includes(letter)) {
            if (number !== 8) {
                availableJumps.push(`${String.fromCharCode(letterCode-2)}${number+1}`);
            }
            if (number !== 1) {
                availableJumps.push(`${String.fromCharCode(letterCode-2)}${number-1}`);
            }
        }
        if (![8, 7].includes(number)) {
            if (letter !== 'H') {
                availableJumps.push(`${String.fromCharCode(letterCode+1)}${number+2}`);
            }
            if (letter !== 'A') {
                availableJumps.push(`${String.fromCharCode(letterCode-1)}${number+2}`)
            }
        }
        if (![1,2].includes(number)) {
            if (letter !== 'H') {
                availableJumps.push(`${String.fromCharCode(letterCode+1)}${number-2}`);
            }
            if (letter !== 'A') {
                availableJumps.push(`${String.fromCharCode(letterCode-1)}${number-2}`)
            }
        }

        availableJumps.forEach(jump => {
            if (!takenByTeam.includes(jump)) {
                availableMoves.push(jump);
            }
        });

    } else if (figure === 'bishop') {
        let code1 = letterCode+1;
        let num1 = number+1;
        if (letter !== 'H' && number !== 8) {
            while (num1 < 9 && code1 < 73 ) {
                if (takenByTeam.includes(`${String.fromCharCode(code1)}${num1}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(code1)}${num1}`);
                }

                if (takenByOpponent.includes(`${String.fromCharCode(code1)}${num1}`)) {
                    availableMoves.push(`${String.fromCharCode(code1)}${num1}`);
                    break;
                }
                code1 += 1;
                num1 += 1;
            }
        }

        let code2 = letterCode-1;
        let num2 = number-1;
        if (letter !== 'A' && number !== 1) {
            while (num2 > 0 && code2 > 64) {
                if (takenByTeam.includes(`${String.fromCharCode(code2)}${num2}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(code2)}${num2}`);
                }

                if (takenByOpponent.includes(`${String.fromCharCode(code2)}${num2}`)) {
                    availableMoves.push(`${String.fromCharCode(code2)}${num2}`);
                    break;
                }
                code2 -= 1;
                num2 -= 1;
            }
        }

        let code3 = letterCode+1;
        let num3 = number-1;
        if (letter !== 'H' && number !== 1) {
            while (num3 > 0 && code3 < 73 ) {
                if (takenByTeam.includes(`${String.fromCharCode(code3)}${num3}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(code3)}${num3}`);
                }

                if (takenByOpponent.includes(`${String.fromCharCode(code3)}${num3}`)) {
                    availableMoves.push(`${String.fromCharCode(code3)}${num3}`);
                    break;
                }
                code3 += 1;
                num3 -= 1;
            }
        }

        let code4 = letterCode-1;
        let num4 = number+1;
        if (letter !== 'A' && number !== 8) {
            while (num4 < 9 && code4 > 64) {
                if (takenByTeam.includes(`${String.fromCharCode(code4)}${num4}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(code4)}${num4}`);
                }

                if (takenByOpponent.includes(`${String.fromCharCode(code4)}${num4}`)) {
                    availableMoves.push(`${String.fromCharCode(code4)}${num4}`);
                    break;
                }
                code4 -= 1;
                num4 += 1;
            }
        }

        
    } else if (figure === 'queen') {
        if (number !== 8) {
            for (let i = number+1; i < 9; i++) {
                if (takenByTeam.includes(`${letter}${i}`)) {
                    break;
                } else {
                    availableMoves.push(`${letter}${i}`)
                }
                if (takenByOpponent.includes(`${letter}${i}`)) {
                    availableMoves.push(`${letter}${i}`);
                    break;
                }
            }
        }

        if (number !== 1) {
            for (let i = number-1; i > 0; i--) {
                if (takenByTeam.includes(`${letter}${i}`)) {
                    break;
                } else {
                    availableMoves.push(`${letter}${i}`)
                }
                if (takenByOpponent.includes(`${letter}${i}`)) {
                    availableMoves.push(`${letter}${i}`);
                    break;
                }
            }
        }
        
        if (letter !== 'H') {
            for (let i = letterCode+1; i < 73; i++) {
                if (takenByTeam.includes(`${String.fromCharCode(i)}${number}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(i)}${number}`)
                }
                if (takenByOpponent.includes(`${String.fromCharCode(i)}${number}`)) {
                    availableMoves.push(`${String.fromCharCode(i)}${number}`);
                    break;
                }
            }
        }
        
        if (letter !== 'A') {
            for (let i = letterCode-1; i > 64; i--) {
                if (takenByTeam.includes(`${String.fromCharCode(i)}${number}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(i)}${number}`)
                }
                if (takenByOpponent.includes(`${String.fromCharCode(i)}${number}`)) {
                    availableMoves.push(`${String.fromCharCode(i)}${number}`);
                    break;
                }
            }
        }

        let code1 = letterCode+1;
        let num1 = number+1;
        if (letter !== 'H' && number !== 8) {
            while (num1 < 9 && code1 < 73 ) {
                if (takenByTeam.includes(`${String.fromCharCode(code1)}${num1}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(code1)}${num1}`);
                }

                if (takenByOpponent.includes(`${String.fromCharCode(code1)}${num1}`)) {
                    availableMoves.push(`${String.fromCharCode(code1)}${num1}`);
                    break;
                }
                code1 += 1;
                num1 += 1;
            }
        }

        let code2 = letterCode-1;
        let num2 = number-1;
        if (letter !== 'A' && number !== 1) {
            while (num2 > 0 && code2 > 64) {
                if (takenByTeam.includes(`${String.fromCharCode(code2)}${num2}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(code2)}${num2}`);
                }

                if (takenByOpponent.includes(`${String.fromCharCode(code2)}${num2}`)) {
                    availableMoves.push(`${String.fromCharCode(code2)}${num2}`);
                    break;
                }
                code2 -= 1;
                num2 -= 1;
            }
        }

        let code3 = letterCode+1;
        let num3 = number-1;
        if (letter !== 'H' && number !== 1) {
            while (num3 > 0 && code3 < 73 ) {
                if (takenByTeam.includes(`${String.fromCharCode(code3)}${num3}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(code3)}${num3}`);
                }

                if (takenByOpponent.includes(`${String.fromCharCode(code3)}${num3}`)) {
                    availableMoves.push(`${String.fromCharCode(code3)}${num3}`);
                    break;
                }
                code3 += 1;
                num3 -= 1;
            }
        }

        let code4 = letterCode-1;
        let num4 = number+1;
        if (letter !== 'A' && number !== 8) {
            while (num4 < 9 && code4 > 64) {
                if (takenByTeam.includes(`${String.fromCharCode(code4)}${num4}`)) {
                    break;
                } else {
                    availableMoves.push(`${String.fromCharCode(code4)}${num4}`);
                }

                if (takenByOpponent.includes(`${String.fromCharCode(code4)}${num4}`)) {
                    availableMoves.push(`${String.fromCharCode(code4)}${num4}`);
                    break;
                }
                code4 -= 1;
                num4 += 1;
            }
        }
    } else if (figure === 'king') {
        let allPaths = [];

        if (letter !== 'H') {
            allPaths.push(`${String.fromCharCode(letterCode+1)}${number}`);
            if (number !== 8) {
                allPaths.push(`${String.fromCharCode(letterCode+1)}${number+1}`);
            }
            if (number !== 1) {
                allPaths.push(`${String.fromCharCode(letterCode+1)}${number-1}`);
            }
        }

        if (letter !== 'A') {
            allPaths.push(`${String.fromCharCode(letterCode-1)}${number}`);
            if (number !== 8) {
                allPaths.push(`${String.fromCharCode(letterCode-1)}${number+1}`);
            }
            if (number !== 1) {
                allPaths.push(`${String.fromCharCode(letterCode-1)}${number-1}`);
            }
        }

        if (number !== 8) {
            allPaths.push(`${String.fromCharCode(letterCode)}${number+1}`);
        }
        
        if (number !== 1) {
            allPaths.push(`${String.fromCharCode(letterCode)}${number-1}`);
        }

        if (initialRun) {
            if (player === 'white' && position === 'E1') {
                if (!(table.find(field => field.id === 'F1').figure) && !(table.find(field => field.id === 'G1').figure) && (table.find(field => field.id === 'H1').figure.player === 'white' && table.find(field => field.id === 'H1').figure.figure === 'rook')) {
                    allPaths.push('G1');
                } else if (!(table.find(field => field.id === 'D1').figure) && !(table.find(field => field.id === 'C1').figure) && !(table.find(field => field.id === 'B1').figure) && (table.find(field => field.id === 'A1').figure.player === 'white' && table.find(field => field.id === 'A1').figure.figure === 'rook')) {
                    allPaths.push('C1');
                }
            } else if (player === 'black' && position === 'E8') {
                if (!(table.find(field => field.id === 'F8').figure) && !(table.find(field => field.id === 'G8').figure) && (table.find(field => field.id === 'H8').figure.player === 'black' && table.find(field => field.id === 'H8').figure.figure === 'rook')) {
                    allPaths.push('G8');
                } else if (!(table.find(field => field.id === 'D8').figure) && !(table.find(field => field.id === 'C8').figure) && !(table.find(field => field.id === 'B8').figure) && (table.find(field => field.id === 'A8').figure.player === 'black' && table.find(field => field.id === 'A8').figure.figure === 'rook')) {
                    allPaths.push('C8');
                }
            }
        }
        

        let availablePaths = [];
        allPaths.forEach(path => {
            if (!takenByTeam.includes(path)) {
                availablePaths.push(path);
            }
        });
        
        if (recursion) {
            return availablePaths;
        }
        
        let unavailablePaths;

        for (let i = 0; i < attackingFigures.length; i++) {
            const attackingPaths = getAvailableMoves(table, attackingFigures[i], true);
            if (unavailablePaths) {
                unavailablePaths = [...new Set([...unavailablePaths, ...attackingPaths])];
                // unavailablePaths = unavailablePaths.concat(attackingPaths);
            } else {
                unavailablePaths = attackingPaths;
            }
        }

        if (unavailablePaths && unavailablePaths.length > 0) {
            availablePaths.forEach(path => {
                if (!unavailablePaths.includes(path)) {
                    availableMoves.push(path);
                }
            })
        } else {
            return availablePaths;
        }
    }

    return availableMoves.filter(move => move !== position);
}

export const checkIfSelfCheck = (table, player) => {
    let selfKingPosition;
    let opponentAttackingFigures = [];

    table.forEach(field => {
        if (field.figure) {
            if (field.figure.player === player && field.figure.figure === 'king') {
                selfKingPosition = field.id;
            }
            if (field.figure.player !== player) {
                opponentAttackingFigures.push(field)
            }
        }
    });

    let opponentAvailablePaths;
    for (let i = 0; i < opponentAttackingFigures.length; i++) {
        const attackingPaths = getAvailableMoves(table, opponentAttackingFigures[i], true, true);
        if (opponentAvailablePaths) {
            opponentAvailablePaths = [...new Set([...opponentAvailablePaths, ...attackingPaths])];
        } else {
            opponentAvailablePaths = attackingPaths;
        }
    }

    if (opponentAvailablePaths && opponentAvailablePaths.length > 0 && opponentAvailablePaths.includes(selfKingPosition)) {
        return true;
    } else {
        return false;
    }
}


export const getUpdatedTable = (table, previousField, newField) => {
    if (!table || table.length < 64 || !previousField || !previousField.figure || !newField) {
        return;
    }

    let error;

    let removedFigure;
    let gameOver;
    if (newField.figure) {
        if (previousField.figure.player !== newField.figure.player) {
            removedFigure = newField.figure;
            if (newField.figure.figure === 'king') {
                gameOver = {winner: previousField.figure.player, reason: `${removedFigure.player === 'white' ? 'White player made a rookie mistake by letting his king get captured!' : 'Black player made a rookie mistake by letting his king get captured!'}`}
            }
        } else {
            error = `Can't remove your own figure!!!`;
            return {error};
        }
    }


    let newTable;

    let selectFigureToSave;
    if (previousField.figure.player === 'white' && previousField.figure.figure === 'pawn' && previousField.number === 7 && newField.number === 8) {
        selectFigureToSave = {
            player: 'white',
            id: newField.id
        }
    } else if (previousField.figure.player === 'black' && previousField.figure.figure === 'pawn' && previousField.number === 2 && newField.number === 1) {
        selectFigureToSave = {
            player: 'black',
            id: newField.id
        }
    }

    if (previousField.figure.player === 'white' && previousField.figure.figure === 'king' && previousField.id === 'E1' && newField.id === 'G1') {
        newTable = table.map(tableField => {
            if (tableField.id === 'E1') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className
                }
                return obj;
            } else if (tableField.id === 'F1') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className,
                    figure: {player: 'white', figure: 'rook'}
                }
                return obj;
            } else if (tableField.id === 'G1') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className,
                    figure: {player: 'white', figure: 'king'}
                }
                return obj;
            } else if (tableField.id === 'H1') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className
                }
                return obj;
            } else {
                return tableField;
            }
        })
    } else if (previousField.figure.player === 'white' && previousField.figure.figure === 'king' && previousField.id === 'E1' && newField.id === 'C1') {
        newTable = table.map(tableField => {
            if (tableField.id === 'E1') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className
                }
                return obj;
            } else if (tableField.id === 'D1') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className,
                    figure: {player: 'white', figure: 'rook'}
                }
                return obj;
            } else if (tableField.id === 'C1') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className,
                    figure: {player: 'white', figure: 'king'}
                }
                return obj;
            } else if (tableField.id === 'A1') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className
                }
                return obj;
            } else {
                return tableField;
            }
        })
    } else if (previousField.figure.player === 'black' && previousField.figure.figure === 'king' && previousField.id === 'E8' && newField.id === 'G8') {
        newTable = table.map(tableField => {
            if (tableField.id === 'E8') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className
                }
                return obj;
            } else if (tableField.id === 'F8') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className,
                    figure: {player: 'black', figure: 'rook'}
                }
                return obj;
            } else if (tableField.id === 'G8') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className,
                    figure: {player: 'black', figure: 'king'}
                }
                return obj;
            } else if (tableField.id === 'H8') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className
                }
                return obj;
            } else {
                return tableField;
            }
        })
    } else if (previousField.figure.player === 'black' && previousField.figure.figure === 'king' && previousField.id === 'E8' && newField.id === 'C8') {
        newTable = table.map(tableField => {
            if (tableField.id === 'E8') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className
                }
                return obj;
            } else if (tableField.id === 'D8') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className,
                    figure: {player: 'black', figure: 'rook'}
                }
                return obj;
            } else if (tableField.id === 'C8') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className,
                    figure: {player: 'black', figure: 'king'}
                }
                return obj;
            } else if (tableField.id === 'A8') {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className
                }
                return obj;
            } else {
                return tableField;
            }
        })
    }

    if (!newTable) {
        newTable = table.map(tableField => {
            if (tableField.id === previousField.id) {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    className: tableField.className
                };
                return obj;
            } else if (tableField.id === newField.id) {
                let obj = {
                    letter: tableField.letter,
                    number: tableField.number,
                    id: tableField.id,
                    figure: previousField.figure,
                    className: tableField.className
                }
                return obj;
            } else {
                return tableField;
            }
        });
    }
    
    let move;
    if (previousField.figure.player === 'black') {
        if (!removedFigure) {
            move = `Black player moved his ${previousField.figure.figure} from ${previousField.id} to ${newField.id}`
        } else {
            move = `Black player captured ${removedFigure.figure} from white player, by moving his ${previousField.figure.figure} from ${previousField.id} to ${newField.id}`
        }
    } else {
        if (!removedFigure) {
            move = `White player moved his ${previousField.figure.figure} from ${previousField.id} to ${newField.id}`
        } else {
            move = `White player captured ${removedFigure.figure} from black player, by moving his ${previousField.figure.figure} from ${previousField.id} to ${newField.id}`
        }
    }

    // let player = previousField.figure.player;
    // let selfCheck = checkIfSelfCheck(newTable, player);
    let selfCheck = false;

    return {newTable, removedFigure, error, move, selectFigureToSave, gameOver, selfCheck};
}

export const checkIfStalemate = (table) => {
    let whiteFigures = [];
    let blackFigures = [];

    table.forEach(field => {
        if (field.figure) {
            if (field.figure.player === 'black') {
                blackFigures.push(field);
            } else if (field.figure.player === 'white') {
                whiteFigures.push(field);
            }
        }
    });

    if (whiteFigures && whiteFigures.length > 0) {
        let availableMoves = [];
        for (let i = 0; i < whiteFigures.length; i++) {
            let moves = getAvailableMoves(table, whiteFigures[i]);
            if (moves && moves.length > 0) {
                availableMoves = [...moves];
                break;
            }
        }
        if (availableMoves.length === 0) {
            return 'white';
        }
    }

    if (blackFigures && blackFigures.length > 0) {
        let availableMoves = [];
        for (let i = 0; i < blackFigures.length; i++) {
            let moves = getAvailableMoves(table, blackFigures[i]);
            if (moves && moves.length > 0) {
                availableMoves = [...moves];
                break;
            }
        }
        if (availableMoves.length === 0) {
            return 'black';
        }
    }

    return false;
}

export const checkIfCheck = (table) => {
    if (checkIfStalemate(table)) {
        return;
    }
    let whiteFigures = [];
    let blackFigures = [];

    let whiteKingPosition;
    let blackKingPosition;

    table.forEach(field => {
        if (field.figure) {
            if (field.figure.player === 'black') {
                blackFigures.push(field);
                if (field.figure.figure === 'king') {
                    blackKingPosition = field.id;
                }
            } else if (field.figure.player === 'white') {
                whiteFigures.push(field);
                if (field.figure.figure === 'king') {
                    whiteKingPosition = field.id;
                }
            }
        }
    });

    if (whiteFigures && whiteFigures.length > 0) {
        let whiteAvailableMoves = [];
        for (let i = 0; i < whiteFigures.length; i++) {
            let moves = getAvailableMoves(table, whiteFigures[i]);
            if (moves && moves.length > 0) {
                whiteAvailableMoves = [...new Set([...whiteAvailableMoves, ...moves])];
            }
        }
        if (whiteAvailableMoves.length > 0 && blackKingPosition && whiteAvailableMoves.includes(blackKingPosition)) {
            return 'black';
        }
    }

    if (blackFigures && blackFigures.length > 0) {
        let blackAvailableMoves = [];
        for (let i = 0; i < blackFigures.length; i++) {
            let moves = getAvailableMoves(table, blackFigures[i]);
            if (moves && moves.length > 0) {
                blackAvailableMoves = [...new Set([...blackAvailableMoves, ...moves])];
            }
        }
        if (blackAvailableMoves.length > 0 && blackAvailableMoves.includes(whiteKingPosition)) {
            return 'white';
        }
    }

    return false;
}

