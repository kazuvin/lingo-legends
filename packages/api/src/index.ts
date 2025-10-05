import { Hono } from "hono";

import words from "./routes/words";
import wordsRandom from "./routes/words.random";

const app = new Hono();

app.route("/words", words);
app.route("/words/random", wordsRandom);

export default app;
