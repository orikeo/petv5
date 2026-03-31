import { Request, Response } from "express";
import { repairService } from "./repair.service";

class RepairController {
  createRepair = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const repair = await repairService.createRepair(userId, req.body);

      return res.status(201).json(repair);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  getRepairsByCarId = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { carId } = req.params as { carId: string };

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const repairs = await repairService.getRepairsByCarId(userId, carId);

      return res.status(200).json(repairs);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  getRepairById = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params as { id: string };

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const repair = await repairService.getRepairById(userId, id);

      return res.status(200).json(repair);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  updateRepair = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params as { id: string };

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const repair = await repairService.updateRepair(userId, id, req.body);

      return res.status(200).json(repair);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  deleteRepair = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params as { id: string };

      if (!userId) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      await repairService.deleteRepair(userId, id);

      return res.status(200).json({ message: "Ремонт удалён" });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  getRepairTypes = async (_req: Request, res: Response) => {
    try {
      const repairTypes = await repairService.getRepairTypes();

      return res.status(200).json(repairTypes);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  createRepairType = async (req: Request, res: Response) => {
    try {
      const { name } = req.body as { name: string };

      const repairType = await repairService.createRepairType(name);

      return res.status(201).json(repairType);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  private handleError(error: unknown, res: Response) {
    if (error instanceof Error) {
      const message = error.message;

      if (
        message === "Машина не найдена" ||
        message === "Ремонт не найден" ||
        message === "Тип ремонта не найден"
      ) {
        return res.status(404).json({ message });
      }

      if (
        message === "Нет доступа к этой машине" ||
        message === "Нет доступа к этому ремонту"
      ) {
        return res.status(403).json({ message });
      }

      if (
        message === "Название типа ремонта обязательно" ||
        message === "Такой тип ремонта уже существует" ||
        message === "Дата ремонта обязательна" ||
        message === "Дата ремонта должна быть в формате YYYY-MM-DD" ||
        message === "Некорректная дата ремонта" ||
        message === "Цена ремонта должна быть больше 0" ||
        message === "Пробег должен быть целым числом и не меньше 0"
      ) {
        return res.status(400).json({ message });
      }

      return res.status(400).json({ message });
    }

    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
}

export const repairController = new RepairController();