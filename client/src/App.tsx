
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import '@mantine/dropzone/styles.css';
import { MyDocument } from './pages/Mydocument';
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pdfview" element={<MyDocument />} />
      </Routes>
    </div>
  );
}

export default App;
