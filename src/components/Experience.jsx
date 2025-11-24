import React from "react";
import "./css/Experience.css";

const Experience = ({ experiences }) => {
  return (
    <section id="experience" className="timeline">
      <h2 className="timeline-title">🖥️ Experiencia</h2>
      <div className="timeline-line"></div>

      <div className="timeline-items">
        {experiences.map((exp, index) => (
          <div className="timeline-item" key={index}>
            <div className="timeline-short-line"></div>
            <div className="timeline-content">
              
              <div className="timeline-header-group">
                <div className="timeline-titles">
                    <h3>{exp.title}</h3>
                    <h4>{exp.company}</h4>
                </div>
                <span className="timeline-date">{exp.date}</span>
              </div>

              <ul>
                {exp.tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;