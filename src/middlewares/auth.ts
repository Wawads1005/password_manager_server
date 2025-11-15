import { keys } from "@/lib/keys";
import { User } from "@prisma/client";
import e from "express";
import { jwtVerify } from "jose";

async function authenticate(
  req: e.Request,
  res: e.Response,
  next: e.NextFunction
) {
  try {
    const { headers } = req;
    const { authorization } = headers;

    if (!authorization) {
      res.status(401).json({ message: "Missing authorization header" });
      return;
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer") {
      res
        .status(400)
        .json({ message: "Unsupported authorization header scheme" });
      return;
    }

    if (!token) {
      res.status(401).json({ message: "Missing authorization token" });
      return;
    }

    const textEncoder = new TextEncoder();
    const encodedSecret = textEncoder.encode(keys.auth.secret);

    const { payload } = await jwtVerify<{ user: User }>(token, encodedSecret);

    req.user = payload.user;

    next();
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;

      console.error(`[ERROR:] ${message}`);
    }

    res
      .status(500)
      .json({ message: "Unexpected error occured upon authenticating" });
  }
}

export { authenticate };
