const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Upload config
const upload = multer({ dest: "uploads/" });

// Ensure folders exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("uploads/data.json")) fs.writeFileSync("uploads/data.json", "[]");
if (!fs.existsSync("generated")) fs.mkdirSync("generated");

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// User submit form
app.post("/submit", upload.single("photo"), async (req, res) => {
  const { name, number } = req.body;
  const photoPath = req.file.path;

  // Save user details
  const users = JSON.parse(fs.readFileSync("uploads/data.json"));
  users.push({ name, number, photoPath });
  fs.writeFileSync("uploads/data.json", JSON.stringify(users, null, 2));

  // Generate poster
  try {
    const template = await Jimp.read("public/poster-preview.png");
    const photo = await Jimp.read(photoPath);

    // Crop + zoom photo
    photo.cover(245, 342);

    // Place photo
    template.composite(photo, 95, 620);

    // Font for name & number
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    template.print(font, 125, 1006, name);
    template.print(font, 125, 1080, number);

    const fileName = `poster-${Date.now()}.png`;
    const filePath = path.join("generated", fileName);
    await template.writeAsync(filePath);

    res.send(`
      <h2>Poster Ready 🎉</h2>
      <img src="/generated/${fileName}" style="width:300px;border-radius:10px"><br><br>
      <a href="/generated/${fileName}" download>
        <button style="padding:10px 20px;font-size:16px;background:#ff6a00;color:white;border:none;border-radius:6px;cursor:pointer">Download Poster</button>
      </a>
      <p><a href="/">Go Back</a></p>
    `);
  } catch (err) {
    console.log("Poster Generate Error:", err);
    res.send("<h2>Poster Generate Error ⚠️</h2><p>Check console for details.</p><a href='/'>Go Back</a>");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
