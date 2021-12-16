const knex = require("../db");

function authorizeRequest(req, res, next) {
  if (req.headers.authorization) {
    const userName = req.headers.authorization;
    if (userName === "admin") {
      next();
      return;
    }
  }
  res.send(401).send({ message: "Unauthorized" });
}

async function basicAuthenticUser(req, res, next) {
  const userInfo = req.headers.authorization;
  if (!userInfo) {
    return next();
  }
  const credentials = userInfo.split(" ")[1];
  if (credentials) {
    const decoded = Buffer.from(credentials, "base64").toString();
    const [username, password] = decoded.split(":");
    console.log(username, password);
    if (username) {
      const user = await knex("users")
        .select()
        .where("username", username)
        .first();
      if (user && user.password === password) {
        req.user = user;
      }
    }
  }
  next();
}

async function authenticateUser(req, res, next) {
  const userInfo = req.headers.authorization;
  if (!userInfo) {
    next();
    return;
  }
  const credentials = userInfo.split(" ")[1];

  if (credentials) {
    const decoded = Buffer.from(credentials, "base64").toString();
    const [username, password] = decoded.split(":");
  }

  if (username) {
    const user = await knex("users")
      .select()
      .where("username", username)
      .first();

    if (user.password === password) {
      req.user = user;
    }
  }
  next();
}

async function isLoggedIn(req, res, next) {
  req.user = req.user || req.session.user;
  if (req.user) {
    next();
    return;
  }

  res.status(401).send({ message: "User unauthorized" });
}

async function isOwnerOfEpic(req, res, next) {
  const epicId = Number(req.body.epic_id ? req.body.epic_id : req.params.id);

  const epic = await knex("epics")
    .select("id", "owner_id")
    .where({ id: epicId, owner_id: req.user.id })
    .first();

  if (epic) {
    next();
    return;
  }

  res.status(401).send({ message: "Permission denied" });
}

async function isOwnerOfCategory(req, res, next) {
  const epicId = req.body.epic_id;
  const categoryId = req.body.category_id || req.params.id;

  if (epicId) {
    const epic = await knex("epics")
      .select("id", "owner_id")
      .where({ id: epicId, owner_id: req.user.id })
      .first();

    if (epic) {
      next();
      return;
    } else res.status(401).send({ message: "Permission denied" });
  }

  if (categoryId) {
    const ownerId = await knex("categories")
      .leftJoin("epics", "categories.epic_id", "=", "epics.id")
      .select("epics.owner_id")
      .where({ "categories.id": categoryId, "epics.owner_id": req.user.id })
      .first();

    if (ownerId) {
      next();
      return;
    }
  }
  res.status(401).send({ message: "Permission denied" });
}

async function isOwnerOfItem(req, res, next) {
  const categoryId = req.body.category_id;
  const itemId = req.params.id;
  if (categoryId) {
    const ownerId = await knex("categories")
      .leftJoin("epics", "categories.epic_id", "=", "epics.id")
      .select("epics.owner_id")
      .where({ "categories.id": categoryId, "epics.owner_id": req.user.id })
      .first();
    if (ownerId) {
      next();
      return;
    } else res.status(401).send({ message: "Permission denied" });
  }
  if (itemId) {
    const ownerId = await knex("items")
      .leftJoin("categories", "items.category_id", "=", "categories.id")
      .leftJoin("epics", "categories.epic_id", "=", "epics.id")
      .select("epics.owner_id")
      .where({ "items.id": itemId, "epics.owner_id": req.user.id })
      .first();

    if (ownerId) {
      next();
      return;
    }
  }
  res.status(401).send({ message: "Permission denied" });
}

module.exports = {
  authorizeRequest,
  authenticateUser: basicAuthenticUser,
  isLoggedIn,
  isOwnerOfEpic,
  isOwnerOfCategory,
  isOwnerOfItem
};
