import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/main.css'; 

const LandingPage = () => {
    return (
        <div className="landing-page">
            <nav>
                <NavLink to="/" exact activeClassName="active">Home</NavLink>
                <NavLink to="/miniDataProjects" activeClassName="active">Data ML Projects</NavLink>
                <NavLink to="/contact" activeClassName="active">Contact</NavLink>
            </nav>
            <header className="landing-header">
                <h1>Welcome to My Personal Website</h1>
                <p>Hi, I'm Shangmin Chen. A passionate developer and lifelong learner.</p>
            </header>
            <section className="about-section">
                <h2>About Me</h2>
                <p>
                    I specialize in building modern web applications and love exploring new technologies.
                    Feel free to explore my projects and get to know more about me.
                </p>
            </section>
            <section className="projects-section">
                <h2>Projects</h2>
                <p>Check out some of my work below:</p>
                <ul>
                    <li><a href="#project1">Project 1</a></li>
                    <li><a href="#project2">Project 2</a></li>
                    <li><a href="#project3">Project 3</a></li>
                </ul>
            </section>
            <footer className="landing-footer">
                <p>© 2023 Shangmin Chen. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;