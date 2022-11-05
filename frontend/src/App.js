import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import '@tensorflow/tfjs';

import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
