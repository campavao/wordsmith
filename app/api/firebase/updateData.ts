import {
  getFirestore,
  doc,
  updateDoc,
  FieldPath,
  arrayUnion,
} from "firebase/firestore";
import firebase_app from "./firebase.config";

const db = getFirestore(firebase_app);
export default async function updateDocument(
  collection: string,
  id: string,
  field: string | FieldPath,
  value?: unknown
) {
  let docRef = doc(db, collection, id);

  let result = null;

  try {
    result = await updateDoc(docRef, field, value);
  } catch (e: any) {
    throw new Error(e);
  }

  return result;
}

export async function addToArray(
  collection: string,
  id: string,
  field: string,
  value: unknown
) {
  let docRef = doc(db, collection, id);

  let result = null;

  try {
    result = await updateDoc(docRef, {
      [field]: arrayUnion(value),
    });
  } catch (e: any) {
    throw new Error(e);
  }

  return result;
}
