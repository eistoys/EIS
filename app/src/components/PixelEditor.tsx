import React, { useState, useEffect, useMemo, useCallback } from "react";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  Layers3,
  Proportions,
  FileUp,
  FileDown,
  Grid,
  ScanSearch,
  ZoomOut,
  ZoomIn,
  Pen,
  PaintBucket,
  Eraser,
  Undo,
  Redo,
} from "lucide-react";

interface Pixel {
  x: number;
  y: number;
  color: string;
}

interface Layer {
  id: number;
  name: string;
  pixels: Pixel[];
  visible: boolean;
  opacity: number;
}

interface HistoryEntry {
  layers: Layer[];
  activeLayerId: number;
}

const canvasPixelCount = 64;
const downloadSize = 256;
const minZoomFactor = 1;
const maxZoomFactor = 8;

const PixelEditor: React.FC = () => {
  const canvasRef = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      setCanvas(node);
    }
  }, []);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const gridCanvasRef = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      setGridCanvas(node);
    }
  }, []);
  const [gridCanvas, setGridCanvas] = useState<HTMLCanvasElement | null>(null);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<"pen" | "eraser" | "fill" | "search">("pen");

  const [gridCount, setGridCount] = useState<number>(16);
  const [pixelSize, setPixelSize] = useState<number>(1);
  const [penSize, setPenSize] = useState<number>(1);
  const [showGrid, setShowGrid] = useState(true);

  const cellSize = useMemo(() => canvasPixelCount / gridCount, [gridCount]);
  const canvasLength = useMemo(() => canvasPixelCount * pixelSize, [pixelSize]);

  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: minZoomFactor });
  const [cameraZoomFactor, setCameraZoomFactor] = useState(1);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const [currentDrawing, setCurrentDrawing] = useState<Pixel[]>([]);

  const defaultLayerId = Date.now();
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: defaultLayerId,
      name: "Layer 1",
      pixels: [],
      visible: true,
      opacity: 100,
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<number>(defaultLayerId);
  const [showLayerModal, setShowLayerModal] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const handleZoomIn = () => {
    setCameraZoomFactor((prev) => Math.min(maxZoomFactor, prev + 1));
  };

  const handleZoomOut = () => {
    setCameraZoomFactor((prev) => Math.max(minZoomFactor, prev - 1));
  };

  useEffect(() => {
    setCamera((prevCamera) => {
      const newZoom = cameraZoomFactor;
      const maxPan = canvasLength * (newZoom - 1);
      const newX = Math.max(-maxPan, Math.min(0, prevCamera.x));
      const newY = Math.max(-maxPan, Math.min(0, prevCamera.y));
      return {
        ...prevCamera,
        zoom: newZoom,
        x: newX,
        y: newY,
      };
    });
  }, [cameraZoomFactor]);

  const handlePan = (dx: number, dy: number) => {
    if (camera.zoom <= 1) return;

    setCamera((prevCamera) => {
      const newX = prevCamera.x + dx;
      const newY = prevCamera.y + dy;

      const maxPan = canvasLength * (camera.zoom - 1);

      return {
        ...prevCamera,
        x: Math.max(-maxPan, Math.min(0, newX)),
        y: Math.max(-maxPan, Math.min(0, newY)),
      };
    });
  };

  useEffect(() => {
    const handleResize = () => {
      let width = Math.min(window.innerWidth, window.innerHeight - 300);
      const newPixelSize = Math.max(1, Math.floor(width / canvasPixelCount));
      setPixelSize(newPixelSize);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const preventDefault = (e: Event) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };
    canvas.addEventListener("touchstart", preventDefault, { passive: false });
    canvas.addEventListener("touchmove", preventDefault, { passive: false });
    canvas.addEventListener("mousedown", preventDefault);
    canvas.addEventListener("mousemove", preventDefault);
    return () => {
      canvas.removeEventListener("touchstart", preventDefault);
      canvas.removeEventListener("touchmove", preventDefault);
      canvas.removeEventListener("mousedown", preventDefault);
      canvas.removeEventListener("mousemove", preventDefault);
    };
  }, [canvas]);

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx) {
      clearCanvas(ctx);
      drawLayers(ctx);
    }
  }, [canvas, layers, pixelSize, camera]);

  const drawLayers = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    [...layers]
      .reverse()
      .sort()
      .forEach((layer) => {
        if (layer.visible) {
          ctx.globalAlpha = layer.opacity;
          layer.pixels.forEach(({ x, y, color }) => {
            ctx.fillStyle = color;
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
          });
        }
      });
    ctx.restore();
  };

  const addNewLayer = () => {
    const existingLayerNumbers = layers
      .map((layer) => parseInt(layer.name.replace("Layer ", "")))
      .sort((a, b) => a - b);

    let nextLayerNumber = 1;
    for (let i = 0; i < existingLayerNumbers.length; i++) {
      if (existingLayerNumbers[i] !== nextLayerNumber) {
        break;
      }
      nextLayerNumber++;
    }

    const newLayer: Layer = {
      id: Date.now(),
      name: `Layer ${nextLayerNumber}`,
      pixels: [],
      visible: true,
      opacity: 1,
    };
    setLayers([newLayer, ...layers]);
    setActiveLayerId(newLayer.id);
  };

  const toggleLayerVisibility = (id: number) => {
    setLayers(
      layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const removeLayer = (id: number) => {
    if (layers.length > 1) {
      const newLayers = layers.filter((layer) => layer.id !== id);
      setLayers(newLayers);
      if (activeLayerId === id) {
        setActiveLayerId(newLayers[0].id);
      }
    }
  };

  useEffect(() => {
    if (!gridCanvas) {
      return;
    }

    const ctx = gridCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    if (showGrid) {
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);
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
      ctx.restore();
    }
  }, [gridCanvas, showGrid, pixelSize, cellSize, camera]);

  const addToHistory = useCallback(() => {
    const newHistoryEntry: HistoryEntry = {
      layers,
      activeLayerId,
    };
    setHistory((prevHistory) => {
      const lastEntry = prevHistory[prevHistory.length - 1];
      const isDuplicate =
        lastEntry &&
        JSON.stringify(lastEntry) === JSON.stringify(newHistoryEntry);
      if (!isDuplicate) {
        return [...prevHistory, newHistoryEntry];
      }
      return prevHistory;
    });
    setRedoStack([]);
  }, [layers, activeLayerId]);

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const draw = (x: number, y: number) => {
    const activeLayer = layers.find((layer) => layer.id === activeLayerId);
    if (!activeLayer) return;

    let newPixels = [...activeLayer.pixels];

    const currentPixel = newPixels.find((p) => p.x === x && p.y === y);
    const targetColor = currentPixel ? currentPixel.color : "#ffffff";

    // let newPixels = [...pixels];
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
            continue;
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

      const existingPixelIndex = newPixels.findIndex(
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

    const newLayers = layers.map((layer) =>
      layer.id === activeLayerId ? { ...layer, pixels: newPixels } : layer
    );
    setLayers(newLayers);
    setCurrentDrawing(newPixels);
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(
      (clientX - rect.left - camera.x) / (pixelSize * camera.zoom)
    );
    const y = Math.floor(
      (clientY - rect.top - camera.y) / (pixelSize * camera.zoom)
    );
    setIsDrawing(true);

    if (mode === "search") {
      setLastMousePos({ x: clientX, y: clientY });
    } else {
      draw(x, y);
    }
  };

  const handleEnd = useCallback(() => {
    setIsDrawing(false);
    if (currentDrawing.length > 0) {
      addToHistory();
      setCurrentDrawing([]);
    }
  }, [currentDrawing, addToHistory]);

  useEffect(() => {
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [handleEnd]);

  const handleMove = (clientX: number, clientY: number) => {
    // const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;

    if (mode === "search") {
      const dx = clientX - lastMousePos.x;
      const dy = clientY - lastMousePos.y;

      handlePan(dx, dy);
      setLastMousePos({ x: clientX, y: clientY });
    } else {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(
        (clientX - rect.left - camera.x) / (pixelSize * camera.zoom)
      );
      const y = Math.floor(
        (clientY - rect.top - camera.y) / (pixelSize * camera.zoom)
      );
      draw(x, y);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode == "pen" || mode == "eraser") {
      const offsetX = event.clientX + (pixelSize * cellSize) / 2;
      const offsetY = event.clientY + (pixelSize * cellSize) / 2;
      handleStart(offsetX, offsetY);
    } else {
      handleStart(event.clientX, event.clientY);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode == "pen" || mode == "eraser") {
      const offsetX = event.clientX + (pixelSize * cellSize) / 2;
      const offsetY = event.clientY + (pixelSize * cellSize) / 2;
      handleMove(offsetX, offsetY);
    } else {
      handleMove(event.clientX, event.clientY);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = event.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = event.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const currentState = newHistory.pop();
      const previousState = newHistory[newHistory.length - 1];
      if (currentState) {
        setRedoStack((prevRedoStack) => [...prevRedoStack, currentState]);
        const layerId = Date.now();
        setLayers(
          previousState?.layers || [
            {
              id: layerId,
              name: "Layer 1",
              pixels: [],
              visible: true,
              opacity: 100,
            },
          ]
        );
        setActiveLayerId(previousState?.activeLayerId || layerId);
        setHistory(newHistory);
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop();

      if (nextState) {
        setHistory((prevHistory) => [...prevHistory, nextState]);
        setLayers(nextState.layers);
        setActiveLayerId(nextState.activeLayerId);
        setRedoStack(newRedoStack);
      }
    }
  };

  const handleImportImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = canvasPixelCount;
          canvas.height = canvasPixelCount;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(
              img,
              0,
              0,
              img.width,
              img.height,
              0,
              0,
              canvasPixelCount,
              canvasPixelCount
            );
            const imageData = ctx.getImageData(
              0,
              0,
              canvasPixelCount,
              canvasPixelCount
            );
            const newPixels: Pixel[] = [];

            for (let y = 0; y < canvasPixelCount; y++) {
              for (let x = 0; x < canvasPixelCount; x++) {
                const index = (y * canvasPixelCount + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const a = imageData.data[index + 3];

                if (a > 0) {
                  const color = `rgba(${r},${g},${b},${a / 255})`;
                  newPixels.push({ x, y, color });
                }
              }
            }

            setLayers((prevLayers) => {
              return prevLayers.map((layer) => {
                if (layer.id === activeLayerId) {
                  const updatedPixels = [...layer.pixels];
                  newPixels.forEach((newPixel) => {
                    const existingPixelIndex = updatedPixels.findIndex(
                      (p) => p.x === newPixel.x && p.y === newPixel.y
                    );
                    if (existingPixelIndex !== -1) {
                      updatedPixels[existingPixelIndex] = newPixel;
                    } else {
                      updatedPixels.push(newPixel);
                    }
                  });
                  return { ...layer, pixels: updatedPixels };
                }
                return layer;
              });
            });

            addToHistory();
          }
        };
        img.src = imageData;
      };
      reader.readAsDataURL(file);
    }
  };

  const convertCanvasToImage = (): string | null => {
    const offScreenCanvas = document.createElement("canvas");
    offScreenCanvas.width = downloadSize;
    offScreenCanvas.height = downloadSize;
    const ctx = offScreenCanvas.getContext("2d");

    if (ctx) {
      const cellSize = downloadSize / canvasPixelCount;

      [...layers]
        .reverse()
        .sort()
        .forEach((layer) => {
          if (layer.visible) {
            ctx.globalAlpha = layer.opacity;
            layer.pixels.forEach(({ x, y, color }) => {
              ctx.fillStyle = color;
              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            });
          }
        });

      return offScreenCanvas.toDataURL("image/png");
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
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return "";
    const cursorSize = pixelSize * cellSize * penSize;
    canvas.width = cursorSize;
    canvas.height = cursorSize;

    const isColorMoreBlackOrWhite = (color: string) => {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128 ? "white" : "black";
    };

    if (mode === "pen") {
      context.fillStyle = currentColor;
      context.fillRect(0, 0, cursorSize, cursorSize);
      const borderColor = isColorMoreBlackOrWhite(currentColor);
      context.strokeStyle = borderColor;
      context.lineWidth = 2; // Adjust the border thickness as needed
      context.strokeRect(0, 0, cursorSize, cursorSize);
    } else if (mode === "eraser") {
      context.fillStyle = "white";
      context.fillRect(0, 0, cursorSize, cursorSize);
      context.strokeStyle = "black";
      context.lineWidth = 2;
      context.strokeRect(0, 0, cursorSize, cursorSize);
    }

    return canvas.toDataURL();
  };

  const getCursorStyle = () => {
    if (mode === "pen" || mode === "eraser") {
      return `url(${createSquareCursor()}) ${pixelSize / 2} ${
        pixelSize / 2
      }, auto`;
    } else {
      return "pointer";
    }
  };

  useEffect(() => {
    if (!canvas) {
      return;
    }
    canvas.style.cursor = getCursorStyle();
  }, [canvas, mode, pixelSize, cellSize, penSize, currentColor]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    const items = Array.from(layers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLayers(items);
  };

  const changeLayerOpacity = (id: number, opacity: number) => {
    setLayers(
      layers.map((layer) => (layer.id === id ? { ...layer, opacity } : layer))
    );
  };

  const generatePreview = (layer: Layer) => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.globalAlpha = layer.opacity;
      layer.pixels.forEach(({ x, y, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(x / 2, y / 2, 1, 1);
      });
    }
    return canvas.toDataURL();
  };

  const handleLayerNameChange = (id: number, newName: string) => {
    setLayers(
      layers.map((layer) =>
        layer.id === id ? { ...layer, name: newName } : layer
      )
    );
  };

  return (
    <>
      {pixelSize > 1 && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 py-4">
            <button
              onClick={handleUndo}
              className="p-1 border border-gray-200 rounded-md"
            >
              <Undo className="text-white" size={24} />
            </button>
            <button
              onClick={handleRedo}
              className="p-1 border border-gray-200 rounded-md"
            >
              <Redo className="text-white" size={24} />
            </button>
            <button
              onClick={handleZoomIn}
              className={`p-1 border border-gray-200 rounded-md ${
                cameraZoomFactor === maxZoomFactor &&
                "opacity-25 cursor-not-allowed"
              }`}
            >
              <ZoomIn className="text-white" size={24} />
            </button>
            <button
              onClick={handleZoomOut}
              className={`p-1 border border-gray-200 rounded-md ${
                cameraZoomFactor === minZoomFactor &&
                "opacity-25 cursor-not-allowed"
              }`}
            >
              <ZoomOut className="text-white" size={24} />
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1 border border-gray-200 rounded-md ${
                showGrid && "bg-[#FFD582]"
              }`}
            >
              <Grid
                className="text-white"
                size={24}
                color={showGrid ? "#191D88" : "white"}
              />
            </button>
            <button
              onClick={() => setShowLayerModal(true)}
              className="p-1 border border-gray-200 rounded-md"
            >
              <Layers3 className="text-white" size={24} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
                className={`p-1 border border-gray-200 rounded-md ${
                  showMenu && "bg-[#FFD582]"
                }`}
              >
                <ChevronDown
                  className="text-white"
                  size={24}
                  color={showMenu ? "#191D88" : "white"}
                />
              </button>
              {showMenu && (
                <>
                  <div
                    className="absolute inset-0 h-20 cursor-pointer"
                    onClick={() => setShowMenu(false)}
                    onMouseEnter={() => setShowMenu(true)}
                    onMouseLeave={() => setShowMenu(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg z-10"
                    onMouseEnter={() => setShowMenu(true)}
                    onMouseLeave={() => setShowMenu(false)}
                  >
                    <button
                      className="block w-full py-3 hover:bg-gray-700 flex justify-center"
                      onClick={() => {
                        setShowMenu(false);
                        setShowSizeModal(true);
                      }}
                    >
                      <Proportions className="text-white" size={24} />
                    </button>
                    <label
                      htmlFor="file-upload"
                      className="w-full block py-3 cursor-pointer hover:bg-gray-600 flex justify-center"
                    >
                      <FileUp className="text-white" size={24} />
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
                      className="block w-full py-3 hover:bg-gray-700 flex justify-center"
                    >
                      <FileDown className="text-white" size={24} />
                    </button>
                  </div>
                </>
              )}
            </div>
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
              className={`p-1 border border-gray-200 rounded-md ${
                mode === "pen" && "bg-[#FFD582]"
              }`}
            >
              <Pen
                className="text-white"
                size={24}
                color={mode === "pen" ? "#191D88" : "white"}
              />
            </button>
            <button
              onClick={() => setMode("fill")}
              className={`p-1 border border-gray-200 rounded-md ${
                mode === "fill" && "bg-[#FFD582]"
              }`}
            >
              <PaintBucket
                className="text-white"
                size={24}
                color={mode === "fill" ? "#191D88" : "white"}
              />
            </button>
            <button
              onClick={() => setMode("eraser")}
              className={`p-1 border border-gray-200 rounded-md ${
                mode === "eraser" && "bg-[#FFD582]"
              }`}
            >
              <Eraser
                className="text-white"
                size={24}
                color={mode === "eraser" ? "#191D88" : "white"}
              />
            </button>
            <button
              onClick={() => setMode("search")}
              disabled={cameraZoomFactor === minZoomFactor}
              className={`p-1 border border-gray-200 rounded-md ${
                cameraZoomFactor === minZoomFactor
                  ? "opacity-25 cursor-not-allowed"
                  : mode === "search" && "bg-[#FFD582]"
              }`}
            >
              <ScanSearch
                className="text-white"
                size={24}
                color={
                  cameraZoomFactor !== minZoomFactor && mode === "search"
                    ? "#191D88"
                    : "white"
                }
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
      {showLayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Layer</h2>
              <button
                onClick={() => setShowLayerModal(false)}
                className="text-white hover:text-gray-400 text-2xl"
              >
                &times;
              </button>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="layers">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {layers.map((layer, index) => (
                      <Draggable
                        key={layer.id.toString()}
                        draggableId={layer.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center p-2 mb-2 rounded ${
                              layer.id === activeLayerId
                                ? "bg-white text-black"
                                : "bg-gray-700 text-white"
                            }`}
                            onClick={() => {
                              setActiveLayerId(layer.id);
                            }}
                          >
                            <img
                              src={generatePreview(layer)}
                              alt={layer.name}
                              className="w-8 h-8 mr-2 border border-gray-800 rounded"
                            />
                            <div className="flex-grow">
                              <input
                                type="text"
                                value={layer.name}
                                onChange={(e) =>
                                  handleLayerNameChange(
                                    layer.id,
                                    e.target.value
                                  )
                                }
                                className="bg-gray-600 text-white rounded px-2 py-1 w-24 md:w-40"
                              />
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={layer.opacity}
                              onChange={(e) =>
                                changeLayerOpacity(
                                  layer.id,
                                  parseFloat(e.target.value)
                                )
                              }
                              className="w-16 mr-4"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLayerVisibility(layer.id);
                              }}
                              className="mr-4"
                            >
                              {layer.visible ? (
                                <Eye size={24} />
                              ) : (
                                <EyeOff size={24} />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLayer(layer.id);
                              }}
                              disabled={layers.length == 1}
                              className="disabled:opacity-25 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={24} />
                            </button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button
              onClick={addNewLayer}
              className="w-full py-2 mt-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-25 disabled:cursor-not-allowed"
              disabled={layers.length === 5}
            >
              +
            </button>
          </div>
        </div>
      )}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Canvas</h2>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-white hover:text-gray-400 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setGridCount(16);
                  setShowSizeModal(false);
                }}
                className={`font-bold w-full py-2 mt-2  rounded ${
                  gridCount === 16
                    ? "bg-white text-black"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                16 × 16
              </button>
              <button
                onClick={() => {
                  setGridCount(32);
                  setShowSizeModal(false);
                }}
                className={`font-bold w-full py-2 mt-2  rounded ${
                  gridCount === 32
                    ? "bg-white text-black"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                32 × 32
              </button>
              <button
                onClick={() => {
                  setGridCount(64);
                  setShowSizeModal(false);
                }}
                className={`font-bold w-full py-2 mt-2  rounded ${
                  gridCount === 64
                    ? "bg-white text-black"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                64 × 64
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PixelEditor;
