import './styles/index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import Now from './components/Now';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Gallery from './components/Gallery';
import Contact from './components/Contact';

import GalleryPage from './components/GalleryPage';

const AppToaster = () => {
  const { theme } = useTheme();
  return <Toaster position="bottom-right" richColors closeButton theme={theme} />;
};

const HomePage = () => (
  <>
    <Hero />
    <About />
    <Now />
    <Experience />
    <Projects />
    <Gallery />
    <Contact />
  </>
);

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <AppToaster />
        <Router>
          <div className="App">
            <a
              href="#main-content"
              className="skip-link"
              onClick={() => document.getElementById('main-content')?.focus()}
            >
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content" tabIndex={-1}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/gallery/:albumId" element={<GalleryPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </MotionConfig>
  );
}

export default App;