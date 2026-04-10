import React from 'react'
import { Routes, Route, Link } from "react-router-dom";
import Hero from './pages/Hero';
import Home from './pages/Home'
import { useUser } from '@clerk/react';
import Add from './pages/Add';



function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null; // prevent flicker
  if (!isSignedIn)
    return (
      <div className="min-h-screen font-mono flex items-center justify-center bg-linear-to-b from-emerald-50 via-green-50 to-emerald-100 px-4">
        <div className="text-center">
          {/* Animated text */}
          <p className="text-emerald-800 font-semibold text-lg sm:text-2xl mb-4 animate-fade-in">
            Please sign in to view this page
          </p>

          {/* Button on new line */}
          <div className="flex justify-center">
            <Link
              to="/"
              className="px-4 py-2 text-sm rounded-full bg-emerald-600 text-white shadow-sm
                       hover:bg-emerald-700 hover:shadow-md
                       transition-all duration-300 ease-in-out
                       animate-bounce-subtle"
            >
              HOME
            </Link>
          </div>
        </div>
      </div>
    );
  return children;
}
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route
        path="/h"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/add"
        element={
          <RequireAuth>
            <Add />
          </RequireAuth>
        }
      />
      
    </Routes>
  );
};
export default App;
