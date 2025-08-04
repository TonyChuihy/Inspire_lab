import { useState } from "react";
import "./App.css";

function App() {
  // 游戏状态
  const [gamePhase, setGamePhase] = useState("setup"); // setup -> firstPlayerRole -> truthInput -> roleAssignment -> complete
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [showBlank, setShowBlank] = useState(false);

  // 游戏设置
  const [playerCount, setPlayerCount] = useState(6);
  const [seerCount, setSeerCount] = useState(1);
  const [wolfCount, setWolfCount] = useState(2);

  // 真言
  const [truth, setTruth] = useState("");

  // 初始化游戏
  const startGame = () => {
    // 验证输入
    if (playerCount < seerCount + wolfCount + 1) {
      alert("村民数量不能为0，请调整玩家数量或角色数量");
      return;
    }

    // 创建角色数组
    const roles = [];
    for (let i = 0; i < seerCount; i++) roles.push("先知");
    for (let i = 0; i < wolfCount; i++) roles.push("狼人");
    while (roles.length < playerCount) roles.push("村民");

    // 打乱角色顺序
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    // 创建玩家数组
    const newPlayers = roles.map((role, index) => ({
      id: index + 1,
      role,
      hasSeenRole: false,
    }));

    setPlayers(newPlayers);
    setGamePhase("firstPlayerRole"); // 先让第一位玩家查看身份
  };

  // 第一位玩家确认身份后
  const confirmFirstPlayerRole = () => {
    setGamePhase("truthInput");
  };

  // 提交真言
  const submitTruth = () => {
    if (!truth.trim()) {
      alert("请输入真言");
      return;
    }

    // 标记第一位玩家已查看角色
    const updatedPlayers = [...players];
    updatedPlayers[0].hasSeenRole = true;
    setPlayers(updatedPlayers);

    // 如果不是单人游戏，进入角色分配阶段
    if (players.length > 1) {
      setCurrentPlayerIndex(1); // 从第二位玩家开始
      setGamePhase("roleAssignment");
    } else {
      setGamePhase("complete");
    }
  };

  // 显示下一个玩家角色
  const showNextPlayer = () => {
    // 标记当前玩家已查看角色
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].hasSeenRole = true;
    setPlayers(updatedPlayers);

    // 显示空白页5秒
    setShowRole(false);
    setShowBlank(true);

    setTimeout(() => {
      setShowBlank(false);

      // 检查是否所有玩家都已查看角色
      if (currentPlayerIndex < players.length - 1) {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setShowRole(true);
      } else {
        setGamePhase("complete");
      }
    }, 5000);
  };

  // 重新开始游戏
  const restartGame = () => {
    setGamePhase("setup");
    setCurrentPlayerIndex(0);
    setTruth("");
    setShowRole(false);
    setShowBlank(false);
  };

  // 获取当前玩家
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div classname="app">
      <div className="app">
        {gamePhase === "setup" && (
          <div className="setup-phase">
            <h1>狼人真言游戏设置</h1>
            <div className="form-group">
              <label>玩家总数 (3-12):</label>
              <input
                type="number"
                min="3"
                max="12"
                value={playerCount}
                onChange={(e) => setPlayerCount(parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>先知数量 (1):</label>
              <input
                type="number"
                min="1"
                max="1"
                value={seerCount}
                onChange={(e) => setSeerCount(parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>狼人数量 (1-2):</label>
              <input
                type="number"
                min="1"
                max="2"
                value={wolfCount}
                onChange={(e) => setWolfCount(parseInt(e.target.value))}
              />
            </div>
            <button onClick={startGame}>开始游戏</button>
          </div>
        )}

        {gamePhase === "firstPlayerRole" && (
          <div className="role-display">
            <h1>第一位玩家的身份</h1>
            <div className="role-info">
              <p>
                你的角色是: <strong>{players[0]?.role}</strong>
              </p>
              <p>作为第一位玩家，你需要设置一个真言。</p>
              <p>狼人和先知将会知道这个真言。</p>
            </div>
            <button onClick={confirmFirstPlayerRole}>确认身份并设置真言</button>
          </div>
        )}

        {gamePhase === "truthInput" && (
          <div className="truth-input-phase">
            <h1>设置真言</h1>
            <p>
              玩家 {players[0]?.id} ({players[0]?.role})，请设置一个真言：
            </p>
            <textarea
              value={truth}
              onChange={(e) => setTruth(e.target.value)}
              placeholder="输入真言..."
            />
            <button onClick={submitTruth}>提交真言</button>
          </div>
        )}

        {gamePhase === "roleAssignment" && (
          <div className="role-assignment-phase">
            {showBlank && (
              <div className="blank-screen">
                <h1>请将设备传递给下一位玩家</h1>
              </div>
            )}

            {!showBlank && showRole && (
              <div className="role-display">
                <h1>玩家 {currentPlayer?.id} 的身份</h1>
                <div className="role-info">
                  <p>
                    你的角色是: <strong>{currentPlayer?.role}</strong>
                  </p>
                  {(currentPlayer?.role === "先知" ||
                    currentPlayer?.role === "狼人") && (
                    <div className="truth-display">
                      <h3>真言:</h3>
                      <p>{truth}</p>
                    </div>
                  )}
                  {currentPlayer?.role === "村民" && (
                    <p>作为村民，你不知道真言。</p>
                  )}
                </div>
                <button onClick={showNextPlayer}>
                  {currentPlayerIndex < players.length - 1
                    ? "下一位玩家"
                    : "完成"}
                </button>
              </div>
            )}

            {!showBlank && !showRole && (
              <div className="initial-prompt">
                <h1>准备查看玩家 {currentPlayer?.id} 的身份</h1>
                <button onClick={() => setShowRole(true)}>查看身份</button>
              </div>
            )}
          </div>
        )}

        {gamePhase === "complete" && (
          <div className="complete-phase">
            <h1>所有玩家已查看身份</h1>
            <p>游戏可以开始了！</p>
            <button onClick={restartGame}>重新开始</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
