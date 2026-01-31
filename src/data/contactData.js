export const contactData = {
  title: "Get In Touch",
  description: "I'm always interested in new opportunities and exciting projects. Feel free to reach out if you'd like to collaborate or just say hello!",
  contactDetails: [
    {
      label: "Email",
      value: "shangminch@gmail.com",
      href: "mailto:shangminch@gmail.com",
      external: false
    },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/shangmin-chen",
      href: "https://linkedin.com/in/shangmin-chen",
      external: true
    },
    {
      label: "GitHub",
      value: "github.com/Shangmin-Chen",
      href: "https://github.com/Shangmin-Chen",
      external: true
    }
  ],
  formFields: [
    {
      label: "Name",
      type: "text",
      name: "name"
    },
    {
      label: "Email",
      type: "email",
      name: "email"
    },
    {
      label: "Subject",
      type: "text",
      name: "subject"
    },
    {
      label: "Message",
      type: "textarea",
      name: "message",
      rows: 5
    }
  ],
  submitButton: {
    default: "Send Message",
    submitting: "Sending..."
  },
  messages: {
    success: "Thank you! Your message has been sent successfully.",
    error: "Failed to send message. Please try again.",
    validation: {
      emptyFields: "Please fill in all fields",
      invalidEmail: "Please enter a valid email address"
    }
  }
};

