import { db } from '../database/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const fetchMissingPersons = async () => {
  const snapshot = await getDocs(collection(db, 'missingPersons'));
  const missingPersonsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return missingPersonsList;
};

const addMissingPerson = async (person) => {
  try {
    const docRef = await addDoc(collection(db, 'missingPersons'), person);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export { addMissingPerson, fetchMissingPersons };
