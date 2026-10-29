import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outputDir = path.join(rootDir, "public", "images");
const tempDir = path.join(os.tmpdir(), "toyota-preview-assets");

fs.mkdirSync(tempDir, { recursive: true });

const symbol = ({ x, y, width, height, fill, opacity = 1 }) => `
  <ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width / 2}" ry="${height / 2}" fill="none" stroke="${fill}" stroke-opacity="${opacity}" stroke-width="6"/>
  <ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width * 0.18}" ry="${height / 2}" fill="none" stroke="${fill}" stroke-opacity="${opacity}" stroke-width="6"/>
  <ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width / 2}" ry="${height * 0.2}" fill="none" stroke="${fill}" stroke-opacity="${opacity}" stroke-width="6"/>
`;

const wordmark = ({ x, y, size, fill, opacity = 1, spacing = 14 }) => `
  <text
    x="${x}"
    y="${y}"
    text-anchor="middle"
    fill="${fill}"
    fill-opacity="${opacity}"
    font-family="DejaVu Sans, Arial, sans-serif"
    font-size="${size}"
    font-weight="800"
    letter-spacing="${spacing}"
  >TOYOTA</text>
`;

const logoBlock = ({
  centerX,
  symbolY,
  symbolWidth,
  symbolHeight,
  symbolFill,
  wordY,
  wordSize,
  wordFill,
  spacing = 14,
}) => `
  ${symbol({
    x: centerX - symbolWidth / 2,
    y: symbolY,
    width: symbolWidth,
    height: symbolHeight,
    fill: symbolFill,
  })}
  ${wordmark({
    x: centerX,
    y: wordY,
    size: wordSize,
    fill: wordFill,
    spacing,
  })}
`;

const embossedLogoBlock = ({
  centerX,
  symbolY,
  symbolWidth,
  symbolHeight,
  wordY,
  wordSize,
  baseFill,
  highlightFill,
  spacing = 12,
}) => `
  ${symbol({
    x: centerX - symbolWidth / 2 + 5,
    y: symbolY + 5,
    width: symbolWidth,
    height: symbolHeight,
    fill: highlightFill,
    opacity: 0.16,
  })}
  ${symbol({
    x: centerX - symbolWidth / 2,
    y: symbolY,
    width: symbolWidth,
    height: symbolHeight,
    fill: baseFill,
    opacity: 0.78,
  })}
  ${wordmark({
    x: centerX,
    y: wordY + 4,
    size: wordSize,
    fill: highlightFill,
    opacity: 0.15,
    spacing,
  })}
  ${wordmark({
    x: centerX,
    y: wordY,
    size: wordSize,
    fill: baseFill,
    opacity: 0.74,
    spacing,
  })}
`;

const sharedDefs = `
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6f6b59"/>
      <stop offset="42%" stop-color="#403c31"/>
      <stop offset="100%" stop-color="#15120d"/>
    </linearGradient>
    <radialGradient id="topGlow" cx="50%" cy="18%" r="56%">
      <stop offset="0%" stop-color="#f0ebdc" stop-opacity="0.78"/>
      <stop offset="26%" stop-color="#d8d2bf" stop-opacity="0.46"/>
      <stop offset="55%" stop-color="#8e8b75" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#8e8b75" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="midGlow" cx="50%" cy="56%" r="38%">
      <stop offset="0%" stop-color="#b8b39b" stop-opacity="0.36"/>
      <stop offset="100%" stop-color="#8e8b75" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="floorGlow" cx="50%" cy="50%" r="58%">
      <stop offset="0%" stop-color="#d8d2bf" stop-opacity="0.46"/>
      <stop offset="40%" stop-color="#8e8b75" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#8e8b75" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="stageTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4f4a3e"/>
      <stop offset="100%" stop-color="#302d25"/>
    </linearGradient>
    <linearGradient id="stageFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#27241c"/>
      <stop offset="100%" stop-color="#14120d"/>
    </linearGradient>
    <radialGradient id="badgeFace" cx="38%" cy="24%" r="70%">
      <stop offset="0%" stop-color="#7a7562"/>
      <stop offset="56%" stop-color="#413c30"/>
      <stop offset="100%" stop-color="#1c1813"/>
    </radialGradient>
    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5efdc"/>
      <stop offset="35%" stop-color="#cfc8b3"/>
      <stop offset="68%" stop-color="#8e8b75"/>
      <stop offset="100%" stop-color="#f5efdc"/>
    </linearGradient>
    <linearGradient id="flagDark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#454033"/>
      <stop offset="55%" stop-color="#2e2b22"/>
      <stop offset="100%" stop-color="#1a1711"/>
    </linearGradient>
    <linearGradient id="flagLight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5f1e6"/>
      <stop offset="65%" stop-color="#dbd4c0"/>
      <stop offset="100%" stop-color="#c1baa5"/>
    </linearGradient>
    <linearGradient id="poleGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a4037"/>
      <stop offset="100%" stop-color="#1d1813"/>
    </linearGradient>
    <linearGradient id="walletLeather" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#bf774b"/>
      <stop offset="52%" stop-color="#a55f37"/>
      <stop offset="100%" stop-color="#84492d"/>
    </linearGradient>
    <linearGradient id="walletSide" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b4f31"/>
      <stop offset="100%" stop-color="#6a3c24"/>
    </linearGradient>
    <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffd67c"/>
      <stop offset="100%" stop-color="#e49d1f"/>
    </linearGradient>
    <linearGradient id="softBlob" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f1ecde" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#8e8b75" stop-opacity="0.5"/>
    </linearGradient>
    <filter id="blur18" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <filter id="shadowSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="22" flood-color="#0a0806" flood-opacity="0.42"/>
    </filter>
  </defs>
`;

