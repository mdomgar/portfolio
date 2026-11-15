import { FaCss3Alt, FaHtml5, FaJava, FaNodeJs, FaPython, FaReact } from 'react-icons/fa'
import {
  SiChartdotjs,
  SiDart,
  SiDocker,
  SiFlutter,
  SiGithub,
  SiInfluxdb,
  SiIntellijidea,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiPostman,
  SiSpringboot,
  SiSupabase,
  SiVirtualbox,
} from 'react-icons/si'
import { BiLogoVisualStudio } from 'react-icons/bi'

export const TECH = {
  javascript: { name: 'JavaScript', Icon: SiJavascript, color: '#f7df1e' },
  java: { name: 'Java', Icon: FaJava, color: '#ea2d2e' },
  python: { name: 'Python', Icon: FaPython, color: '#3776ab' },
  react: { name: 'React', Icon: FaReact, color: '#61dafb' },
  html: { name: 'HTML', Icon: FaHtml5, color: '#e34f26' },
  css: { name: 'CSS', Icon: FaCss3Alt, color: '#2965f1' },
  node: { name: 'Node.js', Icon: FaNodeJs, color: '#5fa04e' },
  springboot: { name: 'Spring Boot', Icon: SiSpringboot, color: '#6db33f' },
  mysql: { name: 'MySQL', Icon: SiMysql, color: '#4479a1' },
  mongodb: { name: 'MongoDB', Icon: SiMongodb, color: '#47a248' },
  influxdb: { name: 'InfluxDB', Icon: SiInfluxdb, color: '#22adf4' },
  docker: { name: 'Docker', Icon: SiDocker, color: '#2496ed' },
  github: { name: 'GitHub', Icon: SiGithub, color: '#e8ecf4' },
  vscode: { name: 'VS Code', Icon: BiLogoVisualStudio, color: '#007acc' },
  intellij: { name: 'IntelliJ IDEA', Icon: SiIntellijidea, color: '#fe315d' },
  postman: { name: 'Postman', Icon: SiPostman, color: '#ff6c37' },
  virtualbox: { name: 'VirtualBox', Icon: SiVirtualbox, color: '#00ccc2' },
  chartjs: { name: 'Chart.js', Icon: SiChartdotjs, color: '#ff6384' },
  flutter: { name: 'Flutter', Icon: SiFlutter, color: '#47c5fb' },
  dart: { name: 'Dart', Icon: SiDart, color: '#2cb7f6' },
  supabase: { name: 'Supabase', Icon: SiSupabase, color: '#3ecf8e' },
  postgresql: { name: 'PostgreSQL', Icon: SiPostgresql, color: '#6b8cff' },
}

// The stack grouped for the background section. Only ids from TECH.
export const TECH_GROUPS = [
  { id: 'frontend', title: { es: 'Frontend', en: 'Frontend' }, ids: ['react', 'javascript', 'html', 'css', 'chartjs'] },
  { id: 'backend', title: { es: 'Backend', en: 'Backend' }, ids: ['node', 'java', 'springboot', 'python'] },
  {
    id: 'datos',
    title: { es: 'Datos', en: 'Data' },
    ids: ['mysql', 'postgresql', 'mongodb', 'influxdb', 'supabase'],
  },
  {
    id: 'herramientas',
    title: { es: 'Herramientas', en: 'Tools' },
    ids: ['docker', 'github', 'vscode', 'intellij', 'postman', 'virtualbox'],
  },
  { id: 'movil', title: { es: 'Móvil', en: 'Mobile' }, ids: ['flutter', 'dart'] },
]
