import React from "react";
import "./css/Skills.css";
import { FaReact, FaJava, FaPython } from "react-icons/fa";
import { SiSpringboot, SiJavascript, SiMongodb, SiDocker } from "react-icons/si";

const Skills = ({skillsData}) => {
  return (
    <div className="skills-container">
      <section className="skills-section">
        <h3 className="skills-title">Herramientas de mi día a día</h3>
        <div className="skills-container">
          {skillsData.map((category, index) => (
            <div key={index} className="skills-card">
              <h4 className="skills-category">{category.category}</h4>
              <div className="skills-list">
                {category.skills.map((skill, i) => (
                  <div key={i} className="skill-item">
                    <span className="skill-icon">{skill.icon}</span>
                    <span className="skill-name">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Skills;