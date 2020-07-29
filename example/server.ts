import express from "express";
import path from "path";
import crudity from "..";
import { Article } from "../misc/Article";

const app = express();
const www = ".";
const filename = path.resolve(__dirname, "../data/test.json");

app.use(express.json());
app.use(
  "/ws/articles",
  crudity<Article>({ filename })
);

app.listen(3000, () => console.log("Server started on port 3000"));
