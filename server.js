const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

const upload = multer({dest:"uploads/"});

app.post("/generate", upload.single("photo"), async(req,res)=>{

try{

const name=req.body.name;
const number=req.body.number;

if(!req.file){
return res.send("Photo upload nahi hui");
}

const template="template-upload/poster-template.png";

const outputFile="poster-"+Date.now()+".png";
const outputPath="public/"+outputFile;

/* USER PHOTO */

const userPhoto=await sharp(req.file.path)
.resize(245,342)
.toBuffer();

/* TEXT SVG */

const svgText=`
<svg width="1080" height="1350">

<style>

.name{
fill:black;
font-size:40px;
font-weight:bold;
}

.number{
fill:black;
font-size:38px;
font-weight:bold;
}

</style>

<text x="112" y="1006" class="name">${name}</text>

<text x="112" y="1080" class="number">${number}</text>

</svg>
`;

/* POSTER CREATE */

await sharp(template)

.composite([
{
input:userPhoto,
top:580,
left:78
},
{
input:Buffer.from(svgText),
top:0,
left:0
}
])

.toFile(outputPath);

fs.unlinkSync(req.file.path);

/* RESULT PAGE */

res.send(`

<html>

<head>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body{
font-family:Arial;
text-align:center;
background:#f2f2f2;
padding:20px;
}

img{
width:100%;
max-width:420px;
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

<img src="/${outputFile}">

<br>

<a href="/${outputFile}" download>
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

res.send("Poster generating error");

}

});

const PORT=process.env.PORT||3000;

app.listen(PORT,()=>{
console.log("Server chal raha hai");
});
