# Atomic UI Components Reference (`docs/components.md`)

This document provides technical specifications, property documentation, variant mappings, accessibility features, and code usage examples for the atomic UI component suite located in `src/components/ui/`.

---

## 1. `Button` Component

Located in [`src/components/ui/Button.jsx`](../src/components/ui/Button.jsx).

The `Button` component provides a consistent, accessible trigger control supporting standard action types, visual hierarchy variants, and size options.

### Props Table

| Prop Name | Type | Default | Options | Description |
| :--- | :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | **Required** | — | Button content or child elements. |
| `variant` | `string` | `'primary'` | `'primary'`, `'secondary'`, `'submit'` | Visual style variant mapping to CSS classes. |
| `size` | `string` | `'medium'` | `'small'`, `'medium'`, `'large'` | Size specification (`btn-sm`, standard, `btn-lg`). |
| `className` | `string` | `''` | Custom string | Additional custom CSS classes. |
| `disabled` | `boolean` | `false` | `true`, `false` | Disables the button and sets HTML `disabled` state. |
| `onClick` | `function` | `undefined` | Callback function | Click event handler callback. |
| `type` | `string` | `'button'` | `'button'`, `'submit'`, `'reset'` | Standard HTML button type attribute. |
| `...props` | `object` | `{}` | Standard HTML attributes | Additional props passed to the `<button>` element. |

### Variant & Class Mappings

- `primary`: Applies `.btn.btn-primary` (Accent background with high-contrast text).
- `secondary`: Applies `.btn.btn-secondary` (Subtle tertiary background with border).
- `submit`: Applies `.btn.submit-btn` (Full-width form submission styling with focus states).
- `size="small"`: Adds `.btn-sm`.
- `size="large"`: Adds `.btn-lg`.

### Usage Examples

```jsx
import Button from './components/ui/Button';

// Primary Action Button
<Button variant="primary" onClick={() => handleDownload()}>
  Download Resume
</Button>

// Secondary Small Action
<Button variant="secondary" size="small" onClick={() => handleFilter('all')}>
  Reset Filters
</Button>

// Submit Form Button
<Button type="submit" variant="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Sending...' : 'Send Message'}
</Button>
```

---

## 2. `Card` Component

Located in [`src/components/ui/Card.jsx`](../src/components/ui/Card.jsx).

The `Card` component acts as a flexible content container, supporting multiple domain-specific visual layouts including project showcase cards, submission containers, experience timeline items, and translucent glassmorphic surfaces.

### Props Table

| Prop Name | Type | Default | Options | Description |
| :--- | :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | **Required** | — | Card content, sub-components, or layout nodes. |
| `variant` | `string` | `'default'` | `'default'`, `'submission'`, `'contest'`, `'experience'`, `'glass-card'` | Layout variant mapping to CSS class rules. |
| `className` | `string` | `''` | Custom string | Additional custom CSS classes. |
| `hover` | `boolean` | `false` | `true`, `false` | Enables interactive hover elevation and transition effects. |
| `...props` | `object` | `{}` | Standard HTML attributes | Additional attributes passed to the container `<div>`. |

### Variant & Class Mappings

- `default`: Applies `.card.project-card` (Standard elevated project card styling).
- `submission`: Applies `.card.submission-card` (Codeforces problem submission item).
- `contest`: Applies `.card.contest-card` (Competitive programming rating event item).
- `experience`: Applies `.card.experience-item` (Work history & education timeline item).
- `glass-card`: Applies `.card.glass-card` (Translucent glassmorphism with `backdrop-filter: blur(12px)`).

### Usage Examples

```jsx
import Card from './components/ui/Card';

// Standard Project Card with Hover Animation
<Card variant="default" hover className="custom-project-spacing">
  <h3>Algorithmic Trading Dashboard</h3>
  <p>Real-time telemetry and order execution monitor.</p>
</Card>

// Experience Timeline Item
<Card variant="experience">
  <div className="role-title">Software Engineer</div>
  <div className="company">Cloud Infrastructure Org</div>
</Card>

// Glassmorphism Glass Card
<Card variant="glass-card">
  <h4>Real-time Stats Overview</h4>
  <p>Live metrics using 3-layer design tokens.</p>
</Card>
```

---

## 3. `Tag` Component

Located in [`src/components/ui/Tag.jsx`](../src/components/ui/Tag.jsx).

The `Tag` component renders inline badges, metadata pills, skill tokens, competitive programming difficulty ratings, and submission verdicts.

### Props Table

| Prop Name | Type | Default | Options | Description |
| :--- | :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | **Required** | — | Label, text content, or numerical rating value. |
| `variant` | `string` | `'default'` | `'default'`, `'skill'`, `'tech'`, `'rating'`, `'verdict'` | Badge taxonomy variant. |
| `className` | `string` | `''` | Custom string | Additional custom CSS classes. |
| `color` | `string` | `undefined` | HSL / HEX / RGB string | Custom color applied inline to both text `color` and `borderColor`. |
| `...props` | `object` | `{}` | Standard HTML attributes | Additional attributes passed to the `<span>` element. |

### Variant & Class Mappings

- `default`: Applies `.tag` (Generic pill badge).
- `skill`: Applies `.tag.skill-tag` (Skill taxonomy badge).
- `tech`: Applies `.tag.tech-tag` (Technology stack label).
- `rating`: Applies `.tag.problem-rating` (Codeforces problem rating badge).
- `verdict`: Applies `.tag.verdict` (Codeforces submission verdict badge).

