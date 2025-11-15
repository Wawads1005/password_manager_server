import {
  DEFAULT_HOST,
  DEFAULT_NODE_ENVIRONMENT,
  DEFAULT_PORT,
} from "@/constants";

process.loadEnvFile();

const keys = {
  port: process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT,
  host: process.env.HOST ?? DEFAULT_HOST,
  environment: process.env.NODE_ENV ?? DEFAULT_NODE_ENVIRONMENT,
  auth: {
    secret: process.env.AUTH_SECRET,
  },
};

export { keys };
