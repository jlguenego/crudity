import express from "express";
import serveIndex from "serve-index";
import path from "path";
import crudity from "..";

const app = express();
const www = ".";

interface Article {
  id: string;
  name: string;
  price: number;
  qty: number;
}

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.url);
  next();
});

app.use(
  "/ws/articles",
  crudity<Article>({ filename: path.resolve(__dirname, "data.json") })
);

app.use(express.static(www));
app.use(serveIndex(www, { icons: true }));

app.listen(3000, () => console.log("Server started on port 3000"));
