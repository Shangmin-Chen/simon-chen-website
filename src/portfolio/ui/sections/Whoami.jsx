import { experiences } from '../../../data/experiences';
import File from '../File';
import GithubActivity from '../GithubActivity';
import { experienceId } from '../../domain/reader';
import CompanyMark from '../CompanyMark';

export default function Whoami({ resource, active, fileId }) {
  const experience = experiences.find(item => experienceId(item) === fileId);
  if (experience) return <File name={`${experience.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.log`}>
    <article className="experience-entry">
      <CompanyMark company={experience.company} src={experience.logo} className="company-mark--reader" />
      <h3>{experience.title}</h3>
      <p className="terminal-note">{experience.company} / {experience.location}<br />{experience.period}</p>
      <p>{experience.description}</p>
      {experience.technologies?.length > 0 && <p className="terminal-note">{experience.technologies.join(' / ')}</p>}
    </article>
  </File>;
  if (fileId === 'github-activity') return <GithubActivity resource={resource} active={active} />;
  return null;
}
