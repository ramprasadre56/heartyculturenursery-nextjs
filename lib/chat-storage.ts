
import { supabase } from './supabase';
import { Product, Sender } from './chat/types';

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  products?: Product[];
  created_at: string;
}

// Helper to check if we are in browser
const isBrowser = typeof window !== 'undefined';

export async function createChatSession(userEmail: string, title: string = 'New Chat'): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ user_email: userEmail, title }])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned");
    return data.id;
  } catch (error) {
    if (isBrowser) {
      console.warn("Supabase error (create session), using localStorage fallback.");
      const newId = crypto.randomUUID();
      const newSession: ChatSession = {
        id: newId,
        title,
        created_at: new Date().toISOString()
      };
      const sessions = JSON.parse(localStorage.getItem(`chat_sessions_${userEmail}`) || '[]');
      sessions.unshift(newSession);
      localStorage.setItem(`chat_sessions_${userEmail}`, JSON.stringify(sessions));
      return newId;
    }
    return null;
  }
}

export async function getUserChatSessions(userEmail: string): Promise<ChatSession[]> {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    if (isBrowser) {
      console.warn("Supabase error (fetch sessions), using localStorage fallback.");
      return JSON.parse(localStorage.getItem(`chat_sessions_${userEmail}`) || '[]');
    }
    return [];
  }
}

export async function getChatMessages(sessionId: string): Promise<StoredMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: { id: string; role: string; content: string; products?: unknown; created_at: string }) => ({
      id: row.id,
      role: row.role as 'user' | 'model',
      content: row.content,
      products: row.products ? (row.products as Product[]) : undefined,
      created_at: row.created_at,
    }));
  } catch (error) {
    if (isBrowser) {
      console.warn("Supabase error (fetch messages), using localStorage fallback.");
      return JSON.parse(localStorage.getItem(`chat_messages_${sessionId}`) || '[]');
    }
    return [];
  }
}

export async function saveChatMessage(sessionId: string, message: { sender: Sender, text?: string, products?: Product[] }) {
  try {
    const dbMessage = {
      session_id: sessionId,
      role: message.sender === Sender.USER ? 'user' : 'model',
      content: message.text || '',
      products: message.products || null,
    };

    const { error } = await supabase
      .from('chat_messages')
      .insert([dbMessage]);

    if (error) throw error;
  } catch (error) {
    if (isBrowser) {
      const storedMessage: StoredMessage = {
        id: crypto.randomUUID(),
        role: message.sender === Sender.USER ? 'user' : 'model',
        content: message.text || '',
        products: message.products || undefined,
        created_at: new Date().toISOString()
      };
      const messages = JSON.parse(localStorage.getItem(`chat_messages_${sessionId}`) || '[]');
      messages.push(storedMessage);
      localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
    }
  }
}

export async function updateSessionTitle(sessionId: string, title: string) {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ title })
      .eq('id', sessionId);

    if (error) throw error;
  } catch (error) {
    // Silent fail or implemented for local if needed
    if (isBrowser) {
      // Implementation skipped to avoid scanning all keys.
      // Title update is a nice-to-have.
    }
  }
}
