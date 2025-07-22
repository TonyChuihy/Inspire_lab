import React, { useState } from 'react'; 
import PokemonCard from './card';
function battle(){


    const initialCardData = [
    [ // Player 1's cards
        { name: '黃鐵礦獸', type: '金', hp: 60, attack: 40, defense: 24, retreat: 1, weakness: '火 +20', resistance: '木 -10', skill1: '狂化：增加12點攻擊力。', skill2: '金石為開：恢復8點生命值。', image: null },
        { name: '火焰獅', type: '火', hp: 70, attack: 50, defense: 20, retreat: 2, weakness: '水 +20', resistance: '金 -10', skill1: '烈焰：造成15點傷害。', skill2: '燃燒殆盡：犧牲10點生命值，造成30點傷害。', image: null },
        { name: '海嘯龜', type: '水', hp: 80, attack: 30, defense: 30, retreat: 3, weakness: '木 +20', resistance: '火 -10', skill1: '水槍：造成10點傷害。', skill2: '海嘯：造成25點傷害。', image: null }
    ],
    [ // Player 2's cards
        { name: '森林蜥蜴', type: '木', hp: 65, attack: 45, defense: 22, retreat: 1, weakness: '金 +20', resistance: '水 -10', skill1: '藤鞭：造成12點傷害。', skill2: '寄生種子：每回合恢復5點生命值。', image: null },
        { name: '雷霆鼠', type: '電', hp: 55, attack: 55, defense: 18, retreat: 0, weakness: '土 +20', resistance: '無', skill1: '電擊：造成18點傷害。', skill2: '雷霆：造成25點傷害，自身受到5點反傷。', image: null },
        { name: '岩石怪', type: '土', hp: 90, attack: 25, defense: 35, retreat: 4, weakness: '木 +20', resistance: '電 -10', skill1: '落石：造成8點傷害。', skill2: '地震：造成20點傷害，對方下回合無法行動。', image: null }
    ]
    ];
    
    // Update function
    function updateCardData(playerNumber, cardNumber, name, newValue) {
    setCardData(prev => {
        // Deep copy to avoid mutating state
        const updated = prev.map(playerCards => playerCards.map(card => ({ ...card })));
        // Adjust for 0-based index
        updated[playerNumber - 1][cardNumber - 1][name] = newValue;
        return updated;
    });
    }
    const handleImageUpload = (playerNumber, cardNumber, imageSrc) => {
    const setData = player === 'player1' ? setPlayer1Data : setPlayer2Data;
    setData(prev => ({ ...prev, image: imageSrc }));
  };
        
        
    return (
        <div>
                <h1 className="text-center text-[2.5em] text-[#333] mb-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                🥇 🌳 五行怪物卡牌戰鬥 🌊🔥⛰️
                </h1>
                
                <div className="flex gap-10 mb-8">
                <div className="flex-1 bg-[#f8f9fa] p-6 rounded-[15px] border-2 border-[#e9ecef]">
                    <PokemonCard
                    player="player1"
                    cardData={initialCardData[0][0]}
                    onImageUpload={handleImageUpload}
                    onInputChange={handleInputChange}
                    onDownload={handleDownload}
                    />
                </div>

                <div className="flex-1 bg-[#f8f9fa] p-6 rounded-[15px] border-2 border-[#e9ecef]">
                    <PokemonCard
                    player="player2"
                    cardData={player2Data}
                    onImageUpload={handleImageUpload}
                    onInputChange={handleInputChange}
                    onDownload={handleDownload}
                    />
                </div>
                </div>

                <button
                onClick={startBattle}
                className="w-full p-5 bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white border-none rounded-[15px] text-2xl font-bold cursor-pointer transition-transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                ⚔️ 開始決鬥
                </button>
            </div>
    )
}