### Usage Examples

```jsx
import Tag from './components/ui/Tag';

// Tech Stack Tag
<Tag variant="tech">React 19</Tag>
<Tag variant="tech">Cloudflare Workers</Tag>

// Custom Colored Codeforces Problem Rating
<Tag variant="rating" color="#55FF55">
  1600
</Tag>

// Submission Verdict
<Tag variant="verdict" color="var(--success-color)">
  Accepted
</Tag>
```

---

## 4. `FormField` Component

Located in [`src/components/ui/FormField.jsx`](../src/components/ui/FormField.jsx).

The `FormField` component encapsulates form label management, accessibility binding (`htmlFor`), required field indicator formatting (`*`), and input/textarea element rendering into a unified form group.

### Props Table

| Prop Name | Type | Default | Options | Description |
| :--- | :--- | :--- | :--- | :--- |
| `label` | `string` | `undefined` | Text string | Form label text displayed above the control. |
| `type` | `string` | `'text'` | `'text'`, `'email'`, `'textarea'`, etc. | Input type identifier. Switches element to `<textarea>` when set to `'textarea'`. |
| `name` | `string` | **Required** | Form control key | Name and `id` linking label to control for accessibility. |
| `value` | `string` \| `number` | **Required** | State value | Controlled value state of the field. |
| `onChange` | `function` | **Required** | Handler callback | Event handler triggered on input change. |
| `placeholder` | `string` | `undefined` | Text hint | Input placeholder hint. |
| `required` | `boolean` | `false` | `true`, `false` | Appends required asterisk (`*`) and sets HTML `required`. |
| `rows` | `number` | `1` | Integer | Row height specification for `'textarea'` type fields. |
| `className` | `string` | `''` | Custom string | Class names applied to parent `.form-group` wrapper. |
| `...props` | `object` | `{}` | Standard HTML attributes | Additional props passed to `<input>` or `<textarea>`. |

### Usage Examples

```jsx
import FormField from './components/ui/FormField';

// Text Input Field
<FormField
  label="Your Name"
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  placeholder="Simon Chen"
  required
/>

// Email Input Field
<FormField
  label="Email Address"
  type="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
  placeholder="simon@example.com"
  required
/>

// Textarea Input Field
<FormField
  label="Message"
  type="textarea"
  name="message"
  value={formData.message}
  onChange={handleChange}
  placeholder="How can I help you?"
  rows={5}
  required
/>
```

---

## 5. `BlurhashImage` Component

Located in [`src/components/ui/BlurhashImage.jsx`](../src/components/ui/BlurhashImage.jsx).

The `BlurhashImage` component provides a high-performance progressive image experience with canvas fallback decoding, low-latency placeholders, and smooth opacity cross-fade transitions.

### Technical Implementation Features

1. **Low-Latency Blurhash Decoding**: Uses the `blurhash` decode package to render a low-resolution pixel matrix onto an HTML `<canvas>` element prior to downloading full-resolution images.
2. **Smooth Cross-Fade Animation**: 
   - Initial state: `<canvas>` opacity is `1`, while high-res `<img>` opacity is `0`.
   - On load completion (`onLoad` or cached state detection): `<canvas>` transitions to opacity `0`, and `<img>` transitions seamlessly to opacity `1`.
3. **Canvas & Network Fallback**: If the target image fails to load (`onError`), `hasError` state renders `.blurhash-error-fallback` with accessible label (`Photo unavailable`) and `role="img"`.

### Props Table

| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `src` | `string` | **Required** | High-resolution image source URL. |
| `blurhash` | `string` | `undefined` | 83-character Blurhash string for initial canvas placeholder. |
| `alt` | `string` | `''` | Accessible image alt description. |
| `className` | `string` | `''` | CSS class applied to outer `.blurhash-container`. |
| `imgClassName` | `string` | `''` | CSS class applied to `<img>` element (`.blurhash-img`). |
| `style` | `object` | `{}` | Container inline style overrides. |
| `imgStyle` | `object` | `{}` | Image element inline style overrides. |
| `canvasWidth` | `number` | `32` | Width resolution of internal decoded Blurhash canvas matrix. |
| `canvasHeight` | `number` | `32` | Height resolution of internal decoded Blurhash canvas matrix. |
| `loading` | `string` | `undefined` | Native loading strategy (`'lazy'` or `'eager'`). |
| `draggable` | `boolean` | `undefined` | Controls HTML element drag behavior. |
| `width` | `number` \| `string` | `undefined` | HTML width attribute. |
| `height` | `number` \| `string` | `undefined` | HTML height attribute. |
| `onLoad` | `function` | `undefined` | Image load completion callback handler. |
| `onError` | `function` | `undefined` | Image load error callback handler. |
| `...props` | `object` | `{}` | Additional standard attributes passed to the `<img>` element. |

### Usage Examples

```jsx
import BlurhashImage from './components/ui/BlurhashImage';

// Photo Gallery Card with Blurhash Placeholder & Eager Loading
<BlurhashImage
  src="https://images.simon-chen.com/gallery/shanghai_08.jpg"
  blurhash="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
  alt="Shanghai skyline at sunset"
  loading="eager"
  width={800}
  height={600}
  className="gallery-photo-frame"
  imgClassName="object-cover"
  onLoad={() => console.log('Image successfully loaded')}
/>
```
