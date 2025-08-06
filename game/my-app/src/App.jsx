import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://172.18.4.68:3001");

function App() {
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [truth, setTruth] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("game-state", (state) => {
      setGameState(state);
      setCurrentPlayer(state.players.find((p) => p.id === socket.id));
    });

    return () => {
      socket.off("connect");
      socket.off("game-state");
    };
  }, []);

  const handleJoin = () => {
    if (playerName.trim()) {
      socket.emit("player-join", playerName.trim());
    }
  };

  const toggleReady = () => {
    socket.emit("player-ready");
  };

  const submitTruth = (truth) => {
    socket.emit("submit-truth", truth);
  };

  if (!isConnected) {
    return <div>连接服务器中...</div>;
  }

  if (!gameState) {
    return <div>加载游戏状态...</div>;
  }

  // 配置阶段
  if (gameState.phase === "config" && !currentPlayer) {
    return (
      <div className="container config-phase">
        <div className="header">
          <h1>狼人真言</h1>
          <div className="logo">🔮</div>
        </div>

        <div className="card">
          <h2>加入游戏</h2>
          <div className="input-group">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="输入你的名字"
            />
            <button className="primary" onClick={handleJoin}>
              加入游戏
            </button>
          </div>
        </div>

        <div className="game-info">
          <p>等待管理员开始游戏...</p>
        </div>
      </div>
    );
  }

  // 准备阶段
  if (gameState.phase === "config" && currentPlayer) {
    return (
      <div className="container preparation-phase">
        <div className="header">
          <h1>等待开始</h1>
          <div className="player-count">{gameState.players.length}位玩家</div>
        </div>

        <div className="card player-list">
          <h2>玩家列表</h2>
          <ul>
            {gameState.players.map((player) => (
              <li key={player.id} className={player.isReady ? "ready" : ""}>
                <span className="player-name">{player.name}</span>
                <span className="status">
                  {player.isReady ? "✅ 已准备" : "❌ 未准备"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="action-button">
          <button
            className={currentPlayer.isReady ? "secondary" : "primary"}
            onClick={toggleReady}
          >
            {currentPlayer.isReady ? "取消准备" : "准备"}
          </button>
        </div>

        <div className="game-info">
          <p>所有玩家准备后，管理员将开始游戏</p>
        </div>
      </div>
    );
  }

  // 角色分配阶段
  if (gameState.phase === "roleAssignment") {
    return (
      <div className="container role-assignment">
        <div className="header">
          <h1>你的身份</h1>
          <div className="role-icon">
            {currentPlayer.role === "狼人"
              ? "🐺"
              : currentPlayer.role === "先知"
              ? "🔮"
              : "👨‍🌾"}
          </div>
        </div>

        <div className="card">
          <h2 className="role-name">{currentPlayer.role}</h2>

          {currentPlayer.role === "狼人" && (
            <div className="role-description">
              <p>你的目标：帶偏方向，找出先知，隐藏自己！</p>
            </div>
          )}

          {currentPlayer.role === "先知" && (
            <div className="role-description">
              <p>你的目标：引導方向，找出狼人，隐藏自己！</p>
            </div>
          )}

          {currentPlayer.role === "村民" && (
            <div className="role-description">
              <p>你需要找出真言，找出狼人</p>
            </div>
          )}

          {currentPlayer.id === gameState.truthTeller && (
            <div className="special-role">
              <div className="badge">🎤</div>
              <p>你被选为设定真言的村長</p>
            </div>
          )}
        </div>

        <div className="game-info">
          <p>请记住你的角色，游戏即将开始</p>
        </div>
      </div>
    );
  }

  // 真言输入阶段
  if (
    gameState.phase === "truthInput" &&
    currentPlayer.id === gameState.truthTeller
  ) {
    return (
      <div className="container truth-input">
        <div className="header">
          <h1>设定真言</h1>
          <div className="role-icon">🎤</div>
        </div>

        <div className="card">
          <p>
            作为<b>{currentPlayer.role}</b>，你需要为游戏设定一个真言
          </p>

          <div className="input-group">
            <textarea
              value={truth}
              onChange={(e) => setTruth(e.target.value)}
              placeholder="输入一个句子作为真言..."
              rows="4"
            />
            <button
              className="primary"
              onClick={() => submitTruth(truth)}
              disabled={!truth.trim()}
            >
              提交真言
            </button>
          </div>
        </div>

        <div className="game-info">
          <p>狼人和先知将知道这个真言</p>
        </div>
      </div>
    );
  } else if (gameState.phase === "truthInput") {
    const truthTeller = gameState.players.find(
      (p) => p.id === gameState.truthTeller
    );

    return (
      <div className="container waiting-truth">
        <div className="header">
          <h1>等待真言</h1>
          <div className="spinner"></div>
        </div>

        <div className="card">
          <div className="waiting-message">
            <p>
              村長 <span className="highlight">{truthTeller.name}</span>{" "}
              正在设定真言
            </p>
            <p>请耐心等待...</p>
          </div>
        </div>

        <div className="game-info">
          <p>真言设定后，先知和狼人将能看到它</p>
        </div>
      </div>
    );
  }

  // 真言揭示阶段
  if (gameState.phase === "truthReveal") {
    return (
      <div className="container truth-reveal">
        <div className="header">
          <h1>真言揭示</h1>
          <div className="role-icon">
            {currentPlayer.role === "狼人"
              ? "🐺"
              : currentPlayer.role === "先知"
              ? "🔮"
              : "👨‍🌾"}
          </div>
        </div>

        <div className="card">
          {currentPlayer.role === "狼人" || currentPlayer.role === "先知" ? (
            <>
              <div className="truth-card">
                <div className="truth-icon">📜</div>
                <h3>你知道的真言是:</h3>
                <div className="truth-content">{gameState.truth}</div>
              </div>
              <p className="hint">请记住这个真言，它将在游戏中起到关键作用</p>
            </>
          ) : (
            <>
              <div className="truth-card villager">
                <div className="truth-icon">❓</div>
                <h3>作为村民</h3>
                <div className="truth-content">你不知道真言内容</div>
              </div>
              <p className="hint">你需要通过对话找出真言</p>
            </>
          )}
        </div>

        <div className="game-info">
          <p>管理员将很快开始游戏</p>
        </div>
      </div>
    );
  }

  // 计时阶段
  if (gameState.phase === "timer") {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;

    return (
      <div className="container timer-phase">
        <div className="header">
          <h1>游戏进行中</h1>
          <div className="role-icon">
            {currentPlayer.role === "狼人"
              ? "🐺"
              : currentPlayer.role === "先知"
              ? "🔮"
              : "👨‍🌾"}
          </div>
        </div>

        <div className="card">
          <div className="timer-display">
            <div className="time">
              {minutes}:{seconds < 10 ? "0" + seconds : seconds}
            </div>
            <div className="label">剩余时间</div>
          </div>

          <div className="role-reminder">
            <p>
              你的角色: <span className="highlight">{currentPlayer.role}</span>
            </p>
          </div>

          <div className="game-tips">
            {currentPlayer.role === "狼人" && (
              <p>阻止村民，找到先知，不要暴露</p>
            )}
            {currentPlayer.role === "先知" && <p>協助村民，不要暴露</p>}
            {currentPlayer.role === "村民" && <p>找出真言，找出狼人</p>}
          </div>
        </div>

        <div className="game-info">
          <p>游戏结束后</p>
          <p>若找出真言：狼人請指認先知</p>
          <p>若未能找出真言：請指認狼人</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container unknown-phase">
      <div className="header">
        <h1>游戏状态错误</h1>
      </div>
      <div className="card">
        <p>未知游戏阶段，请联系管理员</p>
        <p>当前阶段: {gameState.phase}</p>
      </div>
    </div>
  );
}

export default App;
