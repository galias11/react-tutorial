import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {

  //Checks if the square is on the winning line to set className
  const squareType = props.winner ? "square winner" : "square";

  return (
    <button className={squareType} onClick={() => {props.onClick()}}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      maxWidth: props.maxWidth,
      maxHeight: props.maxHeight
    }
  }

  renderSquare(i) {

    return (
      <Square
        winner={this.props.winnerSquares.includes(i)}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {

    //Assigment is made in a reverse-like way...

    //First we declare a row array.
    let rows = [];

    //First loop: Loops through rows
    for(let i = 0; i < this.state.maxWidth; i++) {

      //Now we declare a square array per row.
      let rowSquares = [];

      //Second loop: Loops through columns
      for(let j = 0; j < this.state.maxHeight;  j++) {

        //Renders the square using square class and pushes it into square array
        let square = this.renderSquare(i * 3 + j);
        rowSquares.push(square);
      }

      //Pushes into row array a React div wit the desired class containing current row squares.
      rows.push(React.createElement("div", {className: "board-row"}, rowSquares));

    }

    //Finally we create the container react div containing rows array.
    let board = React.createElement("div", null, rows);

    //Returns the created board.
    return board;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),

        //Adds winning squares to the history (null)
        winnerSquares: Array(3).fill(null),
        position: null
      }],
      stepNumber: 0,
      xIsNext: true,
      descendingOrder: false
    };
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if(calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        position: calculatePosition(i)
      }]),
      stepNumber: history.length,
      xIsNext:  !this.state.xIsNext
    });
  }

  checkChanged() {

    //Changes descending order flag on the state.
    this.setState({
      descendingOrder: !this.state.descendingOrder
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    /*If there is a winner, the winning line is copied to a new variable,
    that is later passed to the board. */
    const winningSquares = winner ? winner.squares : Array(3).fill(null);

    const moves = history.map((step, move) => {
      let desc;
      let buttonClass;

      //This statement was changed to consider if descending order flag is active.
      if(!this.state.descendingOrder) {

        //Checks if current button must be bolder by comparing move with stepNumber
        buttonClass = move === this.state.stepNumber ? "current-step" : "";

        desc = move ?
        'Go to move #' + historyString(history, move) :
        'Go to game start';
        return (
          <li key={move}>
            <button className={buttonClass} onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
      } else {

        //Checks if current button must be bolder by comparing move with stepNumber
        buttonClass = (history.length - 1 - move) === this.state.stepNumber ? "current-step" : "";

        //If descending order flag is on, buttons are created on inverse order.
        desc = move < history.length - 1 ?
        'Go to move #' + historyString(history, (history.length - 1 - move)) :
        'Go to game start';
        return (
          <li key={move}>
            <button
              className={buttonClass}
              onClick={() => this.jumpTo(history.length - 1 - move)}>
              {desc}
            </button>
          </li>
        );
      }

    });


    //Implements checkbox input. onChange calls checkChanged method.
    const label = React.createElement("label", {htmlFor:"inverseCheck",
    name:"Inverse order!"}, "Descending order")
    const invert = <input id="inverseCheck" type="checkbox" onChange={() => {this.checkChanged()}}></input>;


    let status;

    if(winner) {
      status = "Winner: " + winner.winner;
    } else if(this.state.stepNumber === 9) {

      /*Adds a new condition to the status (if all squares al filled up, and
      there is no winner, draw is announced.)*/
      status = "Game ended in draw";
    } else {
      status = "Next player: " + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board

            //Passing props to border class.
            maxWidth="3"
            maxHeight="3"

            //Passes the winning line.
            winnerSquares={winningSquares}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{label}{invert}</div>
          <ol id="moveList">{moves}</ol>
        </div>
      </div>
    );
  }
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

  for(let line of lines) {
    const [a, b, c] = line;
    if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[b] === squares[c]) {

      //This function was modified to return both player and winning line.
      return {
        winner: squares[a],
        squares: line
      };
    }
  }
  return null;
}

function calculatePosition(i) {
  const positions = [
    {row: 1, col: 1},
    {row: 1, col: 2},
    {row: 1, col: 3},
    {row: 2, col: 1},
    {row: 2, col: 2},
    {row: 2, col: 3},
    {row: 3, col: 1},
    {row: 3, col: 2},
    {row: 3, col: 3},
  ];

  return positions[i];
}

function historyString(history, move) {
  let symbol = (move % 2 ? 'X' : 'O');
  return `${move} --> (row: ${history[move].position.row} - col: ${history[move].position.col} --> Symbol: ${symbol})`;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
