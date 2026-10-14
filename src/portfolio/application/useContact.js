import { useRef, useState } from 'react';
import { validateContact } from '../domain/contact';

const emptyDraft = { name: '', email: '', subject: '', message: '' };

export function useContact(sendMessage) {
  const [draft, setDraft] = useState(emptyDraft);
  const [status, setStatus] = useState('idle');
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const pending = useRef(false);

  const change = (name, value) => {
    setDraft(previous => ({ ...previous, [name]: value }));
    setFields(previous => ({ ...previous, [name]: undefined }));
    setStatus('idle');
  };
  const submit = async () => {
    if (pending.current) return;
    const result = validateContact(draft);
    setFields(result.fields);
    setError('');
    if (!result.valid) { setStatus('invalid'); return; }
    pending.current = true;
    setStatus('sending');
    try {
      await sendMessage(result.values);
      setStatus('sent');
      setDraft(emptyDraft);
    } catch (failure) {
      setError(failure.message || 'Message could not be sent. Please try again.');
      setStatus('error');
    } finally { pending.current = false; }
  };
  return { draft, status, fields, error, change, submit };
}
