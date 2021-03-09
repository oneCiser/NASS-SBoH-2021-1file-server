import {
  NextFunction, Request, Response, Router,
} from 'express';
import passport from 'passport';
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
    this.router.post(
      '/upload',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .uploadFile(req, res, next),
    );

    this.router.post(
      '/move',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .moveFile(req, res, next)
    );

    this.router.get(
      '/files',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .getAllFiles(req, res, next)
    );

    this.router.post(
      '/remove',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .removeFileById(req, res, next)
    );

    this.router.get(
      `/download${this.pathIdParam}`,
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .downloadFile(req, res, next)
    )

    this.router.get(
      '/images',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .getImages(req, res, next)
    );
    
  }
}
export default new ExampleRouter().router;
