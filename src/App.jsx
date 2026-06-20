import './styles/index.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Now from './components/Now';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Blog from './components/Blog';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import { useScrollReveal } from './hooks/useScrollReveal';

import GalleryPage from './components/GalleryPage';

const BlogPost = lazy(() => import('./components/BlogPost'));

function App() {
  useScrollReveal();

  const HomePage = () => (
    <>
      <Hero />
      <About />
      <Now />
      <Experience />
      <Projects />
      <Blog />
      <Gallery />
      <Contact />
    </>
  );

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog/:slug" element={<Suspense fallback={null}><BlogPost /></Suspense>} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/gallery/:albumId" element={<GalleryPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;