import { useState } from 'react';
import { BrowserRouter } from 'react-router';
import { browserStorage } from './portfolio/adapters/storage';
import { createPortfolioServices } from './portfolio/adapters/http';
import Portfolio from './portfolio/ui/Portfolio';
import './styles/index.css';

// Composition root: browser/HTTP adapters are provided to the application.
// Domain algorithms never import React, fetch, storage, or the router.
export default function App() {
  const [ports] = useState(() => ({
    services: createPortfolioServices({ fetch: window.fetch.bind(window), storage: browserStorage(() => window.sessionStorage) }),
    preferences: browserStorage(() => window.localStorage),
  }));
  return <BrowserRouter><Portfolio {...ports} /></BrowserRouter>;
}
