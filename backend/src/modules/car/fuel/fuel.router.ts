import { Router } from "express";
import { fuelController } from "./fuel.controller";

/**
 * предполагается, что у тебя уже есть middleware auth
 * который добавляет req.user
 */
import { authGuard } from "../../../middlewares/auth.middleware";

const fuelRouter = Router();

/**
 * =========================================================
 * ROUTES
 * =========================================================
 */

/**
 * создать заправку
 */
fuelRouter.post("/", authGuard, fuelController.create);

/**
 * получить все заправки по машине
 */
fuelRouter.get("/car/:carId", authGuard, fuelController.getByCar);

/**
 * обновить
 */
fuelRouter.patch("/:id", authGuard, fuelController.update);

/**
 * удалить
 */
fuelRouter.delete("/:id", authGuard, fuelController.delete);

export default fuelRouter;