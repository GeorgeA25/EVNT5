import React from "react";

const Footer = () => {
  const handleScrollToTopOfPage = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer>
      <button onClick={handleScrollToTopOfPage} className="footer-button">
        Back to Top
      </button>
    </footer>
  );
};

export default Footer;
