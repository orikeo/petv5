import { Router } from "express"
import { authGuard } from "../../../middlewares/auth.middleware"

import {
  createFuelLog,
  getFuelLogs,
  deleteFuelLog
} from "./fuel.controller"

export const fuelRouter = Router()

fuelRouter.post("/", authGuard, createFuelLog)

fuelRouter.get("/car/:carId", authGuard, getFuelLogs)

fuelRouter.delete("/:id", authGuard, deleteFuelLog)