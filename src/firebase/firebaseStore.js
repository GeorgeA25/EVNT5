import { serverTimestamp, setDoc, doc, getDoc } from "firebase/firestore";
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
