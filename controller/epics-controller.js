const express = require("express");

const router = express.Router();
const epicsService = require("../services/epics-service");
const {
  authorizeRequest,
  authenticateUser,
  isLoggedIn,
  isOwnerOfEpic,
  jwtAuthentication
} = require("../middleware/auth");

router.get("/", authenticateUser, jwtAuthentication,isLoggedIn, async (req, res) => {
  res.send(await epicsService.getAllEpics(req.user.id));
});

router.post("/", authenticateUser, isLoggedIn, async (req, res) => {
  try {
    const newEpic = await epicsService.createEpic(req.body.name, req.user);
    res.status(201).send(newEpic);
  } catch (err) {
    if (err.errno === 19) {
      res.status(404).send({ error: "Epic name already exists" });
    } else {
      console.error(err);
      res.status(500).send({ message: "Internal server error" });
    }
  }
});

router.get(
  "/:id",
  authenticateUser,
  isLoggedIn,
  isOwnerOfEpic,
  async (req, res) => {
    const epic = await epicsService.getByEpicId(Number(req.params.id));
    console.log(epic)
    if (epic) {
      res.send(epic);
    } else {
      res.status(404).send({ message: "Epic not found" });
    }
  }
);

router.delete(
  "/:id",
  authenticateUser,
  isLoggedIn,
  isOwnerOfEpic,
  async (req, res) => {
    const epic = await epicsService.deleteEpic(req.params.id);
    if (epic) {
      res.send({ message: "Epic deleted successfully" });
    } else {
      res.status(404).send({ message: "Epic not found" });
    }
  }
);

router.put(
  "/:id",
  authenticateUser,
  isLoggedIn,
  isOwnerOfEpic,
  async (req, res) => {
    const updatedEpic = await epicsService.updateById(
      Number(req.params.id),
      req.body.name
    );
    if (updatedEpic) {
      res.send(updatedEpic);
    } else {
      res.status(404).send({ message: "Epic not found to update" });
    }
  }
);

module.exports = router;
