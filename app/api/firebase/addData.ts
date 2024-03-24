import firebase_app from "./firebase.config";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const db = getFirestore(firebase_app);

export default async function addData(
  collection: string,
  id: string,
  data: any
): Promise<void> {
  let error = null;

  try {
    await setDoc(doc(db, collection, id), data, {
      merge: true,
    });
  } catch (e: any) {
    throw new Error(e);
  }
}