const frameStart = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    ${sharedDefs}
    <rect width="1080" height="1350" fill="url(#bgGrad)"/>
    <circle cx="540" cy="210" r="520" fill="url(#topGlow)"/>
    <circle cx="540" cy="760" r="280" fill="url(#midGlow)"/>
    <ellipse cx="540" cy="1150" rx="470" ry="170" fill="url(#floorGlow)"/>
`;

const frameEnd = `
    <rect width="1080" height="1350" fill="#050402" fill-opacity="0.08"/>
  </svg>
`;

const bg1 = `${frameStart}
  <ellipse cx="540" cy="1030" rx="390" ry="78" fill="#16130f" fill-opacity="0.4" filter="url(#blur18)"/>
  <ellipse cx="540" cy="1010" rx="378" ry="74" fill="url(#stageTop)"/>
  <rect x="160" y="1010" width="760" height="124" rx="62" fill="url(#stageFront)"/>
  <ellipse cx="540" cy="1074" rx="352" ry="8" fill="#e2ddcf" fill-opacity="0.84"/>
  <ellipse cx="540" cy="1106" rx="354" ry="7" fill="#d6cfbc" fill-opacity="0.76"/>
  <ellipse cx="540" cy="1138" rx="356" ry="6" fill="#b8b39b" fill-opacity="0.66"/>
  <ellipse cx="308" cy="742" rx="96" ry="66" fill="#8e8b75" fill-opacity="0.12" filter="url(#blur18)"/>
  <ellipse cx="772" cy="742" rx="96" ry="66" fill="#8e8b75" fill-opacity="0.12" filter="url(#blur18)"/>
  <g filter="url(#shadowSoft)">
    <circle cx="540" cy="770" r="228" fill="url(#badgeFace)" stroke="url(#ringGrad)" stroke-width="24"/>
    <circle cx="540" cy="770" r="190" fill="none" stroke="#d8d2bf" stroke-opacity="0.2" stroke-width="5"/>
    ${logoBlock({
      centerX: 540,
      symbolY: 665,
      symbolWidth: 470,
      symbolHeight: 156,
      symbolFill: "#f4efde",
      wordY: 875,
      wordSize: 48,
      wordFill: "#efe8d7",
      spacing: 18,
    })}
  </g>
  <g opacity="0.98">
    <line x1="165" y1="650" x2="180" y2="760" stroke="#d9d6c8" stroke-opacity="0.35" stroke-width="2"/>
    <line x1="120" y1="735" x2="138" y2="842" stroke="#d9d6c8" stroke-opacity="0.35" stroke-width="2"/>
    <line x1="920" y1="650" x2="902" y2="760" stroke="#d9d6c8" stroke-opacity="0.35" stroke-width="2"/>
    <line x1="965" y1="735" x2="948" y2="842" stroke="#d9d6c8" stroke-opacity="0.35" stroke-width="2"/>
    <ellipse cx="165" cy="620" rx="44" ry="58" fill="#9f9a82"/>
    <ellipse cx="120" cy="705" rx="42" ry="54" fill="#a9a58c"/>
    <ellipse cx="220" cy="705" rx="40" ry="52" fill="#f8f7f3"/>
    <ellipse cx="920" cy="620" rx="44" ry="58" fill="#9f9a82"/>
    <ellipse cx="965" cy="705" rx="42" ry="54" fill="#a9a58c"/>
    <ellipse cx="865" cy="705" rx="40" ry="52" fill="#f8f7f3"/>
    <ellipse cx="148" cy="598" rx="10" ry="14" fill="#ffffff" fill-opacity="0.62"/>
    <ellipse cx="104" cy="682" rx="10" ry="14" fill="#ffffff" fill-opacity="0.55"/>
    <ellipse cx="902" cy="598" rx="10" ry="14" fill="#ffffff" fill-opacity="0.62"/>
    <ellipse cx="948" cy="682" rx="10" ry="14" fill="#ffffff" fill-opacity="0.55"/>
  </g>
