const { default: knex } = require("knex");

exports.up = function (knex) {
  return knex.schema.table("epics", (t) => {
    t.integer("owner_id")
      .unsigned()
      .notNullable()
      .references("users.id")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
return knex.schema.table("epics", (t) => {
  t.dropColumn("owner_id");
});
}
