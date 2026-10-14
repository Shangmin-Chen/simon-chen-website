import test from 'node:test';
import assert from 'node:assert/strict';
import { experiences } from '../src/data/experiences.js';
import { projects } from '../src/data/projects.js';
import { adjacentFileId, filesFor, isReaderOpen, projectId, sequenceFor } from '../src/portfolio/domain/reader.js';

test('home indexes compactly describe real content and map to reader entries', () => {
  assert.deepEqual(filesFor('whoami').map(file => file.id), ['experience.log', 'github-activity']);
  assert.equal(sequenceFor('whoami')[0].id, 'about');
  assert.equal(sequenceFor('whoami').length, experiences.length + 2);
  assert.equal(filesFor('projects').length, projects.length);
  assert.deepEqual(filesFor('hobbies').map(file => file.id), ['reading', 'chess', 'gaming', 'running']);
});

test('prev and next traverse actual files and entries without wrapping', () => {
  const sequence = sequenceFor('whoami');
  assert.equal(adjacentFileId(sequence, 'about', 1), sequence[1].id);
  assert.equal(adjacentFileId(sequence, sequence[1].id, -1), 'about');
  assert.equal(adjacentFileId(sequence, sequence.at(-1).id, 1), sequence.at(-1).id);
  assert.equal(adjacentFileId([], 'about', 1), 'about');
});

test('project IDs match the data-backed project inventory', () => {
  assert.deepEqual(filesFor('projects').map(file => file.id), projects.map(projectId));
});

test('reader opens for selected files, contact, and routed albums only', () => {
  assert.equal(isReaderOpen('whoami', '', ''), false);
  assert.equal(isReaderOpen('projects', 'project:0', ''), true);
  assert.equal(isReaderOpen('contact', '', ''), true);
  assert.equal(isReaderOpen('pictures', '', 'summer'), true);
});
