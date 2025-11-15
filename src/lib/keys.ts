import { DEFALT_HOST, DEFAULT_PORT } from "@/constants";

const keys = {
  port: process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT,
  host: process.env.HOST ?? DEFALT_HOST,
};

export { keys };
