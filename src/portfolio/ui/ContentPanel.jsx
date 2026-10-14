import { useEffect, useRef } from 'react';
import { nameArt } from '../assets/name';
import Whoami from './sections/Whoami';
import Projects from './sections/Projects';
import Pictures from './sections/Pictures';
import Hobbies from './sections/Hobbies';
import Contact from './sections/Contact';

const commands = { whoami: 'whoami', projects: 'ls projects/', pictures: 'ls pictures/', hobbies: 'ls hobbies/', contact: 'write contact' };

export default function ContentPanel({ member, services, albumId }) {
  const bufferRef = useRef(null);
  useEffect(() => { bufferRef.current.scrollTop = 0; }, [member.section, albumId]);
  const section = member.section;
  return <section className="readme" aria-label="Simon Chen portfolio files">
    <div className="buffer-head"><span>~/{section}{albumId ? `/${albumId}` : ''}</span></div>
    <h1 className="owner-name"><span className="name-text">Simon Chen</span><span className="ascii-wordmark" aria-hidden="true">{nameArt}</span></h1>
    <div className="content-buffer" ref={bufferRef} tabIndex={0} role="region" aria-label={`${section} content`}>
      <p className="section-command"><b aria-hidden="true">└─$</b> {commands[section]}</p>
      {/* Mounted views retain file expansion and the contact draft. `hidden`
          removes inactive controls from both tab order and accessibility tree. */}
      <section hidden={section !== 'whoami'} aria-label="whoami"><Whoami /></section>
      <section hidden={section !== 'projects'} aria-label="Projects"><Projects resource={services.github} active={section === 'projects'} /></section>
      <section hidden={section !== 'pictures'} aria-label="Pictures"><Pictures resource={services.gallery} active={section === 'pictures'} albumId={albumId} /></section>
      <section hidden={section !== 'hobbies'} aria-label="Hobbies"><Hobbies resource={services.goodreads} active={section === 'hobbies'} /></section>
      <section hidden={section !== 'contact'} aria-label="Contact"><Contact sendMessage={services.sendMessage} /></section>
    </div>
  </section>;
}
