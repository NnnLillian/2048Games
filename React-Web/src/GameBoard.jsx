// Game2048.jsx
import { useState, useEffect, useCallback } from "react";
import { decryptScore, encryptScore } from "./utils";
// import "./GameBoard.scss";

const GRID_SIZE = 4;
const INITIAL_TILES = 2;

export default function Game2048() {
	const [board, setBoard] = useState([]);
	const [score, setScore] = useState(0);
	const [bestScore, setBestScore] = useState(0);
	const [gameOver, setGameOver] = useState(false);

	// 初始化游戏
	useEffect(() => {
		const newBoard = generateInitialBoard();
		setBoard(newBoard);
		setBestScore(loadBestScore());
		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, []);

	useEffect(() => {
		if (score > bestScore) {
			const encrypted = encryptScore(score);
			localStorage.setItem("bestScore", encrypted);
		}
	}, [bestScore, score]);

	// 解密最佳分数
	const loadBestScore = () => {
		const encrypted = localStorage.getItem("bestScore");
		return encrypted ? decryptScore(encrypted) : 0;
	};

	// 生成初始棋盘（包含两个2/4）
	const generateInitialBoard = () => {
		const newBoard = Array(GRID_SIZE)
			.fill()
			.map(() => Array(GRID_SIZE).fill(0));
		for (let i = 0; i < INITIAL_TILES; i++) {
			addNewTile(newBoard);
		}
		return newBoard;
	};

	// 添加新方块（函数式更新）
	const addNewTile = useCallback((currentBoard) => {
		const emptyCells = [];
		// 获取空单元格
		currentBoard.forEach((row, i) => {
			row.forEach((cell, j) => {
				if (cell === 0) emptyCells.push([i, j]);
			});
		});

		if (emptyCells.length === 0) return;

		const [x, y] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
		currentBoard[x][y] = Math.random() < 0.9 ? 2 : 4;
	}, []);

	// 核心移动逻辑
	const moveTiles = useCallback((direction) => {
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
	}, []);

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
		<div className="game-container min-h-screen bg-[#faf8f0] p-5 flex flex-col items-center">
			{/* 头部区域 */}
			<div className="header flex justify-between w-full max-w-[600px] mb-5 items-center">
				{/* 标题 */}
				<div className="title text-[#726554] text-5xl font-bold font-[Frizon]">2048</div>

				{/* 分数区域 */}
				<div className="middle flex gap-4">
					{/* 当前分数 */}
					<div className="score middle-box bg-[#eae7d9] border-2 border-[#eae7d9] rounded-xl min-w-[75px] px-3 py-1 text-center">
						<div className="score-title text-[#75695a] text-xs font-medium">Score</div>
						<div className="score-number text-[#75695a] text-xl font-black">{score}</div>
					</div>

					{/* 最佳分数 */}
					<div className="best middle-box border-2 border-[#eae7d9] rounded-xl min-w-[75px] px-3 py-1 text-center">
						<div className="score-title text-[#75695a] text-xs font-medium">Best</div>
						<div className="score-number text-[#75695a] text-xl font-black">{score > bestScore ? score : bestScore}</div>
					</div>
				</div>

				{/* 重启按钮 */}
				<button
					onClick={restart}
					className="restart-btn bg-[#8f7a66] text-white rounded-xl px-4 py-2 text-lg font-medium
                hover:bg-[#7c6b5a] transition-colors duration-200"
				>
					New Game
				</button>
			</div>

			{/* 游戏网格区域 */}
			<div
				className={`grid-container bg-[#99897b] rounded-xl p-2.5 relative w-full max-w-[600px] 
                  ${gameOver ? "game-over" : ""}`}
			>
				{board.map((row, i) => (
					<div key={i} className="grid-row flex mb-2.5 last:mb-0">
						{row.map((cell, j) => (
							<div
								key={`${i}-${j}-${cell}`}
								className={`tile w-24 h-24 rounded-lg mr-2.5 last:mr-0 flex items-center justify-center
                       text-4xl font-bold text-[#726554] transition-all duration-150 shadow-inner
                       ${cell ? "bg-[#ede5db] shadow-[0_1px_3px_1px_rgba(0,0,0,0.1)]" : "bg-[#baad9a]"}
                       tile-${cell}`}
							>
								{cell || ""}
							</div>
						))}
					</div>
				))}

				{/* 游戏结束遮罩 */}
				{gameOver && (
					<div
						className="absolute inset-0 bg-[rgba(238,228,218,0.8)] flex items-center justify-center 
                     rounded-xl text-5xl font-bold text-[#776e65]"
					>
						Game Over
					</div>
				)}
			</div>
		</div>
	);
}
