const express = require("express");
const multer = require("multer");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const app = express();

// Static folder
app.use(express.static("public"));

// Form body parser
app.use(express.urlencoded({ extended: true }));

// Upload config
const upload = multer({ dest: "uploads/" });

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Poster generate route
app.post("/generate", upload.single("photo"), async (req, res) => {

  const name = req.body.name;
  const number = req.body.number;

  const template = await loadImage("template-upload/poster-template.png");

  const width = 1080;
  const height = 1350;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(template, 0, 0, width, height);

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

  ctx.fillText(name, 540, 1000);
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

  </body>
  </html>
  `);

});

// Railway PORT fix
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server chal raha hai");
});
