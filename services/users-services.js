const knex = require("../db");
const bcrypt = require("bcrypt");

async function createUser(user) {
  user.created_at = new Date();
  user.updated_at = new Date();
  const [id] = await knex("users").insert(user);
  user.id = id;
  return user;
}

async function loginUser(username, password) {
  const user = await knex("users").select().where({ username }).first();

  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return null;
}

module.exports = { createUser, loginUser };
