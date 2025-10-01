import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  emailLogin,
  googleLogin,
  registerUser,
} from "../firebase/firebaseAuth";
import {
  addUserToFirestore,
  addStaffToFirestore,
  getUserFromFirestore,
  getStaffFromFirestore,
} from "../firebase/firebaseStore";

const LoginForm = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRegisterEmail, setUserRegisterEmail] = useState("");
  const [userRegisterPassword, setUserRegisterPassword] = useState("");

  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRegisterEmail, setStaffRegisterEmail] = useState("");
  const [staffRegisterPassword, setStaffRegisterPassword] = useState("");

  const [loginLoadingMessage, setLoginLoadingMessage] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState(null);

  const [registering, setRegistering] = useState(false);
  const [registerLoadingMessage, setRegisterLoadingMessage] = useState(false);
  const [registerErrorMessage, setRegisterErrorMessage] = useState(null);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);

  const [userFormErrorMessage, setUserFormErrorMessage] = useState("");
  const [staffFormErrorMessage, setStaffFormErrorMessage] = useState("");

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

  const handleUserEmailLogin = async (e) => {
    e.preventDefault();
    setLoginLoadingMessage(true);
    setLoginErrorMessage(null);

    try {
      if (staffEmail || staffPassword) {
        setUserFormErrorMessage(
          "Staff login/Registering is not allowed in these fields. Please use the staff login/registering"
        );
        return;
      }
      const user = await emailLogin(userEmail, userPassword);
      console.log(user);
      const userRole = await getUserFromFirestore(user.uid);
      navigate("/user-dashboard");
    } catch (error) {
      const errorMessage = handleAuthentificationError(error.code);
      setLoginErrorMessage(errorMessage);
    } finally {
      setLoginLoadingMessage(false);
    }
  };

  const handleStaffEmailLogin = async (e) => {
    e.preventDefault();
    setLoginLoadingMessage(true);
    setLoginErrorMessage(null);

    try {
      if (userEmail || userPassword) {
        setStaffFormErrorMessage(
          "User login/Registering is not allowed in these fields. Please use the user login/registering"
        );
        return;
      }
      const user = await emailLogin(staffEmail, staffPassword);
      console.log(user);
      const userRole = await getStaffFromFirestore(user.uid);
      navigate("/staff-dashboard");
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

      navigate("/user-dashboard");
    } catch (error) {
      const errorMessage = handleAuthentificationError(error.code);
      setLoginErrorMessage(errorMessage);
    } finally {
      setGoogleLoginLoading(false);
    }
  };

  const handleUserRegister = async (e) => {
    e.preventDefault();
    setRegisterLoadingMessage(true);
    setRegisterErrorMessage(null);
    setRegistering(true);

    try {
      if (userRegisterEmail.endsWith("@evnt5.com")) {
        setUserFormErrorMessage(
          "Staff registration is not allowed here. Please use the staff registration form"
        );
        return;
      }
      const user = await registerUser(userRegisterEmail, userRegisterPassword);
      console.log(user);
      await addUserToFirestore({
        uid: user.uid,
        email: userRegisterEmail,
      });
      navigate("/user-dashboard");
    } catch (error) {
      console.error(error);
      const errorMessage = handleAuthentificationError(error.code);
      setRegisterErrorMessage(errorMessage);
    } finally {
      setRegisterLoadingMessage(false);
      setRegistering(false);
    }
  };

  const handleStaffRegister = async (e) => {
    e.preventDefault();
    setRegisterLoadingMessage(true);
    setRegisterErrorMessage(null);
    setRegistering(true);

    try {
      if (!staffRegisterEmail.endsWith("@evnt5.com")) {
        setStaffFormErrorMessage(
          "User registration is not allowed here. Please use the user registration form"
        );
        return;
      }
      const user = await registerUser(
        staffRegisterEmail,
        staffRegisterPassword
      );
      console.log(user);
      await addStaffToFirestore({
        uid: user.uid,
        email: staffRegisterEmail,
      });
      navigate("/staff-dashboard");
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
      <h1> User Login/Register</h1>
      {loginLoadingMessage && (
        <p> Loading login/registration page, please wait...</p>
      )}
      {loginErrorMessage && <p>{loginErrorMessage}</p>}

      <form onSubmit={handleUserEmailLogin}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Please enter your email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Please enter your password"
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" disabled={loginLoadingMessage}>
          {registering ? "Logging in..." : "Login"}
        </button>
      </form>
      {registerLoadingMessage && <p>loading, please wait...</p>}
      {registerErrorMessage && <p>{registerErrorMessage}</p>}
      {userFormErrorMessage && <p>{userFormErrorMessage}</p>}
      <form onSubmit={handleUserRegister}>
        <label htmlFor="email-register">Email</label>
        <input
          type="email"
          id="user-email-register"
          placeholder="please enter email"
          value={userRegisterEmail}
          onChange={(e) => setUserRegisterEmail(e.target.value)}
          disabled={registering}
        />
        <label htmlFor="password-register"></label>
        <input
          type="password"
          id="user-password-register"
          placeholder="please enter password"
          value={userRegisterPassword}
          onChange={(e) => setUserRegisterPassword(e.target.value)}
          required
          minLength={6}
          disabled={registering}
        />
        <button type="submit" disabled={registerLoadingMessage || registering}>
          {registering ? "Registering..." : "Register"}
        </button>
      </form>
      <h1> Staff Login/Register</h1>
      {loginLoadingMessage && (
        <p> Loading login/registration page, please wait...</p>
      )}
      {loginErrorMessage && <p>{loginErrorMessage}</p>}

      <form onSubmit={handleStaffEmailLogin}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Please enter your email"
          value={staffEmail}
          onChange={(e) => setStaffEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Please enter your password"
          value={staffPassword}
          onChange={(e) => setStaffPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" disabled={loginLoadingMessage}>
          {registering ? "Logging in..." : "Login"}
        </button>
      </form>
      {registerLoadingMessage && <p>loading, please wait...</p>}
      {registerErrorMessage && <p>{registerErrorMessage}</p>}
      {staffFormErrorMessage && <p>{staffFormErrorMessage}</p>}
      <form onSubmit={handleStaffRegister}>
        <label htmlFor="email-register">Email</label>
        <input
          type="email"
          id="staff-mail-register"
          placeholder="please enter email"
          value={staffRegisterEmail}
          onChange={(e) => setStaffRegisterEmail(e.target.value)}
          disabled={registering}
        />
        <label htmlFor="password-register">Password</label>
        <input
          type="password"
          id="staff-password-register"
          placeholder="please enter password"
          value={staffRegisterPassword}
          onChange={(e) => setStaffRegisterPassword(e.target.value)}
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
