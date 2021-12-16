const knex = require("../db");

const categoriesService = require("../services/categories-service");
const epicsService = require("../services/epics-service");

async function queryItems(condition) {
  const query = knex("items")
    .select({
      id: "items.id",
      name: "items.name",
      created_at: "items.created_at",
      updated_at: "items.updated_at",
      category_id: "categories.id",
      category_name: "categories.name",
      category_created_at: "categories.created_at",
      category_updated_at: "categories.updated_at",
    })
    .join("categories", "categories.id", "=", "items.category_id");

  if (!condition) {
    return await query;
  } else {
    return await query.where(condition).first();
  }
}

async function getAllItems(id) {
  const items = await knex("items")
    .select("items.*")
    .leftJoin("categories", "categories.id", "=", "items.category_id")
    .leftJoin("epics", "epics.id", "=", "categories.epic_id")
    .where("epics.owner_id", id);

  for (let item of items) {
    item.categories = await categoriesService.getByCategoryId(item.category_id);
    delete item.categories.item;
  }
  return items;
  // const items = await queryItems();
  // const results = [];

  // for (let item of items) {
  //   results.push({
  //     id: item.id,
  //     name: item.name,
  //     created_at: new Date(item.created_at),
  //     updated_at: new Date(item.updated_at),
  //     category: {
  //       id: item.category_id,
  //       name: item.category_name,
  //       created_at: new Date(item.category_created_at),
  //       updated_at: new Date(item.category_updated_at),
  //     },
  //   });
  // }

  // return results;
}

async function createItem(item,userId) {
  const categoryId = item.category_id;
  const category = await categoriesService.getByCategoryId(categoryId);

  if (!category) {
    return null;
  }

  item.created_at = new Date();
  item.updated_at = new Date();

  const [id] = await knex("items").insert(item);
  return await getItemById(id,userId);
}

async function getItemById(id, userId) {
  const item = await knex("items")
    .select("items.*")
    .leftJoin("categories","items.category_id" , "=", "categories.id")
    .leftJoin("epics","categories.epic_id", "=",  "epics.id")
    .where({ "items.id": id, "epics.owner_id": userId })
    .first();

  if (!item) {
    return null;
  }

  item.categories = await categoriesService.getByCategoryId(item.category_id);
  delete item.categories.item;

  return item;
  // const item = await queryItems({ "items.id": id });

  // if (!item) {
  //   return null;
  // }
  // return {
  //   id: item.id,
  //   name: item.name,
  //   created_at: new Date(item.created_at),
  //   updated_at: new Date(item.updated_at),
  //   category: {
  //     id: item.category_id,
  //     name: item.category_name,
  //     created_at: new Date(item.category_created_at),
  //     updated_at: new Date(item.category_updated_at),
  //   },
  // };
}

async function deleteItem(id,userId) {
  const item = await getItemById(id,userId);
  if (!item) {
    return null;
  }

  await knex("items").del().where("id", id);
  return item;
}

async function updateItemById(id, inputItem,userId) {
  const item = await getItemById(id,userId);
  const updateItem = {
    name: inputItem.name,
    category_id: inputItem.category_id,
  };

  if (!item) {
    return null;
  }

  item.updated_at = new Date();
  await knex("items").update(updateItem).where("id", id);
  return getItemById(id,userId);
}

module.exports = {
  getAllItems,
  createItem,
  getItemById,
  deleteItem,
  updateItemById,
};
