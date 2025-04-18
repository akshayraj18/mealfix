import { db, auth } from '@/config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

const PANTRY_COLLECTION = 'pantryItems';

export async function getPantryItems(): Promise<string[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = doc(db, PANTRY_COLLECTION, user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return (data.items || []) as string[];
  }

  return [];
}

export async function addPantryItem(item: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = doc(db, PANTRY_COLLECTION, user.uid);
  await setDoc(
    docRef,
    { items: arrayUnion(item.toLowerCase()) },
    { merge: true }
  );
}

export async function removePantryItem(item: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = doc(db, PANTRY_COLLECTION, user.uid);
  await updateDoc(docRef, {
    items: arrayRemove(item.toLowerCase()),
  });
}
