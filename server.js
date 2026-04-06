const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Upload config
const upload = multer({ dest: "uploads/" });

// Ensure data.json exists
const dataFile = "uploads/data.json";
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]");

// Ensure generated folder exists
if (!fs.existsSync("generated")) fs.mkdirSync("generated");

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// User submit form
app.post("/submit", upload.single("photo"), (req, res) => {
  const { name, number } = req.body;
  const photoPath = req.file.path;

  const users = JSON.parse(fs.readFileSync(dataFile));
  users.push({ name, number, photoPath });
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));

  res.send(`
    <h2>Thank you! Your details are saved.</h2>
    <p><a href="/">Go Back</a></p>
  `);
});

// Admin: generate all posters
app.get("/generate-all", async (req, res) => {
  const users = JSON.parse(fs.readFileSync(dataFile));
  let generated = [];

  for (let user of users) {
    try {
      const template = await Jimp.read("public/poster-preview.png");
      const photo = await Jimp.read(user.photoPath);

      // Crop + Zoom photo
      photo.cover(245, 342); // width x height
      template.composite(photo, 95, 620); // X,Y coordinates

      // Font for name & number
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      template.print(font, 125, 1006, user.name);
      template.print(font, 125, 1080, user.number);

      const fileName = `poster-${user.name.replace(/ /g, "_")}.png`;
      const filePath = path.join("generated", fileName);
      await template.writeAsync(filePath);

      generated.push(fileName);
    } catch (err) {
      console.log("Error generating poster for", user.name, err);
    }
  }

  res.send(`
    <h2>Posters Generated ✅</h2>
    <ul>
      ${generated.map(f => `<li><a href="/generated/${f}" target="_blank">${f}</a></li>`).join("")}
    </ul>
    <p><a href="/">Back to Homepage</a></p>
  `);
});

// Serve generated posters
app.use("/generated", express.static(path.join(__dirname, "generated")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
