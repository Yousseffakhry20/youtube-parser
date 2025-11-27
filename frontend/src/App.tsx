
import { HashRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './Pages/Home'
import Layout from './Components/Layout'
import About from './Pages/About'

function App() {
  

  return (
    <>
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </HashRouter>
    </>
  )
}

export default App
