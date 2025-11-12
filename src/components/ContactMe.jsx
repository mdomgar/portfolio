import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./css/ContactMe.css"

const ContactMe = () => {
    return (
        <section id="contact" className="contact">
            <h2 className="contact-title">Contactame</h2>
            <p>¿Te gustaría que trabajáramos juntos en un proyecto? Puedes escribirme por LinkedIn o enviarme un correo, estaré encantado de hablar contigo.</p>
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
        </section>
    );
}

export default ContactMe;