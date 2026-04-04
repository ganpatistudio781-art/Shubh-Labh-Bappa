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

    const template = await Jimp.read(
      path.join(__dirname, "template-upload", "Poster-template.png")
    );

    const photo = await Jimp.read(req.file.path);

    // photo crop size
    photo.cover(
      245,
      342,
      Jimp.HORIZONTAL_ALIGN_CENTER,
      Jimp.VERTICAL_ALIGN_MIDDLE
    );

    // photo position
    template.composite(photo, 78, 580);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // name
    template.print(font, 112, 1006, name, 260);

    // number
    template.print(font, 112, 1080, number, 260);

    const fileName = "poster-" + Date.now() + ".png";

    await template.writeAsync(path.join("public", fileName));

    res.send(`
      <html>
      <body style="text-align:center;font-family:Arial
