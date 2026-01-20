import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CreateContract from './components/CreateContract';
import Blueprints from './components/Blueprints';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateContract />} />
          <Route path="/blueprints" element={<Blueprints />} />
          <Route path="/blueprints/new" element={<Blueprints />} />
          <Route path="/blueprints/edit/:id" element={<Blueprints />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;