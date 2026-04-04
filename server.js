const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

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

    // load template
    const template = await Jimp.read(
      path.join(__dirname, "template-upload", "Poster-template.png")
    );

    const photo = await Jimp.read(photoPath);

    // crop and resize photo
    photo.cover(
      285,
      305,
      Jimp.HORIZONTAL_ALIGN_CENTER,
      Jimp.VERTICAL_ALIGN_MIDDLE
    );

    // place photo
    template.composite(photo, 75, 520);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // print name
    template.print(font, 115, 910, name, 260);

    // print number
    template.print(font, 115, 970, number, 260);

    const fileName = "poster-" + Date.now() + ".png";

    const outputPath = path.join(__dirname, "public", fileName);

    // save poster
    await template.writeAsync(outputPath);

    // delete uploaded photo
    fs.unlinkSync(photoPath);

    res.send(`
      <html>
      <body style="text-align:center;font-family:Arial">

      <h2>Poster Ready 🎉</h2>

      <img src="/${fileName}" style="width:350px;margin-top:20px"><br><br>

      <a href="/${fileName}" download="${fileName}">
      <
