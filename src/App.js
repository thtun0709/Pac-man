import React, { useState, useEffect } from 'react';
import './App.css';

const GRID_SIZE = 15;
const CELL_SIZE = 30;
const ENEMY_MOVE_INTERVAL = 300;

// 0: empty, 1: wall, 2: dot
const MAZE_1 = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,2,2,2,2,2,1,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,2,1,2,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MAZE_2 = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,2,1,2,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function generateMaze() {
  let maze = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(1));
  
  // Simple maze generation algorithm
  for (let y = 1; y < GRID_SIZE - 1; y += 2) {
    for (let x = 1; x < GRID_SIZE - 1; x += 2) {
      maze[y][x] = 0;
      if (x + 2 < GRID_SIZE - 1) {
        maze[y][x + 1] = Math.random() > 0.3 ? 0 : 1;
      }
      if (y + 2 < GRID_SIZE - 1) {
        maze[y + 1][x] = Math.random() > 0.3 ? 0 : 1;
      }
    }
  }

  // Add dots
  for (let y = 1; y < GRID_SIZE - 1; y++) {
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      if (maze[y][x] === 0 && Math.random() > 0.3) {
        maze[y][x] = 2;
      }
    }
  }

  return maze;
}

function App() {
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [enemyPositions, setEnemyPositions] = useState([
    { x: GRID_SIZE - 2, y: GRID_SIZE - 2 },
    { x: GRID_SIZE - 2, y: 1 }
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [maze, setMaze] = useState(MAZE_1);
  const [level, setLevel] = useState(1);
  const [totalDots, setTotalDots] = useState(0);
  const [chapter, setChapter] = useState(1);

  useEffect(() => {
    // Count total dots
    let dots = 0;
    for (let row of maze) {
      for (let cell of row) {
        if (cell === 2) dots++;
      }
    }
    setTotalDots(dots);
  }, [maze]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;
      const { key } = e;
      setPlayerPosition((prev) => {
        let newPos = { ...prev };
        if (key === 'ArrowUp' && prev.y > 0 && maze[prev.y - 1][prev.x] !== 1) newPos.y--;
        if (key === 'ArrowDown' && prev.y < GRID_SIZE - 1 && maze[prev.y + 1][prev.x] !== 1) newPos.y++;
        if (key === 'ArrowLeft' && prev.x > 0 && maze[prev.y][prev.x - 1] !== 1) newPos.x--;
        if (key === 'ArrowRight' && prev.x < GRID_SIZE - 1 && maze[prev.y][prev.x + 1] !== 1) newPos.x++;
        return newPos;
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, maze]);

  useEffect(() => {
    const moveEnemy = () => {
      if (gameOver) return;
      setEnemyPositions((prevPositions) => 
        prevPositions.map(enemy => {
          const possibleMoves = [
            { x: enemy.x - 1, y: enemy.y },
            { x: enemy.x + 1, y: enemy.y },
            { x: enemy.x, y: enemy.y - 1 },
            { x: enemy.x, y: enemy.y + 1 },
          ].filter(move => 
            move.x >= 0 && move.x < GRID_SIZE && 
            move.y >= 0 && move.y < GRID_SIZE && 
            maze[move.y][move.x] !== 1
          );
          
          if (possibleMoves.length > 0) {
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            return randomMove;
          }
          return enemy;
        })
      );
    };

    const enemyInterval = setInterval(moveEnemy, ENEMY_MOVE_INTERVAL);
    return () => clearInterval(enemyInterval);
  }, [playerPosition, gameOver, maze]);

  useEffect(() => {
    if (maze[playerPosition.y][playerPosition.x] === 2) {
      setScore((prev) => prev + 1);
      setMaze((prev) => {
        const newMaze = [...prev];
        newMaze[playerPosition.y][playerPosition.x] = 0;
        return newMaze;
      });

      // Check if all dots are collected
      if (score + 1 === totalDots) {
        if (chapter === 1) {
          // Complete chapter 1, move to chapter 2
          setChapter(2);
          setLevel(1);
          setMaze(MAZE_2);
          setPlayerPosition({ x: 1, y: 1 });
          setEnemyPositions([
            { x: GRID_SIZE - 2, y: GRID_SIZE - 2 },
            { x: GRID_SIZE - 2, y: 1 },
            { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }
          ]);
          // Keep the score for chapter 2
          setScore((prev) => prev);
        } else {
          // Complete a level within chapter 2
          setLevel((prev) => prev + 1);
          setMaze(generateMaze());
          setPlayerPosition({ x: 1, y: 1 });
          setEnemyPositions(prev => [
            ...prev,
            { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }
          ]);
          // Keep the score for the next level
          setScore((prev) => prev);
        }
      }
    }

    if (enemyPositions.some(enemy => enemy.x === playerPosition.x && enemy.y === playerPosition.y)) {
      setGameOver(true);
    }
  }, [playerPosition, enemyPositions, maze, score, totalDots, level, chapter]);

  const resetGame = () => {
    setPlayerPosition({ x: 1, y: 1 });
    setEnemyPositions([
      { x: GRID_SIZE - 2, y: GRID_SIZE - 2 },
      { x: GRID_SIZE - 2, y: 1 }
    ]);
    setScore(0);
    setGameOver(false);
    setMaze(MAZE_1);
    setLevel(1);
    setChapter(1);
  };

  return (
    <div className="App">
      <h1>Pac-Man của Dương Thanh Tùng </h1>
      <div className="game-board">
        {maze.map((row, y) => (
          <div key={y} className="row">
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`cell 
                  ${cell === 1 ? 'wall' : ''}
                  ${cell === 2 ? 'dot' : ''}
                  ${x === playerPosition.x && y === playerPosition.y ? 'player' : ''}
                  ${enemyPositions.some(enemy => enemy.x === x && enemy.y === y) ? 'enemy' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <p>Điểm: {score}</p>
      <p>Chương: {chapter}</p>
      <p>Màn: {level}</p>
      <p>Sài phím mũi tên nha :Đ</p>
      {gameOver && (
        <div>
          <h2>Non ác!</h2>
          <p>bạn đã đạt tới chương {chapter}, Màn {level}</p>
          <p>Điểm tổng kết: {score}</p>
          <button onClick={resetGame}>Thử lại</button>
        </div>
      )}
    </div>
  );
}

export default App;