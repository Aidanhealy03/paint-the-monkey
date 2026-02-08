const canvas = document.getElementById("paint-area");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color");
const sizeInput = document.getElementById("size");
const sizeValue = document.getElementById("size-value");
const brushButton = document.getElementById("brush");
const eraserButton = document.getElementById("eraser");
const clearButton = document.getElementById("clear");
const newReferenceButton = document.getElementById("new-reference");
const submitJudgingButton = document.getElementById("submit-judging");
const referenceImage = document.getElementById("reference-image");
const referenceSource = document.getElementById("reference-source");
const referenceTitle = document.getElementById("reference-title");
const referenceNote = document.getElementById("reference-note");
const scoreOverall = document.getElementById("score-overall");
const scoreColor = document.getElementById("score-color");
const scoreFeatures = document.getElementById("score-features");
const scoreNote = document.getElementById("score-note");

let drawing = false;
let brushSize = Number(sizeInput.value);
let brushColor = colorInput.value;
let isEraser = false;

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeMonkeySvg = () => {
  const faceWidth = randomBetween(180, 230);
  const faceHeight = randomBetween(170, 220);
  const faceX = (320 - faceWidth) / 2;
  const faceY = randomBetween(70, 95);
  const faceColor = `hsl(${randomBetween(18, 38)} ${randomBetween(40, 65)}% ${randomBetween(35, 55)}%)`;
  const muzzleColor = `hsl(${randomBetween(20, 35)} ${randomBetween(45, 70)}% ${randomBetween(65, 80)}%)`;
  const earOffset = randomBetween(10, 25);
  const earSize = randomBetween(55, 70);
  const eyeGap = randomBetween(55, 75);
  const eyeY = faceY + randomBetween(40, 60);
  const eyeSize = randomBetween(16, 22);
  const noseWidth = randomBetween(26, 36);
  const noseHeight = randomBetween(18, 24);
  const mouthWidth = randomBetween(70, 95);
  const mouthCurve = randomBetween(20, 35);
  const cheekSpot = randomBetween(0, 1) === 1;
  const tuftSize = randomBetween(18, 32);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
      <rect width="320" height="320" fill="#fef7e5"/>
      <circle cx="${faceX - earOffset}" cy="${faceY + 40}" r="${earSize / 2}" fill="${faceColor}" stroke="#5b3a1e" stroke-width="4"/>
      <circle cx="${faceX + faceWidth + earOffset}" cy="${faceY + 40}" r="${earSize / 2}" fill="${faceColor}" stroke="#5b3a1e" stroke-width="4"/>
      <rect x="${faceX}" y="${faceY}" width="${faceWidth}" height="${faceHeight}" rx="${randomBetween(70, 95)}" fill="${faceColor}" stroke="#5b3a1e" stroke-width="4"/>
      <ellipse cx="160" cy="${faceY + faceHeight - 45}" rx="${faceWidth / 2.4}" ry="${faceHeight / 3}" fill="${muzzleColor}"/>
      <circle cx="${160 - eyeGap / 2}" cy="${eyeY}" r="${eyeSize}" fill="#ffffff"/>
      <circle cx="${160 + eyeGap / 2}" cy="${eyeY}" r="${eyeSize}" fill="#ffffff"/>
      <circle cx="${160 - eyeGap / 2}" cy="${eyeY}" r="${eyeSize / 2.2}" fill="#1a1a1a"/>
      <circle cx="${160 + eyeGap / 2}" cy="${eyeY}" r="${eyeSize / 2.2}" fill="#1a1a1a"/>
      <rect x="${160 - noseWidth / 2}" y="${eyeY + 30}" width="${noseWidth}" height="${noseHeight}" rx="6" fill="#3b2a1a"/>
      <path d="M ${160 - mouthWidth / 2} ${eyeY + 65} Q 160 ${eyeY + 65 + mouthCurve} ${160 + mouthWidth / 2} ${eyeY + 65}" stroke="#2a1a0f" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M ${160} ${faceY - tuftSize} L ${160 - tuftSize} ${faceY + 10} L ${160 + tuftSize} ${faceY + 10} Z" fill="${faceColor}" stroke="#5b3a1e" stroke-width="3"/>
      ${cheekSpot ? `<circle cx="${faceX + 45}" cy="${faceY + faceHeight - 60}" r="12" fill="#e7a97d" opacity="0.6"/>` : ""}
    </svg>
  `;
};

const setLocalReference = () => {
  const svg = makeMonkeySvg().trim();
  referenceImage.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  referenceSource.textContent = "Source: local";
  referenceTitle.textContent = "Title: Random Monkey Sketch";
  referenceNote.textContent = "Generated locally because the server is unavailable.";
};

const setCanvasBackground = () => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

setCanvasBackground();

const resizeCanvas = () => {
  const temp = document.createElement("canvas");
  temp.width = canvas.width;
  temp.height = canvas.height;
  temp.getContext("2d").drawImage(canvas, 0, 0);

  const { width } = canvas.getBoundingClientRect();
  const scale = width / canvas.width;
  canvas.style.height = `${canvas.height * scale}px`;

  ctx.drawImage(temp, 0, 0);
};

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const getCoords = (event) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX || event.touches?.[0]?.clientX) - rect.left) * (canvas.width / rect.width),
    y: ((event.clientY || event.touches?.[0]?.clientY) - rect.top) * (canvas.height / rect.height)
  };
};

const startDraw = (event) => {
  drawing = true;
  const { x, y } = getCoords(event);
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const draw = (event) => {
  if (!drawing) return;
  const { x, y } = getCoords(event);
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = isEraser ? "#ffffff" : brushColor;
  ctx.lineTo(x, y);
  ctx.stroke();
};

const endDraw = () => {
  drawing = false;
  ctx.closePath();
};

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseleave", endDraw);

canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
  startDraw(event);
});
canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  draw(event);
});
canvas.addEventListener("touchend", endDraw);

colorInput.addEventListener("input", (event) => {
  brushColor = event.target.value;
});

sizeInput.addEventListener("input", (event) => {
  brushSize = Number(event.target.value);
  sizeValue.textContent = `${brushSize}px`;
});

brushButton.addEventListener("click", () => {
  isEraser = false;
  brushButton.classList.add("active");
  eraserButton.classList.remove("active");
});

eraserButton.addEventListener("click", () => {
  isEraser = true;
  eraserButton.classList.add("active");
  brushButton.classList.remove("active");
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackground();
});

const loadReference = async () => {
  referenceNote.textContent = "Loading new monkey...";
  try {
    const response = await fetch("/api/monkey");
    if (!response.ok) {
      throw new Error("Server unavailable");
    }
    const data = await response.json();
    if (!data.imageUrl) {
      throw new Error("Missing image");
    }
    referenceImage.src = data.imageUrl;
    referenceSource.textContent = `Source: ${data.source}`;
    referenceTitle.textContent = data.title ? `Title: ${data.title}` : "";
    referenceNote.textContent = data.note || "";
  } catch (error) {
    setLocalReference();
  }
};

const waitForImageLoad = (image) =>
  new Promise((resolve, reject) => {
    if (image.complete && image.naturalWidth > 0) {
      resolve();
      return;
    }
    const handleLoad = () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      resolve();
    };
    const handleError = () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      reject(new Error("Image failed to load"));
    };
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
  });

const getScaledImageData = (source, size = 64) => {
  const offscreen = document.createElement("canvas");
  offscreen.width = size;
  offscreen.height = size;
  const offCtx = offscreen.getContext("2d");
  offCtx.fillStyle = "#ffffff";
  offCtx.fillRect(0, 0, size, size);
  offCtx.drawImage(source, 0, 0, size, size);
  return offCtx.getImageData(0, 0, size, size);
};

const analyzeFeatures = (imageData, width, height) => {
  const darkThreshold = 70;
  let leftEye = { x: 0, y: 0, count: 0 };
  let rightEye = { x: 0, y: 0, count: 0 };
  let mouth = { x: 0, y: 0, count: 0 };
  let earLeft = 0;
  let earRight = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness > darkThreshold) continue;

      const isTop = y < height * 0.55;
      const isBottom = y >= height * 0.55;
      if (isTop && x < width * 0.5 && x > width * 0.15) {
        leftEye = { x: leftEye.x + x, y: leftEye.y + y, count: leftEye.count + 1 };
      } else if (isTop && x >= width * 0.5 && x < width * 0.85) {
        rightEye = { x: rightEye.x + x, y: rightEye.y + y, count: rightEye.count + 1 };
      }

      if (isBottom && x > width * 0.25 && x < width * 0.75) {
        mouth = { x: mouth.x + x, y: mouth.y + y, count: mouth.count + 1 };
      }

      if (isTop && x < width * 0.15) {
        earLeft += 1;
      }
      if (isTop && x > width * 0.85) {
        earRight += 1;
      }
    }
  }

  const normalize = (point) => ({
    x: point.count ? point.x / point.count : null,
    y: point.count ? point.y / point.count : null,
    count: point.count
  });

  return {
    leftEye: normalize(leftEye),
    rightEye: normalize(rightEye),
    mouth: normalize(mouth),
    earLeft,
    earRight
  };
};

const scoreJudging = async () => {
  await waitForImageLoad(referenceImage);
  const referenceData = getScaledImageData(referenceImage);
  const playerData = getScaledImageData(canvas);

  let totalDiff = 0;
  for (let i = 0; i < referenceData.data.length; i += 4) {
    const dr = Math.abs(referenceData.data[i] - playerData.data[i]);
    const dg = Math.abs(referenceData.data[i + 1] - playerData.data[i + 1]);
    const db = Math.abs(referenceData.data[i + 2] - playerData.data[i + 2]);
    totalDiff += dr + dg + db;
  }

  const maxDiff = 255 * 3 * (referenceData.data.length / 4);
  const colorScore = Math.max(0, 100 - (totalDiff / maxDiff) * 140);

  const referenceFeatures = analyzeFeatures(referenceData, 64, 64);
  const playerFeatures = analyzeFeatures(playerData, 64, 64);

  const eyeDistanceRef =
    referenceFeatures.leftEye.x && referenceFeatures.rightEye.x
      ? referenceFeatures.rightEye.x - referenceFeatures.leftEye.x
      : null;
  const eyeDistancePlayer =
    playerFeatures.leftEye.x && playerFeatures.rightEye.x
      ? playerFeatures.rightEye.x - playerFeatures.leftEye.x
      : null;

  const eyeSpacingScore =
    eyeDistanceRef && eyeDistancePlayer
      ? Math.max(0, 100 - Math.abs(eyeDistanceRef - eyeDistancePlayer) * 2.4)
      : 45;

  const mouthOffsetRef = referenceFeatures.mouth.y ?? 48;
  const mouthOffsetPlayer = playerFeatures.mouth.y ?? 48;
  const mouthScore = Math.max(0, 100 - Math.abs(mouthOffsetRef - mouthOffsetPlayer) * 2.2);

  const earTotalRef = referenceFeatures.earLeft + referenceFeatures.earRight;
  const earTotalPlayer = playerFeatures.earLeft + playerFeatures.earRight;
  const earScore =
    earTotalRef > 0
      ? Math.max(0, 100 - (Math.abs(earTotalRef - earTotalPlayer) / earTotalRef) * 100)
      : 50;

  const featureScore = Math.max(0, Math.min(100, eyeSpacingScore * 0.4 + mouthScore * 0.35 + earScore * 0.25));
  const overallScore = Math.max(0, Math.min(100, colorScore * 0.6 + featureScore * 0.4));

  scoreOverall.textContent = `Overall score: ${overallScore.toFixed(1)}`;
  scoreColor.textContent = `Color accuracy: ${colorScore.toFixed(1)}`;
  scoreFeatures.textContent = `Feature spacing: ${featureScore.toFixed(1)}`;
  scoreNote.textContent = "Resubmit after making more edits to improve your score.";
};

newReferenceButton.addEventListener("click", loadReference);
submitJudgingButton.addEventListener("click", () => {
  scoreJudging().catch(() => {
    scoreNote.textContent = "Judging failed. Try loading a new reference.";
  });
});

loadReference();
