import { projects } from '../../../data/projects';
import File from '../File';
import { projectId } from '../../domain/reader';

export default function Projects({ fileId }) {
  const index = projects.findIndex((project, itemIndex) => projectId(project, itemIndex) === fileId);
  const project = projects[index];
  if (!project) return null;
  return <File name={`${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`}>
    <h3>{project.title}</h3>
    <p className="terminal-note">{project.meta.year} / {project.meta.role} / {project.meta.status}</p>
    <p>{project.description}</p>
    <p className="terminal-note">{project.tags.join(' / ')}</p>
    {project.demo && <a className="inline-link" href={project.demo} target="_blank" rel="noopener noreferrer">open project ↗</a>}
    {project.github && <a className="inline-link" href={project.github} target="_blank" rel="noopener noreferrer">source ↗</a>}
  </File>;
}
