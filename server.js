const express = require("express");
const multer = require("multer");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const app = express();

app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

app.post("/generate", upload.single("photo"), async (req, res) => {

  const name = req.body.name;
  const number = req.body.number;

  const template = await loadImage("template-upload/poster-template.png");

  const posterWidth = 1080;
  const posterHeight = 1350;

  const canvas = createCanvas(posterWidth, posterHeight);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(template, 0, 0, posterWidth, posterHeight);

  const photo = await loadImage(req.file.path);

  const centerX = 540;
  const centerY = 722;
  const diameter = 384;
  const radius = diameter / 2;

  // Circle crop
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(photo, centerX - radius, centerY - radius, diameter, diameter);

  ctx.restore();

  // Text style
  ctx.textAlign = "center";
  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "#ff4d00";

  // Name
  ctx.fillText(name, 540, 1000);

  // Number
  ctx.fillText(number, 540, 1080);

  const fileName = "poster-" + Date.now() + ".png";

  const buffer = canvas.toBuffer("image/png");

  fs.writeFileSync("public/" + fileName, buffer);

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

  <br><br>

  <a href="https://wa.me/?text=Check this poster ${fileName}">
  <button style="padding:10px 20px;background:green;color:white">
  Share on WhatsApp
  </button>
  </a>

  </body>
  </html>
  `);

});

// IMPORTANT FOR HOSTING
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server chal raha hai");
});