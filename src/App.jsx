
import './App.css';

import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Enter from './pages/Enter'



function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Enter />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/About" element={<About />} />
   
        </Routes>
      
    </Router>
  )
}

export default App
