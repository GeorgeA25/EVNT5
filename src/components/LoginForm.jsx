import { useState, useEffect } from "react";
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
  addGoogleUsersToFirestore,
  getGoogleUsersFromFirestore,
} from "../firebase/firebaseStore";
import "../css/LoginPage.css";

const LoginForm = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRegisterEmail, setUserRegisterEmail] = useState("");
  const [userRegisterPassword, setUserRegisterPassword] = useState("");

  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRegisterEmail, setStaffRegisterEmail] = useState("");
  const [staffRegisterPassword, setStaffRegisterPassword] = useState("");

  const [userLoginLoadingMessage, setUserLoginLoadingMessage] = useState(false);
  const [staffLoginLoadingMessage, setStaffLoginLoadingMessage] =
    useState(false);
  const [userLoginErrorMessage, setUserLoginErrorMessage] = useState(null);
  const [staffLoginErrorMessage, setStaffLoginErrorMessage] = useState(null);
  const [loginErrorMessage, setLoginErrorMessage] = useState(null);

  const [registering, setRegistering] = useState(false);
  const [userRegisterLoadingMessage, setUserRegisterLoadingMessage] =
    useState(false);
  const [staffRegisterLoadingMessage, setStaffRegisterLoadingMessage] =
    useState(false);
  const [userRegisterErrorMessage, setUserRegisterErrorMessage] =
    useState(null);
  const [staffRegisterErrorMessage, setStaffRegisterErrorMessage] =
    useState(null);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);

  const [userFormErrorMessage, setUserFormErrorMessage] = useState("");
  const [staffFormErrorMessage, setStaffFormErrorMessage] = useState("");

  const [isUserLoggingIn, setIsUserLoggingIn] = useState(false);

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
    setUserLoginLoadingMessage(true);
    setUserLoginErrorMessage(null);
    setIsUserLoggingIn(true);

    try {
      if (staffEmail || staffPassword) {
        setUserFormErrorMessage(
          "Staff login/Registering is not allowed in these fields. Please use the staff login/registering"
        );
        setTimeout(() => {
          setUserFormErrorMessage(null);
        }, 4000);
        setUserLoginLoadingMessage(false);
        setIsUserLoggingIn(false);
        return;
      }
      const user = await emailLogin(userEmail, userPassword);
      console.log(user);
      await getUserFromFirestore(user.uid);
      setUserEmail("");
      setUserPassword("");
      navigate("/events");
    } catch (error) {
      const errorMessage = handleAuthentificationError(error.code);
      setUserLoginErrorMessage(errorMessage);
      setTimeout(() => {
        setUserLoginErrorMessage(null);
      }, 4000);
    } finally {
      setUserLoginLoadingMessage(false);
      setIsUserLoggingIn(false);
    }
  };

  const handleStaffEmailLogin = async (e) => {
    e.preventDefault();
    setStaffLoginLoadingMessage(true);
    setStaffLoginErrorMessage(null);
    setIsUserLoggingIn(true);

    try {
      if (userEmail || userPassword) {
        setStaffFormErrorMessage(
          "User login/Registering is not allowed in these fields. Please use the user login/registering"
        );
        setTimeout(() => {
          setStaffFormErrorMessage(null);
        }, 4000);
        setStaffLoginLoadingMessage(false);
        setIsUserLoggingIn(false);
        return;
      }
      const user = await emailLogin(staffEmail, staffPassword);
      console.log(user);
      await getStaffFromFirestore(user.uid);
      setStaffEmail("");
      setStaffPassword("");
      navigate("/staff-dashboard");
    } catch (error) {
      const errorMessage = handleAuthentificationError(error.code);
      setStaffLoginErrorMessage(errorMessage);
      setTimeout(() => {
        setStaffLoginErrorMessage(null);
      }, 4000);
    } finally {
      setStaffLoginLoadingMessage(false);
      setIsUserLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isUserLoggingIn) return;
    setGoogleLoginLoading(true);
    setLoginErrorMessage(null);
    setIsUserLoggingIn(true);

    try {
      const outcome = await googleLogin();
      const user = outcome.user;
      const existingUser = await getGoogleUsersFromFirestore(user.uid);

      if (!existingUser) {
        await addGoogleUsersToFirestore(
          user,
          outcome.__tokenResponse.idToken,
          outcome.__tokenResponse.accessToken
        );
      }
      navigate(
        user.email.includes("@evnt5.com") ? "/staff-dashboard" : "/events"
      );
    } catch (error) {
      setLoginErrorMessage(error.message || "error signing in via google");
    } finally {
      setGoogleLoginLoading(false);
      setIsUserLoggingIn(false);
    }
  };

  const handleUserRegister = async (e) => {
    e.preventDefault();
    setUserRegisterLoadingMessage(true);
    setUserRegisterErrorMessage(null);
    setRegistering(true);

    try {
      if (userRegisterEmail.endsWith("@evnt5.com")) {
        setUserFormErrorMessage(
          "Staff registration is not allowed here. Please use the staff registration form"
        );
        setTimeout(() => {
          setUserFormErrorMessage(null);
        }, 4000);
        setUserRegisterLoadingMessage(false);
        setRegistering(false);
        return;
      }
      const user = await registerUser(userRegisterEmail, userRegisterPassword);
      console.log(user);
      await addUserToFirestore({
        uid: user.uid,
        email: userRegisterEmail,
      });
      navigate("/events");
      setUserRegisterEmail("");
      setUserRegisterPassword("");
    } catch (error) {
      console.error(error);
      const errorMessage = handleAuthentificationError(error.code);
      setUserRegisterErrorMessage(errorMessage);
      setTimeout(() => {
        setUserRegisterErrorMessage(null);
      }, 4000);
    } finally {
      setUserRegisterLoadingMessage(false);
      setRegistering(false);
    }
  };

  const handleStaffRegister = async (e) => {
    e.preventDefault();
    setStaffRegisterLoadingMessage(true);
    setStaffRegisterErrorMessage(null);
    setRegistering(true);

    try {
      if (!staffRegisterEmail.endsWith("@evnt5.com")) {
        setStaffFormErrorMessage(
          "User registration is not allowed here. Please use the user registration form"
        );
        setTimeout(() => {
          setStaffFormErrorMessage(null);
        }, 4000);
        setStaffRegisterLoadingMessage(false);
        setRegistering(false);
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
      setStaffRegisterEmail("");
      setStaffRegisterPassword("");
    } catch (error) {
      console.error(error);
      const errorMessage = handleAuthentificationError(error.code);
      setStaffRegisterErrorMessage(errorMessage);
      setTimeout(() => {
        setStaffRegisterErrorMessage(null);
      }, 4000);
    } finally {
      setStaffRegisterLoadingMessage(false);
      setRegistering(false);
    }
  };

  return (
    <section className="login-section">
      <div className="login-box user">
        <div className="login-container">
          <h1 className="login-title"> User Login</h1>
          {loginLoadingMessage && (
            <p aria-live="polite" className="login-loading">
              {" "}
              Loading login/registration page, please wait...
            </p>
          )}
          {loginErrorMessage && (
            <p id="userLoginError" role="alert" className="login-error">
              {loginErrorMessage}
            </p>
          )}

          <form
            onSubmit={handleUserEmailLogin}
            aria-busy={loginLoadingMessage}
            className="login-form"
          >
            <label htmlFor="user-email" className="login-label">
              Email:
            </label>
            <input
              type="email"
              id="user-email"
              placeholder="Please enter your email"
              value={userEmail}
              className="login-input"
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            <label htmlFor="user-password" className="login-label">
              Password:
            </label>
            <input
              type="password"
              id="user-password"
              placeholder="Please enter your password"
              value={userPassword}
              className="login-input"
              onChange={(e) => setUserPassword(e.target.value)}
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={loginLoadingMessage}
              className="login-button"
            >
              {registering ? "Logging in..." : "Login"}
            </button>
          </form>
          <h1 className="login-title">User Registration</h1>
          {registerLoadingMessage && (
            <p aria-live="polite" className="login-loading">
              loading, please wait...
            </p>
          )}
          {registerErrorMessage && (
            <p
              id="userRegisterError"
              role="alert"
              aria-live="assertive"
              className="register-error"
            >
              {registerErrorMessage || ""}
            </p>
          )}
          {userFormErrorMessage && (
            <p
              id="userFormError"
              role="alert"
              aria-live="assertive"
              className="form-error"
            >
              {userFormErrorMessage || ""}
            </p>
          )}
          <form
            onSubmit={handleUserRegister}
            aria-describedby="userRegisterError userFormError"
            className="login-form"
          >
            <label htmlFor="user-email-register" className="login-label">
              Email:
            </label>
            <input
              type="email"
              id="user-email-register"
              placeholder="please enter email"
              value={userRegisterEmail}
              className="login-input"
              onChange={(e) => setUserRegisterEmail(e.target.value)}
              disabled={registering}
              required
            />
            <label htmlFor="user-password-register" className="login-label">
              Password:
            </label>
            <input
              type="password"
              id="user-password-register"
              placeholder="please enter password"
              value={userRegisterPassword}
              className="login-input"
              onChange={(e) => setUserRegisterPassword(e.target.value)}
              required
              minLength={6}
              disabled={registering}
            />
            <button
              type="submit"
              disabled={registerLoadingMessage || registering}
              className="login-button"
            >
              {registering ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
      <div className="login-box staff">
        <div className="login-container">
          <h1 className="login-title"> Staff Login</h1>
          {loginLoadingMessage && (
            <p aria-live="polite" className="login-loading">
              {" "}
              Loading login/registration page, please wait...
            </p>
          )}
          {loginErrorMessage && (
            <p
              id="staffLoginError"
              role="alert"
              aria-live="assertive"
              className="login-error"
            >
              {loginErrorMessage}
            </p>
          )}

          <form
            onSubmit={handleStaffEmailLogin}
            aria-describedby="staffLoginError"
            aria-busy={loginLoadingMessage}
            className="login-form"
          >
            <label htmlFor="staff-email" className="login-label">
              Email:
            </label>
            <input
              type="email"
              id="staff-email"
              placeholder="Please enter your email"
              value={staffEmail}
              className="login-input"
              onChange={(e) => setStaffEmail(e.target.value)}
              required
            />
            <label htmlFor="staff-password" className="login-label">
              Password:
            </label>
            <input
              type="password"
              id="staff-password"
              placeholder="Please enter your password"
              value={staffPassword}
              className="login-input"
              onChange={(e) => setStaffPassword(e.target.value)}
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={loginLoadingMessage}
              className="login-button"
            >
              {registering ? "Logging in..." : "Login"}
            </button>
          </form>
          <h1 className="login-title"> Staff Registartion</h1>
          {registerLoadingMessage && (
            <p aria-live="polite" className="login-loading">
              loading, please wait...
            </p>
          )}
          {registerErrorMessage && (
            <p
              id="staffRegisterError"
              role="alert"
              aria-live="assertive"
              className="login-error"
            >
              {registerErrorMessage || ""}
            </p>
          )}
          {staffFormErrorMessage && (
            <p
              id="staffFormError"
              role="alert"
              aria-live="assertive"
              className="form-error"
            >
              {staffFormErrorMessage || ""}
            </p>
          )}
          <form
            onSubmit={handleStaffRegister}
            aria-describedby="staffRegisterError staffFormError"
            className="login-form"
          >
            <label htmlFor="staff-email-register" className="login-label">
              Email:
            </label>
            <input
              type="email"
              id="staff-email-register"
              placeholder="please enter email"
              value={staffRegisterEmail}
              className="login-input"
              onChange={(e) => setStaffRegisterEmail(e.target.value)}
              disabled={registering}
              required
            />
            <label htmlFor="staff-password-register" className="login-label">
              Password:
            </label>
            <input
              type="password"
              id="staff-password-register"
              placeholder="please enter password"
              value={staffRegisterPassword}
              className="login-input"
              onChange={(e) => setStaffRegisterPassword(e.target.value)}
              required
              minLength={6}
              disabled={registering}
            />
            <button
              type="submit"
              disabled={registerLoadingMessage || registering}
              className="login-button"
            >
              {registering ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
      <button
        onClick={handleGoogleLogin}
        disabled={googleLoginLoading}
        aria-label="Login with Google"
        className="login-button google-login"
      >
        {" "}
        {googleLoginLoading ? "Logging in with Google..." : "Login with Google"}
      </button>
    </section>
  );
};

export default LoginForm;
