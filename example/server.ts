import express from "express";
import path from "path";
import { Crudity } from "..";
import { Article } from "./article.dto";

const app = express();
const filename = path.resolve(__dirname, "../data/test.json");
const articleRouter = new Crudity<Article>({ filename, dtoClass: Article })
  .router;

app.use(express.json());
app.use("/ws/articles", articleRouter);

app.listen(3000, () => console.log("Server started on port 3000"));
