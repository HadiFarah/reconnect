import { db } from '../database/firebase';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';

const fetchMissingPersons = async () => {
  const snapshot = await getDocs(collection(db, 'missingPersons'));
  const missingPersonsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return missingPersonsList;
};

const addMissingPerson = async (person) => {
  try {
    // Ensure the date is in a Firestore-compatible format
    person.dateMissing = person.dateMissing instanceof Date ? person.dateMissing : new Date(person.dateMissing);
    
    const docRef = await addDoc(collection(db, 'missingPersons'), person);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const fetchUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Ensure UID is included in the returned data
      if (!userData.UID) {
        userData.UID = userId; // Add UID if it's missing for backward compatibility
      }
      return userData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export { addMissingPerson, fetchMissingPersons, fetchUserById };
