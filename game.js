// 获取HTML元素
const trafficLightElement = document.getElementById('traffic-light');
const dogVideoElement = document.getElementById('dog-video');
const recordButton = document.getElementById('record-button');
const scoreElement = document.getElementById('score');
const winScreenElement = document.getElementById('win-screen-container');
let score = 0;

// 游戏状态
const GameState = {
    IDLE: 'IDLE',
    LISTENING_LIGHT_COLOR: 'LISTENING_LIGHT_COLOR',
    LISTENING_DOG_ACTION: 'LISTENING_DOG_ACTION',
    WIN_SCREEN: 'WIN_SCREEN',
};

let currentState = GameState.IDLE;

// 语音识别初始化
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = false;

// 请求麦克风权限
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => console.log('Microphone access granted'))
    .catch(() => alert('Microphone access denied'));

// 启动语音识别
recognition.start();

// 处理语音识别结果
recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
    handleSpeechRecognitionResult(transcript);
};

// 处理语音识别错误
recognition.onerror = () => {
    console.error('Speech recognition failed');
};

// 语音识别结果处理函数
function handleSpeechRecognitionResult(transcript) {
    if (currentState === GameState.LISTENING_LIGHT_COLOR) {
        if (checkKeyword(transcript, ['red', 'yellow', 'green'])) {
            const color = transcript.includes('red') ? 'red' : (transcript.includes('yellow') ? 'yellow' : 'green');
            updateTrafficLightColor(color);
            startDogAction(color);
            currentState = GameState.LISTENING_DOG_ACTION;
        } else {
            displayFeedback('error');
        }
    } else if (currentState === GameState.LISTENING_DOG_ACTION) {
        if (checkKeyword(transcript, ['good job'])) {
            score++;
            updateScore();
            if (score < 5) {
                startNewRound();
            } else {
                enterWinScreen();
            }
        } else if (checkKeyword(transcript, ['stop', 'wait', 'go'])) {
            // 纠正动作
            displayFeedback('error');
            dogVideoElement.play();
        }
    }
}

// 检查关键词
function checkKeyword(transcript, keywords) {
    return keywords.some(keyword => transcript.includes(keyword));
}

// 更新红绿灯颜色
function updateTrafficLightColor(color) {
    const colorMap = {
        red: 'SDHG_TrafficLight_red2.png',
        yellow: 'SDHG_TrafficLight_yellow2.png',
        green: 'SDHG_TrafficLight_green2.png'
    };
    trafficLightElement.src = `https://github.com/gzy622/622SeeingDogHTMLGame/raw/refs/heads/main/${colorMap[color]}`;
}

// 开始导盲犬动作
function startDogAction(color) {
    const actions = {
        red: 'stop',
        yellow: 'wait',
        green: 'go'
    };
    playDogAction(actions[color]);
}

// 播放导盲犬动作
function playDogAction(action) {
    const actionVideos = {
        stop: 'SDHG_dog_stop_2.webm',
        wait: 'SDHG_dog_wait.webm',
        go: 'SDHG_dog_go_2.webm'
    };
    dogVideoElement.src = `https://github.com/gzy622/622SeeingDogHTMLGame/raw/refs/heads/main/${actionVideos[action]}`;
    dogVideoElement.play();
}

// 更新分数
function updateScore() {
    scoreElement.textContent = `${score}/5`;
}

// 开始新一轮
function startNewRound() {
    currentState = GameState.LISTENING_LIGHT_COLOR;
    trafficLightElement.src = 'https://github.com/gzy622/622SeeingDogHTMLGame/raw/refs/heads/main/SDHG_TrafficLight_gray2.png';
}

// 显示反馈信息
function displayFeedback(type) {
    if (type === 'error') {
        alert('Try again!');
    } else {
        alert('Good job!');
    }
}

// 显示胜利界面
function enterWinScreen() {
    winScreenElement.style.display = 'block';
    currentState = GameState.WIN_SCREEN;
    setTimeout(() => {
        resetFullGame();
    }, 5000); // 等待5秒后重置
}

// 重置游戏
function resetFullGame() {
    score = 0;
    updateScore();
    winScreenElement.style.display = 'none';
    startNewRound();
    currentState = GameState.IDLE;
}
