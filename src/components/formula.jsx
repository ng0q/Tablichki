import React from 'react';
import './formula.css';

function formula({ value, onFormulaChange }) {
  return (
    <div className="formula-bar">
      <span className="formula-label">fx</span>
      <input 
        className="formula-input"
        type="text" 
        value={value} 
        onChange={(e) => onFormulaChange(e.target.value)}
        placeholder="Введите значение или формулу"
      />
    </div>
  );
}

export default formula;