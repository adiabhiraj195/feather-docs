import './App.css';
import { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Register from './pages/register/register.page';
import Login from './pages/login/login.page';
import Create from './pages/document/create';
import Document from './pages/document/document';

const App: FC = () => {
  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'enabled') {
      document.documentElement.classList.add('dark');
    } else if (localStorage.getItem('darkMode') === null) {
      // Respect system preference by default
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
      }
    }
  }, []);

  return (
    <div className='App'>
      <Routes>
        <Route path='/register' Component={Register} />
        <Route path='/' Component={Login} />
        <Route path='document/create' Component={Create} />
        <Route path='document/:id' Component={Document} />
      </Routes>
    </div>
  );
}

export default App;
