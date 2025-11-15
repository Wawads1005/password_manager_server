import e from "express";
import { apiRouter } from "@/routes/api";
import { authenticate } from "@/middlewares/auth";

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

appRouter.use("/protected", authenticate, async (req, res) => {
  const { user } = req;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.status(200).json({ message: "Protected routes" });
});

export { appRouter };
