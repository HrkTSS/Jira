const express = require("express");

const router = express.Router();
const categoriesServices = require("../services/categories-service");
const {
  authenticateUser,
  isLoggedIn,
  isOwnerOfEpic,
  isOwnerOfCategory,
} = require("../middleware/auth");
const req = require("express/lib/request");

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
    res.send(await categoriesServices.getAllCategories(req.user.id));
  })
);

router.post(
  "/",
  authenticateUser,
  isLoggedIn,
  isOwnerOfCategory,
  catchError(async (req, res) => {
    try {
      const newCategory = await categoriesServices.createCategory(req.body);
      res.status(201).send(newCategory);
    } catch (err) {
      if (err.errno === 19) {
        res.status(404).send({ message: "Category name already exists" });
      } else {
        res.status(500).send({ message: "Internal sever error on category" });
      }
    }
  })
);

router.get(
  "/:id",
  authenticateUser,
  isLoggedIn,
  isOwnerOfCategory,
  catchError(async (req, res) => {
    const category = await categoriesServices.getByCategoryId(
      Number(req.params.id)
    );
    if (!category) {
      res.status(404).send({ message: "category not found" });
      return;
    }

    category.created_at = new Date(category.created_at);
    res.send(category);
  })
);

router.delete(
  "/:id",
  authenticateUser,
  isLoggedIn,
  isOwnerOfCategory,
  catchError(async (req, res) => {
    const deletedCategory = await categoriesServices.deleteCategory(
      Number(req.params.id)
    );
    if (!deletedCategory) {
      res.status(404).send({ message: "category not found" });
      return;
    }
    res.send(deletedCategory);
  })
);

router.put(
  "/:id",
  authenticateUser,
  isLoggedIn,
  isOwnerOfCategory,
  catchError(async (req, res) => {
    const updatedCategory = await categoriesServices.updateByCategoryId(
      Number(req.params.id),
      req.body
    );

    if (!updatedCategory) {
      res.status(404).send({ message: "Category not found to updated" });
      return;
    }

    res.status(201).send(updatedCategory);
  })
);

module.exports = router;
