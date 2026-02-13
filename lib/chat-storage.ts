
import { db } from './firebase';
import { collection, addDoc, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';
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
    const docRef = await addDoc(collection(db, 'chat_sessions'), {
      user_email: userEmail,
      title,
      created_at: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.warn("Firestore error (create session), using localStorage fallback:", error);
    if (isBrowser) {
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
    // Simple where-only query to avoid needing composite indexes
    const q = query(
      collection(db, 'chat_sessions'),
      where('user_email', '==', userEmail)
    );
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(d => ({
      id: d.id,
      title: d.data().title,
      created_at: d.data().created_at,
    }));
    // Sort by created_at descending in JavaScript
    sessions.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return sessions;
  } catch (error) {
    console.warn("Firestore error (fetch sessions), using localStorage fallback:", error);
    if (isBrowser) {
      return JSON.parse(localStorage.getItem(`chat_sessions_${userEmail}`) || '[]');
    }
    return [];
  }
}

export async function getChatMessages(sessionId: string): Promise<StoredMessage[]> {
  try {
    // Subcollection query — single-field orderBy on subcollection doesn't need composite index
    const messagesRef = collection(db, 'chat_sessions', sessionId, 'chat_messages');
    const snapshot = await getDocs(messagesRef);
    const messages = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        role: data.role as 'user' | 'model',
        content: data.content,
        products: data.products ? (data.products as Product[]) : undefined,
        created_at: data.created_at,
      };
    });
    // Sort by created_at ascending in JavaScript
    messages.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    return messages;
  } catch (error) {
    console.warn("Firestore error (fetch messages), using localStorage fallback:", error);
    if (isBrowser) {
      return JSON.parse(localStorage.getItem(`chat_messages_${sessionId}`) || '[]');
    }
    return [];
  }
}

export async function saveChatMessage(sessionId: string, message: { sender: Sender, text?: string, products?: Product[] }) {
  try {
    await addDoc(collection(db, 'chat_sessions', sessionId, 'chat_messages'), {
      role: message.sender === Sender.USER ? 'user' : 'model',
      content: message.text || '',
      products: message.products || null,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Firestore error (save message), using localStorage fallback:", error);
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
    await updateDoc(doc(db, 'chat_sessions', sessionId), { title });
  } catch (error) {
    // Silent fail — title update is a nice-to-have
  }
}
