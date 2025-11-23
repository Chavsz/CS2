import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const ageCollection = collection(db, 'age')

export type AgeRecord = {
  id?: string;
  year: number;
  age14Below: number;
  age15to19: number;
  age20to24: number;
  age25to29: number;
  age30to34: number;
  age35to39: number;
  age40to44: number;
  age45to49: number;
  age50to54: number;
  age55to59: number;
  age60to64: number;
  age65to69: number;
  age70Above: number;
  notReported: number;
  total?: number; // Computed field for total per year
}

export const addAge = async (data: Omit<AgeRecord, 'id'>) => {
  const ref = await addDoc(ageCollection, data)
  return ref.id
}

export const getAges = async (): Promise<AgeRecord[]> => {
  const snapshot = await getDocs(ageCollection)
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AgeRecord, 'id'>) }))
}

export const updateAge = async (id: string, data: Partial<AgeRecord>) => {
  const ref = doc(db, 'age', id)
  await updateDoc(ref, data)
}

export const deleteAge = async (id: string) => {
  const ref = doc(db, 'age', id)
  await deleteDoc(ref)
}

export const deleteAllAges = async () => {
  const snapshot = await getDocs(ageCollection)
  snapshot.docs.forEach(async (doc) => {
    await deleteDoc(doc.ref)
  })
}


