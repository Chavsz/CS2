import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const sexCollection = collection(db, 'sex')

export type SexRecord = {
  id?: string;
  year: number;
  male: number;
  female: number;
}

export const addSex = async (data: Omit<SexRecord, 'id'>) => {
  const ref = await addDoc(sexCollection, data)
  return ref.id
}

export const getSexes = async (): Promise<SexRecord[]> => {
  const snapshot = await getDocs(sexCollection)
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SexRecord, 'id'>) }))
}

export const updateSex = async (id: string, data: Partial<SexRecord>) => {
  const ref = doc(db, 'sex', id)
  await updateDoc(ref, data)
}

export const deleteSex = async (id: string) => {
  const ref = doc(db, 'sex', id)
  await deleteDoc(ref)
}

