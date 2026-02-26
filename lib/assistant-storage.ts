
import { db } from './firebase';
import { collection, addDoc, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { Plant } from './data';

export interface AssistantSession {
  id: string;
  title: string;
  created_at: string;
}

export interface StoredAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Plant[];
  created_at: string;
}

const isBrowser = typeof window !== 'undefined';

export async function createAssistantSession(userEmail: string, title: string = 'New Chat'): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'assistant_sessions'), {
      user_email: userEmail,
      title,
      created_at: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.warn("Firestore error (create assistant session), using localStorage fallback:", error);
    if (isBrowser) {
      const newId = crypto.randomUUID();
      const newSession: AssistantSession = { id: newId, title, created_at: new Date().toISOString() };
      const sessions = JSON.parse(localStorage.getItem(`assistant_sessions_${userEmail}`) || '[]');
      sessions.unshift(newSession);
      localStorage.setItem(`assistant_sessions_${userEmail}`, JSON.stringify(sessions));
      return newId;
    }
    return null;
  }
}

export async function getAssistantSessions(userEmail: string): Promise<AssistantSession[]> {
  try {
    const q = query(collection(db, 'assistant_sessions'), where('user_email', '==', userEmail));
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(d => ({
      id: d.id,
      title: d.data().title,
      created_at: d.data().created_at,
    }));
    sessions.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return sessions;
  } catch (error) {
    console.warn("Firestore error (fetch assistant sessions), using localStorage fallback:", error);
    if (isBrowser) {
      return JSON.parse(localStorage.getItem(`assistant_sessions_${userEmail}`) || '[]');
    }
    return [];
  }
}

export async function getAssistantMessages(sessionId: string): Promise<StoredAssistantMessage[]> {
  try {
    const messagesRef = collection(db, 'assistant_sessions', sessionId, 'assistant_messages');
    const snapshot = await getDocs(messagesRef);
    const messages = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        role: data.role as 'user' | 'assistant',
        content: data.content,
        products: data.products ? (data.products as Plant[]) : undefined,
        created_at: data.created_at,
      };
    });
    messages.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    return messages;
  } catch (error) {
    console.warn("Firestore error (fetch assistant messages), using localStorage fallback:", error);
    if (isBrowser) {
      return JSON.parse(localStorage.getItem(`assistant_messages_${sessionId}`) || '[]');
    }
    return [];
  }
}

export async function saveAssistantMessage(sessionId: string, message: { role: 'user' | 'assistant'; content: string; products?: Plant[] }) {
  try {
    await addDoc(collection(db, 'assistant_sessions', sessionId, 'assistant_messages'), {
      role: message.role,
      content: message.content,
      products: message.products || null,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Firestore error (save assistant message), using localStorage fallback:", error);
    if (isBrowser) {
      const storedMessage: StoredAssistantMessage = {
        id: crypto.randomUUID(),
        role: message.role,
        content: message.content,
        products: message.products || undefined,
        created_at: new Date().toISOString()
      };
      const messages = JSON.parse(localStorage.getItem(`assistant_messages_${sessionId}`) || '[]');
      messages.push(storedMessage);
      localStorage.setItem(`assistant_messages_${sessionId}`, JSON.stringify(messages));
    }
  }
}

export async function updateAssistantSessionTitle(sessionId: string, title: string) {
  try {
    await updateDoc(doc(db, 'assistant_sessions', sessionId), { title });
  } catch {
    // Silent fail
  }
}
