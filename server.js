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

    const photoPath = req.file.path;

    // template load
    const template = await Jimp.read(
      path.join(__dirname, "template-upload", "Poster-template.png")
    );

    const photo = await Jimp.read(photoPath);

    // crop photo
    photo.cover(
      285,
      305,
      Jimp.HORIZONTAL_ALIGN_CENTER,
      Jimp.VERTICAL_ALIGN_MIDDLE
    );

    // place photo
    template.composite(photo, 75, 520);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // add name
    template.print(font, 115, 910, name, 260);

    // add number
    template.print(font, 115, 970, number, 260);

    const fileName = "poster-" + Date.now() + ".png";

    // save poster
    await template.writeAsync(path.join("public", fileName));

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

    console.log(err);

    res.send("Error generating poster");

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
