const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

const upload = multer({dest:"uploads/"});

const dataFile = "uploads/data.json";

app.post("/generate", upload.single("photo"), (req,res)=>{

try{

if(!req.file){
throw new Error("Photo upload nahi hui");
}

const name=req.body.name;
const number=req.body.number;

let users=[];

if(fs.existsSync(dataFile)){
users=JSON.parse(fs.readFileSync(dataFile));
}

users.push({
name:name,
number:number
});

fs.writeFileSync(dataFile,JSON.stringify(users,null,2));

const newFile="poster-"+Date.now()+".png";

fs.copyFileSync(req.file.path,"public/"+newFile);

fs.unlinkSync(req.file.path);

res.send(`
<h2>Poster Ready</h2>
<img src="/${newFile}" style="width:300px">
<br><br>
<a href="/${newFile}" download>Download Poster</a>
`);

}catch(err){

res.send("Error: "+err.message);

}

});

app.get("/developer",(req,res)=>{

let users=[];

if(fs.existsSync(dataFile)){
users=JSON.parse(fs.readFileSync(dataFile));
}

let html="<h2>Users</h2>";

users.forEach(u=>{

const link=`https://wa.me/91${u.number}?text=Ganpati Studio ki taraf se shubhkamnaye ${u.name}`;

html+=`<p>${u.name} - <a href="${link}" target="_blank">Send</a></p>`;

});

res.send(html);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("Server running");
});
