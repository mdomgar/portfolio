import React from "react";
import "./css/Education.css";

const Education = ({educationData}) => {

  return (
    <section id="education" className="education-section">
      <h2 className="education-title">Educación</h2>
      <div className="education-container">
        {educationData.map((edu, index) => (
          <div key={index} className="education-card">
            <div className="education-header">
              <h3 className="education-degree">{edu.degree}</h3>
              <span className="education-date">{edu.date}</span>
            </div>
            <p className="education-place">{edu.place}</p>
            <p className="education-grade">{edu.grade}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Education;
