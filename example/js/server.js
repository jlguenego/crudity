const express = require("express");
const { crudity } = require("../../dist");

const app = express();
app.use("/ws/articles", crudity());

app.listen(3000, () => console.log("JS Server started on port 3000"));
