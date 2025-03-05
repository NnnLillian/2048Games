// 加密函数（存储时调用）
const encryptScore = (score) => {
  // 步骤1：添加随机盐值
  const salt = Math.random().toString(36).slice(2, 6);
  const rawString = `${salt}-${score}`;
  console.log("rawString", rawString);
  // 步骤2：Base64 编码
  const base64 = btoa(encodeURIComponent(rawString));
  console.log("base64", base64);
  // 步骤3：字符混淆（交换奇偶位）
  const mixedChars = base64.split('')
    .map((char, index) => 
      index % 2 === 0 ? base64[index + 1] || char : base64[index - 1]
    )
    .join('');
  
  return mixedChars;
};

// 解密函数（读取时调用）
const decryptScore = (encrypted) => {
  try {
    // 步骤1：还原字符顺序
    const restored = encrypted.split('')
      .map((char, index) => 
        index % 2 === 0 ? encrypted[index + 1] || char : encrypted[index - 1]
      )
      .join('');
    console.log("restored",restored)
    // 步骤2：Base64 解码
    const decodedString = decodeURIComponent(atob(restored));
    console.log("decodedString",decodedString)
    // 步骤3：提取真实分数
    const [_, score] = decodedString.split('-');
    console.log("score",score)
    return parseInt(score, 10) || 0;
  } catch (error) {
    // 防止篡改后报错
    console.log('Error decrypting score:', error);
    return 0;
  }
};
export { encryptScore, decryptScore };