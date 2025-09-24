import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  emailLogin,
  googleLogin,
  registerUser,
} from "../firebase/firebaseAuth";
import {
  addUserToFirestore,
  getUserFromFirestore,
} from "../firebase/firebaseStore";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginLoadingMessage, setLoginLoadingMessage] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registerLoadingMessage, setRegisterLoadingMessage] = useState(false);
  const [registerErrorMessage, setRegisterErrorMessage] = useState(null);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);

  const navigate = useNavigate();

  const handleAuthentificationError = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Please enter a valid email address";
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "Incorrect password or email, Please try again";
      case "auth/email-already-in-use":
        return "This email is already registered";
      case "auth/weak-password":
        return "Password must be atleast 6 characters";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection";
      default:
        return "Something went wrong. Please try again";
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoginLoadingMessage(true);
    setLoginErrorMessage(null);

    try {
      const user = await emailLogin(email, password);
      console.log(user);
      const userRole = await getUserFromFirestore(user.uid);
      navigate(userRole === "staff" ? "/staff-dashboard" : "/dashboard");
    } catch (error) {
      const errorMessage = handleAuthentificationError(error.code);
      setLoginErrorMessage(errorMessage);
    } finally {
      setLoginLoadingMessage(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoginLoading(true);
    setLoginErrorMessage(null);

    try {
      const user = await googleLogin();
      console.log(user);
      const userRole = await getUserFromFirestore(user.uid);

      if (!userRole) {
        await addUserToFirestore({
          uid: user.uid,
          email: user.email,
          role: "user",
        });
      }

      navigate(userRole === "staff" ? "/staff-dashboard" : "/dashboard");
    } catch (error) {
      const errorMessage = handleAuthentificationError(error.code);
      setLoginErrorMessage(errorMessage);
    } finally {
      setGoogleLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoadingMessage(true);
    setRegisterErrorMessage(null);
    setRegistering(true);

    try {
      const user = await registerUser(registerEmail, registerPassword);
      console.log(user);
      let userRole = "user";
      if (registerEmail.endsWith("@evnt5.com")) {
        userRole = "staff";
      }
      console.log(userRole);
      await addUserToFirestore({
        uid: user.uid,
        email: registerEmail,
        role: userRole,
      });
      navigate(userRole === "staff" ? "/staff-dashboard" : "/dashboard");
    } catch (error) {
      console.error(error);
      const errorMessage = handleAuthentificationError(error.code);
      setRegisterErrorMessage(errorMessage);
    } finally {
      setRegisterLoadingMessage(false);
      setRegistering(false);
    }
  };

  return (
    <section>
      <h1>Login</h1>
      {loginLoadingMessage && (
        <p> Loading login/registration page, please wait...</p>
      )}
      {loginErrorMessage && <p>{loginErrorMessage}</p>}

      <form onSubmit={handleEmailLogin}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Please enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Please enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" disabled={loginLoadingMessage}>
          {registering ? "Logging in..." : "Login"}
        </button>
      </form>
      <h1>Register</h1>
      {registerLoadingMessage && <p>loading, please wait...</p>}
      {registerErrorMessage && <p>{registerErrorMessage}</p>}
      <form onSubmit={handleRegister}>
        <label htmlFor="email-register">Email</label>
        <input
          type="email"
          id="email-register"
          placeholder="please enter email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          disabled={registering}
        />
        <label htmlFor="password-register"></label>
        <input
          type="password"
          id="password-register"
          placeholder="please enter password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          required
          minLength={6}
          disabled={registering}
        />
        <button type="submit" disabled={registerLoadingMessage || registering}>
          {registering ? "Registering..." : "Register"}
        </button>
      </form>
      <button onClick={handleGoogleLogin} disabled={googleLoginLoading}>
        {" "}
        {googleLoginLoading ? "Logging in with Google..." : "Login with Google"}
      </button>
    </section>
  );
};

export default LoginForm;
