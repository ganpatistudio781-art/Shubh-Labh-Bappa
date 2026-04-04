const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Upload setup
const upload = multer({ dest: "uploads/" });

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Poster generate
app.post("/generate", upload.single("photo"), async (req, res) => {

  try {

    const name = req.body.name;
    const number = req.body.number;
    const photoPath = req.file.path;

    // Load template
    const template = await Jimp.read(
      path.join(__dirname, "template-upload", "Poster-template.png")
    );

    // Load user photo
    const photo = await Jimp.read(photoPath);

    // Resize & crop photo according to frame
    photo.cover(
      245,
      342,
      Jimp.HORIZONTAL_ALIGN_CENTER,
      Jimp.VERTICAL_ALIGN_MIDDLE
    );

    // Place photo
    template.composite(photo, 78, 580);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // Print name
    template.print(font, 196, 1019, name, 260);

    // Print number
    template.print(font, 196, 1098, number, 260);

    const fileName = "poster-" + Date.now() + ".png";

    // Save poster
    await template.writeAsync(path.join("public", fileName));

    res.send(`
      <html>
      <body style="text-align:center;font-family:Arial">

      <h2>Poster Ready 🎉</h2>

      <img src="/${fileName}" style="width:350px;margin-top:20px"><br><br>

      <a href="/${fileName}" download>
      <button style="padding:10px 20px;font-size:16px">
      Download Poster
      </button>
      </a>

      </body>
      </html>
    `);

  } catch (err) {

    console.log(err);

    res.send("Error generating poster");

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
