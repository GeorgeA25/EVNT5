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
    if (!event.createdBy) {
      throw new Error(
        "Event must have a createdBy property with a valid staff UID"
      );
    }
    const staffDocRef = doc(db, "staff", event.createdBy);
    const eventRef = collection(staffDocRef, "events");
    await setDoc(eventRef, {
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
