import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    setErrorMessage('');
    
    // Validate form data
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      const msg = contactData.messages.validation.emptyFields;
      toast.error(msg, { id: 'contact-validation-error' });
      setSubmitStatus('error');
      setErrorMessage(msg);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      const msg = contactData.messages.validation.invalidEmail;
      toast.error(msg, { id: 'contact-validation-error' });
      setSubmitStatus('error');
      setErrorMessage(msg);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Sending your message...');

    try {
      // Send email
      const result = await sendEmail(formData);
      
      if (result.success) {
        toast.success('Message sent successfully!', { id: toastId });
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const msg = result.message || contactData.messages.error;
        toast.error(msg, { id: toastId });
        setSubmitStatus('error');
        setErrorMessage(msg);
      }
    } catch (error) {
      const msg = error.message || contactData.messages.error;
      toast.error(msg, { id: toastId });
      setSubmitStatus('error');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <motion.h2
          className="section-title farewell"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Let&apos;s <em>Chat</em>
        </motion.h2>
        <motion.div
          className="contact-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
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

            {submitStatus === 'success' && (
              <div className="success-message" role="alert">
                {contactData.messages.success}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="error-message" role="alert">
                {errorMessage}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
