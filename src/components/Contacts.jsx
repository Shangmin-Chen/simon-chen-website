import React from 'react';
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Contacts = () => {
    return (
        <div className="contacts">
            <nav>
                <NavLink to="/" exact activeClassName="active">Home</NavLink>
                <NavLink to="/miniDataProjects" activeClassName="active">Data ML Projects</NavLink>
                <NavLink to="/contact" activeClassName="active">Contact</NavLink>
            </nav>
            <h1>Contact Me</h1>
            <form>
                <div>
                    <label htmlFor="fullName">Full Name:</label>
                    <input type="text" id="fullName" name="fullName" placeholder="Your Name" required />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" placeholder="Your Email" required />
                </div>
                <div>
                    <label htmlFor="message">Message:</label>
                    <textarea id="message" name="message" placeholder="Your Message" required></textarea>
                </div>
                <button type="submit">Send</button>
            </form>
            <footer>
                <h2>Follow Me</h2>
                <div className="social-icons">
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                        <FaLinkedin />
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        <FaGithub />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <FaTwitter />
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default Contacts;
