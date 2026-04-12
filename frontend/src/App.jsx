import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import DoctorDetail from './pages/DoctorDetails'
import Service from './pages/Service'
import ServiceDetailPage from './pages/ServiceDetailPage'
import Contact from './pages/Contact'
import Login from './pages/Login'
import DHome from './pages/DHome'
import List  from './doctor/List'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />}></Route>

        <Route path="/doctors" element={<Doctors />}></Route>
        <Route path="/doctors/:id" element={<DoctorDetail />}></Route>

        <Route path="/services" element={<Service />}></Route>
        <Route path="/services/:id" element={<ServiceDetailPage />}></Route>

        <Route path="/contact" element={<Contact />}></Route>

        <Route path="/doctor-admin/login" element={<Login />}></Route>
        <Route path="/doctor-admin/:id" element={<DHome />}></Route>
        <Route path="/doctor-admin/:id/appointments" element={<List />}></Route>
      </Routes>
    </div>
  )
}

export default App
