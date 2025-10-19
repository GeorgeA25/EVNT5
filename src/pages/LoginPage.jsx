import LoginForm from "../components/LoginForm.jsx";
import "../css/LoginPage.css";

const LoginPage = () => {
  return (
    <>
      <h1 className="platform-message">Welcome to EVNT5 platform</h1>
      <section>
        <LoginForm />
      </section>
    </>
  );
};

export default LoginPage;
