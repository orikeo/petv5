import { Router } from "express";
import { authGuard } from "../../middlewares/auth.middleware";
import { dailyCheckController } from "./daily-check.controller";

export const dailyCheckRouter = Router();

dailyCheckRouter.use(authGuard);

dailyCheckRouter.get("/items", dailyCheckController.getItems);
dailyCheckRouter.post("/items", dailyCheckController.createItem);
dailyCheckRouter.patch("/items/:id", dailyCheckController.updateItem);
dailyCheckRouter.delete("/items/:id", dailyCheckController.deleteItem);

dailyCheckRouter.get("/day", dailyCheckController.getDay);
dailyCheckRouter.put("/day", dailyCheckController.saveDay);
dailyCheckRouter.get("/range", dailyCheckController.getRange);