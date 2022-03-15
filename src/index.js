import { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Moves({moves, sort}) {
    const sortMoves = moves.slice()
    sortMoves.sort(sort)
    return <ol>{sortMoves}</ol>
}

function Square({value, active, onClick}) {
    return <button className={"square " + active} onClick={onClick}>{value}</button>
}

function Board({squares, activeSquare, winner, onClick}) {
    const items = (start = 0) =>
        Array.from({length: 3}, (x, i) => i + start).map((number) =>
            <Square
                key={number}
                value={squares[number]}
                onClick={() => onClick(number)}
                active={!winner && number === activeSquare|| winner && winner.includes(number) ? 'active' : ''}
            />
        )

    const content = [0, 3, 6].map((start) =>
        <div className="board-row" key={start}>
            {items(start)}
        </div>
    )

    return <div>{content}</div>
}

function Game() {
    const [stepNumber, setStepNumber] = useState(0)
    const [activeSquare, setActiveSquare] = useState(-1)
    const [xIsNext, setXIsNext] = useState(true)
    const [sortMovesAsc, setSortMovesAsc] = useState(true)
    const [history, setHistory] = useState([{
        squares: Array(9).fill(null),
    }])

    const handleClick = (i) => {
        const newHistory = history.slice(0, stepNumber + 1)
        const current = newHistory[newHistory.length - 1]
        const squares = current.squares.slice()
        if (calculateWinner(squares) || squares[i]) {
            return
        }
        squares[i] = xIsNext ? 'X' : 'O'

        setHistory(newHistory.concat([{
            squares: squares,
        }]))
        setStepNumber(newHistory.length)
        setActiveSquare(getActiveSquare(current, stepNumber, i))
        setXIsNext(!xIsNext)
    }

    const getActiveSquare = (current, stepNumber, activeSquare = null) => {
        const newHistory = history.slice(0, stepNumber + 1)
        if (newHistory.length === 1) {
            return activeSquare
        }
        if (newHistory.length === 2) {
            return activeSquare ?
                activeSquare :
                newHistory[1].squares.findIndex((item) => item !== null)
        }
        return activeSquare ?
            activeSquare :
            newHistory[stepNumber - 1].squares.findIndex((item, index) => item !== current.squares[index])
    }

    const getPosition = (current, stepNumber) => {
        let position = getActiveSquare(current, stepNumber)
        position = '(' + ((position / 3 + 1 ) | 0) + ',' + (position % 3 + 1) + ')'
        return position
    }

    const sortMoves = (a, b) => {
        if (sortMovesAsc) {
            return a.key - b.key
        }
        return  b.key - a.key
    }

    const jumpTo = (step) => {
        setStepNumber(step)
        setActiveSquare(getActiveSquare(history[step], step))
        setXIsNext((step % 2) === 0)
    }

    const current = history[stepNumber]
    const winner = calculateWinner(current.squares)
    let status

    if (winner) {
        status = 'Выиграл ' + current.squares[winner[0]]
    } else if(!current.squares.filter((item) => item === null).length) {
        status = 'Ничья'
    } else {
        status = 'Следующий ход: ' + (xIsNext ? 'X' : 'O')
    }

    const moves = history.map((step, move) => {
        const desc = move ?
            'Перейти к ходу #' + move + ' ' + getPosition(step, move):
            'К началу игры'
        return (
            <li key={move}>
                <button move={move} onClick={() => jumpTo(move)}>{desc}</button>
            </li>
        )
    })

    return (
        <div className="game">
            <div className="game-board">
                <Board
                    squares={current.squares}
                    activeSquare={activeSquare}
                    onClick={(i) => handleClick(i)}
                    winner={winner}
                />
            </div>
            <div className="game-info">
                <div className="status">{status}</div>
                <button onClick={() => setSortMovesAsc(!sortMovesAsc)}>Сортировать</button>
                <Moves
                    sort={sortMoves}
                    moves={moves}
                />
            </div>
        </div>
    )
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return lines[i];
        }
    }
    return null;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
)