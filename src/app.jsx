import React, { useState, useCallback, useRef } from 'react';
import './App.css';

const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26;

function App() {
  const [data, setData] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [editingCell, setEditingCell] = useState(null);

  const getCellValue = useCallback((row, col) => {
    const key = `${row},${col}`;
    return data[key]?.value ?? '';
  }, [data]);

  const getCellFormula = useCallback((row, col) => {
    const key = `${row},${col}`;
    return data[key]?.formula ?? '';
  }, [data]);

  const updateCell = useCallback((row, col, value) => {
    setData(prev => {
      const key = `${row},${col}`;
      const newData = { ...prev };
      
      if (typeof value === 'string' && value.startsWith('=')) {
        newData[key] = { formula: value, value: '' };
      } else {
        newData[key] = { formula: '', value };
      }
      
      return newData;
    });
  }, []);

  const handleCellSelect = useCallback((row, col, shiftKey = false) => {
    if (shiftKey && selectedCell) {
      const minRow = Math.min(selectedCell.row, row);
      const maxRow = Math.max(selectedCell.row, row);
      const minCol = Math.min(selectedCell.col, col);
      const maxCol = Math.max(selectedCell.col, col);
      setSelectedRange({ start: { row: minRow, col: minCol }, end: { row: maxRow, col: maxCol } });
    } else {
      setSelectedCell({ row, col });
      setSelectedRange(null);
    }
    setEditingCell(null);
  }, [selectedCell]);

  const handleCellDoubleClick = useCallback((row, col) => {
    setEditingCell({ row, col });
  }, []);

  const handleCellEdit = useCallback((row, col, value) => {
    updateCell(row, col, value);
    setEditingCell(null);
  }, [updateCell]);

  const addRow = useCallback((afterRow) => {
    setData(prev => {
      const newData = {};
      Object.entries(prev).forEach(([key, val]) => {
        const [r, c] = key.split(',').map(Number);
        if (r > afterRow) {
          newData[`${r + 1},${c}`] = val;
        } else {
          newData[key] = val;
        }
      });
      return newData;
    });
  }, []);

  const deleteRow = useCallback((row) => {
    setData(prev => {
      const newData = {};
      Object.entries(prev).forEach(([key, val]) => {
        const [r, c] = key.split(',').map(Number);
        if (r > row) {
          newData[`${r - 1},${c}`] = val;
        } else if (r < row) {
          newData[key] = val;
        }
      });
      return newData;
    });
  }, []);

  const addColumn = useCallback((afterCol) => {
    setData(prev => {
      const newData = {};
      Object.entries(prev).forEach(([key, val]) => {
        const [r, c] = key.split(',').map(Number);
        if (c > afterCol) {
          newData[`${r},${c + 1}`] = val;
        } else {
          newData[key] = val;
        }
      });
      return newData;
    });
  }, []);

  const deleteColumn = useCallback((col) => {
    setData(prev => {
      const newData = {};
      Object.entries(prev).forEach(([key, val]) => {
        const [r, c] = key.split(',').map(Number);
        if (c > col) {
          newData[`${r},${c - 1}`] = val;
        } else if (c < col) {
          newData[key] = val;
        }
      });
      return newData;
    });
  }, []);

  const getSelectedValue = () => {
    if (!selectedCell) return '';
    const key = `${selectedCell.row},${selectedCell.col}`;
    return data[key]?.formula || data[key]?.value || '';
  };

  return (
    <div className="app">
    <h1>Чето работает</h1>
  </div>
  )
}

export default App;