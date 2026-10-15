import { experiences } from '../../data/experiences.js';
import { githubData } from '../../data/githubData.js';
import { projects } from '../../data/projects.js';

const experienceId = experience => `experience:${experience.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const projectId = (project, index) => `project:${index}`;

export function filesFor(section) {
  if (section === 'whoami') return [
    ...experiences.map(experience => ({
      id: experienceId(experience),
      label: `${experience.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.log`,
      title: experience.company,
      description: experience.title,
      meta: [experience.location, experience.period],
      logo: experience.logo,
    })),
    { id: 'github-activity', label: 'github-activity.log', title: 'GitHub activity', description: 'Contribution activity', meta: 'Live feed', logo: githubData.logo },
  ];
  if (section === 'projects') return projects.map((project, index) => ({
    id: projectId(project, index),
    kind: 'dossier',
    label: `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`,
    title: project.title,
    purpose: project.summary,
    detail: project.cardDetail,
    tags: project.tags,
    meta: [project.meta.year, project.meta.role, project.meta.status],
  }));
  if (section === 'hobbies') return [
    { id: 'reading', label: 'reading/', title: 'Reading', description: 'Currently reading', meta: 'Live Goodreads shelf' },
    { id: 'chess', label: 'chess/', title: 'Chess', description: 'A board, a clock, and one more game.' },
    { id: 'gaming', label: 'gaming/', title: 'Gaming', description: 'Cyberpunk and Edgerunners. Side quests after the side projects.' },
    { id: 'running', label: 'running/', title: 'Running', description: 'Away from the keyboard. Out for a run.' },
  ];
  return [];
}

export function sequenceFor(section) {
  return filesFor(section).map(({ id, label, title }) => ({ id, label, title }));
}

export function adjacentFileId(files, currentId, direction) {
  if (!Array.isArray(files) || !files.length || ![-1, 1].includes(direction)) return currentId;
  const index = files.findIndex(file => file.id === currentId);
  if (index < 0) return files[0].id;
  return files[Math.max(0, Math.min(files.length - 1, index + direction))].id;
}

export { experienceId, projectId };
