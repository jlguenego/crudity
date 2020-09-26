import express from "express";
import { crudity } from "../src";
import { Article } from "./article.dto";

const app = express();

app.use(express.json());
app.use(
  "/ws/articles",
  crudity<Article>({ dtoClass: Article })
);

app.listen(3000, () => console.log("Server started on port 3000"));
