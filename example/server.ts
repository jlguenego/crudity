import express from "express";
import serveIndex from "serve-index";

const app = express();
const www = ".";

app.use(express.static(www));
app.use(serveIndex(www, { icons: true }));

app.listen(3000, () => console.log("Server started on port 3000"));
