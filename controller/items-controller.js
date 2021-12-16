const express = require("express");

const router = express.Router();
const itemsService = require("../services/items-service");
const {
  authenticateUser,
  isLoggedIn,
  isOwnerOfItem,
} = require("../middleware/auth");

function catchError(fn) {
  return async function (req, res) {
    try {
      await fn(req, res);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send({ message: "Internal server error" });
    }
  };
}

router.get(
  "/",
  authenticateUser,
  isLoggedIn,
  catchError(async (req, res) => {
    res.send(await itemsService.getAllItems(req.user.id));
  })
);

router.post(
  "/",
  authenticateUser,
  isLoggedIn,
  isOwnerOfItem,
  catchError(async (req, res) => {
    const newItem = await itemsService.createItem(req.body,req.user.id);

    if (!newItem) {
      res.status(400).send({ message: "Invalid item data" });
      return;
    }
    res.status(201).send(newItem);
  })
);

router.get(
  "/:id",
  authenticateUser,
  isLoggedIn,
  isOwnerOfItem,
  catchError(async (req, res) => {
    const item = await itemsService.getItemById(Number(req.params.id),req.user.id);
    if (!item) {
      res.status(404).send({ message: "Item not found" });
      return;
    }

    res.send(item);
  })
);

router.delete(
  "/:id",
  authenticateUser,
  isLoggedIn,
  isOwnerOfItem,
  catchError(async (req, res) => {
    const item = await itemsService.deleteItem(Number(req.params.id,req.user.id));
    if (!item) {
      res.status(404).send({ message: "Item not found to delete" });
      return;
    }

    res.send(item);
  })
);

router.put(
  "/:id",
  authenticateUser,
  isLoggedIn,
  isOwnerOfItem,
  catchError(async (req, res) => {
    const updateItem = await itemsService.updateItemById(
      Number(req.params.id),
      req.body,
      req.user.id
    );
    if (!updateItem) {
      res.status(404).send({ message: "Item not found to update" });
      return;
    }

    res.status(201).send(updateItem);
  })
);

module.exports = router;
