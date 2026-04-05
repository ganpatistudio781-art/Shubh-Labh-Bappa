const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");

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

const template = await Jimp.read("template-upload/poster-template.png");
const photo = await Jimp.read(req.file.path);

photo.cover(320,320);

template.composite(photo,95,620);

const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

template.print(font,180,1045,name);

template.print(font,180,1125,number);

template.print(font,220,1180,"आप सभी को बैसाखी की हार्दिक शुभकामनाएँ");

template.print(font,360,1230,"शुभ लाभ बप्पा");

const fileName = "poster-"+Date.now()+".png";

await template.writeAsync("public/"+fileName);

const posterURL = `${req.protocol}://${req.get("host")}/${fileName}`;

res.send(`
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Poster Ready</title>
</head>

<body style="text-align:center;font-family:Arial;background:#f2f2f2">

<h2>आपका पोस्टर तैयार है 🎉</h2>

<img src="/${fileName}" style="width:350px;border-radius:10px">

<br><br>

<a href="/${fileName}" download>
<button style="padding:12px 20px;font-size:16px;background:#ff6a00;color:white;border:none;border-radius:6px">
पोस्टर डाउनलोड करें
</button>
</a>

<br><br>

<a href="https://wa.me/?text=आप सभी को बैसाखी की हार्दिक शुभकामनाएँ%0A%0A${posterURL}%0A%0Aशुभ लाभ बप्पा">
<button style="padding:12px 20px;font-size:16px;background:green;color:white;border:none;border-radius:6px">
WhatsApp पर शेयर करें
</button>
</a>

<br><br>

<a href="/">
<button style="padding:10px 18px;font-size:14px;background:#444;color:white;border:none;border-radius:6px">
नया पोस्टर बनाएं
</button>
</a>

</body>
</html>
`);

}

catch(err){

console.log(err);
res.send("Poster generate error");

}

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("Server chal raha hai");
});
