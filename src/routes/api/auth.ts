import e from "express";
import z from "zod";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prismaClient } from "@/lib/prisma";
import { AccountProvider } from "@prisma/client";
import { keys } from "@/lib/keys";

const authRouter = e.Router();

const signUpInput = z
  .object({
    email: z.email(),
    name: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((input) => input.password === input.confirmPassword, {
    error: "Password doesn't matched",
    path: ["confirmPassword", "password"],
  });

authRouter.post("/signup", async (req, res) => {
  try {
    const { body } = req;

    const parsedSignUpInputResult = signUpInput.safeParse(body);

    if (!parsedSignUpInputResult.success) {
      res.status(400).json({ message: parsedSignUpInputResult.error.message });
      return;
    }

    const foundUser = await prismaClient.user.findUnique({
      where: { email: parsedSignUpInputResult.data.email },
    });

    if (foundUser) {
      res.status(404).json({ message: "Email is already registered" });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(
      parsedSignUpInputResult.data.password,
      salt
    );

    await prismaClient.$transaction(async (prismaClient) => {
      const user = await prismaClient.user.create({
        data: {
          email: parsedSignUpInputResult.data.email,
          name: parsedSignUpInputResult.data.name,
        },
      });

      const account = await prismaClient.account.create({
        data: {
          provider: AccountProvider.Credentials,
          providerId: user.id,
          userId: user.id,
          password: hashedPassword,
        },
      });

      return { user, account };
    });

    res.status(201).json({ message: "You are successfully signed up" });
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;

      console.error(`[ERROR]: ${message}`);
    }

    res.status(500).json({
      message: "Unexpected error upon creating signing up",
    });
  }
});

const signInInput = z.object({
  email: z.email(),
  password: z.string(),
});

authRouter.post("/signin", async (req, res) => {
  try {
    const { body } = req;
    const parsedSignInInputResult = signInInput.safeParse(body);

    if (!parsedSignInInputResult.success) {
      res.status(400).json({ message: parsedSignInInputResult.error.message });
      return;
    }

    const foundUser = await prismaClient.user.findUnique({
      where: { email: parsedSignInInputResult.data.email },
    });

    if (!foundUser) {
      res.status(404).json({ message: "Email is not yet registered" });
      return;
    }

    const foundAccount = await prismaClient.account.findUnique({
      where: {
        provider_userId: {
          provider: AccountProvider.Credentials,
          userId: foundUser.id,
        },
      },
    });

    if (!foundAccount || !foundAccount.password) {
      res
        .status(404)
        .json({ message: "User does not have credentials account" });
      return;
    }

    const matchedPassword = await bcrypt.compare(
      parsedSignInInputResult.data.password,
      foundAccount.password
    );

    if (!matchedPassword) {
      res.status(401).json({ message: "Wrong credentials" });
      return;
    }

    const signer = new SignJWT();
    signer.setProtectedHeader({ alg: "HS256" });
    signer.setSubject(foundUser.id);
    signer.setExpirationTime("15m");

    const textEncoder = new TextEncoder();
    const encodedSecret = textEncoder.encode(keys.auth.secret);

    const token = await signer.sign(encodedSecret);

    res.status(200).json({ token: token });
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;

      console.error(`[ERROR]: ${message}`);
    }

    res.status(500).json({
      message: "Unexpected error upon creating signing in",
    });
  }
});

export { authRouter };
