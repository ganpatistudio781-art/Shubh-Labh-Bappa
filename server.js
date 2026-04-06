const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

app.post("/generate", upload.single("photo"), async (req, res) => {

try {

const name = req.body.name;
const number = req.body.number;

if (!req.file) {
return res.send("Photo upload nahi hui");
}

const template = "template-upload/poster-template.png";

const output = "public/poster-" + Date.now() + ".png";

/* PHOTO RESIZE */

const photo = await sharp(req.file.path)
.resize(350,350)
.toBuffer();

/* COMPOSITE */

await sharp(template)
.composite([
{
input:photo,
top:560,
left:80
}
])
.toFile(output);

/* DELETE TEMP */

fs.unlinkSync(req.file.path);

/* RESPONSE */

const fileName = output.replace("public/","");

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

<a href="https://wa.me/?text=बैसाखी की हार्दिक शुभकामनाएं 🌾">
<button class="whatsapp">WhatsApp पर शेयर करें</button>
</a>

</body>
</html>
`);

} catch(err){

console.log(err);
res.send("Poster generating error");

}

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Server chal raha hai");
});
