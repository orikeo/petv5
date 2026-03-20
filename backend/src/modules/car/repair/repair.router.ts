import { Router } from "express";
import { repairController } from "./repair.controller";
import { authGuard } from "../../../middlewares/auth.middleware";

 export const repairRouter = Router();


repairRouter.use(authGuard);

repairRouter.get("/types", repairController.getRepairTypes);
repairRouter.post("/types", repairController.createRepairType);

repairRouter.post("/", repairController.createRepair);
repairRouter.get("/car/:carId", repairController.getRepairsByCarId);
repairRouter.get("/:id", repairController.getRepairById);
repairRouter.patch("/:id", repairController.updateRepair);
repairRouter.delete("/:id", repairController.deleteRepair);

