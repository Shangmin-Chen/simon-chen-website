import './styles/index.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
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
import { useScrollReveal } from './hooks/useScrollReveal';

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
  useScrollReveal();

  return (
    <ThemeProvider>
      <AppToaster />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/gallery/:albumId" element={<GalleryPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;