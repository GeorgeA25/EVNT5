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

export const addGoogleUsersToFirestore = async (user) => {
  const displayName = user.displayName || user.email.split("@")[0];
  await setDoc(doc(db, "GoogleUsers", user.uid), {
    email: user.email,
    name: displayName,
    createdAt: serverTimestamp(),
  });
};

export const addSignedUpEvents = async (user, eventId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const displayName = user.displayName || user.email.split("@")[0];
    const eventRef = collection(db, "eventSignedUp");
    await addDoc(eventRef, {
      eventId: eventId,
      name: displayName,
      email: user.email,
      signedUp: serverTimestamp(),
    });
    console.log("Event has been signed up to successfully");
  } catch (error) {
    console.error("Error whilst adding event signUp to Firestore", error);
    throw error;
  }
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

export const getGoogleUsersFromFirestore = async (uid) => {
  try {
    const userRef = doc(db, "GoogleUsers", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error whilst fetching Google User", error);
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

export const getEventsById = async (eventId) => {
  try {
    const eventsRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventsRef);
    if (eventSnap.exists()) {
      return { id: eventSnap.id, ...eventSnap.data() };
    } else {
      throw new Error("Event nt found");
    }
  } catch (error) {
    console.error("Error whilst fetching events by event ID", error);
    throw error;
  }
};

export const getSignedUpEventsByEventId = async (eventId) => {
  try {
    const signUpsRef = collection(db, "eventSignedUp");
    const q = query(signUpsRef, where("eventId", "==", eventId));
    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return events;
  } catch (error) {
    console.error(
      "Error whilst fetching events that have been signed up to",
      error
    );
    throw error;
  }
};
