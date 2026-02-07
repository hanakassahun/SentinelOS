import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../features/dashboard';
import Insights from '../features/insights';
import Logging from '../features/logging';
import Planning from '../features/planning';
import Auth from '../features/auth';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/logging" element={<Logging />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
}
