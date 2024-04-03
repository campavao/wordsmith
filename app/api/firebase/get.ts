import { getFirestore } from "firebase-admin/firestore";
import { WhereFilterOp } from "firebase/firestore";

const db = getFirestore();

export async function getDocuments<T extends object>(
  collectionString: string,
  fieldPath: string,
  opStr: WhereFilterOp,
  value: unknown
): Promise<T[]> {
  const collectionRef = db.collection(collectionString);

  try {
    const result = await collectionRef.where(fieldPath, opStr, value).get();
    const docs = result.docs
      .map<T | undefined>((d) => (d.exists ? (d.data() as T) : undefined))
      .filter<T>((d): d is T => d != null);

    return docs;
  } catch (e: any) {
    throw new Error(e);
  }
}
