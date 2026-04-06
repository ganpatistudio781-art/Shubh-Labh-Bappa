const express=require("express");
const multer=require("multer");
const sharp=require("sharp");
const fs=require("fs");

const app=express();

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

const upload=multer({dest:"uploads/"});

app.post("/generate",upload.single("photo"),async(req,res)=>{

try{

if(!req.file){
throw new Error("Photo upload nahi hui");
}

const name=req.body.name||"";
const number=req.body.number||"";

const template="template-upload/poster-template.png";

const output="public/poster-"+Date.now()+".png";

/* USER PHOTO */

const photo=await sharp(req.file.path)
.resize(245,342)
.toBuffer();

/* TEXT SVG */

const svg=`
<svg width="1080" height="1350">

<style>

.name{
fill:black;
font-size:42px;
font-weight:bold;
}

.number{
fill:black;
font-size:40px;
font-weight:bold;
}

</style>

<text x="112" y="1006" class="name">${name}</text>

<text x="112" y="1080" class="number">${number}</text>

</svg>
`;

await sharp(template)

.composite([
{input:photo,top:580,left:78},
{input:Buffer.from(svg),top:0,left:0}
])

.png({quality:90})
.toFile(output);

fs.unlinkSync(req.file.path);

const fileName=output.replace("public/","");

res.send(`

<html>

<head>

<meta name="viewport" content="width=device-width,initial-scale=1">

<style>

body{
font-family:Arial;
text-align:center;
background:#f2f2f2;
margin:0;
padding:20px;
}

.container{
max-width:420px;
margin:auto;
background:white;
padding:15px;
border-radius:10px;
}

img{
width:100%;
border-radius:10px;
}

button{
width:100%;
padding:12px;
margin-top:10px;
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

<div class="container">

<h2>🎉 आपका पोस्टर तैयार है</h2>

<img src="/${fileName}">

<a href="/${fileName}" download>
<button class="download">पोस्टर डाउनलोड करें</button>
</a>

<a href="https://wa.me/?text=बैसाखी की हार्दिक शुभकामनाएं 🌾">
<button class="whatsapp">WhatsApp पर शेयर करें</button>
</a>

</div>

</body>
</html>

`);

}catch(err){

console.log(err);

res.send(`
<h2>Poster generating error</h2>
<p>${err.message}</p>
`);

}

});

const PORT=process.env.PORT||3000;

app.listen(PORT,()=>{
console.log("Server chal raha hai");
});