${frameEnd}`;

const bg2 = `${frameStart}
  <ellipse cx="540" cy="768" rx="230" ry="140" fill="#b8b39b" fill-opacity="0.18" filter="url(#blur18)"/>
  <ellipse cx="92" cy="272" rx="44" ry="118" fill="url(#softBlob)" transform="rotate(26 92 272)"/>
  <ellipse cx="204" cy="112" rx="30" ry="90" fill="url(#softBlob)" transform="rotate(-18 204 112)"/>
  <ellipse cx="978" cy="246" rx="44" ry="118" fill="url(#softBlob)" transform="rotate(-26 978 246)"/>
  <ellipse cx="868" cy="120" rx="30" ry="90" fill="url(#softBlob)" transform="rotate(20 868 120)"/>
  <ellipse cx="86" cy="928" rx="48" ry="86" fill="#8e8b75" fill-opacity="0.16" filter="url(#blur18)"/>
  <ellipse cx="994" cy="930" rx="48" ry="86" fill="#8e8b75" fill-opacity="0.16" filter="url(#blur18)"/>
  <g filter="url(#shadowSoft)">
    <rect x="140" y="430" width="12" height="760" rx="6" fill="url(#poleGrad)"/>
    <rect x="530" y="330" width="12" height="900" rx="6" fill="url(#poleGrad)"/>
    <rect x="928" y="430" width="12" height="760" rx="6" fill="url(#poleGrad)"/>
    <ellipse cx="146" cy="430" rx="15" ry="12" fill="#d67745"/>
    <ellipse cx="536" cy="330" rx="15" ry="12" fill="#d67745"/>
    <ellipse cx="934" cy="430" rx="15" ry="12" fill="#d67745"/>
    <path d="M160 470 C300 490 320 630 288 805 C265 930 288 1035 255 1135 L88 1118 C115 994 98 868 74 710 C58 594 76 494 160 470 Z" fill="url(#flagDark)"/>
    <path d="M159 478 C268 488 285 606 258 776 C238 898 255 1000 233 1092 L113 1082 C132 975 120 864 102 725 C88 622 95 512 159 478 Z" fill="#ffffff" fill-opacity="0.08"/>
    <path d="M420 380 C525 402 650 370 690 408 L682 1045 C595 1024 490 1068 404 1036 L412 382 Z" fill="url(#flagLight)"/>
    <path d="M430 390 C515 408 616 386 649 414 L640 1007 C570 990 494 1018 430 995 Z" fill="#ffffff" fill-opacity="0.12"/>
    <path d="M920 470 C780 490 760 630 792 805 C815 930 792 1035 825 1135 L992 1118 C965 994 982 868 1006 710 C1022 594 1004 494 920 470 Z" fill="url(#flagDark)"/>
    <path d="M921 478 C812 488 795 606 822 776 C842 898 825 1000 847 1092 L967 1082 C948 975 960 864 978 725 C992 622 985 512 921 478 Z" fill="#ffffff" fill-opacity="0.08"/>
  </g>
  <ellipse cx="192" cy="792" rx="126" ry="74" fill="#8e8b75" fill-opacity="0.16" filter="url(#blur18)"/>
  <ellipse cx="540" cy="716" rx="168" ry="96" fill="#8e8b75" fill-opacity="0.18" filter="url(#blur18)"/>
  <ellipse cx="888" cy="792" rx="126" ry="74" fill="#8e8b75" fill-opacity="0.16" filter="url(#blur18)"/>
  ${logoBlock({
    centerX: 191,
    symbolY: 735,
    symbolWidth: 170,
    symbolHeight: 56,
    symbolFill: "#f4efde",
    wordY: 816,
    wordSize: 22,
    wordFill: "#f4efde",
    spacing: 8,
  })}
  ${logoBlock({
    centerX: 540,
    symbolY: 642,
    symbolWidth: 226,
    symbolHeight: 74,
    symbolFill: "#605b4d",
    wordY: 753,
    wordSize: 30,
    wordFill: "#605b4d",
    spacing: 11,
  })}
  ${logoBlock({
    centerX: 889,
    symbolY: 735,
    symbolWidth: 170,
    symbolHeight: 56,
    symbolFill: "#f4efde",
    wordY: 816,
    wordSize: 22,
    wordFill: "#f4efde",
    spacing: 8,
  })}
