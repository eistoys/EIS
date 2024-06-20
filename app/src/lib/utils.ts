export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export const bufferToDataURL = (buffer: Buffer): string => {
  const base64String = buffer.toString("base64");
  return `data:image/png;base64,${base64String}`;
};

export const encodeSVGToDataURL = (svg: string) => {
  const svg64 = btoa(svg);
  const image64 = `data:image/svg+xml;base64,${svg64}`;
  return image64;
};

export const decodeDataURLToSVG = (dataURL: string) => {
  const base64 = dataURL.split(",")[1]; // Get the base64 part of the data URL
  const svg = atob(base64); // Decode the base64 string
  return svg;
};

export const truncateString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
};

export const escapeString = (str: string) => {
  return str.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
};
