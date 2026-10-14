import { experiences } from '../../../data/experiences';
import File from '../File';
import GithubActivity from '../GithubActivity';
import { experienceId } from '../../domain/reader';

export default function Whoami({ resource, active, fileId }) {
  const experience = experiences.find(item => experienceId(item) === fileId);
  if (fileId === 'about') return <File name="about.md">
    <p>I build software and chase side quests.</p>
    <p className="terminal-note">NYC / SF · Boston University</p>
  </File>;
  if (experience) return <File name={`${experience.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.log`}>
    <article className="experience-entry">
      <h3>{experience.title}</h3>
      <p className="terminal-note">{experience.company} / {experience.location}<br />{experience.period}</p>
      <p>{experience.description}</p>
      {experience.technologies?.length > 0 && <p className="terminal-note">{experience.technologies.join(' / ')}</p>}
    </article>
  </File>;
  if (fileId === 'github-activity') return <GithubActivity resource={resource} active={active} />;
  return null;
}
