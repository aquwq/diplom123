import React from 'react';
import "./ZGU.css";

function ZGU() {
  const links = [
    { name: "Сайт университета", url: "https://polaruniversity.ru/", icon: "🌐" },
    { name: "Онлайн платформа", url: "https://learn.norvuz.ru/", icon: "📘" },
    { name: "Новости", url: "https://polaruniversity.ru/news/", icon: "📰" },
  ];

  return (
    <div className="zgu-container">
      <h3>Переходы на сайты</h3>
      <div className="zgu-links-container">
        {links.map((link, index) => (
          <a 
            key={index} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="zgu-link"
          >
            <div className="zgu-icon">{link.icon}</div>
            <div className="zgu-title">{link.name}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default ZGU;
