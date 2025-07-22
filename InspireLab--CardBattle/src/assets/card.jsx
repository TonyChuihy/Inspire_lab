import React from 'react';
import './card.css'; // 引入樣式文件

// 五行顏色 class 對應
const wuxingClassMap = {
  '金': 'wuxing-jin',
  '木': 'wuxing-mu',
  '水': 'wuxing-shui',
  '火': 'wuxing-huo',
  '土': 'wuxing-tu',
};

/**
 * Card component for rendering a 五行怪物卡牌
 * @param {Object} props
 * @param {string} props.name - 卡牌名稱
 * @param {string} props.type - 五行屬性 ('金', '木', '水', '火', '土')
 * @param {string} props.image - 圖片 URL
 * @param {number} props.hp - 生命值
 * @param {number} props.attack - 攻擊力
 * @param {number} props.defense - 防禦力
 * @param {string} props.skill - 技能描述
 * @param {string} props.weakness - 弱點
 * @param {string} props.resistance - 抗性
 * @param {string} [props.className] - 額外 class
 */
export default function Card({
  name = 'ERROR_NAME_NOT_SET',
  type = '金',
  image = '',
  hp = 0,
  attack = 0,
  defense = 0,
  skill = '',
  weakness = '',
  resistance = '',
  className = '',
}) {
  const wuxingClass = wuxingClassMap[type] || 'wuxing-jin';
  return (
    <div className={`pokemon-card ${wuxingClass} ${className}`}>
      <div className="card-header" /* 可根據 type 加 dark-text */>
        <span className="card-name">{name}</span>
        <span className="card-type">{type}</span>
        <span className="energy-symbol" style={{ background: 'rgba(0,0,0,0.15)' }}></span>
      </div>
      <div className="card-image-container">
        {image ? (
          <img src={image} alt="怪物圖片" className="card-image" />
        ) : (
          <span className="placeholder-text">無圖片</span>
        )}
      </div>
      <div className="card-stats">
        <div className="stat-row">
          <span className="hp-display">HP: {hp}</span>
          <span className="attack-display">攻擊: {attack}</span>
        </div>
        <div className="stat-row">
          <span className="skill-display">技能: {skill}</span>
        </div>
        <div className="stat-row">
          <span>防禦: {defense}</span>
        </div>
      </div>
      <div className="card-footer">
        <div className="footer-row">
          <span className="weakness-resistance">弱點: {weakness}</span>
          <span className="weakness-resistance">抗性: {resistance}</span>
        </div>
        <div className="bottom-stats">
          {/* 可擴充其他資訊 */}
        </div>
      </div>
    </div>
  );
}
