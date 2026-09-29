export const sendEmail = async (formData) => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Prefer field-level validation messages so users see WHICH field
      // failed (take the first one for a clean single-line toast), falling
      // back to the generic top-level error text.
      const fieldMessages =
        data.fields && typeof data.fields === 'object'
          ? Object.values(data.fields).filter((m) => typeof m === 'string' && m.trim())
          : [];
      const msg =
        fieldMessages[0] ||
        data.error ||
        data.detail ||
        `Request failed with status ${response.status}`;
      throw new Error(typeof msg === 'string' ? msg : 'Failed to send email.');
    }

    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email. Please try again.',
    };
  }
};
