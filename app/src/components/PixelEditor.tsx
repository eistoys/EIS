import React, { useRef, useState, useEffect } from "react";

interface Pixel {
  x: number;
  y: number;
  color: string;
}

const gridSize = 16;
const pixelSize = 24;

const PixelEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [history, setHistory] = useState<Pixel[][]>([]);
  const [redoStack, setRedoStack] = useState<Pixel[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawGrid(ctx);
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        clearCanvas(ctx);
        drawPixels(ctx);
      }
    }
  }, [pixels]);

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

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    for (let x = 0; x <= gridSize; x++) {
      ctx.moveTo(x * pixelSize, 0);
      ctx.lineTo(x * pixelSize, gridSize * pixelSize);
    }
    for (let y = 0; y <= gridSize; y++) {
      ctx.moveTo(0, y * pixelSize);
      ctx.lineTo(gridSize * pixelSize, y * pixelSize);
    }
    ctx.strokeStyle = "#ddd";
    ctx.stroke();
  };

  const drawPixels = (ctx: CanvasRenderingContext2D) => {
    pixels.forEach(({ x, y, color }) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });
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

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / pixelSize);
      const y = Math.floor((event.clientY - rect.top) / pixelSize);
      setIsDrawing(true);
      handleClick(x, y);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / pixelSize);
        const y = Math.floor((event.clientY - rect.top) / pixelSize);
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

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 py-4">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className="border-none"
        />
        <button
          onClick={handleUndo}
          className="px-2 py-1 bg-gray-200 rounded-md"
        >
          Undo
        </button>
        <button
          onClick={handleRedo}
          className="px-2 py-1 bg-gray-200 rounded-md"
        >
          Redo
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={gridSize * pixelSize}
        height={gridSize * pixelSize}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="bg-white"
      />
    </div>
  );
};

export default PixelEditor;
