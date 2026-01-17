import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        ...(process.env.EMAIL_SERVER ? [
            Nodemailer({
                server: process.env.EMAIL_SERVER,
                from: process.env.EMAIL_FROM,
            })
        ] : []),
    ],
    pages: {
        signIn: "/",
    },
    callbacks: {
        async session({ session, token }) {
            return session;
        },
    },
});
