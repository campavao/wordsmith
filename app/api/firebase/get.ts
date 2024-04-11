import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  WhereFilterOp,
} from "firebase/firestore";
import firebase_app from "./firebase.config";

const db = getFirestore(firebase_app);

export async function getDocuments<T extends object>(
  collectionString: string,
  fieldPath: string,
  opStr: WhereFilterOp,
  value: unknown
): Promise<T[]> {
  const collectionRef = query(
    collection(db, collectionString),
    where(fieldPath, opStr, value)
  );

  try {
    const result = await getDocs(collectionRef);
    const docs = result.docs
      .map<T | undefined>((d) => (d.exists() ? (d.data() as T) : undefined))
      .filter<T>((d): d is T => d != null);

    return docs;
  } catch (e: any) {
    throw new Error(e);
  }
}
