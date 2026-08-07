import React, { useState } from 'react';
import { toast } from 'sonner';
import { sendEmail } from '../utils/emailService';
import { contactData } from '../data/contactData';
import FormField from './ui/FormField';
import Button from './ui/Button';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error(contactData.messages.validation.emptyFields);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(contactData.messages.validation.invalidEmail);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.info('Sending your message...', { duration: 10000 });

    try {
      // Send email
      const result = await sendEmail(formData);
      
      toast.dismiss(toastId);
      if (result.success) {
        toast.success(contactData.messages.success);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(result.message || contactData.messages.error);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || contactData.messages.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <h2 className="section-title farewell">
          Let&apos;s <em>Chat</em>
        </h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3>{contactData.title}</h3>
            <p>{contactData.description}</p>
            <div className="contact-details">
              {contactData.contactDetails.map((detail, index) => (
                <div key={index} className="contact-item">
                  <strong>{detail.label}:</strong>
                  <a 
                    href={detail.href} 
                    target={detail.external ? "_blank" : undefined}
                    rel={detail.external ? "noopener noreferrer" : undefined}
                  >
                    {detail.value}
                  </a>
                </div>
              ))}
            </div>
          </div>
          
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            {contactData.formFields.map((field, index) => (
              <FormField
                key={index}
                label={field.label}
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                rows={field.rows}
                required
              />
            ))}
            
            <Button type="submit" variant="submit" disabled={isSubmitting}>
              {isSubmitting ? contactData.submitButton.submitting : contactData.submitButton.default}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
