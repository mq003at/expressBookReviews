const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    username: "quan",
    password: "123qwe",
  },
  {
    username: "user1",
    password: "pwd1",
  },
  {
    username: "user2",
    password: "pwd2",
  },
];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  //returns boolean
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    // Changed to 400 Bad Request for missing username or password
    return res.status(400).json({ message: "Missing username or password" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { data: username }, // Typically, you should include username or userId not the password
      "access", // This key should be secret and complex in production
      { expiresIn: "1h" } // "60 * 60" can be written as '1h' for clarity
    );

    // Assuming req.session is properly configured with session middleware
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send({ message: "Logged In!", accessToken });
  } else {
    // 401 Unauthorized is more appropriate here than 208 Already Reported
    return res
      .status(401)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn, review, username } = req.body;
  const book = Object.values(books).find((book) => book.isbn === isbn);
  const bookReviews = book.reviews;

  if (!book) {
    res.send(`Book with isbn ${isbn} not found.`);
  } else if (!username || !review) {
    res.send(`Review or user name is missing`);
  } else {
    const userReview = bookReviews.find(
      (review) => review.username === username
    );
    if (userReview) {
      // If user has already reviewed, update the review
      userReview.review = review;
      res.send({ message: "Review updated", review });
    } else {
      // If user hasn't reviewed yet, add a new review
      bookReviews.push({ username, review });
      res.send({ message: `Review added for user ${username} on book with isbn ${isbn}`, review });
    }
  }
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Retrieve username from session
  const book = Object.values(books).find((book) => book.isbn === isbn);
  const bookReviews = book.reviews;

  if (!book) {
    res.send(`Book with isbn ${isbn} not found.`);
  } else if (!username) {
    res.send(`User is not authenticated. Please log in.`);
  } else {
    const userReviewIndex = bookReviews.findIndex(
      (review) => review.username === username
    );

    if (userReviewIndex !== -1) {
      // If user has a review, delete the review
      bookReviews.splice(userReviewIndex, 1);
      res.send(`Review deleted for user ${username} on book with isbn ${isbn}`);
    } else {
      // If user doesn't have a review on the book
      res.send(`The user ${username} has no review on book with isbn ${isbn}`);
    }
  }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
