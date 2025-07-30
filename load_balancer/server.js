const express = require("express");
const app = express();

app.get("/status", (req, res) => {
  res.send("A");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
