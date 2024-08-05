import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.scss'

import App from './App.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Pokemon from './pages/Pokemon.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path='/' element={<Home />}/>
          <Route path='/search' element={<Search />}/>
          <Route path='/pokemon' element={<Pokemon />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
