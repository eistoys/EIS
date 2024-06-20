import React, { useRef, useState, useEffect } from "react";
import { FaRedo, FaUndo } from "react-icons/fa";

interface Pixel {
  x: number;
  y: number;
  color: string;
}

const gridSize = 64;
const pixelSize = 8;

const PixelEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [history, setHistory] = useState<Pixel[][]>([]);
  const [redoStack, setRedoStack] = useState<Pixel[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState<number>(16);

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

    // Draw pixels for the pen size
    const cellSize = gridSize / penSize;
    const cellX = Math.floor(x / cellSize) * cellSize;
    const cellY = Math.floor(y / cellSize) * cellSize;

    for (let i = 0; i < cellSize; i++) {
      for (let j = 0; j < cellSize; j++) {
        const penX = cellX + i;
        const penY = cellY + j;
        const existingPenPixelIndex = newPixels.findIndex(
          (p) => p.x === penX && p.y === penY
        );
        if (existingPenPixelIndex !== -1) {
          newPixels[existingPenPixelIndex] = {
            x: penX,
            y: penY,
            color: currentColor,
          };
        } else {
          newPixels.push({ x: penX, y: penY, color: currentColor });
        }
      }
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

  const handleImportImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          if (ctx) {
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const newPixels: Pixel[] = [];

            for (let y = 0; y < gridSize; y++) {
              for (let x = 0; x < gridSize; x++) {
                const pixelX = Math.floor((x / gridSize) * img.width);
                const pixelY = Math.floor((y / gridSize) * img.height);
                const index = (pixelY * img.width + pixelX) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const a = imageData.data[index + 3];

                if (a > 0) {
                  // Only include non-transparent pixels
                  const color = `rgba(${r},${g},${b},${a / 255})`;
                  newPixels.push({ x, y, color });
                }
              }
            }

            setPixels(newPixels);
            addToHistory(newPixels);
          }
        };

        img.src = imageData;
      };
      reader.readAsDataURL(file);
    }
  };

  const convertCanvasToImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      return canvas.toDataURL("image/png");
    }
    return null;
  };

  const handleDownload = () => {
    const imageDataURL = convertCanvasToImage();
    if (imageDataURL) {
      const link = document.createElement("a");
      link.download = "pixel-art.png";
      link.href = imageDataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 py-4">
        <select
          value={penSize}
          onChange={(e) => setPenSize(parseInt(e.target.value))}
          className="px-2 py-1 bg-gray-200 rounded-md"
        >
          <option value={8}>8x8</option>
          <option value={16}>16x16</option>
          <option value={32}>32x32</option>
          <option value={64}>64x64</option>
        </select>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className="border-none"
        />
        <button
          onClick={handleUndo}
          className="p-2 border border-gray-200 rounded-md"
        >
          <FaUndo className="text-white" />
        </button>
        <button
          onClick={handleRedo}
          className="p-2 border border-gray-200 rounded-md"
        >
          <FaRedo className="text-white" />
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleImportImage}
          className="px-2 py-1 bg-gray-200 rounded-md"
        />
        <button
          onClick={handleDownload}
          className="px-2 py-1 bg-gray-200 rounded-md"
        >
          Download PNG
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
