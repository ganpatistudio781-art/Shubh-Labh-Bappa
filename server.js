const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Ensure generated folder exists
if (!fs.existsSync("generated")) fs.mkdirSync("generated");
if (!fs.existsSync("uploads/data.json")) fs.writeFileSync("uploads/data.json", "[]");

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Poster generation route
app.post("/generate", upload.single("photo"), async (req, res) => {
  try {
    const { name, number } = req.body;

    if (!req.file) throw new Error("Photo upload nahi hui");

    const templatePath = path.join(__dirname, "template-upload", "Poster-template.png");
    const template = await Jimp.read(templatePath);
    const photo = await Jimp.read(req.file.path);

    // Crop & place photo
    photo.cover(245, 342, Jimp.HORIZONTAL_ALIGN_CENTER, Jimp.VERTICAL_ALIGN_MIDDLE);
    template.composite(photo, 78, 580);

    // Font & print text
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    template.print(font, 112, 1006, name, 260);
    template.print(font, 112, 1080, number, 260);

    // Save poster in generated/
    const fileName = "poster-" + Date.now() + ".png";
    const outputPath = path.join(__dirname, "generated", fileName);
    await template.writeAsync(outputPath);

    // Save user details in uploads/data.json
    const dataPath = path.join(__dirname, "uploads", "data.json");
    let users = JSON.parse(fs.readFileSync(dataPath));
    users.push({ name, number, photo: req.file.path, poster: outputPath, timestamp: new Date() });
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));

    // Return poster page with auto-download
    res.send(`
      <html>
      <body style="text-align:center;font-family:Arial">
        <h2>Poster Ready 🎉</h2>
        <img src="/../generated/${fileName}" style="width:350px"><br><br>
        <a href="/../generated/${fileName}" download>
          <button style="padding:10px 20px;font-size:16px">Download Poster</button>
        </a>
      </body>
      </html>
    `);

  } catch (err) {
    console.log("ERROR:", err);
    res.send(`
      <html>
      <body style="font-family:Arial;text-align:center;color:red">
        <h2>Poster Generate Error ⚠️</h2>
        <p>${err.message}</p>
        <p>Console me bhi error check karo</p>
      </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
