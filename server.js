const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/generate", upload.single("photo"), async (req, res) => {

  try {

    const name = req.body.name;
    const number = req.body.number;

    if (!req.file) {
      throw new Error("Photo upload nahi hui");
    }

    const templatePath = path.join(__dirname, "template-upload", "Poster-template.png");

    console.log("Template path:", templatePath);

    const template = await Jimp.read(templatePath);

    const photo = await Jimp.read(req.file.path);

    // crop photo
    photo.cover(
      245,
      342,
      Jimp.HORIZONTAL_ALIGN_CENTER,
      Jimp.VERTICAL_ALIGN_MIDDLE
    );

    // place photo
    template.composite(photo, 78, 580);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // name
    template.print(font, 112, 1006, name, 260);

    // number
    template.print(font, 112, 1080, number, 260);

    const fileName = "poster-" + Date.now() + ".png";

    const outputPath = path.join(__dirname, "public", fileName);

    await template.writeAsync(outputPath);

    res.send(`
      <html>
      <body style="text-align:center;font-family:Arial">

      <h2>Poster Ready 🎉</h2>

      <img src="/${fileName}" style="width:350px"><br><br>

      <a href="/${fileName}" download>
      <button style="padding:10px 20px;font-size:16px">
      Download Poster
      </button>
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

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
