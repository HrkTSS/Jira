const knex = require("../db");

async function createUser(user) {
  const [id] = await knex("users").insert(user);
  user.id = id;
  return user;
}

async function loginUser(username, password) {
  const user = await knex("users")
    .select()
    .where({ username, password })
    .first();
  return user;
}

module.exports = { createUser,loginUser };
