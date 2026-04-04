const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

const app = express();

// middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// multer upload setup
const upload = multer({ dest: "uploads/" });

// home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// poster generate route
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

    // resize user photo
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

    const outputPath = path.join(__dirname, "public", fileName);

    await template.writeAsync(outputPath);

    // delete uploaded photo
    fs.unlinkSync(photoPath);

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

  } catch (error) {

    console.log(error);

    res.send("Error generating poster");

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("Server chal raha hai port", PORT);

});
