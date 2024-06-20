import React, { useState, useRef } from "react";

interface Pixel {
  x: number;
  y: number;
  color: string;
}

const gridSize = 16;

const PixelEditor: React.FC = () => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [history, setHistory] = useState<Pixel[][]>([]);
  const [redoStack, setRedoStack] = useState<Pixel[][]>([]);
  const isDrawing = useRef(false);

  const addToHistory = (newPixels: Pixel[]) => {
    if (
      history.length > 0 &&
      JSON.stringify(history[history.length - 1]) === JSON.stringify(newPixels)
    ) {
      return;
    }
    setHistory([...history, newPixels]);
    setRedoStack([]);
  };

  const handleClick = (x: number, y: number) => {
    const newPixel = { x, y, color: currentColor };
    const existingPixelIndex = pixels.findIndex((p) => p.x === x && p.y === y);
    let newPixels;
    if (existingPixelIndex !== -1) {
      newPixels = [...pixels];
      newPixels[existingPixelIndex] = newPixel;
    } else {
      newPixels = [...pixels, newPixel];
    }
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

  const handleTouchStart = (x: number, y: number) => {
    isDrawing.current = true;
    handleClick(x, y);
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isDrawing.current) {
      const touch = event.touches[0];
      const element = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      ) as HTMLElement;
      if (
        element &&
        element.dataset &&
        element.dataset.x &&
        element.dataset.y
      ) {
        const x = parseInt(element.dataset.x, 10);
        const y = parseInt(element.dataset.y, 10);
        handleClick(x, y);
      }
    }
  };

  const handleUndo = () => {
    const newHistory = [...history];
    const previousState = newHistory[newHistory.length - 2];
    newHistory.pop();
    setRedoStack([pixels, ...redoStack]);
    setPixels(previousState || []);
    setHistory(newHistory);
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
            data-x={x}
            data-y={y}
            onMouseDown={() => handleClick(x, y)}
            onMouseOver={() => handleMouseOver(x, y)}
            onTouchStart={() => handleTouchStart(x, y)}
            onTouchMove={handleTouchMove}
            style={{
              backgroundColor: pixelColor,
              margin: "-0.25px",
              width: "24px",
              height: "24px",
            }}
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
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center gap-2 py-4">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className="border-none"
        />
        <button onClick={handleUndo} className="p-2 bg-gray-200">
          Undo
        </button>
        <button onClick={handleRedo} className="p-2 bg-gray-200">
          Redo
        </button>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {renderPixels()}
      </div>
    </div>
  );
};

export default PixelEditor;
