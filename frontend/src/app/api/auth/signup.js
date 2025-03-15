import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, password, phoneNumber } = req.body;

  if (!email.endsWith("@cb.students.amrita.edu")) {
    return res.status(400).json({ message: "Only Amrita students can sign up." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, phoneNumber },
  });

  res.status(201).json({ message: "User created successfully!" });
}
