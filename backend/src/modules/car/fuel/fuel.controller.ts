import { Request, Response } from "express";
import { fuelService } from "./fuel.service";

class FuelController {
  create = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const body = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const fuelLog = await fuelService.create(userId, body);

      return res.status(201).json(fuelLog);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  getByCar = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { carId } = req.params as { carId: string };

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const fuelLogs = await fuelService.getByCar(userId, carId);

      return res.status(200).json(fuelLogs);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  getStatsByCar = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { carId } = req.params as { carId: string };

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const stats = await fuelService.getStatsByCar(userId, carId);

      return res.status(200).json(stats);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params as { id: string };
      const body = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const updated = await fuelService.update(userId, id, body);

      return res.status(200).json(updated);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params as { id: string };

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      await fuelService.delete(userId, id);

      return res.status(200).json({ message: "Запись удалена" });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  private handleError(error: unknown, res: Response) {
    console.error(error);

    if (error instanceof Error) {
      const message = error.message;

      if (
        message === "Не авторизован"
      ) {
        return res.status(401).json({ message });
      }

      if (
        message === "Машина не найдена" ||
        message === "Запись о заправке не найдена"
      ) {
        return res.status(404).json({ message });
      }

      if (message === "Нет доступа к этой машине") {
        return res.status(403).json({ message });
      }

      return res.status(400).json({ message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}

export const fuelController = new FuelController();