import { db } from '../database/firebase';
import { collection, addDoc, getDocs, doc, setDoc, getDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';

// User profile functions
export const createUserProfile = async (uid, userData) => {
  try {
    // Include the UID field in the user data
    const userDataWithUID = {
      ...userData,
      UID: uid  // Add the UID field
    };
    await setDoc(doc(db, 'users', uid), userDataWithUID);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, userData);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Missing persons functions
export const fetchMissingPersons = async () => {
  const snapshot = await getDocs(collection(db, 'missingPersons'));
  const missingPersonsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return missingPersonsList;
};

// Fetch missing persons for a specific user
export const fetchUserListings = async (userId) => {
  try {
    const q = query(
      collection(db, 'missingPersons'),
      where('reporterId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw error;
  }
};

export const addMissingPerson = async (person) => {
  try {
    // Ensure the date is in a Firestore-compatible format
    person.dateMissing = person.dateMissing instanceof Date ? person.dateMissing : new Date(person.dateMissing);
    
    // Add reporter contact information from user profile if available
    if (person.reporterId) {
      const userProfile = await getUserProfile(person.reporterId);
      if (userProfile) {
        person.reporterEmail = userProfile.email;
        person.reporterPhone = userProfile.phoneNumber;
      }
    }
    
    const docRef = await addDoc(collection(db, 'missingPersons'), person);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Update a missing person listing
export const updateMissingPerson = async (listingId, updateData) => {
  try {
    const listingRef = doc(db, 'missingPersons', listingId);
    await updateDoc(listingRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

// Delete a missing person listing
export const deleteMissingPerson = async (listingId) => {
  try {
    await deleteDoc(doc(db, 'missingPersons', listingId));
    return true;
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};
