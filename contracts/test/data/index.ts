import fs from "fs";
import path from "path";

export const smallSVG = fs.readFileSync(
  path.join(__dirname, "987b.svg"),
  "utf8"
);

export const middleSVG = fs.readFileSync(
  path.join(__dirname, "132619b.svg"),
  "utf8"
);

export const largeSVG = fs.readFileSync(
  path.join(__dirname, "325953b.svg"),
  "utf8"
);
