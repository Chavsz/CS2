import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface OccupationData {
  id?: string;
  year: number;
  // A. EMPLOYED categories
  professionalTechnical: number;
  managerialExecutive: number;
  clericalWorkers: number;
  salesWorkers: number;
  serviceWorkers: number;
  agriculturalWorkers: number;
  productionTransportLaborers: number;
  armedForces: number;
  // B. UNEMPLOYED categories
  housewives: number;
  retirees: number;
  students: number;
  minors: number;
  outOfSchoolYouth: number;
  refugees: number;
  noOccupationReported: number;
}

const COLLECTION_NAME = 'occupation';

export const addOccupation = async (data: Omit<OccupationData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding occupation data:', error);
    throw error;
  }
};

export const getOccupation = async (): Promise<OccupationData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as OccupationData));
  } catch (error) {
    console.error('Error getting occupation data:', error);
    throw error;
  }
};

export const updateOccupation = async (id: string, data: Partial<OccupationData>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating occupation data:', error);
    throw error;
  }
};

export const deleteOccupation = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting occupation data:', error);
    throw error;
  }
};
