import { FormField } from 'simon-chen-website';

// FormField renders a labeled input or textarea (type="textarea"). Inputs are
// full-width with a bottom-border underline; see Contact.jsx. Static previews
// pass a value + no-op onChange so the controlled field renders filled.

const noop = () => {};

export const Text = () => (
  <div style={{ maxWidth: 420 }}>
    <FormField label="Name" type="text" name="name" value="Ada Lovelace" onChange={noop} required />
  </div>
);

export const Email = () => (
  <div style={{ maxWidth: 420 }}>
    <FormField label="Email" type="email" name="email" value="ada@example.com" onChange={noop} required />
  </div>
);

export const Textarea = () => (
  <div style={{ maxWidth: 420 }}>
    <FormField
      label="Message"
      type="textarea"
      name="message"
      rows={5}
      value="I'd love to chat about a collaboration on an open-source project."
      onChange={noop}
      required
    />
  </div>
);

export const Empty = () => (
  <div style={{ maxWidth: 420 }}>
    <FormField label="Subject" type="text" name="subject" placeholder="What's this about?" value="" onChange={noop} />
  </div>
);
