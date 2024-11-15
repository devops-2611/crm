
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import '@mantine/dropzone/styles.css';
import { MyDocument } from './pages/Mydocument';
import CustomerManagement from './components/CustomerManagement';
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pdfview" element={<MyDocument />} />
        <Route path="/admin" element={<CustomerManagement />} />
      </Routes>
    </div>
  );
}

export default App;
