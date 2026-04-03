const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Website chal rahi hai 🎉");
});

app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server chal raha hai");
});
