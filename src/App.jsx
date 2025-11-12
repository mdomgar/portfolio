import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { FaHtml5, FaCss3, FaCss3Alt, FaPython, FaReact, FaGithub, FaExternalLinkAlt, FaJava } from "react-icons/fa";
import { SiIntellijidea, SiDocker, SiMongodb, SiJavascript, SiPython, SiSpringboot, SiMysql, SiInfluxdb, SiGithub, SiVirtualbox, SiPostman } from "react-icons/si";
import { BiLogoVisualStudio } from "react-icons/bi";
import './App.css'
import Header from './components/Header'
import AboutMe from './components/AboutMe'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Education from './components/Education';
import ContactMe from './components/ContactMe';


function App() {
  const info = "Un joven de Jaén apasionado por la informática y el desarrollo de software. Cuento con doble titulación en Administración de Sistemas Informáticos en Red y Desarrollo de Aplicaciones Multiplataforma. Me considero una persona tranquila, ordenada y comprometida, con una fuerte vocación por la tecnología y el aprendizaje continuo. Mi objetivo es seguir creciendo como desarrollador backend o full stack, aportando soluciones eficientes y de calidad."
  const experiences = [
    {
      title: "Técnico Auxiliar IT",
      company: "Grupo Avanza, Jaén",
      date: "Marzo – Junio 2023 / Marzo – Agosto 2024",
      tasks: [
        "Soporte técnico de hardware y software.",
        "Gestión de servidores Windows Server y Hetzner.",
        "Administración de redes y DNS.",
        "Gestión de servicio de Ticketing, Suite de Google y Microsoft."
      ],
    },
    {
      title: "Técnico Informático",
      company: "Mecaofi Jaén 1992, Jaén ",
      date: "Noviembre 2023 – Febrero 2024",
      tasks: [
        "Mantenimiento de infraestructura informática en centros educativos.",
        "Reparación de equipos y resolución de incidencias."
      ],
    },
    {
      title: "Desarrollador Full Stack y Odoo",
      company: "Intelec, Jaén",
      date: "Marzo – Junio 2024",
      tasks: [
        "Desarrollo con Java, SpringBoot, React y consumo de APIs creadas por mi mismo.",
        "Creación de módulos personalizados en Python (Odoo) y testeado en un entorno Docker.",
        "Gestión de modelos, vistas, lógica de negocio y creación de portales para cliente/trabajdor."
      ],
    },
  ];

  const projects = [
  {
    title: "SolarMetrics",
    desc: "El proyecto consiste en un portal web para visualizar datos de medición fotovoltaica. Incluye un sistema de login y gestión de usuarios. El backend genera datos ficticios y los almacena en InfluxDB, mientras que el frontend, desarrollado en React, consume la API para mostrar la información de forma dinámica.",
    tech: [
            { icon: <FaReact />, color: "#61DBFB" },       
            { icon: <SiJavascript />, color: "#F7DF1E" },  
            { icon: <SiSpringboot />, color: "#6DB33F" },  
            { icon: <SiPython />, color: "#3776AB" },      
            { icon: <FaJava />, color: "#E76F00" },   
            { icon: <SiInfluxdb />, color: "#22ADF4" },      

          ],
    live: "https://tutienda-demo.com",
    github: "https://github.com/mdomgar/SolarMetrics",
    img: "/SolarMetrics.png",
  },
];

const educationData = [
    {
      degree: "Técnico Superior en Desarrollo de Aplicaciones Multiplataforma",
      place: "IES Virgen del Carmen, Jaén",
      date: "Septiembre 2022 - Junio 2024",
      grade: "Nota media: 9.7 / 9 (Proyecto final de curso 'SolarMetrics')",
    },
    {
      degree: "Técnico en Admninistrador de Sistemas informáticos en Red",
      place: "IES Virgen del Carmen, Jaén",
      date: "Septiembre 2020 - Junio 2022",
      grade: "Nota media: 9.4 / 9 (Proyecto final de curso)",
    },
  ];

  const skillsData = [
  {
    category: "Herramientas",
    skills: [
      { name: "IntelliJ IDEA", icon: <SiIntellijidea color="#000000" /> },
      { name: "VS Code", icon: <BiLogoVisualStudio  color="#007ACC" /> },
      { name: "Github", icon: <SiGithub color="#ffffff" /> },
      { name: "Virtual Box", icon: <SiVirtualbox  color="#00ccc2ff" /> },
      { name: "Postman", icon: <SiPostman  color="#cc8800ff" /> },
    ],
  },
  {
    category: "Lenguajes de Programación",
    skills: [
      { name: "JavaScript", icon: <SiJavascript color="#f7df1e" /> },
      { name: "Java", icon: <FaJava color="#ea2d2e" /> },
      { name: "Python", icon: <FaPython color="#3776AB" /> },
    ],
  },
  {
    category: "Tecnologías Backend",
    skills: [
      { name: "Spring Boot", icon: <SiSpringboot color="#6DB33F" /> },
      { name: "MongoDB", icon: <SiMongodb color="#4DB33D" /> },
      { name: "Docker", icon: <SiDocker color="#0db7ed" /> },
      { name: "MySQL", icon: <SiMysql color="#4479A1" /> },
      { name: "InfluxDB", icon: <SiInfluxdb color="#22ADF4" /> },


    ],
  },
  {
    category: "Frontend y Librerías",
    skills: [
      { name: "HTML", icon: <FaHtml5 color="#E34F26" /> },
      { name: "CSS", icon: <FaCss3 color="#1572B6" /> },
      { name: "React", icon: <FaReact color="#61DBFB" /> },
    ],
  },
];

  return (
    <>
      <Header/>
      <AboutMe info={info} skillsData={skillsData}/>
      <Experience experiences={experiences}/>
      <Education educationData={educationData}/>
      <Projects projects={projects}/>
      <ContactMe/>
    </>
  )
}

export default App