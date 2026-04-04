const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

const app = express();

// middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// multer setup
const upload = multer({ dest: "uploads/" });

// home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// poster generate
app.post("/generate", upload.single("photo"), async (req, res) => {
  try {

    const name = req.body.name;
    const number = req.body.number;

    const userPhotoPath = req.file.path;

    // ⚠ template path (P capital)
    const template = await Jimp.read(
      path.join(__dirname, "template-upload", "Poster-template.png")
    );

    const photo = await Jimp.read(userPhotoPath);

    // resize photo
    photo.cover(285, 305);

    // place photo
    template.composite(photo, 75, 495);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // print name
    template.print(
      font,
      115,
      882,
      { text: name },
      260
    );

    // print number
    template.print(
      font,
      115,
      945,
      { text: number },
      260
    );

    const fileName = "poster-" + Date.now() + ".png";

    await template.writeAsync(path.join(__dirname, "public", fileName));

    // delete uploaded photo
    fs.unlinkSync(userPhotoPath);

    res.send(`
      <html>
      <body
