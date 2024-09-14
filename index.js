// Import the required modules
require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create an instance of an Express application
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");

// Define the port the server will listen on
const PORT = process.env.PORT || 3001;

// Define a route to render the EJS file
app.get("/", (req, res) => {
  res.render("index"); // Renders the "index.ejs" file located in the "views" folder
});

app.post("/checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Node.Js and Express Book",
          },
          unit_amount: 50 * 100,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Javascript - T Shirt",
          },
          unit_amount: 20 * 100,
        },
        quantity: 2,
      },
    ],
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["US", "BR", "AE", "IN"],
    },
    //success_url: `${process.env.BASE_URL}/complete`,
    //cancel_url: `${process.env.BASE_URL}/cancel`,

    success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
  });
  //console.log(session);

  res.redirect(session.url);
});

app.get("/complete", async (req, res) => {
  const result = Promise.all([
    stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: [`payment_intent.payment_method`],
    }),
    stripe.checkout.sessions.listLineItems(req.query.session_id),
  ]);
  
  console.log(JSON.stringify(await result));

  res.send("Your payment was successful");
});

app.get("/cancel", (req, res) => {
  //res.send('Your payment was cancelled');
  res.redirect("/");
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
