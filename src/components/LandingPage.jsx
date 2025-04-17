import React from 'react';
import Navbar from './Navbar'; // Import the new Navbar component
import Footer from './Footer'; // Import the new Footer component
import HeaderAndIntro from './HeaderAndIntro'; // Import the new HeaderAndIntro component
import AboutSection from './AboutSection'; // Import the new AboutSection component
import ProjectsSection from './ProjectsSection'; // Import the new ProjectsSection component
import '../App.css'; // Updated import

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <HeaderAndIntro /> {/* Use the new HeaderAndIntro component */}
      <AboutSection /> {/* Use the new AboutSection component */}
      <ProjectsSection /> {/* Use the new ProjectsSection component */}
      <Footer />
    </div>
  );
};

export default LandingPage;