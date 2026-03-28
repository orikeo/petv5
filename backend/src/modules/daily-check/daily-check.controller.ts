import { AppError } from "../../errors/app-error";
import { Request, Response } from "express";
import { dailyCheckService } from "./daily-check.service";
import {
  CreateDailyCheckItemDto,
  SaveDayDto,
  UpdateDailyCheckItemDto,
} from "./daily-check.types";

class DailyCheckController {
  private getUserId(req: Request) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    return userId;
  }

  getItems = async (req: Request, res: Response) => {
    const items = await dailyCheckService.getItems(this.getUserId(req));
    res.json(items);
  };

  createItem = async (
    req: Request<{}, {}, CreateDailyCheckItemDto>,
    res: Response
  ) => {
    const item = await dailyCheckService.createItem(this.getUserId(req), req.body);
    res.status(201).json(item);
  };

  updateItem = async (
    req: Request<{ id: string }, {}, UpdateDailyCheckItemDto>,
    res: Response
  ) => {
    const item = await dailyCheckService.updateItem(
      this.getUserId(req),
      req.params.id,
      req.body
    );

    res.json(item);
  };

  deleteItem = async (req: Request<{ id: string }>, res: Response) => {
    await dailyCheckService.deleteItem(this.getUserId(req), req.params.id);
    res.status(204).send();
  };

  getDay = async (
    req: Request<{}, {}, {}, { date?: string }>,
    res: Response
  ) => {
    const date = req.query.date;

    if (!date) {
      throw new AppError("date query param is required", 400);
    }

    const day = await dailyCheckService.getDay(this.getUserId(req), date);
    res.json(day);
  };

  saveDay = async (req: Request<{}, {}, SaveDayDto>, res: Response) => {
    const day = await dailyCheckService.saveDay(this.getUserId(req), req.body);
    res.json(day);
  };

  getRange = async (
    req: Request<{}, {}, {}, { from?: string; to?: string }>,
    res: Response
  ) => {
    const { from, to } = req.query;

    if (!from || !to) {
      throw new AppError("from and to query params are required", 400);
    }

    const result = await dailyCheckService.getRange(this.getUserId(req), from, to);
    res.json(result);
  };
}

export const dailyCheckController = new DailyCheckController();