const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

const dataFile = "uploads/data.json";

/* SAVE USER */

function saveUser(name, number, photo) {

let users = [];

if (fs.existsSync(dataFile)) {
users = JSON.parse(fs.readFileSync(dataFile));
}

users.push({
name: name,
number: number,
photo: photo,
date: new Date()
});

fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));

}

/* GENERATE */

app.post("/generate", upload.single("photo"), (req, res) => {

try {

if (!req.file) {
throw new Error("Photo upload nahi hui");
}

const name = req.body.name || "";
const number = req.body.number || "";

saveUser(name, number, req.file.filename);

const newFile = "poster-" + Date.now() + ".png";

fs.copyFileSync(req.file.path, "public/" + newFile);

fs.unlinkSync(req.file.path);

res.send(`

<html>
<head>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body{
font-family:Arial;
background:#f2f2f2;
margin:0;
padding:20px;
text-align:center;
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

<img src="/${newFile}">

<a href="/${newFile}" download>
<button class="download">पोस्टर डाउनलोड करें</button>
</a>

<a href="https://wa.me/?text=Ganpati Studio ki taraf se shubhkamnaye 🙏">
<button class="whatsapp">WhatsApp Share</button>
</a>

</div>

</body>
</html>

`);

} catch (err) {

res.send(`
<h2>Poster generating error</h2>
<p>${err.message}</p>
`);

}

});

/* DEVELOPER PANEL */

app.get("/developer", (req, res) => {

let users = [];

if (fs.existsSync(dataFile)) {
users = JSON.parse(fs.readFileSync(dataFile));
}

let html = `
<html>
<head>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body{
font-family:Arial;
background:#f2f2f2;
padding:20px;
}

.container{
max-width:500px;
margin:auto;
background:white;
padding:15px;
border-radius:10px;
}

button{
padding:8px 12px;
background:green;
color:white;
border:none;
border-radius:5px;
}

</style>

</head>

<body>

<div class="container">

<h2>Developer Panel</h2>

<p>Total Users: ${users.length}</p>
`;

users.forEach(u => {

const msg = encodeURIComponent(
`Ganpati Studio ki taraf se shubhkamnaye 🙏 ${u.name}`
);

const link = `https://wa.me/91${u.number}?text=${msg}`;

html += `
<p>

<b>${u.name}</b> - ${u.number}

<br>

<a href="${link}" target="_blank">

<button>Send WhatsApp</button>

</a>

</p>
`;

});

html += `
</div>
</body>
</html>
`;

res.send(html);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Server chal raha hai");
});
