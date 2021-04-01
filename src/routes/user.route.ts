import {
  NextFunction, Request, Response, Router,
} from 'express';
import passport from 'passport';
import { IRoute } from '../interfaces';
import { ResourceUserControler } from '../controller';
// import {uploadFileMiddleware } from '../middlewares';
import multer from 'multer';
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
      multer().single('file'),
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
    );
    this.router.get(
      `/img${this.pathIdParam}`,
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .getImg(req, res, next)
    )

    this.router.get(
      '/images',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .getImages(req, res, next)
    );
    
    this.router.get(
      '/videos',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
      .getVideos(req, res, next)
    );
    this.router.get(
      `/loadvideo/:id/:ud`,
      // passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
      .loadVideo(req, res, next)
    );
    this.router.post(
      '/folder',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
        .downloadFolder(req, res, next)
    );

    this.router.delete(
      '/folder',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
       .removeFolder(req, res, next)
    );

    this.router.put(
      '/folder',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
       .changeNameFolder(req, res, next)
    )
    this.router.post(
      '/share',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
      .shareFile(req, res, next)
    );
    this.router.put(
      '/share',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
      .unShareFile(req, res, next)
    );
    this.router.get(
      '/users',
      passport.authenticate('jwt',{session:false}),
      (req: Request, res: Response, next: NextFunction) => ResourceUserControler
      .getUsersToShare(req, res, next)
    );
    
  }
}
export default new ExampleRouter().router;
