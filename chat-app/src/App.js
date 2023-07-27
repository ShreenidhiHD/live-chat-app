import './App.css';
import React from 'react';
import Login from './components/Login';
import Chat from './components/Chat'; // Make sure this path is correct
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import ChatTable from './components/ChatTable';
import AgentChat from './components/AgentChat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chattable" element={<ChatTable />} />
        <Route path="/agentchat" element={<AgentChat />} />
        
      </Routes>
    </Router>
  );
}

export default App;
