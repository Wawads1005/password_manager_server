import e from "express";
import z from "zod";
import bcrypt from "bcrypt";
import { prismaClient } from "@/lib/prisma";
import { AccountProvider } from "@prisma/client";

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

export { authRouter };
