import {
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  where,
  query,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export const addUserToFirestore = async (user) => {
  const displayName = user.displayName || user.email.split("@")[0];
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    name: displayName,
    createdAt: serverTimestamp(),
  });
};

export const addStaffToFirestore = async (user) => {
  const displayName = user.displayName || user.email.split("@")[0];
  await setDoc(doc(db, "staff", user.uid), {
    email: user.email,
    name: displayName,
    createdAt: serverTimestamp(),
  });
};

export const getUserFromFirestore = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData;
    } else {
      throw new Error("User not found in database");
    }
  } catch (error) {
    console.error("Error whhilst fetching role", error);
    throw error;
  }
};

export const getStaffFromFirestore = async (uid) => {
  try {
    const staffRef = doc(db, "staff", uid);
    const staffDoc = await getDoc(staffRef);

    if (staffDoc.exists()) {
      const staffData = staffDoc.data();
      return staffData;
    } else {
      throw new Error("Staff not found in database");
    }
  } catch (error) {
    console.error("Error whhilst fetching role", error);
    throw error;
  }
};

export const addEventsTorFirestore = async (event) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    if (!event.createdBy) {
      event.createdBy = currentUser.uid;
    }
    const eventRef = collection(db, "events");
    await addDoc(eventRef, {
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
    console.log("Event added successfully");
  } catch (error) {
    console.error("Error whilst adding event to Firestore", error);
    throw error;
  }
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

export const getEventsByStaffId = async (staffId) => {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("createdBy", "==", staffId));
    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return events;
  } catch (error) {
    console.error("Error whilst fetching events by staff ID", error);
    throw error;
  }
};
