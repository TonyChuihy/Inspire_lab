import React, { useState, useRef } from "react";
import Card from "./card.jsx";
import "./battle.css";

// 五行相剋關係
const wuxingRelations = {
  金: { weakness: "火", resistance: "木" },
  木: { weakness: "金", resistance: "土" },
  水: { weakness: "土", resistance: "火" },
  火: { weakness: "水", resistance: "金" },
  土: { weakness: "木", resistance: "水" },
};
9;

const wuxingTypes = ["金", "木", "水", "火", "土"];

var cacheCardVaild;

function getDefaultCard(type = "金") {
  const rel = wuxingRelations[type] || {};
  return {
    name: "",
    type,
    image: "",
    hp: 50,
    attack: 50,
    defense: 25,
    skill: "",
    weakness: rel.weakness || "",
    resistance: rel.resistance || "",
  };
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export default function Battle({ cacheCardData = null }) {
  // const [cacheCardData, setCacheCardData] = useState(null);
  // setCacheCardData(importedCacheCardData);
  console.log(
    "Battle component initialized with cacheCardData:",
    cacheCardData
  );
  // Card editing state
  const [player1, setPlayer1] = useState(getDefaultCard("金"));
  const [player2, setPlayer2] = useState(getDefaultCard("木"));
  const [player1ImgFile, setPlayer1ImgFile] = useState(null);
  const [player2ImgFile, setPlayer2ImgFile] = useState(null);
  const [editing, setEditing] = useState(true);
  cacheCardVaild = false;

  // Battle state
  const [battleState, setBattleState] = useState({
    p1: null,
    p2: null,
    turn: "p1",
    log: [],
    ended: false,
    winner: "",
  });

  if (cacheCardData) {
    cacheCardVaild = true;
    console.log(
      "Cache card data is valid:" +
        cacheCardVaild +
        " With data: " +
        cacheCardData.name
    );
  }
  // Check cache card data
  // useState(() => {
  //   if (cacheCardData) {
  //     cacheCardVaild = checkVaildCard(cacheCardData);
  //   }
  // }, [cacheCardData]);

  function importCacheCardData({ int: player }) {
    if (cacheCardVaild) {
      if (player === 1) {
        setPlayer1(cacheCardData);
      } else if (player === 2) {
        setPlayer2(cacheCardData);
      } else {
        console.log("Error: Invalid player number");
      }
    } else {
      console.log("Error: No cache card data");
    }
  }
  // For file input reset
  const p1ImgInput = useRef();
  const p2ImgInput = useRef();

  // Handle card input changes
  function handleInput(player, field, value) {
    const setPlayer = player === "player1" ? setPlayer1 : setPlayer2;
    const getPlayer = player === "player1" ? player1 : player2;
    let newCard = { ...getPlayer, [field]: value };
    // HP + 攻擊力 = 100
    if (field === "hp") {
      let hp = clamp(parseInt(value) || 0, 0, 100);
      let attack = clamp(100 - hp, 0, 100);
      newCard.hp = hp;
      newCard.attack = attack;
      newCard.defense = Math.floor((hp * attack) / 100);
    } else if (field === "attack") {
      let attack = clamp(parseInt(value) || 0, 0, 100);
      let hp = clamp(100 - attack, 0, 100);
      newCard.attack = attack;
      newCard.hp = hp;
      newCard.defense = Math.floor((hp * attack) / 100);
    } else if (field === "type") {
      const rel = wuxingRelations[value] || {};
      newCard.type = value;
      newCard.weakness = rel.weakness || "";
      newCard.resistance = rel.resistance || "";
    } else if (field === "skill" || field === "name") {
      // just update
    }
    setPlayer(newCard);
  }

  // Handle image upload
  function handleImage(player, file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (player === "player1") {
        setPlayer1((p) => ({ ...p, image: e.target.result }));
        setPlayer1ImgFile(file);
      } else {
        setPlayer2((p) => ({ ...p, image: e.target.result }));
        setPlayer2ImgFile(file);
      }
    };
    if (file) reader.readAsDataURL(file);
  }

  // Start battle
  function startBattle() {
    setBattleState({
      p1: {
        ...player1,
        currentHp: player1.hp,
        skillUsed: false,
        shield: false,
      },
      p2: {
        ...player2,
        currentHp: player2.hp,
        skillUsed: false,
        shield: false,
      },
      turn: Math.random() < 0.5 ? "p1" : "p2",
      log: [
        "🎮 戰鬥開始！",
        `${player1.name || "玩家1"} VS ${player2.name || "玩家2"}`,
      ],
      ended: false,
      winner: "",
    });
    setEditing(false);
  }

  // Battle actions
  // function addLog(msg) {
  //   setBattleState(s => ({ ...s, log: [...s.log, msg] }));
  // }

  function attackAction() {
    setBattleState((s) => {
      if (s.ended) return s;
      const attacker = s.turn === "p1" ? s.p1 : s.p2;
      const defender = s.turn === "p1" ? s.p2 : s.p1;
      let dmg = calculateDamage(attacker, defender);
      let newDefender = {
        ...defender,
        currentHp: clamp(defender.currentHp - dmg, 0, defender.hp),
      };
      let logMsg = `${attacker.name} 攻擊造成 ${dmg} 傷害！`;
      let winner = "";
      let ended = false;
      if (newDefender.currentHp <= 0) {
        winner = attacker.name;
        ended = true;
        logMsg += ` ${attacker.name} 勝利！`;
      }
      return {
        ...s,
        [s.turn === "p1" ? "p2" : "p1"]: newDefender,
        turn: s.turn === "p1" ? "p2" : "p1",
        log: [...s.log, logMsg],
        ended,
        winner,
      };
    });
  }

  function skillAction() {
    setBattleState((s) => {
      if (s.ended) return s;
      const attacker = s.turn === "p1" ? s.p1 : s.p2;
      const defender = s.turn === "p1" ? s.p2 : s.p1;
      // Example: skill does 30 fixed damage
      let skillDmg = 30;
      let newDefender = {
        ...defender,
        currentHp: clamp(defender.currentHp - skillDmg, 0, defender.hp),
      };
      let logMsg = `${attacker.name} 使用技能造成 ${skillDmg} 傷害！`;
      let winner = "";
      let ended = false;
      if (newDefender.currentHp <= 0) {
        winner = attacker.name;
        ended = true;
        logMsg += ` ${attacker.name} 勝利！`;
      }
      return {
        ...s,
        [s.turn === "p1" ? "p2" : "p1"]: newDefender,
        turn: s.turn === "p1" ? "p2" : "p1",
        log: [...s.log, logMsg],
        ended,
        winner,
      };
    });
  }

  function defendAction() {
    setBattleState((s) => {
      if (s.ended) return s;
      const defender = s.turn === "p1" ? s.p1 : s.p2;
      let newDefender = { ...defender, shield: true };
      let logMsg = `${defender.name} 防禦，減少下回合所受傷害！`;
      return {
        ...s,
        [s.turn]: newDefender,
        turn: s.turn === "p1" ? "p2" : "p1",
        log: [...s.log, logMsg],
      };
    });
  }

  function calculateDamage(attacker, defender) {
    // 五行剋制
    let base = attacker.attack;
    if (wuxingRelations[attacker.type]?.weakness === defender.type) {
      base = Math.floor(base * 0.7);
    } else if (wuxingRelations[attacker.type]?.resistance === defender.type) {
      base = Math.floor(base * 1.3);
    }
    // 防禦
    let dmg = clamp(base - defender.defense, 1, 999);
    // 防禦盾
    if (defender.shield) {
      dmg = Math.floor(dmg / 2);
    }
    return dmg;
  }

  function restart() {
    setEditing(true);
    setBattleState({
      p1: null,
      p2: null,
      turn: "p1",
      log: [],
      ended: false,
      winner: "",
    });
  }

  // UI
  if (editing) {
    return (
      <div className="container">
        <h1 className="title">🥇 🌳 五行怪物卡牌戰鬥 🌊🔥⛰️</h1>
        <div>
          {cacheCardVaild && (
            <button
              className="import-btn"
              onClick={() => importCacheCardData({ int: 1 })}
            >
              匯入卡片1
            </button>
          )}
          {cacheCardVaild && (
            <button
              className="import-btn"
              onClick={() => importCacheCardData({ int: 2 })}
            >
              匯入卡片2
            </button>
          )}
        </div>
        <div className="cards-section">
          {[
            ["player1", player1, setPlayer1, player1ImgFile, p1ImgInput],
            ["player2", player2, setPlayer2, player2ImgFile, p2ImgInput],
          ].map(([player, card, setCard, imgFile, imgRef], idx) => (
            <div className="card-creator" key={player}>
              <div className="card-preview">
                <Card {...card} />
              </div>
              <div className="form-group">
                <label>名稱</label>
                <input
                  value={card.name}
                  onChange={(e) => handleInput(player, "name", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>五行屬性</label>
                <select
                  value={card.type}
                  onChange={(e) => handleInput(player, "type", e.target.value)}
                >
                  {wuxingTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>生命值 (HP)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={card.hp}
                  onChange={(e) => handleInput(player, "hp", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>攻擊力</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={card.attack}
                  onChange={(e) =>
                    handleInput(player, "attack", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>防禦力 (自動計算)</label>
                <input type="number" value={card.defense} readOnly />
              </div>
              <div className="form-group">
                <label>技能描述</label>
                <textarea
                  value={card.skill}
                  onChange={(e) => handleInput(player, "skill", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>圖片</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={imgRef}
                  onChange={(e) => handleImage(player, e.target.files[0])}
                />
              </div>
              <div className="form-group">
                <label>弱點</label>
                <input value={card.weakness} readOnly />
              </div>
              <div className="form-group">
                <label>抗性</label>
                <input value={card.resistance} readOnly />
              </div>
            </div>
          ))}
        </div>
        <button className="start-battle-btn" onClick={startBattle}>
          ⚔️ 開始決鬥
        </button>
      </div>
    );
  }

  // Battle UI
  const { p1, p2, turn, log, ended, winner } = battleState;
  return (
    <div className="container">
      <h1 className="title">⚔️ 五行怪物對戰</h1>
      <div className="battlefield">
        <div style={{ flex: 1 }}>
          {p1 && <Card {...p1} />}
          <div className="hp-bar">
            <div
              className="hp-fill"
              style={{ width: `${(p1.currentHp / p1.hp) * 100}%` }}
            ></div>
            <div className="hp-text">
              {p1.currentHp}/{p1.hp}
            </div>
          </div>
        </div>
        <div className="vs-text" style={{ flex: 0.5, textAlign: "center" }}>
          VS
        </div>
        <div style={{ flex: 1 }}>
          {p2 && <Card {...p2} />}
          <div className="hp-bar">
            <div
              className="hp-fill"
              style={{ width: `${(p2.currentHp / p2.hp) * 100}%` }}
            ></div>
            <div className="hp-text">
              {p2.currentHp}/{p2.hp}
            </div>
          </div>
        </div>
      </div>
      <div className="action-panel">
        <div className="action-buttons">
          <button
            className="action-btn attack-btn"
            onClick={attackAction}
            disabled={ended || turn !== "p1"}
          >
            攻擊 ({p1?.name})
          </button>
          <button
            className="action-btn skill-btn"
            onClick={skillAction}
            disabled={ended || turn !== "p1"}
          >
            技能 ({p1?.name})
          </button>
          <button
            className="action-btn defend-btn"
            onClick={defendAction}
            disabled={ended || turn !== "p1"}
          >
            防禦 ({p1?.name})
          </button>
        </div>
        <div className="action-buttons">
          <button
            className="action-btn attack-btn"
            onClick={attackAction}
            disabled={ended || turn !== "p2"}
          >
            攻擊 ({p2?.name})
          </button>
          <button
            className="action-btn skill-btn"
            onClick={skillAction}
            disabled={ended || turn !== "p2"}
          >
            技能 ({p2?.name})
          </button>
          <button
            className="action-btn defend-btn"
            onClick={defendAction}
            disabled={ended || turn !== "p2"}
          >
            防禦 ({p2?.name})
          </button>
        </div>
        <div className="battle-log">
          {log.map((msg, i) => (
            <div key={i} className="log-entry">
              {msg}
            </div>
          ))}
        </div>
        {ended && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <div className="winner-text">🎉 勝利者：{winner}</div>
            <button className="restart-btn" onClick={restart}>
              🔄 重新戰鬥
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
