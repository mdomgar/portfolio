import React from "react";
import "./css/AboutMe.css";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import Skills from "./Skills";

const AboutMe = ({ info, skillsData }) => {
  return (
    <>
    <section id="about-me" className="about-container">
      <div className="about-left">
        <img
          src="/foto-perfil.JPG"
          alt="Miguel Ángel"
          className="about-photo"
        />
        
        <div className="about-icons">
        <a
          href="https://www.linkedin.com/in/miguel-%C3%A1ngel-dom%C3%ADnguez-garc%C3%ADa-4a0a03265/"
          target="_blank"
          rel="noopener noreferrer"
          className="linkedin-link"
        >
          <FaLinkedin className="linkedin-icon" />
        </a>

         <a
            href="mailto:miguelangelespeluy@gmail.com"
            className="mail-link"
          >
            <FaEnvelope className="mail-icon" />
          </a>
        </div>
      </div>

      <div className="about-text">
        <h3>¡Soy Miguel Ángel!</h3>
        <p>{info}</p>
      </div>
    </section>
    
      <Skills skillsData={skillsData}/>
    </>
  );
};

export default AboutMe;