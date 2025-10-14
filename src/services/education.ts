import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const educationCollection = collection(db, 'education')

export type EducationRecord = {
  id?: string;
  year: number;
  // store a single total to keep scatter simple; you can change later
  total: number;
  // number of graduates for the same year (used for percent calc)
  graduates?: number;
}

export const addEducation = async (data: Omit<EducationRecord, 'id'>) => {
  const ref = await addDoc(educationCollection, data)
  return ref.id
}

export const getEducations = async (): Promise<EducationRecord[]> => {
  const snapshot = await getDocs(educationCollection)
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<EducationRecord, 'id'>) }))
}

export const updateEducation = async (id: string, data: Partial<EducationRecord>) => {
  const ref = doc(db, 'education', id)
  await updateDoc(ref, data)
}

export const deleteEducation = async (id: string) => {
  const ref = doc(db, 'education', id)
  await deleteDoc(ref)
}

