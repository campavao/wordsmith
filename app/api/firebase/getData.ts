import firebase_app from "./firebase.config";
import {
  getFirestore,
  doc,
  getDoc,
  where,
  query as firestoreQuery,
  collection as firestoreCollection,
  FieldPath,
  getDocs,
  WhereFilterOp,
} from "firebase/firestore";

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

type Query = {
  fieldPath: string | FieldPath;
  opStr: WhereFilterOp;
  value: unknown;
};

export async function getDocuments(collection: string, query: Query) {
  const q = firestoreQuery(
    firestoreCollection(db, collection),
    where(query.fieldPath, query.opStr, query.value)
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot;
}
