// Import necessary modules
const express = require("express");

// Import database of books and authentication functions
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

// Create a router instance for public user routes
const public_users = express.Router();

// Route: Register a new user
const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res
        .status(404)
        .json({ message: `User ${username} already exists!` });
    }
  }
  return res.status(404).json({
    message: "Unable to register user. Username and/or password not provided",
  });
});

// Function to validate email format
function isValidEmail(email) {
  // Regular expression to validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to hash the password
function hashPassword(password) {
  // Implement password hashing logic (using bcrypt or any other suitable library)
  return password; // For demonstration purposes, returning the password as is
}

// Route: Get the list of available books
public_users.get("/", function (req, res) {
  const allBooks = Object.values(books); // Convert object to array

  if (allBooks.length === 0) {
    return res.status(404).json({ message: "No books available" });
  }

  return res.status(200).json(allBooks);
});

// Route: Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = Object.values(books).find((book) => book.isbn === isbn);

  if (book) {
    res.status(200).json(book);
  } else {
    res.send(`Book with ISBN ${isbn} not found.`);
  }
});

// Route: Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const book = Object.values(books).find((book) => book.author === author);

  if (book) {
    res.status(200).json(book);
  } else {
    res.send(`Book with author name ${author} not found.`);
  }
});

// Route: Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const book = Object.values(books).find((book) => book.title === title);

  if (book) {
    res.status(200).json(book);
  } else {
    res.send(`Book with title ${title} not found.`);
  }
});

// Route: Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = Object.values(books).find((book) => book.isbn === isbn);
  const review = book.reviews;
  if (book) {
    res.status(200).json(review);
  } else {
    res.send(`Book with ISBN ${isbn} not found.`);
  }
});

// Export the router containing public user routes
module.exports.general = public_users;
