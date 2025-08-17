
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyDX5UBXN3lKAnI-sRXauGGzu-1BtKr-gjk",
  authDomain: "adv102-final-project.firebaseapp.com",
  projectId: "adv102-final-project",
  storageBucket: "adv102-final-project.appspot.com",
  messagingSenderId: "341184848880",
  appId: "1:341184848880:web:6a7c199f0763c4bd473335",
  measurementId: "G-9DCCMBE3NG"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();