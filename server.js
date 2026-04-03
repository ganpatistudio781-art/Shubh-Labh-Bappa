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

    // resize photo
    photo.cover(384, 384);   // auto crop + fit

    // circle mask
    const circle = new Jimp(384, 384, 0x00000000);
    circle.scan(0, 0, 384, 384, function (x, y, idx) {
      const dx = x - 192;
      const dy = y - 192;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 192) {
        this.bitmap.data[idx + 3] = 255;
      } else {
        this.bitmap.data[idx + 3] = 0;
      }
    });

    photo.mask(circle, 0, 0);

    // correct position (centerX - radius , centerY - radius)
    template.composite(photo, 348, 530);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // name
    template.print(
      font,
      0,
      950,
      {
        text: name,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      1080
    );

    // mobile
    template.print(
      font,
      0,
      1040,
      {
        text: number,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      1080
    );

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server chal raha hai");
});
