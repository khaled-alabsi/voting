import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VotingProvider } from './context/VotingContext';
import Header from './components/Header';
import Home from './pages/Home';
import CreatePool from './pages/CreatePool';
import VotePool from './pages/VotePool';
import PoolResults from './pages/PoolResults';
import ManagePool from './pages/ManagePool';

function App() {
  return (
    <VotingProvider>
      <Router basename="/voting">
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreatePool />} />
              <Route path="/vote/:poolId" element={<VotePool />} />
              <Route path="/results/:poolId" element={<PoolResults />} />
              <Route path="/manage/:poolId" element={<ManagePool />} />
            </Routes>
          </main>
        </div>
      </Router>
    </VotingProvider>
  );
}

export default App;
