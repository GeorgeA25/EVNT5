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
  deleteDoc,
  updateDoc,
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

export const addGoogleUsersToFirestore = async (user, idToken, accessToken) => {
  const displayName = user.displayName || user.email.split("@")[0];
  await setDoc(doc(db, "GoogleUsers", user.uid), {
    email: user.email,
    name: displayName,
    createdAt: serverTimestamp(),
    idToken: idToken || null,
    accessToken: accessToken || null,
  });
};

export const addGoogleRefreshTokenToFirestore = async (uid, refreshToken) => {
  if (!refreshToken) return;

  try {
    await setDoc(
      doc(db, "user_tokens", uid),
      {
        refreshToken,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log("Refresh token saved for user", uid);
  } catch (error) {
    console.error("error saving refresh token", error);
  }
};

export const addGoogleApiRefreshTokenToFirestore = async (uid, tokenData) => {
  if (!tokenData?.refresh_token) {
    console.error("missing google calendar refresh token");
    return;
  }

  try {
    await setDoc(
      doc(db, "google_calendar_tokens", uid),
      {
        refresh_token: tokenData.refresh_token,
        access_token: tokenData.access_token,
        scope: tokenData.scope,
        token_type: tokenData.token_type,
        expiry_date: tokenData.expiry_date,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log("google calendar token stored for user", uid);
  } catch (error) {
    console.error("error saving google calendar token", error);
  }
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

export const addPaymentInfoToFirestore = async (
  uid,
  eventId,
  paymentIntent
) => {
  try {
    const paymentRef = doc(db, "payments", `${uid}_${eventId}`);
    await setDoc(paymentRef, {
      uid,
      eventId,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving payment info to Firestore", error);
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
      price: Number(event.price) || 0,
      createdBy: event.createdBy,
      createdAt: serverTimestamp(),
      public: true,
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

export const deleteUsersFromFirestore = async (uid) => {
  try {
    await deleteDoc(doc(db, "users", uid));
    await deleteDoc(doc(db, "GoogleUsers", uid));
    console.log("User data has been deleted from collections");
    await deleteSignedUpEvents(uid);
    console.log("User data has been successfully deleted");
    await deleteDoc(doc(db, "google_calendar_tokens", uid));
    await deleteDoc(doc(db, "user_tokens", uid));
  } catch (error) {
    console.error("Error whilst deleting user data", error);
  }
};

export const deleteStaffFromFirestore = async (uid) => {
  try {
    await deleteDoc(doc(db, "staff", uid));
    console.log("Staff data has been deleted from collections");
    await deleteEventsCreatedByStaff(uid);
    console.log("Staff data has been successfully deleted");
  } catch (error) {
    console.error("Error whilst deleting staff data", error);
  }
};

export const deleteEventsCreatedByStaff = async (uid) => {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("createdBy", "==", uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
      console.log(`Event with ID of ${doc.id} has been deleted`);
    });
  } catch (error) {
    console.error(
      "Error whilst deleting event that's been created by staff",
      error
    );
  }
};

export const deleteEventsById = async (eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
    console.log(`Event with ID ${eventId} has been deleted`);
  } catch (error) {
    console.error("Error whilst deleting event by ID", error);
    throw error;
  }
};

export const deleteSignedUpEvents = async (uid) => {
  try {
    const signedUpEventsRef = collection(db, "eventSignedUp");
    const q = query(signedUpEventsRef, where("email", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
      console.log(`Signed-up event with ${doc.id} has been deleted`);
    });
  } catch (error) {
    console.error("Error whilst deleting signed-up events for user", error);
  }
};

export const updateEventById = async (eventId, updatedData) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, updatedData);
    console.log("Event updated successfully");
  } catch (error) {
    console.error("Error whilst updating event", error);
    throw error;
  }
};
