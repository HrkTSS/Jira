const knex = require("../db");
const epicsService = require("../services/epics-service");
//js doc

async function queryCategories(id) {
  const categories = await knex("categories")
    .select("categories.*")
    .leftJoin("epics", "epics.id", "=", "categories.epic_id")
    .where("epics.owner_id", id);

  for (let category of categories) {
    category.epic = await epicsService.getByEpicId(category.epic_id);
    // category.epics = await knex("epics")
    //   .select()
    //   .where({ id: category.epic_id, owner_id: id })
    //   .first();
    category.item = await knex("items")
      .select()
      .where("category_id", category.id);
  }
  return categories;
}

async function getAllCategories(id) {
  // return await queryCategories(id);
  const categories = await knex("categories")
    .select("categories.*")
    .leftJoin("epics", "epics.id", "=", "categories.epic_id")
    .where("epics.owner_id", id);

  for (let category of categories) {
    category.epic = await epicsService.getByEpicId(category.epic_id);
    category.item = await knex("items")
      .select()
      .where("category_id", category.id);
  }
  return categories;
}

async function createCategory(category) {
  const epicId = category.epic_id;
  const epic = await epicsService.getByEpicId(epicId);
  if (!epic) {
    return null;
  }

  category.created_at = new Date();
  category.updated_at = new Date();

  console.log(await knex("categories").insert(category));
  const [id] = await knex("categories").insert(category);
  category.id = id;
  return category;
}

async function getByCategoryId(id) {
  const category = await knex("categories").select("*").where("id", id).first();
  if (category) {
    category.epic = await epicsService.getByEpicId(category.epic_id);
    category.item = await knex("items")
      .select()
      .where("category_id", category.id);
  }
  return category;
}

async function updateByCategoryId(id, categoryInput) {
  const category = await getByCategoryId(id);

  if (!category) {
    return null;
  }

  categoryInput.updated_at = new Date();

  await knex("categories").where("id", id).update(categoryInput);
  return getByCategoryId(id);
}

async function deleteCategory(id) {
  const category = await getByCategoryId(id);

  if (!category) {
    return null;
  }

  await knex("categories").del().where("id", id);
  return category;
}

module.exports = {
  createCategory,
  getAllCategories,
  getByCategoryId,
  updateByCategoryId,
  deleteCategory,
};
