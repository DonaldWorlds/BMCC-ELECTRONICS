const getJSONString = function (obj) {
  return JSON.stringify(obj, null, 2);
};

const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();



// Load environment variables from .env file
require('dotenv').config();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//const cookieParser = require("cookie-parser");
const session = require("express-session");
//const flash = require('connect-flash');


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
//app.use(cookieParser());

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

//the user Schema
var loginSchema = new mongoose.Schema({
  userid: String,
  password: String,
});

//The catalog.json Schema
var catalogSchema = mongoose.Schema({
  code: String,
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  image: String,
});

var cartSchema = new mongoose.Schema({
  userid: String,
  code: String,
  name: String,
  price: Number,
  quantity: Number,
});

mongoose.pluralize(null);

//The users model
var User = mongoose.model("login", loginSchema);

//The products model
var Catalog = mongoose.model("catalog", catalogSchema);

//For the cart model
var Cart = mongoose.model("cart", cartSchema);

//This is for the login
app.use((req, res, next) => {
  console.log(`request made to: ${req.url}`);
  next();
});


app.get("/", (req, res) => {
  res.render("login.ejs", { message: "", flag: "" });
});


//get the login
app.get("/login", function (req, res) {
  res.render("login.ejs", { message: "", flag: "" });
});



app.get("/register", (req, res) => {
  res.render("registration.ejs", { message: "", flag: "" });
});

app.get("/contact", (req,res)=>{
  res.render("contact.ejs", {message: "", flag: ""});
});

app.get("/about", (req,res)=>{
  res.render("about.ejs", {message: "", flag: ""});
});

app.get("/sony", (req,res)=>{
  res.render("sony.ejs", {message: "", flag: ""});
});

app.get("/lgtv", (req,res) =>{
  res.render("lgtv.ejs",{message:"",flag:""});
});



//post to the database send the post so you can requestto get the data
app.post("/register", (req, res) => {
  const { userid, password, password2 } = req.body;

  // Check if passwords match
  if (password !== password2) {
    return res.render("registration.ejs", {
      message: "Passwords do not match",
      flag: "",
    });
  }

  // Check if the user already exists
  User.findOne({ userid })
    .then((existingUser) => {
      if (existingUser) {
        return res.render("registration.ejs", {
          message: "User already exists",
          flag: "",
        });
      }

      // Hash the password and save the user
      bcrypt.hash(password, 5, function (err, hashpass) {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).send("Internal Server Error");
        }

        req.body.password = hashpass;
        var newUser = new User(req.body);
        newUser
          .save()
          .then(() => {
            console.log("User saved successfully");
            res.render("login", {
              message: "Registration Successful",
              flag: "",
            });
          })
          .catch((saveErr) => {
            console.error("Error saving user:", saveErr);
            res.status(500).send("Internal Server Error");
          });
      });
    })
    .catch((err) => {
      console.error("Error checking existing user:", err);
      res.status(500).send("Internal Server Error");
    });
});

