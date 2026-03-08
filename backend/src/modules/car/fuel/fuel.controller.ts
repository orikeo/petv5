import { Request, Response } from "express"
import { fuelService } from "./fuel.service"

export const createFuelLog = async (req: Request, res: Response) => {

  if (!req.user) throw new Error("Unauthorized")

  const data = await fuelService.create(req.body)

  res.status(201).json(data)

}

export const getFuelLogs = async (req: Request, res: Response) => {

  if (!req.user) throw new Error("Unauthorized")

  const carId = req.params.carId as string

  const items = await fuelService.getByCar(carId)

  res.json(items)

}

export const deleteFuelLog = async (req: Request, res: Response) => {

  if (!req.user) throw new Error("Unauthorized")

  const id = req.params.id as string

  await fuelService.delete(id)

  res.status(204).send()

}