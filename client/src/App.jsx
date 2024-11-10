// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </div>
  );
}

export default App;
