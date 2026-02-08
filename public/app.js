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
    const data = await response.json();
    referenceImage.src = data.imageUrl;
    referenceSource.textContent = `Source: ${data.source}`;
    referenceTitle.textContent = data.title ? `Title: ${data.title}` : "";
    referenceNote.textContent = data.note || "";
  } catch (error) {
    referenceNote.textContent = "Unable to load a new monkey right now.";
  }
};

newReferenceButton.addEventListener("click", loadReference);

loadReference();
