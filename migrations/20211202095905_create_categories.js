exports.up = function (knex) {
  return knex.schema.createTable("categories", (table) => {
    table.increments();
    table.string("name").notNullable();
    table.timestamps();

    table.integer("epic_id").unsigned().notNullable().references("epics.id").onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("categories");
};