${frameEnd}`;

const confetti = [
  [84, 116, 26],
  [174, 260, -18],
  [970, 110, -24],
  [920, 310, 16],
  [120, 1010, -18],
  [980, 1000, 22],
  [866, 1180, -26],
  [230, 1240, 26],
  [860, 820, 12],
  [240, 840, -10],
  [700, 150, -12],
  [380, 170, 20],
]
  .map(([x, y, rotate], index) => {
    const width = index % 3 === 0 ? 58 : 42;
    const height = index % 3 === 0 ? 24 : 18;
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="9" fill="url(#softBlob)" opacity="0.92" transform="rotate(${rotate} ${x + width / 2} ${y + height / 2})"/>`;
  })
  .join("");

const bg3 = `${frameStart}
  <ellipse cx="540" cy="786" rx="250" ry="156" fill="#b8b39b" fill-opacity="0.16" filter="url(#blur18)"/>
  <g opacity="0.9">${confetti}</g>
  <g filter="url(#shadowSoft)">
    <ellipse cx="540" cy="990" rx="292" ry="80" fill="#16130f" fill-opacity="0.42" filter="url(#blur18)"/>
    <rect x="336" y="475" width="168" height="420" rx="22" fill="#2f9142" transform="rotate(-12 336 475)"/>
    <rect x="555" y="470" width="154" height="398" rx="22" fill="#4c91ef" transform="rotate(8 555 470)"/>
    <circle cx="380" cy="968" r="92" fill="url(#coinGrad)"/>
    <circle cx="706" cy="986" r="92" fill="url(#coinGrad)"/>
    <circle cx="540" cy="500" r="70" fill="url(#coinGrad)"/>
    <rect x="250" y="540" width="580" height="470" rx="74" fill="url(#walletLeather)"/>
    <rect x="278" y="566" width="528" height="420" rx="62" fill="#ffffff" fill-opacity="0.06"/>
    <rect x="250" y="540" width="580" height="470" rx="74" fill="none" stroke="#7e462b" stroke-opacity="0.42" stroke-width="6"/>
    <rect x="616" y="640" width="250" height="164" rx="34" fill="url(#walletSide)"/>
    <rect x="610" y="648" width="248" height="148" rx="30" fill="#cf8455" fill-opacity="0.22"/>
    <circle cx="735" cy="720" r="28" fill="#f3efdf"/>
    <circle cx="735" cy="720" r="18" fill="#73757a"/>
    <ellipse cx="540" cy="756" rx="160" ry="126" fill="#9a603c" fill-opacity="0.28"/>
    <ellipse cx="540" cy="756" rx="156" ry="122" fill="none" stroke="#82472c" stroke-opacity="0.54" stroke-width="7"/>
    ${embossedLogoBlock({
      centerX: 540,
      symbolY: 706,
      symbolWidth: 288,
      symbolHeight: 94,
      wordY: 825,
      wordSize: 28,
      baseFill: "#7b462c",
      highlightFill: "#d79d76",
      spacing: 10,
    })}
  </g>
${frameEnd}`;

const assets = [
  { name: "bg1", svg: bg1 },
  { name: "bg2", svg: bg2 },
  { name: "bg3", svg: bg3 },
];

for (const asset of assets) {
  const svgPath = path.join(tempDir, `${asset.name}.svg`);
  fs.writeFileSync(svgPath, asset.svg);
}

console.log(`Wrote SVG sources to ${tempDir}`);
console.log(`Ready to render: ${assets.map((asset) => asset.name).join(", ")}`);
