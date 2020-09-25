import express from "express";
import path from "path";
import { crudity } from "../src";
import { Article } from "./article.dto";

const app = express();
const filename = path.resolve(__dirname, "../data/test.json");

app.use(express.json());
app.use(
  "/ws/articles",
  crudity<Article>({ filename, dtoClass: Article })
);

app.listen(3000, () => console.log("Server started on port 3000"));
