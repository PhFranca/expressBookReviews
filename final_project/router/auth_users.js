const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in."});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("Costumer successfully logged in!");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password."});
  }
});

// Add a book review
    regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviews = req.body.reviews;
    const username = req.session.authorization.username; // Retrieve the username from session
  
    const book = books[isbn];
  
    if (book) {
      if (book.reviews && book.reviews[username]) {
        book.reviews[username] = reviews;
        return res.status(200).json({ message: "Review modified successfully by" + username + "!" });
      } else {
        if (!book.reviews) {
          book.reviews = {};
        }
        book.reviews[username] = reviews;
        return res.status(200).json({ message: "Review added successfully for book with ISBN " + isbn + " by " + username + "!" });
      }
    } else {
      return res.status(404).json({ message: "Book with ISBN " + isbn + "not found." });
    }
  });

// Delete a book review
    regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Retrieve the username from session
    const book = books[isbn];
  
    if (book) {
      if (book.reviews && book.reviews[username]) {
        delete book.reviews[username];
        return res.status(200).json({ message: "Review deleted successfully for book with ISBN " + isbn + " by " + username + "!" });
      } else {
        if (!book.reviews) {
          return res.status(404).json({ message: "No reviews found for book with ISBN " + isbn + "."});
        } else {
          return res.status(404).json({ message: "Review not found for this user " + username + "." });
        }
      }
    } else {
      return res.status(404).json({ message: "Book with ISBN " + isbn + "not found." });
    }
  });  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;