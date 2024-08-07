import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Eye,
  EyeOff,
  Trash2,
  Pen,
  PaintBucket,
  Eraser,
  Pipette,
  Shuffle,
} from "lucide-react";
import { gql, useQuery } from "@apollo/client";
import { SpinnerLoader } from "@/components/SpinnerLoader";

import GridIcon from "./icons/grid.svg";
import UndoIcon from "./icons/undo.svg";
import RedoIcon from "./icons/redo.svg";
import ZoomInIcon from "./icons/zoom-in.svg";
import ZoomOutIcon from "./icons/zoom-out.svg";
import LayerIcon from "./icons/layer.svg";
import DropIcon from "./icons/drop.svg";
import CanvasIcon from "./icons/canvas.svg";
import FileUpIcon from "./icons/file-up.svg";
import FileDownIcon from "./icons/file-down.svg";
import RemixIcon from "./icons/remix.svg";
import MoveIcon from "./icons/move.svg";

interface PixelEditorProps {
  referenceTokenImage?: string;
  onRemixTokenSelected: (tokenId: BigInt, image: string) => void;
}

export interface PixelEditorRef {
  getImageDataURL: () => string;
}

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
const maxLayerCount = 6;
const maxColorCount = 8;
const minimumLength = 320;

const GET_LATEST_RECORDS = gql`
  query GetLatestRecords {
    hanabiRecords(first: 1000, orderBy: tokenId, orderDirection: desc) {
      tokenId
      creator
      uri
    }
  }
`;

