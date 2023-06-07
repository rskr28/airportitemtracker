import React, { useState } from "react";
import "../styles/Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Spinner } from "react-bootstrap";

function Login() {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const history = useNavigate();

  const login = () => {
    setLoading(true);

    const payload = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };

    axios({
      url: "http://localhost:5000/login",
      method: "POST",
      data: payload,
    })
      .then((response) => {
        console.log("Response is :", response);
        if (response.data.user) {
          setInfo("");
          localStorage.setItem("token", response.data.jwt_token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          history("/feed");
        } else {
          setInfo(response.data);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
        console.log("Error occurred");
      });
  };

  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <form className="Box-1 login">
          <h1>Log in</h1>
          <p style={{ color: "white" }}>{info}</p>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email id"
            required
          />
          <input
            type="password"
            placeholder="Password"
            id="password"
            name="password"
            required
          />
          <button type="button" className="submit" onClick={login}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="sr-only">Loading...</span>
              </>
            ) : (
              <>Submit</>
            )}
          </button>
          <p style={{ color: "white" }}>
            Don't have an account?{" "}
            <a style={{ color: "black" }} href="/sign-up">
              Click here
            </a>
          </p>
        </form>
      </div>
    </>
  );
}

export default Login;
