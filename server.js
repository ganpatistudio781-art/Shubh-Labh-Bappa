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

    const template = await Jimp.read("template-upload/poster-template.png");
    const photo = await Jimp.read(req.file.path);

    // poster size
    const posterWidth = 1080;
    const posterHeight = 1350;

    // circle parameters
    const centerX = 540;
    const centerY = 722;
    const diameter = 384;
    const radius = diameter / 2;

    // resize photo
    photo.resize(diameter, diameter);

    // create circle mask
    const mask = new Jimp(diameter, diameter, 0x00000000);

    mask.scan(0, 0, diameter, diameter, function (x, y, idx) {

      const dx = x - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        this.bitmap.data[idx + 3] = 255;
      } else {
        this.bitmap.data[idx + 3] = 0;
      }

    });

    photo.mask(mask, 0, 0);

    // place photo
    template.composite(photo, centerX - radius, centerY - radius);

    // font
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // name
    template.print(font, 0, 950, {
      text: name,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    }, posterWidth);

    // mobile number
    template.print(font, 0, 1040, {
      text: number,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    }, posterWidth);

    const fileName = "poster-" + Date.now() + ".png";

    await template.writeAsync("public/" + fileName);

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
    res.send("Poster generate error");

  }

});

const PORT =
