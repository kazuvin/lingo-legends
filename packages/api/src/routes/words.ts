import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json("words"));

export default app;
