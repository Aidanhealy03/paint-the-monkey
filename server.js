import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/api/monkey", async (req, res) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;
  if (!apiKey || !cx) {
    return res.json({
      imageUrl: "/assets/monkey-placeholder.svg",
      source: "placeholder",
      note: "Set GOOGLE_API_KEY and GOOGLE_CX to enable Google image search."
    });
  }

  const start = Math.floor(Math.random() * 10) + 1;
  const params = new URLSearchParams({
    key: apiKey,
    cx,
    searchType: "image",
    q: "real monkey",
    safe: "active",
    imgType: "photo",
    start: String(start)
  });

  try {
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
    if (!response.ok) {
      return res.status(502).json({
        imageUrl: "/assets/monkey-placeholder.svg",
        source: "placeholder",
        note: "Google API request failed."
      });
    }

    const data = await response.json();
    const item = data.items?.[0];
    if (!item?.link) {
      return res.status(502).json({
        imageUrl: "/assets/monkey-placeholder.svg",
        source: "placeholder",
        note: "No image results found."
      });
    }

    return res.json({
      imageUrl: item.link,
      source: "google",
      title: item.title || "Monkey"
    });
  } catch (error) {
    return res.status(500).json({
      imageUrl: "/assets/monkey-placeholder.svg",
      source: "placeholder",
      note: "Unexpected error reaching Google API."
    });
  }
});

app.listen(port, () => {
  console.log(`Paint the Monkey running on http://localhost:${port}`);
});
