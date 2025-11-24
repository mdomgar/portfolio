import React from "react";
import { FaLinkedin, FaEnvelope, FaPaperPlane } from "react-icons/fa"; // Añadimos FaPaperPlane para el botón
import "./css/ContactMe.css"

const ContactMe = () => {
    return (
        <section id="contact" className="contact-section"> {/* Renombrar a contact-section para evitar conflicto */}
            <div className="contact-container">
                
                <h2 className="contact-title">✉️ Contáctame</h2>

                <div className="contact-card">
                    <p className="contact-intro-text">
                        ¿Tienes un proyecto en mente, una oportunidad de colaboración o simplemente quieres saludar? ¡Estaré encantado de escucharte! Mi bandeja de entrada siempre está abierta.
                    </p>

                    <a
                        href="mailto:miguelangelespeluy@gmail.com"
                        className="email-cta-button"
                    >
                        <FaPaperPlane className="button-icon" />
                        Enviar Correo Ahora
                    </a>

                    <div className="social-links-group">
                        <p className="social-text">O encuéntrame en mis redes:</p>
                        
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
                </div>

            </div>
        </section>
    );
}

export default ContactMe;