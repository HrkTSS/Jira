const express = require("express");
const morgan = require("morgan");
const session = require("express-session");

const epicsRouter = require("./controller/epics-controller");
const categoriesRouter = require("./controller/categories-controller");
const itemsRouter = require("./controller/items-controller");
const usersRouter = require("./controller/users-controller");

const app = express();
// app.use();

app.use(morgan("combined"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 600000 },
  })
);

app.use(async function (req, res, next) {
  try {
    await next();
  } catch (err) {
    console.error("Something went wrong:", err);
    res.status(500).send({ message: "Internal server error" });
  }
});
app.use(express.json());

app.use("/api/v1/epics", epicsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/auth", usersRouter);

const count = {};

app.get("/hello", (req, res) => {
  const uid = req.cookies.uid;
  if (uid) {
    count[uid] = count[uid] + 1 || 1;
  } else {
    uid = Math.random().toString(36);
    res.cookie("uid", uid);
  }
  res.send({ message: "World", count: count[uid], uid });
});

app.listen(3000);
