const canvas = document.getElementById("paint-area");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color");
const sizeInput = document.getElementById("size");
const sizeValue = document.getElementById("size-value");
const brushButton = document.getElementById("brush");
const eraserButton = document.getElementById("eraser");
const clearButton = document.getElementById("clear");
const newReferenceButton = document.getElementById("new-reference");
const referenceImage = document.getElementById("reference-image");
const referenceSource = document.getElementById("reference-source");
const referenceTitle = document.getElementById("reference-title");
const referenceNote = document.getElementById("reference-note");

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

newReferenceButton.addEventListener("click", loadReference);

loadReference();
