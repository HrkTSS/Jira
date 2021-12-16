const knex = require("../db");

async function queryEpics(condition) {
  let epics;
  if (!condition) {
    epics = await knex("epics").select();
  } else {
    epics = await knex("epics").select().where(condition);
  }
  for (let epic of epics) {
    epic.categories = await knex("categories")
      .select()
      .where({"epic_id":epic.id});
    for (let category of epic.categories) {
      epic.categories.items = await knex("items")
        .select()
        .where("category_id", category.id);
    }
  }
  return epics;
}

async function getAllEpics(id) {
  return await queryEpics({"owner_id":id});
  
}

async function createEpic(epicName, user) {
  const newEpic = { name: epicName, created_at: new Date(), owner_id: user.id };
  const insertedIds = await knex.insert(newEpic).into("epics");
  newEpic.id = insertedIds[0];

  return newEpic;
}

async function getByEpicId(epicId) {
  return knex.select("*").from("epics").where({"id":epicId}).first();
}

async function deleteEpic(id) {
  const epic = await getByEpicId(id);
  if (!epic) {
    return null;
  }
  await knex("epics").del().where("id", id);
  return epic;
}

async function updateById(id, epicName) {
  const epic = await getByEpicId(id);
  if (!epic) {
    return null;
  }

  const result = await knex("epics")
    .update({ name: epicName, updated_at: new Date() })
    .where("id", id);
  return getByEpicId(id);
}

module.exports = {
  getAllEpics,
  createEpic,
  getByEpicId,
  deleteEpic,
  updateById,
};
