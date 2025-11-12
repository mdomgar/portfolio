import { FaReact, FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { SiJavascript, SiSpringboot } from "react-icons/si";
import "./css/Projects.css";

const Projects = ({ projects }) => {
  return (
    <div className="projects-container">
      <section id="projects" className="projects-section">
        <div className="projects">
          <h2 className="projects-title">Proyectos</h2>
          <div className="projects-grid">
            {projects.map((proj, index) => (
              <div className="project-card" key={index}>
                <div className="project-header">
                  <div className="project-title">
                    <img src={proj.img} alt={proj.title} className="project-img" />
                    <h3>{proj.title}</h3>
                  </div>
                  <div className="project-tech">
                    {proj.tech.map((icon, i) => (
                      <span key={i} style={{ color: icon.color }}>
                        {icon.icon}
                      </span>
                    ))}
                  </div>
                </div>

                <p>{proj.desc}</p>

                <div className="project-links">
                  <a
                    href={proj.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="live-btn"
                  >
                    <FaExternalLinkAlt /> Live Demo
                  </a>

                  <a
                    href={proj.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="git-btn"
                  >
                    <FaGithub /> GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;