//post to the database send
////send the data post/send the request to retrive the data
app.post("/login", (req, res) => {
  const enteredUserid = req.body.userid.trim(); // Trim leading/trailing whitespaces

  User.findOne({ userid: enteredUserid }, "")
    .then((data) => {
      console.log("Entered Userid:", enteredUserid);
      console.log("Data from Database:", data);
      if (data == null) {
        res.render("login", { message: "Invalid Userid", flag: "" });
      } else {
        bcrypt
          .compare(req.body.password, data.password)
          .then((result) => {
            if (result) {
              req.session.userid = req.body.userid;
              req.session["flag"] = "1";
              res.redirect("/products");
            } else {
              res.render("login", { message: "Invalid Password", flag: "" });
            }
          })
          .catch((err) => {
            console.error(err); // Log the error for further investigation
            res.status(500).send("Internal Server Error");
          });
      }
    })
    .catch((err) => {
      console.error(err); // Log the error for further investigation
      res.status(500).send("Internal Server Error");
    });
});

 app.get("/products", async (req, res) => {
  try {
    // Check if the user is logged in (session flag is "1")
    if (req.session.flag !== "1") {
      // If not logged in, render the login page with a session expired message
      return res.render("login", { message: "Session Expired", flag: "" });
    }

    // Fetch data from the "Catalog" collection using Mongoose
    const data = await Catalog.find({});

    // Check if there are no items in the catalog
    if (data.length === 0) {
      // If catalog is empty, display a message and a link to go back to shopping
      const cart = "CART EMPTY<br><a href='/products'>Back To Shopping</a>";
      return res.render("products.ejs", {
        cart: cart,
        catalog: "",
        message: "",
        flag: "1",
      });
    }

    // Build the catalog HTML string by iterating over each item in the data array
    let catalog = "";

    for (let i = 0; i < data.length; i++) {
      // Construct the HTML for each catalog
      catalog += `
          <div style="border:solid green 1px;background:#FFFFFF;float:left">
          <span class="left"><a href="/"><img src="/${data[i].image}" style="width:200px" alt="example graphic" /></a></span>
          <div class="title">${data[i].name}</div>
          <p>
          ${data[i].description}<a href="/lgtv">More...</a>
          <span style="float:right;text-align:left;padding:.5em;">
          <a href="#" onclick="addItem('${data[i].code}','${data[i].name}',${data[i].price});">Add to Cart</a> &nbsp;&nbsp;<a href="cart">GOTO CART!</a>
          </span>
          </p>
          </div>
          <p>&nbsp</p>`;
    }

    // Render the "products.ejs" view with the constructed catalog HTML and other parameters
    res.render("products.ejs", { catalog: catalog, message: "", flag: "1" });
  } catch (error) {
    // Handle errors - log the error and send a 500 Internal Server Error response
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  const item2find = {
    code: req.body.code,
    userid: req.session.userid,
  };

  try {
    const data = await Cart.findOne(item2find);

    if (!data) {
      const item = {
        userid: req.session.userid,
        code: req.body.code,
        name: req.body.name,
        quantity: req.body.quantity,
        price: req.body.price,
      };

      console.log(getJSONString(item));

      const newItem = new Cart(item);
      await newItem.save();
    } else {
      const item2update = {
        code: req.body.code,
        userid: req.session.userid,
      };

      await Cart.updateOne(item2update, { $inc: { quantity: 1 } });
      console.log("RECORD UPDATED");
    }

    res.redirect("/products");
  } catch (err) {
    console.error("Error:", err);
    // Handle the error, e.g., send an error response
    res.status(500).send("Internal Server Error");
  }
});

app.get("/cart", async (req, res) => {
  console.log("body=" + getJSONString(req.body));
  var msg = "No MSG";
  var flag = 0;
  var message = "";
  const item2find = {
    userid: req.session.userid,
  };

  try {
    const data = await Cart.find(item2find);

    var cart = "";
    if (data == "") console.log("EMPTY");
    console.log("flag=" + flag);

    if (data == "") {
      var cart = "CART EMPTY<br><a href='/products'>Back To Shopping</a>";
      res.render("cart.ejs", {
        cart: cart,
        flag: req.session.flag,
        message: "",
      });
    } else {
      let total = 0;
      cart =
        "<div class='cart'> <table style='background-color:white'><tr><th>ITEM</th><th>NAME</th><th>QTY</th><th>PRICE</th><th>SUBTOTAL</th></tr>";
      for (var i = 0; i < data.length; i++) {
        var image = "apple.jpg";
        cart +=
          "<tr><td><img style='width:60px' src='images/" +
          image +
          "' /></td><td>" +
          data[i].name +
          "</td><td><div style='vertical-align: middle;'><form style='float:left' method=post action='/change'><input style='float:left' type=hidden name=code value='" +
          data[i].code +
          "' /><input size=1 type=text name=quantity style='float:left' value='" +
          data[i].quantity +
          "' /><input type=submit value=Update /></form>" +
          "<a href='/delete:" +
          data[i].code +
          "' style='float:left'><img src='images/x.png' style='width:20px;float:left'/></a></div></td><td class='right'>$" +
          data[i].price.toFixed(2) +
          "</td><td class='right'>$" +
          (parseFloat(data[i].price) * parseInt(data[i].quantity)).toFixed(2) +
          "</td></tr>";
        total =
          total + parseFloat(data[i].quantity * parseFloat(data[i].price));
      }
      cart +=
        "<tr><td colspan=4>GRAND TOTAL:</td><td class='right'>$" +
        total.toFixed(2) +
        "</td></tr>";
      cart += "</table></div>";
      cart += "<a href='checkout'> CHECKOUT </a>";

      res.render("cart.ejs", {cart: cart,flag: req.session.flag,message: "",
      });
    }
  } catch (err) {
    console.error("Error:", err);
    // Handle the error, e.g., send an error response
    res.status(500).send("Internal Server Error");
  }
});


app.post("/change", async (req, res) => {
  try {
    const item2find = {
      code: req.body.code,
      userid: req.session.userid,
    };

    const qty = parseInt(req.body.quantity);

    if (qty <= 0) {
      await Cart.findOneAndDelete(item2find);
      console.log("Successful deletion");
    } else {
      const item2update = {
        code: req.body.code,
        userid: req.session.userid,
      };

      const update = {
        quantity: req.body.quantity,
      };

      await Cart.updateOne(item2update, update);
      console.log("Record updated");
    }

    res.redirect('/cart');
  } catch (err) {
    console.error("Error:", err);
    // Handle the error, e.g., send an error response
    res.status(500).send("Internal Server Error");
  }
});

app.get("/delete:code", async (req, res) => {
  try {
    const item2find = {
      code: req.params.code.substring(1),
      userid: req.session.userid,
    };

    // Log the value of req.params.code
    console.log("param=" + req.params.code);

    // Use await to wait for the asynchronous findOneAndDelete operation
    await Cart.findOneAndDelete(item2find);

    console.log("Successful deletion");
    res.redirect('/cart');
  } catch (err) {
    console.error("Error:", err);
    // Handle the error, e.g., send an error response
    res.status(500).send("Internal Server Error");
  }
});



/* app.get("/checkout", (req, res) => {
  const item = {
    userid: req.session.userid,
    code: req.body.code,
  };

  // Assuming your Cart model has an 'age' field
  const condition = {
    age: { $gte: 15 },
    // Add other conditions if needed
  };

  Cart.deleteMany(condition)
    .then(() => {
      console.log("Items in the cart deleted successfully");
      res.render("checkout.ejs", { message: "", flag: "" });
    })
    .catch((error) => {
      console.error("Error deleting items in the cart:", error);
      res.render("checkout.ejs", { message: "Error during checkout", flag: "error" });
    });
}); */

app.get("/checkout", (req, res) => {
  const condition = {
    userid: req.session.userid,
    // Add other conditions if needed
  };
  Cart.deleteMany(condition)
    .then(() => {
      console.log("Cart for user deleted successfully");
      res.render("checkout.ejs", { message: "", flag: "" });
    })
    .catch((error) => {
      console.error("Error deleting cart for user:", error);
      res.render("checkout.ejs", { message: "Error during checkout", flag: "error" });
    });
});


app.get("/logoff", async (req, res) => {
  try {
    if (req.session.flag === "1") {
      // Clear the session variables
      req.session.userid = null;
      req.session.flag = null;

      // Render the login page with a success message
      return res.render("login.ejs", { message: "Logout Successful", flag: "" });
    } else {
      // If the user is not logged in, render the login page with a message
      return res.render("login.ejs", { message: "Must Login First", flag: "" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});



app.listen(3000, function () {
  console.log("server is listening!!!");
});
