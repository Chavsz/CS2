import { db } from '../firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const countriesCollection = collection(db, 'countries')

export type CountryYearRecord = {
  id?: string;
  year?: number;
  // ISO 3166-1 alpha-3 code (e.g., USA, PHL). Nivo world topo uses alpha-3 ids
  iso3: string;
  count: number;
}

export const addCountryYear = async (data: Omit<CountryYearRecord, 'id'>) => {
  const ref = await addDoc(countriesCollection, data)
  return ref.id
}

export const getCountryYears = async (): Promise<CountryYearRecord[]> => {
  const snapshot = await getDocs(countriesCollection)
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<CountryYearRecord, 'id'>) }))
}

export const updateCountryYear = async (id: string, data: Partial<CountryYearRecord>) => {
  const ref = doc(db, 'countries', id)
  await updateDoc(ref, data)
}

export const deleteCountryYear = async (id: string) => {
  const ref = doc(db, 'countries', id)
  await deleteDoc(ref)
}

export const deleteAllCountryYears = async () => {
  const snapshot = await getDocs(countriesCollection)
  snapshot.docs.forEach(async (d) => {
    await deleteDoc(d.ref)
  })
}


