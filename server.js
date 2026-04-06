const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// Generated folder ko static banaya taaki browser se access ho sake
app.use("/generated", express.static(path.join(__dirname, "generated")));

const upload = multer({ dest: "uploads/" });

// Folders ensure karna (Render startup ke liye zaroori)
const folders = ["uploads", "generated"];
folders.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const dataPath = path.join(__dirname, "uploads/data.json");
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "[]");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/generate", upload.single("photo"), async (req, res) => {
  try {
    const { name, number } = req.body;
    const photoPath = req.file.path;

    // Save user details safely
    const rawData = fs.readFileSync(dataPath);
    const users = JSON.parse(rawData);
    users.push({ name, number, photoPath, time: new Date() });
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));

    // Load Template and User Photo
    const templatePath = path.join(__dirname, "public/poster-preview.png");
    const template = await Jimp.read(templatePath);
    const photo = await Jimp.read(photoPath);

    // Crop & resize photo to 245x342
    photo.cover(245, 342);
    template.composite(photo, 78, 580);

    // Load font (Built-in Jimp font)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    template.print(font, 112, 1006, name);
    template.print(font, 112, 1080, number);

    // Save final poster
    const fileName = `poster-${Date.now()}.png`;
    const outputPath = path.join(__dirname, "generated", fileName);
    await template.writeAsync(outputPath);

    // Return the file for download
    res.sendFile(outputPath);

  } catch (err) {
    console.error("Error generating poster:", err);
    res.status(500).json({ error: "Poster Generate Error ⚠️" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
