import firebase_app from "./firebase.config";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore(firebase_app);
export default async function getDocument(collection: string, id: string) {
  let docRef = doc(db, collection, id);

  let result = null;

  try {
    result = await getDoc(docRef);
  } catch (e: any) {
    throw new Error(e);
  }

  return result;
}
