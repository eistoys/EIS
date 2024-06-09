export const encodeSVGToDataURL = (svg: string) => {
  const svg64 = btoa(svg);
  const image64 = `data:image/svg+xml;base64,${svg64}`;
  return image64;
};

export const truncateString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
};
