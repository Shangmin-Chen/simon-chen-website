export const contactLimits = { name: 100, email: 254, subject: 200, message: 5000 };

// Shared by the browser application and Worker. No transport or UI dependencies.
export function validateContact(raw) {
  const values = {};
  const fields = {};
  for (const [key, limit] of Object.entries(contactLimits)) {
    values[key] = typeof raw?.[key] === 'string' ? raw[key].trim() : '';
    const label = key[0].toUpperCase() + key.slice(1);
    if (!values[key]) fields[key] = `${label} is required.`;
    else if (values[key].length > limit) fields[key] = `${label} must be ${limit} characters or fewer.`;
  }
  if (values.email && !fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    fields.email = 'Email address is invalid.';
  }
  return { values, fields, valid: Object.keys(fields).length === 0 };
}
