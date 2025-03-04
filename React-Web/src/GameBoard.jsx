// Game2048.jsx
import { useState, useEffect, useCallback } from "react";
import "./GameBoard.css";

const GRID_SIZE = 4;
const INITIAL_TILES = 2;

export default function Game2048() {
	// const [board, setBoard] = useState(() =>
	//   Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(2))
	// );
	const [board, setBoard] = useState([
		[2, 2, 2, 2],
		[2, 2, 2, 2],
		[4, 2, 2, 2],
		[8, 2, 2, 2],
	]);
	const [score, setScore] = useState(0);
	const [gameOver, setGameOver] = useState(false);

	// 初始化游戏
	useEffect(() => {
		const newBoard = generateInitialBoard();
		setBoard(newBoard);
		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, []);

	// 生成初始棋盘（包含两个2）
	const generateInitialBoard = () => {
		const newBoard = board.map((row) => [...row]);
		for (let i = 0; i < INITIAL_TILES; i++) {
			addNewTile(newBoard);
		}
		return newBoard;
	};

	// 获取空单元格
	const getEmptyCells = (currentBoard) => {
		const emptyCells = [];
		currentBoard.forEach((row, i) => {
			row.forEach((cell, j) => {
				if (cell === 0) emptyCells.push([i, j]);
			});
		});
		return emptyCells;
	};

	// 添加新方块（函数式更新）
	const addNewTile = (currentBoard) => {
		const emptyCells = getEmptyCells(currentBoard);
		if (emptyCells.length === 0) return;

		const [x, y] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
		currentBoard[x][y] = Math.random() < 0.9 ? 2 : 4;
	};

	// 核心移动逻辑
	const moveTiles = (direction) => {
		setBoard((prevBoard) => {
			const newBoard = prevBoard.map((row) => [...row]);
			let moved = false;
			let mergedScore = 0;

			const processRow = (row) => {
				let filtered = row.filter((cell) => cell !== 0);

				// 合并相同数字
				for (let i = 0; i < filtered.length - 1; i++) {
					if (filtered[i] === filtered[i + 1]) {
						filtered[i] *= 2;
						mergedScore += filtered[i];
						filtered.splice(i + 1, 1);
						i--;
						moved = true;
					}
				}

				// 填充空位
				while (filtered.length < GRID_SIZE) filtered.push(0);
				return filtered;
			};

			switch (direction) {
				case "ArrowUp":
					for (let col = 0; col < GRID_SIZE; col++) {
						const column = newBoard.map((row) => row[col]);
						const processed = processRow(column);
						processed.forEach((val, row) => {
							if (newBoard[row][col] !== val) moved = true;
							newBoard[row][col] = val;
						});
					}
					break;
				case "ArrowDown":
					for (let col = 0; col < GRID_SIZE; col++) {
						const column = newBoard.map((row) => row[col]).reverse();
						const processed = processRow(column).reverse();
						processed.forEach((val, row) => {
							if (newBoard[row][col] !== val) moved = true;
							newBoard[row][col] = val;
						});
					}
					break;
				case "ArrowLeft":
					newBoard.forEach((row, i) => {
						const processed = processRow([...row]);
						if (row.join(",") !== processed.join(",")) moved = true;
						newBoard[i] = processed;
					});
					break;
				case "ArrowRight":
					newBoard.forEach((row, i) => {
						const reversed = [...row].reverse();
						const processed = processRow(reversed).reverse();
						if (row.join(",") !== processed.join(",")) moved = true;
						newBoard[i] = processed;
					});
					break;
			}

			if (moved) {
				addNewTile(newBoard);
				setScore((s) => s + mergedScore);
				checkGameOver(newBoard);
				return newBoard.map((row) => [...row]);
			}
			return prevBoard;
		});
	};

	// 游戏结束检测
	const checkGameOver = (currentBoard) => {
		const hasEmpty = currentBoard.some((row) => row.some((cell) => cell === 0));
		const canMerge = currentBoard.some((row, i) =>
			row.some((cell, j) => (j < GRID_SIZE - 1 && cell === row[j + 1]) || (i < GRID_SIZE - 1 && cell === currentBoard[i + 1][j]))
		);
		setGameOver(!hasEmpty && !canMerge);
	};

	// 键盘事件处理
	const handleKeyPress = useCallback(
		(e) => {
			if (gameOver) return;
			if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
				e.preventDefault();
				moveTiles(e.key);
			}
		},
		[moveTiles, gameOver]
	);

	// 重新开始
	const restart = () => {
		setBoard(generateInitialBoard());
		setScore(0);
		setGameOver(false);
	};

	return (
		<div className="game-container">
			<div className="header">
				<div className="score">Score: {score}</div>
				<button onClick={restart} className="restart-btn">
					New Game
				</button>
			</div>

			<div className="grid-container">
				{board.map((row, i) => (
					<div key={i} className="grid-row">
						{row.map((cell, j) => (
							<div key={`${i}-${j}-${cell}`} className={`tile tile-${cell} ${cell ? "tile-filled" : ""}`}>
								{cell || ""}
							</div>
						))}
					</div>
				))}
				{gameOver && <div className="game-over">Game Over!</div>}
			</div>
		</div>
	);
}
