import React from "react";
import "./css/Header.css";

const Header = () => {
    return (
        <header className="header">
            <h4 className="header-tittle">Miguel Ángel Domínguez García</h4>

            <nav className="nav">
                <ul className="nav-list">
                    <li><a href="#about-me">Sobre mi</a></li>
                    <li><a href="#experience">Experiencia</a></li>
                    <li><a href="#education">Educación</a></li>
                    <li><a href="#projects">Proyectos</a></li>
                    <li><a href="#contact">Contactame</a></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header;