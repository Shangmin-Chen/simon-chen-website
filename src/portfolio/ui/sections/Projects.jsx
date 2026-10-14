import { useState } from 'react';
import { projects } from '../../../data/projects';
import { githubData } from '../../../data/githubData';
import { useResource } from '../../application/useResource';
import { contributionWindow } from '../../domain/contributions';
import File from '../File';
import ResourceState from '../ResourceState';

function GithubActivity({ resource, active }) {
  const [open, setOpen] = useState(false);
  const result = useResource(resource, active && open);
  const window = contributionWindow(result.data?.contributions ?? [], new Date());
  return <File name="github-activity.log" onOpen={setOpen}>
    <ResourceState resource={result} loadingText="Connecting to GitHub…">
      <pre className="ascii-activity" role="img" aria-label={`GitHub activity: ${window.total} contributions from ${window.start} to ${window.end}`}>
        {Array.from({ length: 7 }, (_, weekday) => <span key={weekday}>{window.weeks.map((week, column) => {
          const day = week[weekday];
          return <span key={column} title={day ? `${day.date}: ${day.count} contributions` : 'Future day'} className={`activity-level-${day?.level ?? 0}`}>{day ? '.:oO@'[day.level] : ' '}{' '}</span>;
        })}{'\n'}</span>)}
      </pre>
      <p className="terminal-note">{window.total.toLocaleString()} contributions / {window.start} — {window.end}<br />Live GitHub feed · 1h cache</p>
      <details className="daily-log"><summary>daily log</summary><ul>{window.weeks.flat().filter(Boolean).map(day => <li key={day.date}>{day.date} / {day.count} contributions</li>)}</ul></details>
      <a className="inline-link" href={githubData.url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
    </ResourceState>
  </File>;
}

export default function Projects({ resource, active }) {
  return <>
    <h2 className="section-heading">projects/</h2>
    {projects.map(project => <File key={project.title} name={`${project.title.toLowerCase().replace(/'/g, '').replaceAll(' ', '-')}.md`}>
      <h3>{project.title}</h3><p className="terminal-note">{project.meta.year} / {project.meta.role} / {project.meta.status}</p><p>{project.description}</p><p className="terminal-note">{project.tags.join(' / ')}</p>
      {project.demo && <a className="inline-link" href={project.demo} target="_blank" rel="noopener noreferrer">open project ↗</a>}
      {project.github && <a className="inline-link" href={project.github} target="_blank" rel="noopener noreferrer">source ↗</a>}
    </File>)}
    <GithubActivity resource={resource} active={active} />
  </>;
}
