"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut as firebaseSignOut,
    User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface AuthUser {
    name: string | null;
    email: string | null;
    image: string | null;
}

interface AuthContextValue {
    user: AuthUser | null;
    firebaseUser: User | null;
    status: "loading" | "authenticated" | "unauthenticated";
    signInWithGoogle: () => Promise<void>;
    sendEmailLink: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const EMAIL_LINK_KEY = "emailForSignIn";

const actionCodeSettings = {
    url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    handleCodeInApp: true,
};

const AuthContext = createContext<AuthContextValue>({
    user: null,
    firebaseUser: null,
    status: "loading",
    signInWithGoogle: async () => {},
    sendEmailLink: async () => {},
    signOut: async () => {},
});

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

    // Complete email link sign-in if the page was opened via a sign-in link
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem(EMAIL_LINK_KEY);
            if (!email) {
                email = window.prompt("Please provide your email for confirmation") || "";
            }
            if (email) {
                signInWithEmailLink(auth, email, window.location.href)
                    .then(() => {
                        window.localStorage.removeItem(EMAIL_LINK_KEY);
                        // Clean the URL of sign-in link params
                        window.history.replaceState(null, "", window.location.pathname);
                    })
                    .catch((err) => {
                        console.error("Email link sign-in error:", err);
                    });
            }
        }
    }, []);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);
            setStatus(user ? "authenticated" : "unauthenticated");
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    }, []);

    const sendEmailLink = useCallback(async (email: string) => {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(EMAIL_LINK_KEY, email);
        }
    }, []);

    const handleSignOut = useCallback(async () => {
        await firebaseSignOut(auth);
    }, []);

    const user: AuthUser | null = firebaseUser
        ? {
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              image: firebaseUser.photoURL,
          }
        : null;

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                status,
                signInWithGoogle,
                sendEmailLink,
                signOut: handleSignOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
