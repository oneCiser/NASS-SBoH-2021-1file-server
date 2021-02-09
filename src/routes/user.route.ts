import {
  NextFunction, Request, Response, Router,
} from 'express';
import { IRoute } from '../interfaces';
import { ResourceUserControler } from '../controller';
import { isDefinedParamMiddleware, validationMiddleware } from '../middlewares';
import { UserDTO } from '../dtos';

/**
 *
 * Managament the routes of resource
 * @category Routes
 * @class ExampleRouter
 * @implements {IRoute}
 */
class ExampleRouter implements IRoute {
  public router = Router();

  public pathIdParam = '/:id';

  constructor() {
    this.createRoutes();
  }

  createRoutes(): void {
    this.router.get(
      this.pathIdParam,
      isDefinedParamMiddleware(),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .getById(req, res, next),
    );
    this.router.get('/', (req: Request, res: Response, next: NextFunction) => ResourceUserControler
      .list(req, res, next));
    this.router.post(
      '/',
      validationMiddleware(UserDTO),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .create(req, res, next),
    );
    this.router.put(
      this.pathIdParam,
      isDefinedParamMiddleware(),
      validationMiddleware(UserDTO, true),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .updateById(req, res, next),
    );
    this.router.delete(
      this.pathIdParam,
      isDefinedParamMiddleware(),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .removeById(req, res, next),
    );
  }
}
export default new ExampleRouter().router;
