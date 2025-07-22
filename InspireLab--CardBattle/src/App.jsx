import { useState, useRef, useEffect } from "react";
import { joinRoom } from "trystero";
import "./App.css";
import { Html5Qrcode } from "html5-qrcode";
import QrScanner from "qr-scanner";
import PokemonCard from "./assets/card";
import Battle from "./assets/battle.jsx";

function App() {
  const [inputCard, setInputCard] = useState("");
  const [operation, setOperation] = useState("Addition");
  const [result, setResult] = useState("");

  // QR code scanner state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrScanResult, setQrScanResult] = useState(null);
  const [qrError, setQrError] = useState("");
  const [qrFrameDataUrl, setQrFrameDataUrl] = useState(null);
  const qrRegionId = "qr-reader-region";
  const qrCanvasRef = useRef(null);

  const [qrScanName, setQrScanName] = useState(null);
  const [cacheReady, setCacheReady] = useState(false);

  // Image states and refs
  const [userImg1, setUserImg1] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
  );
  const [userImg2, setUserImg2] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
  );
  const fileInput1 = useRef(null);
  const fileInput2 = useRef(null);
  const [cardData, setCardData] = useState([
    {
      name: "黃鐵礦獸",
      type: "金",
      hp: 60,
      attack: 40,
      defense: 24,
      retreat: 1,
      weakness: "火 +20",
      resistance: "木 -10",
      skill1: "狂化：增加12點攻擊力。",
      skill2: "金石為開：恢復8點生命值。",
      image: null,
    },
    {
      name: "火焰獅",
      type: "火",
      hp: 70,
      attack: 50,
      defense: 20,
      retreat: 2,
      weakness: "水 +20",
      resistance: "金 -10",
      skill1: "烈焰：造成15點傷害。",
      skill2: "燃燒殆盡：犧牲10點生命值，造成30點傷害。",
      image: null,
    },
    {
      name: "海嘯龜",
      type: "水",
      hp: 80,
      attack: 30,
      defense: 30,
      retreat: 3,
      weakness: "木 +20",
      resistance: "火 -10",
      skill1: "水槍：造成10點傷害。",
      skill2: "海嘯：造成25點傷害。",
      image: null,
    },
    {
      name: "森林蜥蜴",
      type: "木",
      hp: 65,
      attack: 45,
      defense: 22,
      retreat: 1,
      weakness: "金 +20",
      resistance: "水 -10",
      skill1: "藤鞭：造成12點傷害。",
      skill2: "寄生種子：每回合恢復5點生命值。",
      image: null,
    },
    {
      name: "雷霆鼠",
      type: "電",
      hp: 55,
      attack: 55,
      defense: 18,
      retreat: 0,
      weakness: "土 +20",
      resistance: "無",
      skill1: "電擊：造成18點傷害。",
      skill2: "雷霆：造成25點傷害，自身受到5點反傷。",
      image: null,
    },
    {
      name: "岩石怪",
      type: "土",
      hp: 90,
      attack: 25,
      defense: 35,
      retreat: 4,
      weakness: "木 +20",
      resistance: "電 -10",
      skill1: "落石：造成8點傷害。",
      skill2: "地震：造成20點傷害，對方下回合無法行動。",
      image: null,
    },
  ]);

  // Trystero P2P setup for sharing results
  const config = { appId: "vite-calculator" };
  const room = joinRoom(config, "152358");
  const [sendResult, getResult] = room.makeAction("results");
  // const [peerResults, setPeerResults] = useState<{ result: string }[]>([])
  const [peerResults, setPeerResults] = useState([]);
  // const otherResults = {}
  // Send result to peers when calculated
  const handleButtonClick = () => {
    const calcResult = computeResult();
    setResult(calcResult);
    sendResult(calcResult);
  };

  getResult((data, peerId) => {
    setPeerResults((prev) =>
      [{ peer: peerId, result: data }, ...prev].slice(0, 10)
    );
  });

  // Listen for results from peers
  // useEffect(() => {
  //   const unsubscribe = onResult((result: string, peerId: string) => {
  //     setPeerResults(prev => [
  //       { peer: peerId, result: result ?? '' },
  //       ...prev.filter(r => r.peer !== peerId || r.result !== result)
  //     ].slice(0, 10))
  //   })
  //   return unsubscribe
  // }, [onResult])

  // Handle image upload
  const handleImgClick = (ref) => {
    if (ref.current) ref.current.click();
  };

  const handleImgChange = (e, setImg) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") {
          setImg(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open QR modal and start scanning
  const handleScanQrClick = () => {
    setShowQrModal(true);
    setQrScanResult(null);
    setQrError("");
  };

  // Start QR scanning when modal opens
  useEffect(() => {
    let html5Qr = null;
    let running = false;

    let qrScanner = null;
    const videoElem = document.getElementById("qrVideo");
    if (showQrModal && !qrScanResult && videoElem) {
      qrScanner = new QrScanner(videoElem, (result) => {
        // Freeze frame: capture the current video frame
        if (videoElem && qrCanvasRef.current) {
          qrCanvasRef.current.width = videoElem.videoWidth;
          qrCanvasRef.current.height = videoElem.videoHeight;
          const ctx = qrCanvasRef.current.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              videoElem,
              0,
              0,
              videoElem.videoWidth,
              videoElem.videoHeight
            );
            setQrFrameDataUrl(qrCanvasRef.current.toDataURL("image/png"));
          }
        }
        setQrScanResult(result);
        // handleQrResult("");
      });
      qrScanner.setInversionMode("both");
      qrScanner.start();

      // html5Qr = new Html5Qrcode(qrRegionId);
      // html5Qr
      //   .start(
      //     { facingMode: "environment" },
      //     { fps: 10, qrbox: 250 },
      //     (decodedText) => {
      //       // Freeze frame: capture the current video frame
      //       const videoElem = document.querySelector(`#${qrRegionId} video`);
      //       if (videoElem && qrCanvasRef.current) {
      //         qrCanvasRef.current.width = videoElem.videoWidth;
      //         qrCanvasRef.current.height = videoElem.videoHeight;
      //         const ctx = qrCanvasRef.current.getContext("2d");
      //         if (ctx) {
      //           ctx.drawImage(
      //             videoElem,
      //             0,
      //             0,
      //             videoElem.videoWidth,
      //             videoElem.videoHeight
      //           );
      //           setQrFrameDataUrl(qrCanvasRef.current.toDataURL("image/png"));
      //         }
      //       }
      //       setQrScanResult(decodedText);
      //       // handleQrResult("");
      //       if (html5Qr && running) {
      //         html5Qr.stop().then(() => html5Qr?.clear());
      //         running = false;
      //       }
      //     },
      //     () => {}
      //   )
      //   .then(() => {
      //     running = true;
      //   })
      //   .catch((err) => {
      //     setQrError("Camera error: " + err);
      //   });
    }
    return () => {
      // if (html5Qr && running) {
      //   html5Qr
      //     .stop()
      //     .then(() => html5Qr.clear())
      //     .catch(() => {});
      //   running = false;
      // }
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
      // setQrFrameDataUrl(null)
    };
  }, [showQrModal, qrScanResult]);

  // Handle QR result button actions
  const handleQrResult = async (action) => {
    console.log("handleQrResult");
    if (!qrScanResult) {
      setShowQrModal(false);
      return;
    }

    try {
      // 發送請求獲取卡牌資料
      const response = await fetch(
        `http://localhost:3000/cards/${qrScanResult}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const cardData = await response.json();
      console.log(
        "App get card data from database: 228, handleQrResult: " +
          cardData.monsterName
      );
      // 解構獲得的卡牌資料
      const {
        // cid,
        // studentId,
        monsterName,
        monsterImage,
        cardFrontImage,
        // cardBackImage,
        monsterAttribute,
        skill1Attribute,
        skill2Attribute,
        skill1Attack,
        skill2Attack,
      } = cardData;
      console.log(
        "App get card data from database and create copy: handleQrResult: " +
          monsterName
      );

      // 更新卡牌數據狀態
      // 創建新卡牌對象
      const newCard = {
        name: monsterName,
        type: monsterAttribute,
        hp: 60, // 可以根據需要調整或從API獲取
        attack: skill1Attack, // 可以根據需要調整或從API獲取
        defense: skill2Attack, // 可以根據需要調整或從API獲取
        retreat: 1, // 可以根據需要調整或從API獲取
        weakness: getWeakness(monsterAttribute), // 需要實現getWeakness函數
        resistance: getResistance(monsterAttribute), // 需要實現getResistance函數
        skill: `${skill1Attribute}: 造成${skill1Attack}點傷害。`,
        // skill2: `${skill2Attribute}: 造成${skill2Attack}點傷害。`,
        image: monsterImage || cardFrontImage,
      };
      console.log(
        "App get card data from database and create newCard: handleQrResult: " +
          newCard.name
      );
      if (monsterName !== null) {
        setCacheReady(true);
        setQrScanName(monsterName);
        console.log(
          "App fetch card name from getted object to Qrscanname(display): handleQrResult: " +
            monsterName
        );
        setInputCard(newCard); // ?
        setCardData((prevCards) => [...prevCards, newCard]);
      }
      // setInputCard(newCard);

      /*
      setCardData((prevCards) => {
        // 創建新卡牌對象
        const newCard = {
          name: monsterName,
          type: monsterAttribute,
          hp: 60, // 可以根據需要調整或從API獲取
          attack: skill1Attack, // 可以根據需要調整或從API獲取
          defense: skill2Attack, // 可以根據需要調整或從API獲取
          retreat: 1, // 可以根據需要調整或從API獲取
          weakness: getWeakness(monsterAttribute), // 需要實現getWeakness函數
          resistance: getResistance(monsterAttribute), // 需要實現getResistance函數
          skill: `${skill1Attribute}: 造成${skill1Attack}點傷害。`,
          // skill2: `${skill2Attribute}: 造成${skill2Attack}點傷害。`,
          image: monsterImage || cardFrontImage,
        };
        console.log(
          "App get card data from database and create newCard: handleQrResult: " +
            newCard.name
        );
        if (monsterName !== null) {
          setCacheReady(true);
          setQrScanName(monsterName);
          console.log(
            "App fetch card name from getted object to Qrscanname(display): handleQrResult: " +
              monsterName
          );
        }
        setInputCard(newCard);
        // 返回更新後的卡牌陣列 (這裡簡單添加到現有卡牌中)
        return [...prevCards, newCard];
      });
      */

      // 可以選擇更新用戶圖片或其他狀態
      // setUserImg1(monsterImage);
      // setUserImg2(cardBackImage);
    } catch (error) {
      console.error("獲取卡牌資料失敗:", error);
      setQrError(`獲取卡牌資料失敗: ${error.message}`);
      // return; // 保持模態框開啟顯示錯誤
    }
    if (action === "cancel") {
      setShowQrModal(false);
      setQrScanResult(null);
      setQrError("");
      setQrFrameDataUrl(null);
      setInputCard("");
      return;
    }
    if (action === "inputCard") {
      console.log("handleQrResult: inputCard");
    }

    // 關閉模態框
    setShowQrModal(false);

    setQrError("");
    setQrFrameDataUrl(null);
  };

  // 輔助函數 - 根據屬性獲取弱點
  const getWeakness = (attribute) => {
    const weaknesses = {
      金: "火 +20",
      火: "水 +20",
      水: "木 +20",
      木: "金 +20",
      電: "土 +20",
      土: "木 +20",
    };
    return weaknesses[attribute] || "無";
  };

  // 輔助函數 - 根據屬性獲取抗性
  const getResistance = (attribute) => {
    const resistances = {
      金: "木 -10",
      火: "金 -10",
      水: "火 -10",
      木: "水 -10",
      電: "無",
      土: "電 -10",
    };
    return resistances[attribute] || "無";
  };

  // // Broadcast state when changed locally
  // useEffect(() => {
  //   if (!isRemoteUpdate.current) {
  //     broadcast({ input1, input2, operation })
  //   }
  //   isRemoteUpdate.current = false
  // }, [input1, input2, operation])

  // // Listen for remote state updates
  // useEffect(() => {
  //   const unsubscribe = onBroadcast((data) => {
  //     isRemoteUpdate.current = true
  //     if (typeof data.input1 === 'string') setInput1(data.input1)
  //     if (typeof data.input2 === 'string') setInput2(data.input2)
  //     if (typeof data.operation === 'string') setOperation(data.operation)
  //   })
  //   return unsubscribe
  // }, [onBroadcast])

  return (
    <>
      <div>
        <button onClick={handleScanQrClick} style={{ marginLeft: 8 }}>
          Scan QR Code
        </button>
      </div>
      {/* QR Modal */}
      {showQrModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              textAlign: "center",
              position: "relative",
            }}
          >
            <h2 style={{ color: "black" }}>Scan QR Code</h2>
            <p style={{ color: "black" }}>
              Align your QR code within the box below.
            </p>
            <div>
              {!qrScanResult && (
                <video id="qrVideo" width={480} height={360}></video>
              )}
            </div>
            {/* {!qrScanResult && (
              <div
                id={qrRegionId}
                style={{ width: 260, height: 260, margin: "0 auto" }}
              />
            )} */}
            {/* Show frozen frame if scan is successful */}
            {qrError && (
              <div style={{ color: "red", marginTop: 8 }}>{qrError}</div>
            )}
            {qrScanResult && (
              <div style={{ marginTop: 16 }}>
                {qrScanResult && qrFrameDataUrl && (
                  <img
                    src={qrFrameDataUrl}
                    alt="QR Frame"
                    style={{
                      width: 260,
                      height: 260,
                      objectFit: "contain",
                      margin: "0 auto",
                      display: "block",
                      border: "1px solid #ccc",
                    }}
                  />
                )}
                <div style={{ color: "black" }}>
                  QR Result: <b>{qrScanResult}</b>
                </div>
                {cacheReady && (
                  <div style={{ color: "black" }}>
                    Lets invite : <b>{qrScanName}</b>
                  </div>
                )}
                <button
                  onClick={() => handleQrResult("inputCard")}
                  style={{ margin: 8 }}
                >
                  Use as input
                </button>

                <button
                  onClick={() => handleQrResult("cancel")}
                  style={{ margin: 8 }}
                >
                  Cancel
                </button>
              </div>
            )}
            {!qrScanResult && (
              <button
                onClick={() => handleQrResult("cancel")}
                style={{ marginTop: 16 }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
      <h1>五行怪物卡牌戰鬥（開發版本）</h1>
      {/* Peer results box
      <div style={{ marginTop: 24, background: '#f6f8fa', borderRadius: 8, padding: 16, minHeight: 48 }}>
        <b>Here's what others calculated!</b>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {peerResults.length === 0 && <li style={{ color: '#888' }}>No peer results yet.</li>}
          {peerResults.map((r, i) => (
            <li key={r.peer + r.result + i} style={{ color: '#333' }}>
              <span style={{ fontWeight: 500 }}>Peer:</span> {r.peer.slice(0, 8)}... &rarr; <span style={{ fontFamily: 'monospace' }}>{r.result}</span>
            </li>
          ))}
        </ul>
      </div> */}
      {/* 五行怪物卡牌戰鬥遊戲 */}
      <div style={{ marginTop: 40 }}>
        <Battle cacheCardData={inputCard} />
      </div>
      <p className="read-the-docs">誰讓兄弟用VsCode copilot煮代碼的</p>
      {/* Hidden canvas for frame capture */}
      <canvas ref={qrCanvasRef} style={{ display: "none" }} />
    </>
  );
}

export default App;
