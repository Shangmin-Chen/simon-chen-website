import { useEffect, useRef } from 'react';
import { socialLinks } from '../../../data/socialLinks';
import { contactData } from '../../../data/contactData';
import { contactLimits } from '../../domain/contact';
import { useContact } from '../../application/useContact';

export default function Contact({ sendMessage }) {
  const form = useContact(sendMessage);
  const formRef = useRef(null);
  useEffect(() => {
    if (form.status === 'invalid') formRef.current.querySelector('[aria-invalid="true"]')?.focus();
  }, [form.status]);
  return <>
    <h2 className="section-heading">contact/</h2>
    <p>Have a project in mind, or just want to say hello?</p>
    <nav className="terminal-socials" aria-label="Social profiles">{socialLinks.map(link => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}</nav>
    <form ref={formRef} className="terminal-contact" noValidate onSubmit={event => { event.preventDefault(); void form.submit(); }}>
      {contactData.formFields.map(field => {
        const props = {
          id: `contact-${field.name}`, name: field.name, value: form.draft[field.name], required: true,
          maxLength: contactLimits[field.name], disabled: form.status === 'sending',
          'aria-invalid': Boolean(form.fields[field.name]),
          'aria-describedby': form.fields[field.name] ? `error-${field.name}` : undefined,
          onChange: event => form.change(field.name, event.target.value),
        };
        return <div key={field.name} className="contact-field">
          <label htmlFor={props.id}>{field.name}</label>
          {field.type === 'textarea' ? <textarea {...props} rows={3} /> : <input {...props} type={field.type} autoComplete={field.name === 'name' || field.name === 'email' ? field.name : undefined} />}
          {form.fields[field.name] && <p id={`error-${field.name}`} className="terminal-error">{form.fields[field.name]}</p>}
        </div>;
      })}
      <button className="text-button" type="submit" disabled={form.status === 'sending'}>{form.status === 'sending' ? '[ sending… ]' : '[ send message ↵ ]'}</button>
      <p role="status" className={form.status === 'error' ? 'terminal-error' : 'terminal-note'}>{form.status === 'sent' ? contactData.messages.success : form.status === 'error' ? form.error : form.status === 'sending' ? 'Sending your message…' : ''}</p>
    </form>
  </>;
}
