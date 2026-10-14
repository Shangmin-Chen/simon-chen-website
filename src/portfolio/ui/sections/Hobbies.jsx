import { useState } from 'react';
import { goodreadsData } from '../../../data/goodreadsData';
import { useResource } from '../../application/useResource';
import File from '../File';
import ResourceState from '../ResourceState';

function Reading({ resource, active }) {
  const [open, setOpen] = useState(false);
  const result = useResource(resource, active && open);
  const books = result.data?.books ?? [];
  return <File name="reading/" onOpen={setOpen}>
    <p>Currently reading</p>
    <ResourceState resource={result} loadingText="Connecting to Goodreads…">
      {books.length ? books.map(book => <a className="book-link" key={book.id || book.link} href={book.link} target="_blank" rel="noopener noreferrer">{book.title} ↗<small>{book.author}</small></a>) : <p className="terminal-note">{goodreadsData.messages.empty}</p>}
      <p className="terminal-note">Live Goodreads shelf · 1h cache</p>
    </ResourceState>
    <a className="inline-link" href={goodreadsData.url} target="_blank" rel="noopener noreferrer">Goodreads ↗</a>
  </File>;
}

export default function Hobbies({ resource, active }) {
  return <>
    <h2 className="section-heading">hobbies/</h2>
    <Reading resource={resource} active={active} />
    <File name="chess/"><p>A board, a clock, and one more game.</p></File>
    <File name="gaming/"><p>Cyberpunk and Edgerunners. Side quests after the side projects.</p></File>
    <File name="running/"><p>Away from the keyboard. Out for a run.</p></File>
  </>;
}
