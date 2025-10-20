import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const civilCollection = collection(db, 'civilStatus')

export type CivilStatusRecord = {
  id?: string;
  year: number;
  single: number;
  married: number;
  widower: number;
  separated: number;
  divorced: number;
  notReported: number;
  total?: number; // optional convenience for chart labels
}

export const addCivilStatus = async (data: Omit<CivilStatusRecord, 'id'>) => {
  const ref = await addDoc(civilCollection, data)
  return ref.id
}

export const getCivilStatuses = async (): Promise<CivilStatusRecord[]> => {
  const snapshot = await getDocs(civilCollection)
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<CivilStatusRecord, 'id'>) }))
}

export const updateCivilStatus = async (id: string, data: Partial<CivilStatusRecord>) => {
  const ref = doc(db, 'civilStatus', id)
  await updateDoc(ref, data)
}

export const deleteCivilStatus = async (id: string) => {
  const ref = doc(db, 'civilStatus', id)
  await deleteDoc(ref)
}

export const deleteAllCivilStatus = async () => {
  const snapshot = await getDocs(civilCollection)
  snapshot.docs.forEach(async (doc) => {
    await deleteDoc(doc.ref)
  })
}

