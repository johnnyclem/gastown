import React from "react";
import "./BuildingDialog.css";

export default function BuildingDialog({ title, onClose, children }) {
  return (
    <div className="dialog-overlay">
      <div className="rpg-dialog">
        <div className="dialog-header">
          <span className="dialog-title">{title}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          {children}
        </div>
        <div className="dialog-footer">
          <span className="blink-cursor">▼</span>
        </div>
      </div>
    </div>
  );
}
