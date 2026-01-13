// 数独游戏类
class SudokuGame {
    // 难度等级常量
    static DIFFICULTY = {
        EASY: { name: '简单', removeCount: 35 },
        MEDIUM: { name: '中等', removeCount: 45 },
        HARD: { name: '困难', removeCount: 55 }
    };

    constructor() {
        this.board = [];
        this.solution = [];
        this.initialBoard = [];
        this.isSolved = false;
        this.difficulty = SudokuGame.DIFFICULTY.MEDIUM; // 默认中等难度
        this.initializeBoard();
    }

    // 设置难度等级
    setDifficulty(difficulty) {
        if (SudokuGame.DIFFICULTY[difficulty]) {
            this.difficulty = SudokuGame.DIFFICULTY[difficulty];
        } else {
            this.difficulty = SudokuGame.DIFFICULTY.MEDIUM; // 默认中等难度
        }
    }

    // 初始化空白数独板
    initializeBoard() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
    }

    // 生成数独游戏
    generateGame() {
        this.initializeBoard();
        this.solveBoard();
        this.copyBoard(this.solution, this.board);
        // 先移除数字，然后再将board复制到initialBoard中
        this.removeNumbers(this.difficulty.removeCount); // 根据难度等级移除数字
        this.copyBoard(this.board, this.initialBoard);
    }

    // 复制数独板
    copyBoard(source, target) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                target[i][j] = source[i][j];
            }
        }
    }

    // 移除数字生成游戏（确保唯一解）
    removeNumbers(count) {
        let removed = 0;
        const cells = [];
        
        // 创建所有单元格的列表并随机排序
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                cells.push({ row, col });
            }
        }
        
        // 随机打乱单元格顺序
        this.shuffleArray(cells);
        
        // 尝试移除每个单元格的数字
        for (const cell of cells) {
            if (removed >= count) break;
            
            const { row, col } = cell;
            if (this.board[row][col] !== 0) {
                // 保存原始值
                const originalValue = this.board[row][col];
                this.board[row][col] = 0;
                
                // 检查数独是否仍有唯一解
                if (this.countSolutions() === 1) {
                    removed++;
                } else {
                    // 恢复原始值
                    this.board[row][col] = originalValue;
                }
            }
        }
    }

    // 随机打乱数组（Fisher-Yates算法）
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 计算数独解的数量
    countSolutions() {
        let count = 0;
        const tempBoard = [];
        
        // 创建临时数独板副本
        for (let i = 0; i < 9; i++) {
            tempBoard[i] = [...this.board[i]];
        }
        
        // 辅助函数：递归计数解的数量
        const countHelper = (board) => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (this.isValidMove(board, row, col, num)) {
                                board[row][col] = num;
                                countHelper(board);
                                board[row][col] = 0;
                                
                                // 如果已经找到两个解，提前返回
                                if (count >= 2) {
                                    return;
                                }
                            }
                        }
                        return;
                    }
                }
            }
            count++;
        };
        
        countHelper(tempBoard);
        return count;
    }

    // 检查数字是否可以放在指定位置
    isValidMove(board, row, col, num) {
        // 检查行
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) return false;
        }

        // 检查列
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }

        // 检查3x3宫
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] === num) return false;
            }
        }

        return true;
    }

    // 解数独板
    solveBoard() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.solution[row][col] === 0) {
                    // 随机化数字顺序
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    this.shuffleArray(numbers);
                    
                    for (const num of numbers) {
                        if (this.isValidMove(this.solution, row, col, num)) {
                            this.solution[row][col] = num;
                            if (this.solveBoard()) {
                                return true;
                            }
                            this.solution[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // 检查当前板是否正确
    checkBoard() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellValue = this.board[row][col];
                if (cellValue === 0) {
                    return false;
                }
                if (cellValue !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    // 重置游戏
    resetGame() {
        this.copyBoard(this.initialBoard, this.board);
        this.isSolved = false;
    }

    // 自动解题
    autoSolve() {
        this.copyBoard(this.solution, this.board);
        this.isSolved = true;
    }
}

// DOM操作和游戏控制
class SudokuUI {
    constructor() {
        this.game = new SudokuGame();
        this.realTimeCheck = false; // 默认禁用实时检测功能
        this.initializeUI();
    }

    // 初始化UI
    initializeUI() {
        this.createBoard();
        this.bindEvents();
        
        // 从localStorage读取保存的难度
        const savedDifficulty = localStorage.getItem('sudokuDifficulty');
        if (savedDifficulty) {
            this.game.setDifficulty(savedDifficulty);
            document.getElementById('difficulty-select').value = savedDifficulty;
        }
        
        this.game.generateGame();
        this.renderBoard();
    }

    // 创建数独网格
    createBoard() {
        const tableBody = document.getElementById('sudoku-table');
        tableBody.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 9; col++) {
                const td = document.createElement('td');
                
                // 直接在HTML中创建输入框
                td.innerHTML = `
                    <input 
                        type="text" 
                        maxlength="1" 
                        data-row="${row}" 
                        data-col="${col}"
                        style="width: 100%; height: 100%; text-align: center;"
                    />
                `;
                
                const input = td.querySelector('input');
                
                // 直接绑定事件处理函数
                const self = this;
                input.oninput = function(e) {
                    self.handleInput(e);
                };
                
                input.onchange = function(e) {
                    self.handleInput(e);
                };
                
                input.onkeydown = function(e) {
                    self.handleKeyDown(e);
                };
                
                // 添加点击事件处理初始数字高亮
                input.onclick = function(e) {
                    self.handleCellClick(e);
                };
                
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
    }

    // 绑定事件
    bindEvents() {
        // 难度选择事件
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.game.setDifficulty(e.target.value);
            // 保存难度到localStorage
            localStorage.setItem('sudokuDifficulty', e.target.value);
        });

        // 开始游戏事件
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startNewGame();
        });

        // 重置游戏事件
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });

        // 检查答案事件
        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkSolution();
        });

        // 自动解题事件
        document.getElementById('solve-btn').addEventListener('click', () => {
            this.autoSolve();
        });

        // 实时检测开关事件
        document.getElementById('real-time-toggle').addEventListener('change', (e) => {
            this.realTimeCheck = e.target.checked;
            // 如果开启了实时检测，重新验证所有单元格
            if (this.realTimeCheck) {
                // 遍历所有单元格并重新验证，但只对非初始单元格应用样式
                for (let row = 0; row < 9; row++) {
                    for (let col = 0; col < 9; col++) {
                        const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
                        const value = this.game.board[row][col];
                        // 只对非初始单元格进行验证和样式应用
                        if (!this.game.initialBoard[row][col]) {
                            if (value !== 0) {
                                if (value === this.game.solution[row][col]) {
                                    input.classList.add('correct');
                                    input.classList.remove('error');
                                } else {
                                    input.classList.add('error');
                                    input.classList.remove('correct');
                                }
                            } else {
                                input.classList.remove('error', 'correct');
                            }
                        }
                    }
                }
            } else {
                // 如果关闭了实时检测，移除所有单元格的错误和正确样式
                const allInputs = document.querySelectorAll('.sudoku-board input');
                allInputs.forEach(input => {
                    // 只移除非初始单元格的样式
                    const row = parseInt(input.dataset.row);
                    const col = parseInt(input.dataset.col);
                    if (!this.game.initialBoard[row][col]) {
                        input.classList.remove('error', 'correct');
                    }
                });
            }
        });
        
        // 点击页面其他地方取消高亮
        const self = this;
        document.body.addEventListener('click', (e) => {
            // 清除所有高亮，包括可填写格子的淡蓝色背景
            // 但clearHighlights方法会保留已填写数字的背景
            self.clearHighlights();
        });
    }

    // 渲染数独板
    renderBoard() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
                const value = this.game.board[row][col];
                
                input.value = value !== 0 ? value : '';
                
                if (value !== 0) {
                    input.classList.add('filled');
                } else {
                    input.classList.remove('filled');
                }
                
                if (this.game.initialBoard[row][col] !== 0) {
                    input.classList.add('initial');
                    input.readOnly = true;
                } else {
                    input.classList.remove('initial');
                    input.readOnly = false;
                }
                
                input.classList.remove('error', 'correct');
            }
        }
        this.updateMessage('');
    }

    // 处理输入
    handleInput(e) {
        const input = e.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        let value = input.value.trim();
        
        // 只允许输入1-9的数字
        if (value === '' || !/^[1-9]$/.test(value)) {
            value = 0;
            input.value = '';
            input.classList.remove('filled');
        } else {
            value = parseInt(value);
            input.classList.add('filled');
        }

        this.game.board[row][col] = value;
        
        // 验证输入
        if (this.realTimeCheck && value !== 0) {
            if (value === this.game.solution[row][col]) {
                input.classList.add('correct');
                input.classList.remove('error');
            } else {
                input.classList.add('error');
                input.classList.remove('correct');
            }
        } else {
            input.classList.remove('error', 'correct');
        }
    }

    // 处理键盘事件
    handleKeyDown(e) {
        const input = e.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);

        let newRow = row;
        let newCol = col;

        switch (e.key) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(8, col + 1);
                break;
        }

        if (newRow !== row || newCol !== col) {
            const nextInput = document.querySelector(`input[data-row="${newRow}"][data-col="${newCol}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    }
    
    // 处理单元格点击事件
    handleCellClick(e) {
        // 阻止事件冒泡到body，避免高亮立即被清除
        e.stopPropagation();
        
        const input = e.target;
        
        // 检查是否是初始数字
        if (input.classList.contains('initial')) {
            // 如果已经高亮，取消高亮
            if (input.classList.contains('highlighted')) {
                this.clearHighlights();
                return;
            }
            
            // 清除之前的高亮
            this.clearHighlights();
            
            // 高亮被点击的初始数字
            input.classList.add('highlighted');
            
            // 获取被点击的数字
            const clickedNumber = input.value;
            
            // 高亮所有相同数字
            const allInputs = document.querySelectorAll('.sudoku-board input');
            allInputs.forEach(cell => {
                if (cell.value === clickedNumber) {
                    cell.classList.add('same-number');
                }
            });
        } else {
            // 如果点击的是可填写格子
            // 清除所有高亮（包括橙色数字）
            this.clearHighlights();
            
            // 为当前点击的格子添加淡蓝色背景
            input.classList.add('filled');
        }
    }
    
    // 清除所有高亮
    clearHighlights() {
        const allInputs = document.querySelectorAll('.sudoku-board input');
        allInputs.forEach(cell => {
            cell.classList.remove('highlighted', 'same-number');
            
            // 检查如果不是初始数字且没有值，则移除filled类
            if (!cell.classList.contains('initial') && cell.value === '') {
                cell.classList.remove('filled');
            }
        });
    }

    // 开始新游戏
    startNewGame() {
        this.game.generateGame();
        this.renderBoard();
        this.updateMessage('新游戏开始！', 'info');
    }

    // 重置游戏（清空已填写的格子）
    resetGame() {
        this.game.resetGame();
        this.renderBoard();
        this.updateMessage('已清空填写的格子！', 'info');
    }

    // 检查答案
    checkSolution() {
        const isValid = this.game.checkBoard();
        if (isValid) {
            this.game.isSolved = true;
            this.updateMessage('恭喜！你完成了数独游戏！', 'success');
        } else {
            this.updateMessage('数独还未完成或有错误！', 'error');
        }
    }

    // 自动解题
    autoSolve() {
        this.game.autoSolve();
        this.renderBoard();
        this.updateMessage('数独已自动解出！', 'info');
    }

    // 更新消息显示
    updateMessage(message, type = '') {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.className = 'message';
        if (type) {
            messageElement.classList.add(type);
        }
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SudokuUI();
});
