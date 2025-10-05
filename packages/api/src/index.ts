import { Hono } from "hono";

import words from "./routes/words";
import wordsRandom from "./routes/words.random";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://lingo-legends.app"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 86400,
    credentials: true,
  }),
);

// app.route("/words", words);
app.route("/words/random", wordsRandom);

export default app;
