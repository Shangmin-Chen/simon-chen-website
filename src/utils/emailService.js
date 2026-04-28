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
      const msg =
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
