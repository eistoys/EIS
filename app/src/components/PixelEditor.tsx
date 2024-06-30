import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  FaRedo,
  FaUndo,
  FaUpload,
  FaDownload,
  FaEraser,
  FaPen,
  FaThLarge,
  FaFill,
} from "react-icons/fa";

interface Pixel {
  x: number;
  y: number;
  color: string;
}

const canvasPixelCount = 64;
const downloadSize = 256;

const PixelEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [history, setHistory] = useState<Pixel[][]>([]);
  const [redoStack, setRedoStack] = useState<Pixel[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<"pen" | "eraser" | "fill">("pen");

  const [gridCount, setGridCount] = useState<number>(16);
  const [pixelSize, setPixelSize] = useState<number>(1);
  const [penSize, setPenSize] = useState<number>(1);
  const [showGrid, setShowGrid] = useState(true);

  const cellSize = useMemo(() => canvasPixelCount / gridCount, [gridCount]);
  const canvasLength = useMemo(() => canvasPixelCount * pixelSize, [pixelSize]);

  useEffect(() => {
    const handleResize = () => {
      let width = Math.min(window.innerWidth, window.innerHeight - 270); // Limit the width to 512 pixels
      // width -= 32; // Subtract the padding
      const newPixelSize = Math.max(1, Math.floor(width / canvasPixelCount));
      setPixelSize(newPixelSize);
    };

    window.addEventListener("resize", handleResize);

    // Initial call to set pixel size based on window size
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const preventDefault = (e: Event) => {
      if (e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };
    window.addEventListener("touchstart", preventDefault);
    window.addEventListener("touchmove", preventDefault);
    window.addEventListener("mousedown", preventDefault);
    window.addEventListener("mousemove", preventDefault);
    return () => {
      window.removeEventListener("touchstart", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("mousedown", preventDefault);
      window.removeEventListener("mousemove", preventDefault);
    };
  }, []);

  useEffect(() => {
    const setIsDrawingFalse = () => {
      setIsDrawing(false);
    };
    window.addEventListener("mouseup", setIsDrawingFalse);
    window.addEventListener("touchend", setIsDrawingFalse);
    return () => {
      window.removeEventListener("mouseup", setIsDrawingFalse);
      window.removeEventListener("touchend", setIsDrawingFalse);
    };
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
  }, [pixels, pixelSize]);

  useEffect(() => {
    const gridCanvas = gridCanvasRef.current;
    if (!gridCanvas) return;

    const ctx = gridCanvas.getContext("2d");
    if (!ctx) return;

    // Always clear the grid canvas first
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    if (showGrid) {
      ctx.beginPath();
      for (let x = 0; x <= gridCount; x++) {
        ctx.moveTo(x * cellSize * pixelSize, 0);
        ctx.lineTo(x * cellSize * pixelSize, canvasLength);
      }
      for (let y = 0; y <= gridCount; y++) {
        ctx.moveTo(0, y * cellSize * pixelSize);
        ctx.lineTo(canvasLength, y * cellSize * pixelSize);
      }
      ctx.strokeStyle = "#ddd";
      ctx.stroke();
    }
  }, [showGrid, pixelSize, cellSize]);

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

  const drawPixels = (ctx: CanvasRenderingContext2D) => {
    pixels.forEach(({ x, y, color }) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    });
  };

  const draw = (x: number, y: number) => {
    const currentPixel = pixels.find((p) => p.x === x && p.y === y);
    const targetColor = currentPixel ? currentPixel.color : "#ffffff";

    let newPixels = [...pixels];
    if (mode === "fill") {
      const isInitialTransparent = !currentPixel;

      const floodFill = (
        x: number,
        y: number,
        targetColor: string,
        fillColor: string
      ) => {
        if (targetColor === fillColor) return;

        const stack = [{ x, y }];
        while (stack.length > 0) {
          const { x, y } = stack.pop() as { x: number; y: number };
          if (x < 0 || x >= canvasPixelCount || y < 0 || y >= canvasPixelCount)
            continue; // Boundary check
          const pixelIndex = newPixels.findIndex((p) => p.x === x && p.y === y);
          const pixel = newPixels[pixelIndex];
          const isTransparent = !pixel || pixel.color === "#ffffff";

          if (
            (pixel && pixel.color === targetColor) ||
            (isInitialTransparent && isTransparent)
          ) {
            if (pixel) {
              newPixels[pixelIndex].color = fillColor;
            } else {
              newPixels.push({ x, y, color: fillColor });
            }
            stack.push({ x: x + 1, y });
            stack.push({ x: x - 1, y });
            stack.push({ x, y: y + 1 });
            stack.push({ x, y: y - 1 });
          }
        }
      };

      floodFill(x, y, targetColor, currentColor);
    } else {
      const newPixel = {
        x,
        y,
        color: mode === "eraser" ? "#ffffff" : currentColor,
      };

      const existingPixelIndex = pixels.findIndex(
        (p) => p.x === x && p.y === y
      );

      if (existingPixelIndex !== -1) {
        newPixels[existingPixelIndex] = newPixel;
      } else {
        newPixels.push(newPixel);
      }

      const cellX = Math.floor(x / cellSize) * cellSize;
      const cellY = Math.floor(y / cellSize) * cellSize;

      for (let i = 0; i < cellSize * penSize; i++) {
        for (let j = 0; j < cellSize * penSize; j++) {
          const penX = cellX + i;
          const penY = cellY + j;
          const existingPenPixelIndex = newPixels.findIndex(
            (p) => p.x === penX && p.y === penY
          );
          if (existingPenPixelIndex !== -1) {
            newPixels[existingPenPixelIndex] = {
              x: penX,
              y: penY,
              color: mode === "eraser" ? "#ffffff" : currentColor,
            };
          } else {
            newPixels.push({
              x: penX,
              y: penY,
              color: mode === "eraser" ? "#ffffff" : currentColor,
            });
          }
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
      draw(x, y);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("handleMouseMove");
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / pixelSize);
        const y = Math.floor((event.clientY - rect.top) / pixelSize);
        draw(x, y);
      }
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];
      const x = Math.floor((touch.clientX - rect.left) / pixelSize);
      const y = Math.floor((touch.clientY - rect.top) / pixelSize);
      setIsDrawing(true);
      draw(x, y);
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    console.log("handleTouchMove");
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = Math.floor((touch.clientX - rect.left) / pixelSize);
        const y = Math.floor((touch.clientY - rect.top) / pixelSize);
        draw(x, y);
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
            const newPixels = [];

            for (let y = 0; y < canvasPixelCount; y++) {
              for (let x = 0; x < canvasPixelCount; x++) {
                const pixelX = Math.floor((x / canvasPixelCount) * img.width);
                const pixelY = Math.floor((y / canvasPixelCount) * img.height);
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

            // Get the existing pixels from state
            let updatedPixels = [...pixels];

            newPixels.forEach((newPixel) => {
              const existingPixelIndex = updatedPixels.findIndex(
                (p) => p.x === newPixel.x && p.y === newPixel.y
              );
              if (existingPixelIndex !== -1) {
                updatedPixels[existingPixelIndex] = newPixel; // Replace existing pixel
              } else {
                updatedPixels.push(newPixel); // Add new pixel
              }
            });

            setPixels(updatedPixels);
            addToHistory(updatedPixels);
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
      const sellSize = downloadSize / canvasPixelCount;
      const offScreenCanvas = document.createElement("canvas");
      offScreenCanvas.width = downloadSize;
      offScreenCanvas.height = downloadSize;
      const ctx = offScreenCanvas.getContext("2d");
      if (ctx) {
        pixels.forEach(({ x, y, color }) => {
          ctx.fillStyle = color;
          ctx.fillRect(x * sellSize, y * sellSize, sellSize, sellSize);
        });
        return offScreenCanvas.toDataURL("image/png");
      }
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

  const createSquareCursor = () => {
    let size = pixelSize * cellSize * penSize;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return "";
    canvas.width = size;
    canvas.height = size;
    context.fillStyle = mode === "pen" ? currentColor : "white";
    context.fillRect(0, 0, size, size);
    return canvas.toDataURL();
  };

  const getCursorStyle = () => {
    if (mode === "pen" || mode === "eraser") {
      return `url(${createSquareCursor()}) ${pixelSize / 2} ${
        pixelSize / 2
      }, auto`;
    }
    return "auto";
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = getCursorStyle();
    }
  }, [pixelSize, cellSize, penSize, currentColor]);

  return (
    <>
      {pixelSize > 1 && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 py-4">
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
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="p-2 border border-gray-200 rounded-md"
            >
              <FaThLarge className="text-white" />
            </button>
            <select
              value={gridCount}
              onChange={(e) => setGridCount(parseInt(e.target.value))}
              className="px-2 py-1 bg-gray-200 rounded-md"
            >
              <option value={8}>8x8</option>
              <option value={16}>16x16</option>
              <option value={32}>32x32</option>
              <option value={64}>64x64</option>
            </select>
            <label
              htmlFor="file-upload"
              className="p-2 border border-gray-200 rounded-md cursor-pointer"
            >
              <FaUpload className="text-white" />
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImportImage}
              className="hidden"
            />
            <button
              onClick={handleDownload}
              className="p-2 border border-gray-200 rounded-md"
            >
              <FaDownload className="text-white" />
            </button>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasLength}
              height={canvasLength}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className="bg-white"
            />
            <canvas
              ref={gridCanvasRef}
              width={canvasLength}
              height={canvasLength}
              className="absolute top-0 left-0 pointer-events-none"
            />
          </div>

          <div className="flex items-center gap-2 py-4">
            <button
              onClick={() => setMode("pen")}
              className={`p-2 border border-gray-200 rounded-md ${
                mode === "pen" && "active"
              }`}
            >
              <FaPen
                className={`text-white ${mode !== "pen" ? "opacity-20" : ""}`}
              />
            </button>
            <button
              onClick={() => setMode("fill")}
              className={`p-2 border border-gray-200 rounded-md ${
                mode === "fill" && "active"
              }`}
            >
              <FaFill
                className={`text-white ${mode !== "fill" ? "opacity-20" : ""}`}
              />
            </button>
            <button
              onClick={() => setMode("eraser")}
              className={`p-2 border border-gray-200 rounded-md ${
                mode === "eraser" && "active"
              }`}
            >
              <FaEraser
                className={`text-white ${
                  mode !== "eraser" ? "opacity-20" : ""
                }`}
              />
            </button>

            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="border-none"
            />
            <select
              value={penSize}
              onChange={(e) => setPenSize(Number(e.target.value))}
              className="px-2 py-1 bg-gray-200 rounded-md"
            >
              <option value={1}>1x1</option>
              <option value={2}>2x2</option>
              <option value={3}>3x3</option>
              <option value={4}>4x4</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default PixelEditor;
