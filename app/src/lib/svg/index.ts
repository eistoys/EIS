export const encodeSVGToDataURL = (svg: string) => {
  console.log("encodeSVG.svg", svg);
  const svg64 = btoa(svg);
  const image64 = `data:image/svg+xml;base64,${svg64}`;
  console.log("encodeSVG.image64", image64);
  return image64;
};
