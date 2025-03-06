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
		<div className="game-container min-h-screen bg-[#faf8f0] p-4 flex flex-col items-center min-w-screen">
			{/* 头部区域 */}
			<header className="header w-full max-w-[500px] mb-4 md:mb-6">
				{/* PC布局（md以上） */}
				<div className="hidden md:flex justify-between items-center">
					{/* 标题 */}
					<h1 className="text-[#726554] text-4xl md:text-5xl font-bold font-[Frizon]">2048</h1>
					{/* 分数区域 */}
					<div className="middle flex items-center gap-4 text-[#75695a]">
						{/* 当前分数 */}
						<div className="score middle-box inline-block bg-[#eae7d9] border-2 border-[#eae7d9] rounded-xl min-w-[75px] px-3 py-1 text-center">
							<div className="score-title leading-none text-s font-medium">Score</div>
							<div className="score-number leading-none  text-xl font-black mt-1">{score}</div>
						</div>

						{/* 最佳分数 */}
						<div className="best middle-box inline-block border-2 border-[#eae7d9] rounded-xl min-w-[75px] px-3 py-1 text-center">
							<div className="score-title leading-none  text-s font-medium">Best</div>
							<div className="score-number leading-none text-xl font-black mt-1">{score > bestScore ? score : bestScore}</div>
						</div>
					</div>
					{/* 重启按钮 */}
					<button
						onClick={restart}
						className="restart-btn white bg-[#998b7a] flex items-center whitespace-nowrap rounded-lg text-base disabled:opacity-50 text-white px-4 h-10"
					>
						New Game
					</button>
				</div>

				{/* 移动端布局（md以下） */}
				<div className="md:hidden flex flex-col items-center gap-3">
					<div className="w-full flex justify-between">
						<h1 className="text-[#726554] text-4xl font-bold font-[Frizon]">2048</h1>
						<button className="restart-btn text-[#726554] w-6">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 -960 960 960">
								<path d="M480-160q-134 0-227-93t-93-227 93-227 227-93q69 0 132 28.5T720-690v-70q0-17 11.5-28.5T760-800t28.5 11.5T800-760v200q0 17-11.5 28.5T760-520H560q-17 0-28.5-11.5T520-560t11.5-28.5T560-600h128q-32-56-87.5-88T480-720q-100 0-170 70t-70 170 70 170 170 70q68 0 124.5-34.5T692-367q8-14 22.5-19.5t29.5-.5q16 5 23 21t-1 30q-41 80-117 128t-169 48"></path>
							</svg>
						</button>
					</div>
					{/* 分数水平排列容器 */}
					<div className="w-full flex items-center gap-2">
						<div className="score middle-box w-full flex justify-between py-2 px-4 rounded-xl text-[#75695a] bg-[#eae7d9] border-2 border-[#eae7d9]">
							<div className="font-[Boisu]">SCORE</div>
							<div className="font-bold">{score}</div>
						</div>
						<div className="best middle-box w-full flex justify-between py-2 px-4 rounded-xl text-[#75695a] border-2 border-[#eae7d9]">
							<div className="font-[Boisu]">BEST</div>
							<div className="font-bold">{bestScore}</div>
						</div>
					</div>
				</div>
			</header>

			{/* 游戏网格区域 */}
			<div
				className={`grid-container bg-[#99897b] rounded-xl p-2.5 relative  max-w-[600px] font-[Frizon]
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
