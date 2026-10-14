import { experiences } from '../../../data/experiences';
import File from '../File';

export default function Whoami() {
  return <>
    <div className="about-copy"><p>I build software and chase side quests.</p><p className="terminal-note">NYC / SF · Boston University</p></div>
    <File name="experience.log">
      {experiences.map(experience => <article key={experience.company} className="experience-entry">
        <h3>{experience.title}</h3><p className="terminal-note">{experience.company} / {experience.location}<br />{experience.period}</p><p>{experience.description}</p>
      </article>)}
    </File>
  </>;
}
