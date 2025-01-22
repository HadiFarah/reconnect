import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore"; // Import necessary Firestore functions
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage"; // Import necessary Storage functions

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
const storage = getStorage(app); // Initialize Firebase storage

const fetchImagesWithNames = async () => {
    const imagesRef = ref(storage, 'images/'); // Reference to the images folder
    const listResult = await listAll(imagesRef);
    const images = [];

    for (const item of listResult.items) {
        const url = await getDownloadURL(item); // Get the download URL for each image
        console.log("Fetched Image URL:", url); // Log the URL of the fetched image
        images.push({ // Correctly push the object into the array
            url: url
        });
    }

    return images;
};

// Test function to check Firestore access
const testFirestoreAccess = async () => {
    try {
        const images = await fetchImagesWithNames();
        console.log("Fetched images:", images);
    } catch (error) {
        console.error("Error fetching images:", error);
    }
};

testFirestoreAccess(); // Call the test function

export { app, db, storage, fetchImagesWithNames };
