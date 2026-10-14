import { experiences } from '../../data/experiences.js';
import { projects } from '../../data/projects.js';

const experienceId = experience => `experience:${experience.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const projectId = (project, index) => `project:${index}`;

export function filesFor(section) {
  if (section === 'whoami') return [
    { id: 'experience.log', label: 'experience.log', description: `${experiences.length} roles` },
    { id: 'github-activity', label: 'github-activity.log', description: 'Live contribution activity' },
  ];
  if (section === 'projects') return projects.map((project, index) => ({
    id: projectId(project, index),
    label: `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`,
    description: project.title,
  }));
  if (section === 'hobbies') return [
    { id: 'reading', label: 'reading/', description: 'Currently reading' },
    { id: 'chess', label: 'chess/', description: 'One more game' },
    { id: 'gaming', label: 'gaming/', description: 'Side quests after side projects' },
    { id: 'running', label: 'running/', description: 'Away from the keyboard' },
  ];
  return [];
}

export function sequenceFor(section) {
  if (section === 'whoami') return [
    { id: 'about', label: 'about.md' },
    ...experiences.map(experience => ({ id: experienceId(experience), label: `${experience.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.log` })),
    { id: 'github-activity', label: 'github-activity.log' },
  ];
  return filesFor(section).map(({ id, label }) => ({ id, label }));
}

export function selectionFor(section, id) {
  if (section === 'whoami' && id === 'experience.log') return experienceId(experiences[0]);
  return id;
}

export function adjacentFileId(files, currentId, direction) {
  if (!Array.isArray(files) || !files.length || ![-1, 1].includes(direction)) return currentId;
  const index = files.findIndex(file => file.id === currentId);
  if (index < 0) return files[0].id;
  return files[Math.max(0, Math.min(files.length - 1, index + direction))].id;
}

export function isReaderOpen(section, fileId, albumId) {
  return section === 'contact' || Boolean(albumId) || Boolean(fileId);
}

export { experienceId, projectId };
