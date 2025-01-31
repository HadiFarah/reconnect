import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore"; // Import necessary Firestore functions
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx2OJvoU0aQFb9HAdDp8lFv4AMMdrjqVQ",
  authDomain: "reconnect-d37ce.firebaseapp.com",
  projectId: "reconnect-d37ce",
  storageBucket: "reconnect-d37ce.firebasestorage.app",
  messagingSenderId: "223853027081",
  appId: "1:223853027081:web:976d7b6e4a1ef215fb7dd8",
  measurementId: "G-2HCNXKECNB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore database
const storage = getStorage(app);

// Function to fetch missing persons from Firestore
const fetchMissingPersons = async () => {
    const snapshot = await getDocs(collection(db, 'missingPersons'));
    const missingPersonsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() // This will include name, description, and imgSrc
    })).map(person => ({
        ...person,
        imgSrc: person.imgSrc // Ensure this returns an array of URLs
    }));
    return missingPersonsList;
};

// Test function to check Firestore access
const testFirestoreAccess = async () => {
    try {
        const persons = await fetchMissingPersons();
        console.log("Fetched missing persons:", persons);
    } catch (error) {
        console.error("Error fetching missing persons:", error);
    }
};

testFirestoreAccess(); // Call the test function

export { app, db, storage, fetchMissingPersons };
