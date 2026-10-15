import { socialLinks } from '../../../data/socialLinks';
import { contactData } from '../../../data/contactData';
import { contactLimits } from '../../domain/contact';

export default function LetterComposer({ form, formRef }) {
  return <div className="contact-letter">
    <div className="contact-letter__address" aria-label="Letter address">
      <div><span>To:</span><strong>Simon Chen</strong></div>
    </div>
    <form id="contact-letter-form" ref={formRef} className="contact-letter__form" noValidate onSubmit={event => { event.preventDefault(); void form.submit(); }}>
      {contactData.formFields.map(field => {
        const label = field.name === 'email' ? 'Reply-to email' : field.label ?? (field.name[0].toUpperCase() + field.name.slice(1));
        const props = {
          id: `contact-${field.name}`,
          name: field.name,
          value: form.draft[field.name],
          required: true,
          maxLength: contactLimits[field.name],
          disabled: form.status === 'sending',
          'aria-invalid': Boolean(form.fields[field.name]),
          'aria-describedby': form.fields[field.name] ? `error-${field.name}` : undefined,
          onChange: event => form.change(field.name, event.target.value),
        };
        return <div key={field.name} className={`contact-letter__field contact-letter__field--${field.name}`}>
          <label htmlFor={props.id}>{label}</label>
          {field.type === 'textarea'
            ? <textarea {...props} rows={4} />
            : <input {...props} type={field.type} autoComplete={field.name === 'name' || field.name === 'email' ? field.name : undefined} />}
          {form.fields[field.name] && <p id={`error-${field.name}`} className="contact-letter__error">{form.fields[field.name]}</p>}
        </div>;
      })}
    </form>
    <footer className="contact-letter__footer">
      <div className="contact-letter__send-row">
        <button className="contact-letter__send" type="submit" form="contact-letter-form" disabled={form.status === 'sending'}>
          {form.status === 'sending' ? '[ sending… ]' : 'Seal & send letter ↵'}
        </button>
        <p className="contact-letter__delivery" role="status" aria-live="polite">
          {form.status === 'sent' ? contactData.messages.success
            : form.status === 'error' ? form.error
              : form.status === 'sending' ? 'Sending your letter…' : ''}
        </p>
      </div>
      <span>Simon Chen · comms channel</span>
      <nav aria-label="Social profiles">
        {socialLinks.map(link => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}
      </nav>
    </footer>
  </div>;
}
