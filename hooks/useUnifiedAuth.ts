"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export interface UnifiedUser {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    image?: string | null;
    source: 'google' | 'supabase';
}

export function useUnifiedAuth() {
    const { data: nextAuthSession, status: nextAuthStatus } = useSession();
    const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
    const [supabaseLoading, setSupabaseLoading] = useState(true);

    useEffect(() => {
        // Check active Supabase session
        const checkSupabaseSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSupabaseUser(session?.user ?? null);
            setSupabaseLoading(false);
        };

        checkSupabaseSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSupabaseUser(session?.user ?? null);
            setSupabaseLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const isLoading = nextAuthStatus === "loading" || supabaseLoading;

    // Prioritize NextAuth (Google) then Supabase (Email)
    let unifiedUser: UnifiedUser | null = null;

    if (nextAuthSession?.user) {
        unifiedUser = {
            name: nextAuthSession.user.name,
            email: nextAuthSession.user.email,
            image: nextAuthSession.user.image,
            source: 'google'
        };
    } else if (supabaseUser) {
        unifiedUser = {
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || supabaseUser.phone,
            email: supabaseUser.email,
            phone: supabaseUser.phone,
            image: null,
            source: 'supabase'
        };
    }

    return {
        user: unifiedUser,
        status: isLoading ? "loading" : (unifiedUser ? "authenticated" : "unauthenticated"),
        isLoading
    };
}
