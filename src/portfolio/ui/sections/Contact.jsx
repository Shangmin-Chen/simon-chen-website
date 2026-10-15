import { useEffect, useRef, useState } from 'react';
import { useContact } from '../../application/useContact';
import CardDeck from '../CardDeck';
import InspectPanel from '../InspectPanel';
import LetterComposer from './LetterComposer';

const letterId = 'letter-to-simon';

function letterMeta(status, hasDraft) {
  if (status === 'sending') return 'Sending';
  if (status === 'sent') return 'Sent';
  if (status === 'error') return 'Draft retained · send failed';
  if (status === 'invalid') return 'Draft in progress · check fields';
  return hasDraft ? 'Draft in progress' : 'Ready to write';
}

export default function Contact({ sendMessage, active, motion, sceneKey, onReturnToCharacters }) {
  const form = useContact(sendMessage);
  const [inspectionScene, setInspectionScene] = useState('');
  const inspecting = active && inspectionScene === sceneKey;
  const deckRef = useRef(null);
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const focusFrame = useRef(0);
  const returnFrame = useRef(0);

  const item = {
    id: letterId,
    title: 'Letter to Simon',
    description: 'Write a note, share a project, or say hello.',
    meta: letterMeta(form.status, Object.values(form.draft).some(Boolean)),
    sigil: 'letter',
  };

  useEffect(() => () => {
    cancelAnimationFrame(focusFrame.current);
    cancelAnimationFrame(returnFrame.current);
  }, []);

  useEffect(() => {
    if (form.status !== 'invalid') return;
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [form.fields, form.status]);

  useEffect(() => {
    if (!inspecting || !active) return undefined;
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(focusFrame.current);
  }, [active, inspecting]);

  const closeLetter = () => {
    setInspectionScene('');
    const origin = document.activeElement;
    cancelAnimationFrame(returnFrame.current);
    returnFrame.current = requestAnimationFrame(() => {
      if (document.activeElement === origin || document.activeElement === document.body) deckRef.current?.focusSelected();
    });
  };

  const handleKeyDown = event => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing || event.keyCode === 229
      || event.altKey || event.ctrlKey || event.metaKey) return;
    if (inspecting) {
      event.preventDefault();
      closeLetter();
    }
  };

  return <div className="contact-workspace" onKeyDown={handleKeyDown}>
    <div className="contact-workspace__index" inert={inspecting} aria-hidden={inspecting}>
      <p className="contact-workspace__prompt">Select the letter to start a conversation.</p>
      {active && <CardDeck
        ref={deckRef}
        items={[item]}
        selectedId={letterId}
        onReturnToCharacters={onReturnToCharacters}
        onSelect={() => {}}
        onActivate={() => setInspectionScene(sceneKey)}
        label="Comms"
        renderVisual={() => <pre className="contact-letter-sigil" aria-hidden="true">{' +---------+\n | \\       / |\n |  \\     /  |\n |   \\___/   |\n |           |\n +-----------+'}</pre>}
        motion={motion && active && !inspecting}
      />}
    </div>
    <InspectPanel
      open={inspecting && active}
      title="Letter to Simon"
      breadcrumb="comms / outgoing letter"
      onClose={closeLetter}
      position={1}
      total={1}
      headingRef={headingRef}
      bodyRef={null}
      navigationLabel="Letter"
      motion={motion && active && inspecting}
      revealKey={letterId}
    >
      <LetterComposer form={form} formRef={formRef} />
    </InspectPanel>
  </div>;
}
