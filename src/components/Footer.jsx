import { useState, useEffect } from "react";

const Footer = () => {
  const [showButton, setShowButton] = useState(false);
  const handleScrollToTopOfPage = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    useEffect(() => {
      const handleScroll = () => {
        setShowButton(window.scrollY > 200);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
  };

  return (
    <footer>
      {showButton && (
        <button onClick={handleScrollToTopOfPage} className="footer-button">
          Back to Top
        </button>
      )}
    </footer>
  );
};

export default Footer;
