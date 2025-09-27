import {
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export const addUserToFirestore = async (user) => {
  const role = user.email.endsWith("@evnt5.com") ? "staff" : "user";
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    createdAt: serverTimestamp(),
    role: role,
  });
};

export const getUserFromFirestore = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role;
    } else {
      throw new Error("User not found in database");
    }
  } catch (error) {
    console.error("Error whhilst fetching role", error);
    throw error;
  }
};

export const addEventsTorFirestore = async (event) => {
  await setDoc(doc(db, "events", uid), {
    eventId: event.uid,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    type: event.type,
    startTime: event.startTime,
    endTime: event.endTime,
    price: event.price,
    createdBy: event.createdBy,
    createdAt: serverTimestamp(),
  });
};

export const getEventsFromFirestore = async () => {
  try {
    const eventsRef = collection(db, "events");
    const querySnapshot = await getDocs(eventsRef);
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return events;
  } catch (error) {
    console.error("Error whilst fetching events from Firestore", error);
    throw error;
  }
};
