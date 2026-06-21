import { Button } from 'simon-chen-website';

// Buttons drive the hero CTAs and the contact form (see Hero.jsx, Contact.jsx).
// Editorial style: square corners, thin borders, serif label.

export const Primary = () => (
  <Button variant="primary" onClick={() => {}}>
    View Projects
  </Button>
);

export const Secondary = () => (
  <Button variant="secondary" onClick={() => {}}>
    Let&rsquo;s Chat
  </Button>
);

export const Submit = () => (
  <div style={{ maxWidth: 360 }}>
    <Button type="submit" variant="submit">
      Send Message
    </Button>
  </div>
);

export const Disabled = () => (
  <div style={{ maxWidth: 360 }}>
    <Button type="submit" variant="submit" disabled>
      Sending&hellip;
    </Button>
  </div>
);
