const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
      res.send({ books });
    } catch (error) {
      console.error("Error fetching books:", error.message);
      res.status(500).json({ message: "Failed to fetch books", error: error.message });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    new Promise((resolve, reject) => {
      if (books.hasOwnProperty(isbn)) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    })
    .then(book => {
      res.send(book);
    })
    .catch(error => {
      console.error("Error fetching book details:", error.message);
      res.status(500).json({ message: "Failed to fetch book details", error: error.message });
    });
  });

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
      const author = req.params.author;
      let booksArray = Object.values(books);
      let filteredBooks = booksArray.filter((book) => book.author === author);
  
      if (filteredBooks.length > 0) {
        res.send(filteredBooks);
      } else {
        res.status(404).json({ message: "No books found for the author" });
      }
    } catch (error) {
      console.error("Error fetching books by author:", error.message);
      res.status(500).json({ message: "Failed to fetch books by author", error: error.message });
    }
  });

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
      const title = req.params.title;
      let booksArray = Object.values(books);
      let filteredBooks = booksArray.filter((book) => book.title === title);
  
      if (filteredBooks.length > 0) {
        res.send(filteredBooks);
      } else {
        res.status(404).json({ message: "No books found with the specified title" });
      }
    } catch (error) {
      console.error("Error fetching books by title:", error.message);
      res.status(500).json({ message: "Failed to fetch books by title", error: error.message });
    }
  });

//  Get book review
    public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      const reviews = book.reviews || {};
      const reviewsWithUsername = Object.entries(reviews).map(([username, review]) => ({ username, review }));
      res.send(reviewsWithUsername);
    } else {
      res.status(404).json({ message: "Book not found." });
    }
  });

module.exports.general = public_users;
