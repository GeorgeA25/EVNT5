import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const outcome = await signInWithPopup(auth, provider);
    const user = outcome.user;
    return user;
  } catch (error) {
    console.error("Google login error", error);
    throw error;
  }
};

const emailLogin = async (email, password) => {
  try {
    const userCredentials = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredentials.user;
  } catch (error) {
    console.error(
      "error whilst signing in with email and password. Please try again",
      error
    );
    throw error;
  }
};

const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error whilst registering account", error);
    throw error;
  }
};

export { googleLogin, emailLogin, registerUser };
