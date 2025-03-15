import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mysql from "mysql2/promise";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@amrita.students.edu" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "Shama0207",
            database: "carpool",
          });

          const [rows] = await connection.execute(
            "SELECT * FROM user WHERE email = ?",
            [credentials.email]
          );

          connection.end();

          if (rows.length === 0) {
            throw new Error("User not found");
          }

          const user = rows[0];

          // ⚠️ TODO: Use bcrypt to compare hashed passwords instead of plain-text!
          if (user.password !== credentials.password) {
            throw new Error("Invalid password");
          }

          return { id: user.id, name: user.name, email: user.email };
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Internal server error");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
