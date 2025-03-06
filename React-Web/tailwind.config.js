// type {import('tailwindcss').Config}
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}", // 根据项目实际文件类型调整
	],
	theme: {
		extend: {
			// 自定义字体（根据你的设计需求）
			fontFamily: {
				frizon: ["Frizon", "Arial", "sans-serif"],
				boisu: ["Boisu"],
			},
			colors: {
				"game-container": "#faf8f0",
				"tile-base": "#baad9a",
				"tile-2": "#ede5db",
				"game-over": "rgba(238, 228, 218, 0.8)",
			},
			boxShadow: {
				tile: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
				"tile-filled": "0 1px 3px 1px rgba(0, 0, 0, 0.1)",
			},
		},
	},
	plugins: [],
};
