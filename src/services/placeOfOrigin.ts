import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface PlaceOfOriginData {
  id?: string;
  year: number;
  regionI: number;
  regionII: number;
  regionIII: number;
  regionIVA: number;
  regionIVB: number;
  regionV: number;
  regionVI: number;
  regionVII: number;
  regionVIII: number;
  regionIX: number;
  regionX: number;
  regionXI: number;
  regionXII: number;
  regionXIII: number;
  armm: number;
  car: number;
  ncr: number;
  notReported: number;
}

const COLLECTION_NAME = 'placeOfOrigin';

export const addPlaceOfOrigin = async (data: Omit<PlaceOfOriginData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding place of origin data:', error);
    throw error;
  }
};

export const getPlaceOfOrigin = async (): Promise<PlaceOfOriginData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PlaceOfOriginData));
  } catch (error) {
    console.error('Error getting place of origin data:', error);
    throw error;
  }
};

export const updatePlaceOfOrigin = async (id: string, data: Partial<PlaceOfOriginData>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating place of origin data:', error);
    throw error;
  }
};

export const deletePlaceOfOrigin = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting place of origin data:', error);
    throw error;
  }
};

