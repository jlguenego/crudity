import express from "express";
import { crudity } from "../src";
import { DTOValidator } from "../src/validator/DTOValidator";
import { Article } from "./article.dto";

const app = express();

app.use(
  "/ws/articles",
  crudity<Article>({ validator: new DTOValidator<Article>(Article) })
);

app.listen(3000, () => console.log("Server started on port 3000"));
