const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Multer setup
const upload = multer({ dest: "uploads/" });

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Poster generation
app.post("/generate", upload.single("photo"), async (req, res) => {
  try {
    const { name, number } = req.body;

    if (!req.file) throw new Error("No photo uploaded!");
    const userPhotoPath = req.file.path;

    // Load template & user photo
    const templatePath = path.join(__dirname, "template-upload/poster-template.png");
    if (!fs.existsSync(templatePath)) throw new Error("Template image not found!");

    const template = await Jimp.read(templatePath);
    const photo = await Jimp.read(userPhotoPath);

    // Resize and place photo
    photo.cover(285, 305); // maintain aspect ratio
    template.composite(photo, 75, 495); // X=75, Y=495

    // Load font
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // Print name
    template.print(
      font,
      115, // X
      882, // Y
      { text: name, alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT },
      260 // maxWidth
    );

    // Print mobile number
    template.print(
      font,
      115, // X
      945, // Y
      { text: number, alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT },
      260 // maxWidth
    );

    // Save final poster in public folder
    const fileName = "poster-" + Date.now() + ".png";
    const outputPath = path.join(__dirname, "public", fileName);
    await template.writeAsync(outputPath);

    // Delete uploaded user photo
    fs.unlinkSync(userPhotoPath);

    // Response with poster and download button
    res.send(`
      <html>
      <body style="text-align:center;font-family:Arial">
        <h2>Poster Ready 🎉</h2>
        <img src="/${fileName}" style="width:350px;margin:20px auto"><br>
        <a href="/${fileName}" download>
          <button style="padding:10px 20px;font-size:16px">Download Poster</button>
        </a>
      </body>
      </html>
    `);

  } catch (err) {
    console.error("Poster Generation Error:", err);
    res.send("Error generating poster: " + err.message);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server chal raha hai on port", PORT));
