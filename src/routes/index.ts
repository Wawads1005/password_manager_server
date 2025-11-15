import e from "express";
import { apiRouter } from "@/routes/api";

const appRouter = e.Router();

appRouter.use("/api", apiRouter);

appRouter.get("/", async (_, res) => {
  try {
    res.status(200).json({ message: "Hello, World!" });
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;

      console.error(`[ERROR]: ${message}`);
    }

    res.status(500).json({
      message: "[ERROR]: Unexpected error occured, please try again later",
    });
  }
});

export { appRouter };
