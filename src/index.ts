import e from "express";
import http from "node:http";
import { keys } from "@/lib/keys";
import { appRouter } from "@/routes";

const app = e();
const server = http.createServer(app);

app.use(e.urlencoded({ extended: false }));

app.use(e.json());

app.use("/", appRouter);

server.on("error", (error) => {
  const { message } = error;

  console.error(`[ERROR]: ${message}`);
});

server.on("request", (req) => {
  const { method, url } = req;

  console.log(`[INFO]: ${method} ${url}`);
});

server.on("listening", () => {
  console.log(`[INFO]: Server running on http://${keys.host}:${keys.port}`);
});

server.listen({ port: keys.port, host: keys.host });
