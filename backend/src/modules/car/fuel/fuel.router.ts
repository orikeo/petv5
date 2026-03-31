import { Router } from "express";
import { fuelController } from "./fuel.controller";
import { authGuard } from "../../../middlewares/auth.middleware";

export const fuelRouter = Router();

fuelRouter.post("/", authGuard, fuelController.create);

fuelRouter.get("/car/:carId/stats", authGuard, fuelController.getStatsByCar);
fuelRouter.get("/car/:carId", authGuard, fuelController.getByCar);

fuelRouter.patch("/:id", authGuard, fuelController.update);
fuelRouter.delete("/:id", authGuard, fuelController.delete);