export const PixelEditor = forwardRef<PixelEditorRef, PixelEditorProps>(
  ({ referenceTokenImage, onRemixTokenSelected }, ref) => {
    const { data: latestData } = useQuery(GET_LATEST_RECORDS);

    const [references, setReferences] = useState<
      {
        tokenId: BigInt;
        image: string;
      }[]
    >([]);

    useEffect(() => {
      if (!latestData) {
        return;
      }
      setReferences(
        latestData.hanabiRecords
          .filter((r: any) => r.uri)
          .map((record: any) => {
            return {
              tokenId: BigInt(record.tokenId),
              image: JSON.parse(
                record.uri.split("data:application/json;utf8,")[1]
              ).image,
            };
          })
      );
    }, [latestData]);

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
    const [gridCanvas, setGridCanvas] = useState<HTMLCanvasElement | null>(
      null
    );
    const transparentBgCanvasRef = useRef<HTMLCanvasElement>(null);

    const [currentColor, setCurrentColor] = useState<string>("#000000");
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<
      "pen" | "eraser" | "fill" | "search" | "picker"
    >("pen");

    const [gridCount, setGridCount] = useState<number>(64);
    const [pixelSize, setPixelSize] = useState<number>(1);
    const [penSize, setPenSize] = useState<number>(1);
    const [showGrid, setShowGrid] = useState(true);

    const cellSize = useMemo(() => canvasPixelCount / gridCount, [gridCount]);
    const canvasLength = useMemo(
      () => canvasPixelCount * pixelSize,
      [pixelSize]
    );

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
    const [showRemixModal, setShowRemixModal] = useState(false);

    const [shouldAddToHistory, setShouldAddToHistory] = useState(false);

    const [palettes, setPalettes] = useState({
      DEFAULT: [
        "#000000",
        "#FFFFFF",
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FFFF00",
        "#FF00FF",
        "#00FFFF",
      ],
      GAMEBOY: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
      "1 Bit Monitor": ["#222323", "#f0f6f0"],
      "TWILIGHT 5": ["#fbbbad", "#ee8695", "#4a7a96", "#333f58", "#292831"],
      "STAR POP": ["#674577", "#64b9ca", "#ffa3d6", "#ffebe5"],
      VOLTAGE: ["#1c1412", "#635650", "#d3ae21", "#d4c9c3"],
      "BLUSH GB": ["#fe9192", "#fcdebe", "#0cc0d4", "#5e5768"],
      FUZZYFOUR: ["#302387", "#ff3796", "#00faac", "#fffdaf"],
      "SOFTSERVE 4": ["#e64270", "#64c1bd", "#ead762", "#e3e6e8"],
      "PEPE THE FROG": [
        "#44891A",
        "#B1D355",
        "#000000",
        "#FFFFFF",
        "#FF3300",
        "#8B0000",
      ],
      DOGE: ["#ffffff", "#dfcd8d", "#d4c27d", "#dcc690"],
    });

    useEffect(() => {
      if (!transparentBgCanvasRef.current) return;
      const ctx = transparentBgCanvasRef.current.getContext("2d");
      if (!ctx) return;

      const tileSize = cellSize * pixelSize;
      const lightColor = "rgba(255, 255, 255, 1)";
      const darkColor = "rgba(224, 224, 224, 1)";

      ctx.save();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      for (let y = 0; y < canvasLength; y += tileSize) {
        for (let x = 0; x < canvasLength; x += tileSize) {
          ctx.fillStyle =
            (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0
              ? lightColor
              : darkColor;
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }

      ctx.restore();
    }, [canvasLength, camera, cellSize, pixelSize]);

    useEffect(() => {
      if (!referenceTokenImage) {
        return;
      }
      loadImageSrc(referenceTokenImage);
    }, [referenceTokenImage]);

    const [selectedPalette, setSelectedPalette] =
      useState<keyof typeof palettes>("DEFAULT");

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

    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
      const handleResize = () => {
        const windowWidth = window.innerWidth;
        setWindowWidth(windowWidth);
        const windowHeight = window.innerHeight;
        const verticlePaddingWidth = 12 * 2;
        const headerHeight = windowWidth < 768 ? 48 : 60;
        const marginHeight = 20 * 5;
        const toolBar1Height = 36;
        const toolBar2Height = 36;
        const toolBar3Height = 52;
        const footerHeight = 40;

        const availableWidth = windowWidth - verticlePaddingWidth;

        let availableHeight = 0;

        if (windowWidth < 768) {
          availableHeight =
            windowHeight -
            headerHeight -
            marginHeight -
            toolBar1Height -
            toolBar2Height -
            toolBar3Height -
            footerHeight;
        } else {
          availableHeight =
            windowHeight -
            headerHeight -
            marginHeight -
            toolBar1Height -
            toolBar2Height -
            toolBar3Height;
        }

        let length = Math.min(availableWidth, availableHeight);
        if (length < minimumLength) {
          length = minimumLength;
        }
        const newPixelSize = Math.max(1, Math.floor(length / canvasPixelCount));
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
            ctx.globalAlpha = layer.opacity / 100;
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
        opacity: 100,
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

        // Draw grid lines
        ctx.beginPath();
        for (let x = 0; x <= gridCount; x++) {
          ctx.moveTo(x * cellSize * pixelSize, 0);
          ctx.lineTo(x * cellSize * pixelSize, canvasLength);
        }
        for (let y = 0; y <= gridCount; y++) {
          ctx.moveTo(0, y * cellSize * pixelSize);
          ctx.lineTo(canvasLength, y * cellSize * pixelSize);
        }
        ctx.strokeStyle = "#ccc";
        ctx.stroke();

        // Draw dots
        const dotInterval = gridCount / 4; // Adjust this value to change the spacing of dots
        ctx.fillStyle = "#bbb"; // Color of the dots
        for (let x = 0; x <= gridCount; x += dotInterval) {
          for (let y = 0; y <= gridCount; y += dotInterval) {
            ctx.beginPath();
            ctx.arc(
              x * cellSize * pixelSize,
              y * cellSize * pixelSize,
              2,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }
        }

        ctx.restore();
      }
    }, [gridCanvas, showGrid, pixelSize, cellSize, camera]);

    const addToHistory = useCallback(() => {
      setHistory((prevHistory) => {
        const newHistoryEntry: HistoryEntry = {
          layers,
          activeLayerId,
        };
        const lastEntry = prevHistory[prevHistory.length - 1];
        const isDuplicate =
          lastEntry &&
          JSON.stringify(lastEntry) === JSON.stringify(newHistoryEntry);
        if (!isDuplicate) {
          return [...prevHistory, JSON.parse(JSON.stringify(newHistoryEntry))];
        }
        return prevHistory;
      });
      setRedoStack([]);
    }, [history, layers, activeLayerId]);

    useEffect(() => {
      if (shouldAddToHistory) {
        addToHistory();
        setShouldAddToHistory(false);
      }
    }, [layers, shouldAddToHistory]);

    const clearCanvas = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    const draw = (x: number, y: number) => {
      const activeLayer = layers.find((layer) => layer.id === activeLayerId);
      if (!activeLayer) return;

      let newPixels = [...activeLayer.pixels];

      const currentPixel = newPixels.find((p) => p.x === x && p.y === y);
      const targetColor = currentPixel ? currentPixel.color : "transparent";

      if (mode === "fill") {
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
            if (
              x < 0 ||
              x >= canvasPixelCount ||
              y < 0 ||
              y >= canvasPixelCount
            )
              continue;
            const pixelIndex = newPixels.findIndex(
              (p) => p.x === x && p.y === y
            );
            const pixel = newPixels[pixelIndex];

            if (!pixel || pixel.color === targetColor) {
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
        const cellX = Math.floor(x / cellSize) * cellSize;
        const cellY = Math.floor(y / cellSize) * cellSize;

        for (let i = 0; i < cellSize * penSize; i++) {
          for (let j = 0; j < cellSize * penSize; j++) {
            const penX = cellX + i;
            const penY = cellY + j;
            const existingPenPixelIndex = newPixels.findIndex(
              (p) => p.x === penX && p.y === penY
            );
            if (mode === "eraser") {
              if (existingPenPixelIndex !== -1) {
                newPixels.splice(existingPenPixelIndex, 1);
              }
            } else {
              if (existingPenPixelIndex !== -1) {
                newPixels[existingPenPixelIndex] = {
                  x: penX,
                  y: penY,
                  color: currentColor,
                };
              } else {
                newPixels.push({
                  x: penX,
                  y: penY,
                  color: currentColor,
                });
              }
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
      } else if (mode === "picker") {
        pickColor(x, y);
      } else {
        draw(x, y);
      }
    };

    const convertToHex = (color: string): string => {
      // Helper function to convert a number to a 2-digit hex string
      const toHex = (num: number): string => {
        const hex = num.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };

      // Check if the color is already in #rrggbb format
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return color;
      }

      // Handle rgba format
      if (color.startsWith("rgba")) {
        const match = color.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
        );
        if (match) {
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
      }

      // Handle #rrggbbaa format
      if (/^#[0-9A-Fa-f]{8}$/.test(color)) {
        return color.slice(0, 7);
      }

      // If we can't convert, return a default color
      console.warn(`Unable to convert color: ${color}`);
      return "#000000";
    };

    const pickColor = (x: number, y: number) => {
      const activeLayer = layers.find((layer) => layer.id === activeLayerId);
      if (!activeLayer) return;

      const pixel = activeLayer.pixels.find((p) => p.x === x && p.y === y);
      if (pixel) {
        const hexColor = convertToHex(pixel.color);
        setCurrentColor(hexColor);
        setMode("pen"); // Switch back to pen mode after picking a color
      }
    };

    const handleEnd = useCallback(() => {
      setIsDrawing(false);
      if (currentDrawing.length > 0) {
        setShouldAddToHistory(true);
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
          setRedoStack((prevRedoStack) => [
            ...prevRedoStack,
            JSON.parse(JSON.stringify(currentState)),
          ]);
          const layerId = Date.now();
          setLayers(
            previousState?.layers
              ? JSON.parse(JSON.stringify(previousState?.layers))
              : [
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
          setHistory((prevHistory) => [
            ...prevHistory,
            JSON.parse(JSON.stringify(nextState)),
          ]);
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
          loadImageSrc(imageData);
          event.target.value = "";
        };
        reader.readAsDataURL(file);
      }
    };

    const loadImageSrc = (imageSrc: string) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = canvasPixelCount;
        canvas.height = canvasPixelCount;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const scale = Math.min(
            canvasPixelCount / img.width,
            canvasPixelCount / img.height
          );

          const scaledWidth = Math.floor(img.width * scale);
          const scaledHeight = Math.floor(img.height * scale);
          const offsetX = Math.floor((canvasPixelCount - scaledWidth) / 2);
          const offsetY = Math.floor((canvasPixelCount - scaledHeight) / 2);

          // Create a temporary canvas to hold the original image
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          const tempCtx = tempCanvas.getContext("2d");

          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0, img.width, img.height);
            const originalImageData = tempCtx.getImageData(
              0,
              0,
              img.width,
              img.height
            );

            // Draw pixel by pixel with scaling
            for (let y = 0; y < scaledHeight; y++) {
              for (let x = 0; x < scaledWidth; x++) {
                const sourceX = Math.floor(x / scale);
                const sourceY = Math.floor(y / scale);
                const sourceIndex = (sourceY * img.width + sourceX) * 4;

                const r = originalImageData.data[sourceIndex];
                const g = originalImageData.data[sourceIndex + 1];
                const b = originalImageData.data[sourceIndex + 2];
                const a = originalImageData.data[sourceIndex + 3];

                ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
                ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
              }
            }

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
                  return { ...layer, pixels: newPixels };
                }
                return layer;
              });
            });

            setShouldAddToHistory(true);
          }
        }
      };
      img.src = imageSrc;
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
              ctx.globalAlpha = layer.opacity / 100;
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

    useImperativeHandle(ref, () => ({
      getImageDataURL() {
        const imageDataURL = convertCanvasToImage();
        return imageDataURL as string;
      },
    }));

    const createSquareCursor = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return "";
      const cursorSize = pixelSize * cellSize * penSize * cameraZoomFactor;
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
        return `url(${createSquareCursor()}) ${
          (pixelSize * cameraZoomFactor) / 2
        } ${(pixelSize * cameraZoomFactor) / 2}, auto`;
      } else if (mode === "picker") {
        return "crosshair";
      } else {
        return "pointer";
      }
    };

    useEffect(() => {
      if (!canvas) {
        return;
      }
      canvas.style.cursor = getCursorStyle();
    }, [
      canvas,
      mode,
      pixelSize,
      cellSize,
      penSize,
      currentColor,
      cameraZoomFactor,
    ]);

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
      console.log("layer", layer);

      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw transparent checkerboard background
        const tileSize = 4; // Size of each checkerboard tile
        const lightColor = "rgba(255, 255, 255, 1)";
        const darkColor = "rgba(224, 224, 224, 1)";

        for (let y = 0; y < canvas.height; y += tileSize) {
          for (let x = 0; x < canvas.width; x += tileSize) {
            ctx.fillStyle =
              (x / tileSize + y / tileSize) % 2 === 0 ? lightColor : darkColor;
            ctx.fillRect(x, y, tileSize, tileSize);
          }
        }

        // Draw layer pixels
        ctx.globalAlpha = layer.opacity / 100;
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

    const randomizeColor = () => {
      setLayers((prevLayers) => {
        const activeLayer = prevLayers.find(
          (layer) => layer.id === activeLayerId
        );
        if (!activeLayer) return prevLayers;
        const uniqueColors = new Set(
          activeLayer.pixels.map((pixel) => pixel.color)
        );
        const colorMap = new Map();
        uniqueColors.forEach((color) => {
          const randomColor = `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")}`;
          colorMap.set(color, randomColor);
        });
        const updatedPixels = activeLayer.pixels.map((pixel) => {
          const newColor = colorMap.get(pixel.color) || pixel.color;
          return { ...pixel, color: newColor };
        });
        return prevLayers.map((layer) =>
          layer.id === activeLayerId
            ? { ...layer, pixels: updatedPixels }
            : layer
        );
      });
      setShouldAddToHistory(true);
    };

    // const insertColor = () => {
    //   if (currentColor && !palettes[selectedPalette].includes(currentColor)) {
    //     setPalettes((prevPalettes) => {
    //       const newPalettes = { ...prevPalettes };
    //       newPalettes[selectedPalette] = [
    //         ...newPalettes[selectedPalette],
    //         currentColor,
    //       ];
    //       return newPalettes;
    //     });
    //   }
    // };

    return (
      <>
        {pixelSize > 1 && (
          <div className="flex flex-col items-center">
            <div
              className={`flex justify-between items-center h-9 mb-5 w-full px-3 md:px-0`}
              style={{
                maxWidth: `${windowWidth > 728 ? canvasLength : windowWidth}px`,
              }}
            >
              <div className="space-x-4 flex">
                <button
                  onClick={handleUndo}
                  className="flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9"
                >
                  <UndoIcon stroke="white" />
                </button>
                <button
                  onClick={handleRedo}
                  className="flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9"
                >
                  <RedoIcon stroke="white" />
                </button>
              </div>
              <div className="space-x-4 flex">
                <button
                  onClick={handleZoomIn}
                  className={`flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9 ${
                    cameraZoomFactor === maxZoomFactor &&
                    "opacity-25 cursor-not-allowed"
                  }`}
                >
                  <ZoomInIcon stroke="white" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className={`flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9 ${
                    cameraZoomFactor === minZoomFactor &&
                    "opacity-25 cursor-not-allowed"
                  }`}
                >
                  <ZoomOutIcon stroke="white" />
                </button>
              </div>
              <div className="space-x-4 flex">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9 ${
                    showGrid && "bg-white"
                  }`}
                >
                  <GridIcon stroke={showGrid ? "#191D88" : "white"} />
                </button>
                <button
                  onClick={() => setShowLayerModal(true)}
                  className="flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9"
                >
                  <LayerIcon stroke="white" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(true)}
                    onMouseLeave={() => setShowMenu(false)}
                    className={`flex items-center justify-center p-1 border rounded-md h-9 w-9 bg-[#337CCF] border border-[#888888] ${
                      showMenu && "bg-[#337CCF] border border-[#888888]"
                    }`}
                  >
                    <DropIcon fill="white" />
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
                        className="absolute right-0 mt-2 w-40 bg-[#191D88] rounded-md shadow-lg z-10"
                        onMouseEnter={() => setShowMenu(true)}
                        onMouseLeave={() => setShowMenu(false)}
                      >
                        <button
                          className="block w-full py-3 hover:bg-[#337CCF] flex justify-center"
                          onClick={() => {
                            setShowMenu(false);
                            setShowSizeModal(true);
                          }}
                        >
                          <CanvasIcon stroke="white" />
                        </button>
                        <label
                          htmlFor="file-upload"
                          className="w-full block py-3 cursor-pointer hover:bg-[#337CCF] flex justify-center"
                        >
                          <FileUpIcon stroke="white" />
                        </label>

                        <button
                          onClick={handleDownload}
                          className="block w-full py-3 hover:bg-[#337CCF] flex justify-center"
                        >
                          <FileDownIcon stroke="white" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div
              className="relative mb-5"
              style={{ width: canvasLength, height: canvasLength }}
            >
              <canvas
                ref={transparentBgCanvasRef}
                width={canvasLength}
                height={canvasLength}
                className="absolute top-0 left-0"
              />
              <canvas
                ref={canvasRef}
                width={canvasLength}
                height={canvasLength}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                className="absolute top-0 left-0"
              />
              <canvas
                ref={gridCanvasRef}
                width={canvasLength}
                height={canvasLength}
                className="absolute top-0 left-0 pointer-events-none"
              />
            </div>

            <div
              className={`flex justify-between items-center h-9 mb-5 w-full px-3 md:px-0`}
              style={{
                maxWidth: `${windowWidth > 728 ? canvasLength : windowWidth}px`,
              }}
            >
              <div className="space-x-4 flex">
                <button
                  onClick={() => setMode("pen")}
                  className={`flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9 ${
                    mode === "pen" && "bg-white"
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
                  className={`flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9 ${
                    mode === "fill" && "bg-white"
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
                  className={`flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9 ${
                    mode === "eraser" && "bg-white"
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
                  className={`flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9 ${
                    cameraZoomFactor === minZoomFactor
                      ? "opacity-25 cursor-not-allowed"
                      : mode === "search" && "bg-white"
                  }`}
                >
                  <MoveIcon
                    stroke={
                      cameraZoomFactor !== minZoomFactor && mode === "search"
                        ? "#191D88"
                        : "white"
                    }
                  />
                </button>
              </div>
              <div className="space-x-4 flex">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="border-none w-9 h-9"
                />
                <button
                  onClick={() => setMode("picker")}
                  className={`flex items-center justify-center p-1 border border-gray-200 rounded-md h-9 w-9 ${
                    mode === "picker" && "bg-white"
                  }`}
                >
                  <Pipette
                    className="text-white"
                    size={24}
                    color={mode === "picker" ? "#191D88" : "white"}
                  />
                </button>
                <button
                  className="p-1 border border-[#FFC90D] rounded-md h-9 w-9"
                  onClick={() => setShowRemixModal(true)}
                >
                  <RemixIcon />
                </button>
              </div>
            </div>

            <div
              className={`flex items-center justify-between w-full px-3 md:px-0`}
              style={{
                maxWidth: `${windowWidth > 728 ? canvasLength : windowWidth}px`,
              }}
            >
              <select
                value={penSize}
                onChange={(e) => setPenSize(Number(e.target.value))}
                className="pl-1 rounded-md text-sm bg-[#337CCF] border border-[#888888] text-white font-bold h-[52px] cursor-pointer focus:outline-none focus:ring-0"
              >
                <option value={1}>1x1</option>
                <option value={2}>2x2</option>
                <option value={3}>3x3</option>
                <option value={4}>4x4</option>
              </select>
              <div className="space-x-3 flex">
                <select
                  className="pl-1 rounded-md text-sm bg-[#337CCF] border border-[#888888] text-white font-bold h-[52px] w-[140px] cursor-pointer focus:outline-none focus:ring-0"
                  value={selectedPalette}
                  onChange={(e) =>
                    setSelectedPalette(e.target.value as keyof typeof palettes)
                  }
                >
                  {Object.keys(palettes).map((palette) => (
                    <option key={palette} value={palette}>
                      {palette}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col flex-wrap h-[52px] w-[106px]">
                  {Array.from({
                    length: Math.ceil(
                      palettes[selectedPalette].length / (maxColorCount / 2)
                    ),
                  }).map((_, rowIndex) => (
                    <div className="flex" key={rowIndex}>
                      {palettes[selectedPalette]
                        .slice(
                          rowIndex * (maxColorCount / 2),
                          rowIndex * (maxColorCount / 2) + maxColorCount / 2
                        )
                        .map((color, index) => (
                          <button
                            key={index}
                            className="h-[26px] w-[26px]"
                            style={{ backgroundColor: color }}
                            onClick={() => setCurrentColor(color)}
                          />
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {showLayerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-[#191D88] p-4 rounded-lg w-full max-w-md">
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
                              className={`flex items-center p-2 mb-2 rounded border ${
                                layer.id === activeLayerId
                                  ? "bg-white border-black"
                                  : "text-white"
                              }`}
                              onClick={() => {
                                setActiveLayerId(layer.id);
                              }}
                            >
                              <img
                                src={generatePreview(layer)}
                                alt={layer.name}
                                className={`w-8 h-8 mr-2 border rounded ${
                                  layer.id === activeLayerId
                                    ? "border-black"
                                    : ""
                                }`}
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
                                  className="border border-gray-800 font-bold bg-gray-200 text-black rounded px-2 py-1 w-24 md:w-40 focus:outline-none focus:ring-0"
                                />
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
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
                className="w-full py-2 mt-2 font-extrabold border text-white rounded disabled:opacity-25 disabled:cursor-not-allowed"
                disabled={layers.length === maxLayerCount}
              >
                +
              </button>
            </div>
          </div>
        )}
        {showSizeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-[#191D88] p-4 rounded-lg w-full max-w-md">
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
                      : "border text-white"
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
                      : "border text-white"
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
                      : "border text-white"
                  }`}
                >
                  64 × 64
                </button>
              </div>
            </div>
          </div>
        )}
        {showRemixModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-[#191D88] p-4 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">REMIX</h2>
                <button
                  onClick={() => setShowRemixModal(false)}
                  className="text-white hover:text-gray-400 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="flex justify-end items-center mb-4">
                <button
                  onClick={() => {
                    if (references.length > 0) {
                      const randomIndex = Math.floor(
                        Math.random() * references.length
                      );
                      const randomReference = references[randomIndex];
                      loadImageSrc(randomReference.image);
                      onRemixTokenSelected(
                        randomReference.tokenId,
                        randomReference.image
                      );
                      setShowRemixModal(false);
                    }
                  }}
                  className="bg-[#337CCF] text-white px-4 py-2 rounded-md flex items-center"
                  disabled={references.length === 0}
                >
                  <Shuffle className="mr-2" size={20} />
                  Random
                </button>
              </div>
              {references.length === 0 && <SpinnerLoader />}
              <div className="grid grid-cols-3 gap-4 overflow-y-auto h-[400px]">
                {references.map((reference, i) => {
                  return (
                    <img
                      key={`remix_${i}`}
                      src={reference.image}
                      className="bg-white rounded-xl cursor-pointer"
                      onClick={() => {
                        loadImageSrc(reference.image);
                        onRemixTokenSelected(
                          reference.tokenId,
                          reference.image
                        );
                        setShowRemixModal(false);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImportImage}
          className="hidden"
        />
        <div className="h-[60px] md:h-0" />
      </>
    );
  }
);

export default PixelEditor;
