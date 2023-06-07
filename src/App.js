import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Signup from './components/Signup';
import Login from './components/Login';
import Feed from './components/Feed';
import Response from './components/Response';
import 'bootstrap/dist/css/bootstrap.min.css';
// import PrivateRoute from './components/PrivateRoute';
import Home from './components/Home';
import ItemPage from './components/ItemPage';
import MyListings from './components/MyListings';

window.OneSignal = window.OneSignal || [];
const OneSignal = window.OneSignal;

function App() {
  useEffect(() => {
    OneSignal.push(() => {
      OneSignal.init({
        appId: "fe13c665-7830-497e-9a3f-27a523840baf",
        welcomeNotification: {
          "title": "One Signal",
          "message": "Thanks for subscribing!",
        }
      });
    });
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route path="/log-in" element={<Login />} />
          {/* <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} /> */}
          {/* <PrivateRoute path="/feed" element={<Feed />} /> */}
          <Route path='/feed' element={<Feed/>}/>
          <Route path="/mylistings" element={<MyListings />} />
          <Route path="/responses" element={<Response />} />
          <Route path="/:item" element={<ItemPage />} />
        </Routes>
        <ToastContainer autoClose={3000} position="bottom-right" />
      </Router>
    </>
  );
}

export default App;
