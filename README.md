# BMCC ELECTRONICS

This is a simple e-commerce web application built using Node.js, Express, and MongoDB. It provides user registration, login functionality, and a shopping cart for managing products.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Routes](#routes)
- [Database Models](#database-models)
- [License](#license)

## Technologies Used

- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL database to store user and product information.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **bcryptjs**: Library to hash passwords for secure storage.
- **EJS**: Embedded JavaScript templating for rendering HTML pages.
- **dotenv**: Module to load environment variables from a `.env` file.

## Features

- User registration and login with hashed passwords.
- View products from the catalog.
- Add items to the shopping cart.
- Update item quantities in the cart.
- Delete items from the cart.
- Display total cost of items in the cart.
- Responsive layout with EJS templating.

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB URI and session secret:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage

- **Homepage**: Displays the login page.
- **Register**: Navigate to `/register` to create a new account.
- **Contact Page**: Navigate to `/contact` for contact information.
- **About Page**: Navigate to `/about` for information about the application.
- **Product Page**: Navigate to `/products` to view and add products to your cart.
- **Cart Page**: Navigate to `/cart` to view items in your cart and proceed to checkout.

## Routes

| Route                | Method | Description                                       |
|----------------------|--------|---------------------------------------------------|
| `/`                  | GET    | Displays the login page.                         |
| `/login`             | GET    | Displays the login page.                         |
| `/register`          | GET    | Displays the registration page.                  |
| `/contact`           | GET    | Displays the contact page.                       |
| `/about`             | GET    | Displays the about page.                         |
| `/products`          | GET    | Displays the products page with items.          |
| `/add`               | POST   | Adds an item to the cart.                       |
| `/cart`              | GET    | Displays the cart with added items.             |
| `/change`            | POST   | Updates the quantity of an item in the cart.    |
| `/delete:code`      | GET    | Deletes an item from the cart based on its code. |

## Database Models

- **User**: Represents a user with `userid` and `password`.
- **Catalog**: Represents a product in the catalog with `code`, `name`, `description`, `price`, and `quantity`.
- **Cart**: Represents an item in a user's cart with `userid`, `code`, `name`, `price`, and `quantity`.

## License

This project is licensed under the Donald Witherspoon

