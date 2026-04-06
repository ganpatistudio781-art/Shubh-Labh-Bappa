const express = require("express");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

app.post("/generate", upload.single("photo"), async (req, res) => {

try{

const name = req.body.name;
const number = req.body.number;

if(!req.file){
return res.send("Photo upload nahi hui");
}

const templatePath = "template-upload/poster-template.png";

const fileName = "poster-" + Date.now() + ".png";
const outputPath = "public/" + fileName;

/* PHOTO RESIZE */

const userPhoto = await sharp(req.file.path)
.resize(350,350)
.toBuffer();

/* TEMPLATE LOAD */

let image = sharp(templatePath);

/* COMPOSITE */

image = image.composite([
{
input:userPhoto,
top:560,
left:80
}
]);

/* TEXT SVG */

const svgText = `
<svg width="1080" height="1350">
<style>
.name{
fill:black;
font-size:45px;
font-weight:bold;
}
.number{
fill:black;
font-size:40px;
font-weight:bold;
}
</style>

<text x="260" y="980" class="name">${name}</text>
<text x="260" y="1050" class="number">${number}</text>

</svg>
`;

/* ADD TEXT */

image = image.composite([
{
input:Buffer.from(svgText),
top:0,
left:0
}
]);

/* SAVE POSTER */

await image.toFile(outputPath);

/* DELETE TEMP PHOTO */

fs.unlinkSync(req.file.path);

/* RESPONSE PAGE */

res.send(`
<html>
<head>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Poster Ready</title>

<style>

body{
font-family:Arial;
text-align:center;
background:#f2f2f2;
margin:0;
padding:20px;
}

img{
width:100%;
max-width:400px;
border-radius:10px;
}

button{
padding:12px 20px;
margin:10px;
border:none;
border-radius:6px;
font-size:16px;
}

.download{
background:#ff6a00;
color:white;
}

.whatsapp{
background:green;
color:white;
}

</style>

</head>

<body>

<h2>🎉 आपका पोस्टर तैयार है</h2>

<img src="/${fileName}">

<br>

<a href="/${fileName}" download>
<button class="download">पोस्टर डाउनलोड करें</button>
</a>

<br>

<a href="https://wa.me/?text=बैसाखी की हार्दिक शुभकामनाएं 🌾%0A%0Aअपना पोस्टर बनाएं:%0A${req.headers.host}">
<button class="whatsapp">WhatsApp पर शेयर करें</button>
</a>

</body>
</html>
`);

}catch(err){

console.log(err);

res.send("Poster generating error. Server logs check karo.");

}

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Server chal raha hai");
});
