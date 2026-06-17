import React, { useState } from 'react';
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
    setIsSubmitting(true);
    setErrorMessage('');
    setSubmitStatus(null);
    
    try {
      // Validate form data
      if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        throw new Error(contactData.messages.validation.emptyFields);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error(contactData.messages.validation.invalidEmail);
      }

      // Send email
      const result = await sendEmail(formData);
      
      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Reset status after 5 seconds
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error.message || contactData.messages.error);
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <h2 className="section-title farewell">
          Let&apos;s <em>chat</em>
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
          
          <form className="contact-form" onSubmit={handleSubmit}>
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
        </div>
      </div>
    </section>
  );
};

export default Contact;
