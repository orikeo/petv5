import { Request, Response } from "express";
import { fuelService } from "./fuel.service";

class FuelController {
  /**
   * =========================================================
   * CREATE
   * =========================================================
   */
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

  /**
   * =========================================================
   * GET BY CAR
   * =========================================================
   */
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

  /**
   * =========================================================
   * UPDATE
   * =========================================================
   */
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

  /**
   * =========================================================
   * DELETE
   * =========================================================
   */
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

  /**
   * =========================================================
   * ERROR HANDLER
   * =========================================================
   */
  private handleError(error: unknown, res: Response) {
    console.error(error);

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}

export const fuelController = new FuelController();