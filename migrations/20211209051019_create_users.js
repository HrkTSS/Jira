exports.up = function (knex) {
  return knex.schema.createTable("users", (t) => {
    t.increments();
    t.string("username").notNullable().unique();
    t.string("password").notNullable()
    t.timestamps();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
