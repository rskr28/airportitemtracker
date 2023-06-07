import React from "react";
import { setConstraint } from "../constraints";
import "../styles/Navbar.css";
import axios from "axios";
import LostItem from "./LostItem";
// import { ToastProvider } from "react-toast-notifications";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import profile_icon from "../img/profile-icon.png";
// import { Dropdown } from "react-bootstrap";
// import Login from './Login'
function Navbar() {
  const token = window.localStorage.getItem("token");
  // console.log(props)
  // console.log("Status :", LOGGED_IN)
  // useEffect(()=>{
  //   axios({
  //     url:'checktoken',
  //     method:"POST",
  //     headers:{
  //       Authorization: token ? `Bearer ${token}` : "",
  //     },
  //   })
  //   .then((res)=>{
  //     console.log(res)
  //   })
  //   .catch((err)=>{
  //     console.log("400 : ",err)
  //   })
  // },[])
  const signout = () => {
    // constraint.LOGGED_IN = false;
    setConstraint(false);

    console.log("Signed out !");
    axios({
      url: "http://localhost:5000/signout",
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then(localStorage.clear())
      .catch((error) => {
        console.log(error);
        // console.log("Error occured");
      });
  };
  return (
    <>
      <div className="navbar">
        <div className="logo">
          <a style={{ textDecoration: "none", color: "white" }} href="/">
            <h2>Airport Item Tracker</h2>
          </a>
        </div>

        <div
          style={token ? { display: "none" } : {}}
          id="login"
          className="signin"
        >
          <ul>
            <a
              id="a"
              style={{ textDecoration: "none", color: "white" }}
              href="/sign-up"
            >
              Sign-up
            </a>
          </ul>
          <ul>
            <a
              id="a"
              style={{ textDecoration: "none", color: "white" }}
              href="/log-in"
            >
              Log-in
            </a>
          </ul>
        </div>
        <div style={token ? {} : { display: "none" }} className="postsignin">
          <div className="button">
            <LostItem />  
          </div>
          <ToastContainer autoDismiss={true} placement={"bottom-right"} autoClose={3000}/>
          {/* <Found_item /> */}
          <ul className="Navbar-menu">
            <a className="Navbar-link" href="/feed">
              Feed
            </a>
            {/* {props.name} */}
            <a
              className="Navbar-link"
              href="/responses"
            >
              Responses
            </a>
            <a
              className="Navbar-link"
              href="/mylistings"
            >
              My Listings
            </a>
            <a
              className="Navbar-link"
              onClick={signout}
              href="/"
            >
              Sign-out
            </a>
            {/* <div>
              <img src={profile_icon} alt="profile-icon" />
              <ul>
                <li>
                  <a
                    style={{ textDecoration: "none", color: "white" }}
                    href="/mylistings"
                  >
                    My Listings
                  </a>
                </li>
                <li>
                  <a
                    style={{ textDecoration: "none", color: "white" }}
                    href="/responses"
                  >
                    Responses
                  </a>
                </li>
                <li>
                  <a
                    style={{ textDecoration: "none", color: "white" }}
                    onClick={signout}
                    href="/log-in"
                  >
                    Log-out
                  </a>
                </li>
              </ul>
            </div> */}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Navbar;