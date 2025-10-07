import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const emigrantsCollection = collection(db, "emigrants");

type Emigrant = {
  year: number;
  single: number;
  married: number;
  widower: number;
  separated: number;
  divorced: number;
  notReported: number;
}

// CREATE
export const addEmigrant = async (data: Emigrant) => {
  await addDoc(emigrantsCollection, data);
};

// READ
export const getEmigrants = async () => {
  const snapshot = await getDocs(emigrantsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// UPDATE
export const updateEmigrant = async (id: string, data: Emigrant) => {
  const docRef = doc(db, "emigrants", id);
  await updateDoc(docRef, data);
};

// DELETE
export const deleteEmigrant = async (id: string) => {
  const docRef = doc(db, "emigrants", id);
  await deleteDoc(docRef);
};