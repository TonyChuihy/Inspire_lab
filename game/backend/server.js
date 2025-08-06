const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "admin")));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 游戏状态
let gameState = {
  phase: "config", // config -> preparation -> roleAssignment -> truthInput -> truthReveal -> timer
  config: {
    wolfCount: 2,
    seerCount: 1,
    timerDuration: 180, // 3分钟
  },
  players: [],
  truth: "",
  timer: 0,
  // timerInterval: null,
  truthTeller: null,
};

// 角色分配
function assignRoles() {
  const { wolfCount, seerCount } = gameState.config;
  const playerCount = gameState.players.length;

  const roles = [];
  for (let i = 0; i < seerCount; i++) roles.push("先知");
  for (let i = 0; i < wolfCount; i++) roles.push("狼人");
  while (roles.length < playerCount) roles.push("村民");

  // 洗牌算法
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // 分配角色给玩家
  gameState.players.forEach((player, index) => {
    player.role = roles[index];
    player.hasSeenRole = false;
  });

  // 随机选择真言设定玩家
  const truthTellerIndex = Math.floor(Math.random() * gameState.players.length);
  gameState.truthTeller = gameState.players[truthTellerIndex].id;
}
function resetGame() {
  gameState.phase = "config";
  gameState.truth = "";
  gameState.timer = 0;
}
// 启动计时器
function startTimer() {
  gameState.timer = gameState.config.timerDuration;

  timerInterval = setInterval(() => {
    gameState.timer--;
    io.emit("game-state", gameState);

    if (gameState.timer <= 0) {
      clearInterval(timerInterval);
      // 计时结束逻辑
    }
  }, 1000);
}

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // 发送当前游戏状态
  socket.emit("game-state", gameState);

  // 玩家加入
  socket.on("player-join", (playerName) => {
    const player = {
      id: socket.id,
      name: playerName,
      isReady: false,
      role: null,
      hasSeenRole: false,
    };

    gameState.players.push(player);
    io.emit("game-state", gameState);
  });

  // 玩家准备
  socket.on("player-ready", () => {
    const player = gameState.players.find((p) => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      io.emit("game-state", gameState);
    }
  });

  // 管理员操作
  socket.on("admin-action", (action) => {
    switch (action.type) {
      case "update-config":
        gameState.config = { ...gameState.config, ...action.config };
        break;
      case "start-game":
        gameState.phase = "roleAssignment";
        assignRoles();
        break;
      case "start-truth-input":
        gameState.phase = "truthInput";
        break;
      case "start-truth-reveal":
        gameState.phase = "truthReveal";
        break;
      case "start-timer":
        gameState.phase = "timer";
        startTimer();
        break;
      case "reset-game":
        resetGame();
        break;
    }
    io.emit("game-state", gameState);
  });

  // 提交真言
  socket.on("submit-truth", (truth) => {
    gameState.truth = truth;
    gameState.phase = "truthReveal";
    io.emit("game-state", gameState);
  });

  // 断开连接
  socket.on("disconnect", () => {
    gameState.players = gameState.players.filter((p) => p.id !== socket.id);
    io.emit("game-state", gameState);
    console.log("Client disconnected:", socket.id);
  });
});

// 管理员后台页面
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "index.html"));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
