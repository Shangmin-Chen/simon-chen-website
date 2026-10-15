import test from 'node:test';
import assert from 'node:assert/strict';
import { experiences } from '../src/data/experiences.js';
import { projects } from '../src/data/projects.js';
import { adjacentFileId, experienceId, filesFor, projectId, sequenceFor } from '../src/portfolio/domain/reader.js';

test('home indexes compactly describe real content and map to reader entries', () => {
  assert.deepEqual(filesFor('whoami').map(file => file.id), [...experiences.map(experienceId), 'github-activity']);
  assert.equal(sequenceFor('whoami')[0].id, experienceId(experiences[0]));
  assert.equal(sequenceFor('whoami').length, experiences.length + 1);
  assert.deepEqual(filesFor('whoami').slice(0, experiences.length).map(file => file.accessibleLabel), experiences.map(experience => `${experience.title} at ${experience.company}`));
  assert.deepEqual(sequenceFor('whoami').slice(0, experiences.length).map(entry => entry.navigationLabel), experiences.map(experience => `${experience.title} at ${experience.company}`));
  assert.equal(filesFor('projects').length, projects.length);
  assert.deepEqual(filesFor('hobbies').map(file => file.id), ['reading', 'chess', 'gaming', 'running']);
  assert.equal(filesFor('projects')[0].title, projects[0].title);
  assert.deepEqual(filesFor('projects').map(file => file.kind), ['dossier', 'dossier']);
  assert.equal(filesFor('projects')[0].purpose, projects[0].summary);
  assert.equal(filesFor('projects')[0].detail, projects[0].cardDetail);
  assert.deepEqual(filesFor('projects')[0].tags, projects[0].tags);
  assert.equal(filesFor('hobbies')[0].title, 'Reading');
});

test('prev and next traverse actual files and entries without wrapping', () => {
  const sequence = sequenceFor('whoami');
  assert.equal(adjacentFileId(sequence, sequence[0].id, 1), sequence[1].id);
  assert.equal(adjacentFileId(sequence, sequence[1].id, -1), sequence[0].id);
  assert.equal(adjacentFileId(sequence, sequence.at(-1).id, 1), sequence.at(-1).id);
  assert.equal(adjacentFileId([], 'about', 1), 'about');
});

test('project IDs match the data-backed project inventory', () => {
  assert.deepEqual(filesFor('projects').map(file => file.id), projects.map(projectId));
});
