import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const majorCountriesCollection = collection(db, "majorCountries");

type MajorCountries = {
  year: number;
  Usa: number;
  Canada: number;
  Japan: number;
  Australia: number;
  Italy: number;
  NewZealand: number;
  UnitedKingdom: number;
  Germany: number;
  SouthKorea: number;
  Spain: number;
  Others:number;
}

// CREATE
export const addMajorCountries = async (data: MajorCountries) => {
  await addDoc(majorCountriesCollection, data);
};

// READ
export const getMajorCountries = async () => {
  const snapshot = await getDocs(majorCountriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// UPDATE
export const updateMajorCountries = async (id: string, data: MajorCountries) => {
  const docRef = doc(db, "majorCountries", id);
  await updateDoc(docRef, data);
};

// DELETE
export const deleteMajorCountries = async (id: string) => {
  const docRef = doc(db, "majorCountries", id);
  await deleteDoc(docRef);
};

// DELETE ALL
export const deleteAllMajorCountries = async () => {
  const snapshot = await getDocs(majorCountriesCollection);
  snapshot.docs.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
};