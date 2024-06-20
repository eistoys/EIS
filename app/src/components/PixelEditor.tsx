import React, { useState, useRef } from "react";

interface Pixel {
  x: number;
  y: number;
  color: string;
}

const gridSize = 16; // Define your grid size here

const PixelEditor: React.FC = () => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [history, setHistory] = useState<Pixel[][]>([]);
  const [redoStack, setRedoStack] = useState<Pixel[][]>([]);
  const isDrawing = useRef(false);

  const addToHistory = (newPixels: Pixel[]) => {
    setHistory([...history, newPixels]);
    setRedoStack([]); // Clear redo stack when a new action is taken
  };

  const handleClick = (x: number, y: number) => {
    const newPixel = { x, y, color: currentColor };
    const newPixels = [...pixels, newPixel];
    setPixels(newPixels);
    addToHistory(newPixels);
  };

  const handleMouseDown = () => {
    isDrawing.current = true;
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleMouseOver = (x: number, y: number) => {
    if (isDrawing.current) {
      handleClick(x, y);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      setRedoStack([pixels, ...redoStack]);
      setPixels(previousState || []);
      setHistory(newHistory);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.shift();
      setHistory([...history, pixels]);
      setPixels(nextState || []);
      setRedoStack(newRedoStack);
    }
  };

  const renderPixels = () => {
    const pixelElements = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const pixelColor =
          pixels.find((p) => p.x === x && p.y === y)?.color || "#ffffff";
        pixelElements.push(
          <div
            key={`${x}-${y}`}
            onClick={() => handleClick(x, y)}
            onMouseDown={() => handleClick(x, y)}
            onMouseOver={() => handleMouseOver(x, y)}
            className="w-6 h-6 border-gray-200"
            style={{ backgroundColor: pixelColor }}
          ></div>
        );
      }
    }
    return pixelElements;
  };

  return (
    <div
      className="flex flex-col items-center"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="flex mb-4">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className="m-2 border-none"
        />
        <button onClick={handleUndo} className="m-2 p-2 bg-gray-200">
          Undo
        </button>
        <button onClick={handleRedo} className="m-2 p-2 bg-gray-200">
          Redo
        </button>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gap: "0px",
        }}
      >
        {renderPixels()}
      </div>
    </div>
  );
};

export default PixelEditor;
