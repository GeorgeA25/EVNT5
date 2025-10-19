import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import {
  addGoogleRefreshTokenToFirestore,
  addGoogleUsersToFirestore,
} from "./firebaseStore";

const googleLogin = async () => {
  console.log("googleLogin function called");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "consent",
    access_type: "offline",
  });
  provider.addScope("https://www.googleapis.com/auth/calendar");

  try {
    console.log("Attempting to open Google sign-in popup...");
    const outcome = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(outcome);
    console.log(outcome);
    await addGoogleRefreshTokenToFirestore(
      outcome.user.uid,
      outcome.user.refreshToken
    );
    await addGoogleUsersToFirestore(
      outcome.user,
      outcome._tokenResponse?.idToken || null,
      credential?.accessToken || null
    );

    return outcome.user;
  } catch (error) {
    console.error("Google login error", error);
    throw error;
  }
};

const connectGoogleCalendar = async () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "consent",
    access_type: "offline",
  });
  provider.addScope(`https://evnt5-97cf1.web.app/oauth2callback?state=${uid}`);
  try {
    const outcome = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(outcome);
    const refreshToken =
      credential?.refreshToken ||
      outcome.user?.stsTokenManager?.refreshToken ||
      null;

    const accessToken = credential?.accessToken;

    console.log("Google credential:", credential);
    console.log("Access token:", accessToken);
    console.log("Refresh token:", refreshToken);
    if (refreshToken) {
      await addGoogleRefreshTokenToFirestore(outcome.user.uid, refreshToken);
    }

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("error conectng to google calendar", error);
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

export { googleLogin, emailLogin, registerUser, connectGoogleCalendar };
