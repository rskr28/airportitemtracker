// const { request } = require("express");
// const bcryptjs = require('bcryptjs')
const express = require('express');
const nodemailer = require("nodemailer");
const mailgun = require("nodemailer-mailgun-transport");
const router = express.Router();
const jwt = require('jsonwebtoken');
// const httpProxy = require('http-proxy');
const { requireSignin } = require('../middleware');
// const proxy = httpProxy.createServer({});
// const passport = require('passport');
const { promisify } = require("util");
const Signup = require('../models/signup');
// const { token } = require('morgan');
// const { db } = require("../models/signup");
// const { Router } = require('express');
// const { token } = require('morgan');
require("dotenv").config({ path: '../.env' });
const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_EXPIRES = process.env.JWT_EXPIRES;
const NODE_ENV = process.env.NODE_ENV;
// console.log(JWT_EXPIRES);
console.log(JWT_SECRET);

const signJwt = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    // expiresIn: JWT_EXPIRES
  });
};

const sendToken = (user, statusCode, req, res) => {
  const token = signJwt(user._id);
  res.cookie("jwt", token, {
    // expires: new Date(Date.now() + JWT_EXPIRES),
    secure: NODE_ENV === 'production' ? true : false,
    httpOnly: NODE_ENV === 'production' ? true : false
  });
  console.log("Inside send token");
  res.status(statusCode).json({
    // status:"Success",
    token,
    // user
  });
};

const signout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({
    message: "Signed out successfully!"
  });
};

// MIDDLEWARE

const decryptJwt = async (token) => {
  const jwtverify = promisify(jwt.verify);
  return await jwtverify(token, JWT_SECRET);
};

const secure = async (req, res, next) => {
  let token;
  if (req.cookies) token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({
      status: "unauthorized",
      message: "You are not authorized to view the content"
    });
  }
  const jwtInfo = await decryptJwt(token);
  console.log(jwtInfo);
  const user = await Signup.findById(jwtInfo.id);
  req.user = user;
  next();
};

const checkField = (req, res, next) => {
  const { firstname, email, password, cpassword } = req.body;
  if (!firstname || !email || !password || !cpassword) {
    console.log('Please enter all the fields');
    res.send('Please enter all the fields');
  } else {
    next();
  }
};

const checkFieldLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log('Please enter all the fields');
    res.send('Please enter all the fields');
  } else {
    next();
  }
};

const checkUsername = (req, res, next) => {
  const { email } = req.body;
  const checkExistUsername = Signup.findOne({ email: email });
  checkExistUsername.exec()
    .then((data) => {
      if (data) {
        console.log('Email Exists');
        res.send('Email already exists');
      } else {
        next();
      }
    })
    .catch((err) => {
      throw err;
    });
};

const checkPassword = (req, res, next) => {
  const { password, cpassword } = req.body;
  if (password !== cpassword) {
    console.log('Password did not match');
    res.send('Password did not match');
  } else {
    next();
  }
};

router.get('/', (req, res) => res.send("Home page"));

router.post('/signup', checkField, checkUsername, checkPassword, async (req, res) => {
  console.log("Signup :", req.body);
  const { firstname, lastname, email, number, password } = req.body;

  try {
    const newSignup = await Signup.create({
      firstname: firstname,
      lastname: lastname,
      email: email,
      number: number,
      password: password
    });
    console.log(newSignup);
    res.send("Done");
  } catch (err) {
    res.status(401).json(err.message);
  }
});

router.post('/login', checkFieldLogin, (req, res, next) => {
  console.log('Login :', req.body);
  const { email, password } = req.body;

  const checkUser = Signup.findOne({ email: email });
  checkUser.exec()
    .then((data) => {
      if (!data) {
        console.log('Not exist');
        res.send("Email does not exist");
      } else {
        const dbpassword = data.password;
        if (dbpassword === password) {
          console.log("Logging in");
          const jwt_token = jwt.sign(
            { _id: data._id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: '1hr' }
          );
          res.cookie('jwt', jwt_token, { expiresIn: '1hr' });
          res.status(200).json({
            jwt_token,
            user: data
          });
          console.log("Login successful");
        } else {
          console.log('Please check again!');
          res.send("Password Incorrect");
        }
      }
    })
    .catch((err) => {
      throw err;
    });
});

router.post('/checktoken', requireSignin, (req, res) => {
  res.status(200).json({});
});

router.post('/signout', requireSignin, signout);

router.post('/feed', requireSignin, (req, res) => res.status(200).json({
  message: "Working fine"
}));

router.post('/sendmessage', (req, res) => {
  console.log(req.body);
  const { name, email, message } = req.body;
  const auth = {
    auth: {
      api_key: `${process.env.MAIL_GUN_API_KEY}`,
      domain: `${process.env.MAIL_GUN_DOMAIN}`
    }
  };

  const transporter = nodemailer.createTransport(mailgun(auth));

  const mailOption = {
    from: email,
    to: 'ragishivakoushikreddy@gmail.com',
    subject: `Review from ${name}`,
    text: message
  };

  transporter.sendMail(mailOption, (err, data) => {
    if (err) return res.status(500).json(err);
    console.log(data);
    res.status(200).json(data);
  });
});

module.exports = router;
