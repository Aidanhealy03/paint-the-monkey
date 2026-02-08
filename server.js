import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

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

app.get("/api/monkey", (req, res) => {
  const svg = makeMonkeySvg().trim();
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return res.json({
    imageUrl: dataUrl,
    source: "procedural",
    title: "Random Monkey Sketch",
    note: "Every round generates a new monkey drawing."
  });
});

app.listen(port, () => {
  console.log(`Paint the Monkey running on http://localhost:${port}`);
});
