import { FC } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';

import Register from './pages/register/register.page';
import Login from './pages/login/login.page';
import MainPage from './pages/main/main.page';
import DocumentEditor from './components/organism/document-editor/document-editor';
import Create from './pages/document/create';
import Document from './pages/document';

const App: FC = () => {
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
