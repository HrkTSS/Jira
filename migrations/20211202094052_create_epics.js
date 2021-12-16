exports.up = function (knex) {
  return knex.schema.createTable("epics", (table) => {
    table.increments();
    table.string("name").notNullable().unique();
    table.timestamps();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("epics");
};
