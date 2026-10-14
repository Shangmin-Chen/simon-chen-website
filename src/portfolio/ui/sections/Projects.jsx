import { projects } from '../../../data/projects';
import File from '../File';

export default function Projects() {
  return <>
    <h2 className="section-heading">projects/</h2>
    {projects.map(project => <File key={project.title} name={`${project.title.toLowerCase().replace(/'/g, '').replaceAll(' ', '-')}.md`}>
      <h3>{project.title}</h3><p className="terminal-note">{project.meta.year} / {project.meta.role} / {project.meta.status}</p><p>{project.description}</p><p className="terminal-note">{project.tags.join(' / ')}</p>
      {project.demo && <a className="inline-link" href={project.demo} target="_blank" rel="noopener noreferrer">open project ↗</a>}
      {project.github && <a className="inline-link" href={project.github} target="_blank" rel="noopener noreferrer">source ↗</a>}
    </File>)}
  </>;
}
