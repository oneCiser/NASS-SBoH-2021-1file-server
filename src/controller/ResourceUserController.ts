/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { NextFunction, Response, Request, json } from 'express';
import { IUser, IFile, IUploadFile, IPayLoad } from '../interfaces';
import { ResourceUser } from '../models';
import { HttpException } from '../exceptions';
import { ResourceService } from '../services';
import {uploadFileMiddleware} from '../middlewares';
import fs from 'fs';
import archiver from 'archiver';
import {findInArray} from '../utils';
import '../config/dotenv';
import { error } from 'winston';
import { compile } from 'morgan';


/**
 *
 * The controller of resources
 * @category Controllers
 * @class ResourceUserController
 */
class ResourceUserController {
  /**
   *
   * Upload file
   * @static
   * @param {Request} req - The request
   * @param {Response} res - The response
   * @param {NextFunction} next - The next middleware in queue
   * @return {JSON} - return file upload
   * @memberof ResourceUserController
   */
  public static async uploadFile(req: Request, res: Response, next: NextFunction) {
    
    try {
      
      await uploadFileMiddleware(req, res);
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const newFile:IFile = req.body;
      const tmpPath = req.file.destination;
      const {filename} = req.file;
      newFile.name = filename;
      newFile.size = req.file.size;
      const ifExistFile = findInArray(user.directory,newFile);
      let haveSpace = false;
      if(ifExistFile>-1){
        const getExistFile = user.directory[ifExistFile];
        haveSpace = user.haveSpace(Math.abs(newFile.size - getExistFile.size));
      }
      else{
        haveSpace = user.haveSpace(newFile.size);
      }
      if(!haveSpace){
        fs.unlinkSync(`${tmpPath}${filename}`);
        throw new HttpException(400, 'Bad Request');
      }
      const realPath = `${process.env.FILE_STORAGE}/users/${user._id}/${newFile.url}/`;
      const pathExist = fs.existsSync(realPath);
      if(!pathExist) fs.mkdirSync(realPath , {recursive:true});
      fs.rename(`${tmpPath}${filename}`,`${realPath}${filename}`,(error) => {
        if(error) throw new HttpException(400, 'Bad Request');
      });
      if(!newFile) throw new HttpException(400, 'Bad Request');
      const saveFile = await ResourceService.uploadFile(<string>user.username,newFile);
      if(!saveFile) {
        fs.unlinkSync(`${realPath}${filename}`);
        throw new HttpException(404, 'Not Found');
      }
      res.json(newFile);
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }
  /**
   * @static
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {JSON} return file
   * @memberof ResourceUserController
   */
  public static async moveFile(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const fileToMove = <IFile>req.body;
      const oldFile = await ResourceService.getFileById(user._id,fileToMove._id);
      if(!oldFile) throw new HttpException(404, 'Not Found');
      const oldPaht = `${process.env.FILE_STORAGE}/users/${user._id}/${oldFile.url}/${oldFile.name}`;
      const newPath = `${process.env.FILE_STORAGE}/users/${user._id}/${fileToMove.url}/`;
      const pathExist = fs.existsSync(newPath);
      
      const moveFile = await ResourceService.updateExistFile(user, fileToMove);
      if(!moveFile) throw new HttpException(404, 'Not Found');
      if(!pathExist) fs.mkdirSync(newPath , {recursive:true});
      fs.rename(oldPaht,`${newPath}${fileToMove.name}`,(error) => {
        if(error) throw new HttpException(400, 'Bad Request');
      });
      res.json(moveFile);
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }

    
  }
  /**
   * @static
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {JSON} return file
   * @memberof ResourceUserController
   */
  public static async getAllFiles(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const files = await ResourceService.getFiles(user._id);
      if(!files) throw new HttpException(404, 'Not Found');
      res.json({files});
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }
  /**
   * @static
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {JSON} return file
   * @memberof ResourceUserController
   */
  public static async removeFileById(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const file = <IFile>req.body;
      const existFile = await ResourceService.getFileById(user._id, file._id);
      const remove = await ResourceService.removeFileById(user._id, file._id);
      
      if(existFile && remove){
        const path = `${process.env.FILE_STORAGE}/users/${user._id}/${existFile.url}/${existFile.name}`;
        const existPath = fs.existsSync(path);
        if(!existPath ) throw new HttpException(404, 'Not Found');
        fs.unlink(path,(error) => {
          if(error) throw new HttpException(404, 'Not Found');
        });
        res.json(existFile);
      }
      else{
        throw new HttpException(404, 'Not Found');
      }
      
      
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }

  /**
   * @static
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   * @returns {JSON} return file
   * @memberof ResourceUserController
   */

  public static async downloadFile(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const id = req.params.id;
      
      const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      const getFile = await ResourceService.getFileById(user._id, id);
      if(getFile){
        const path = `${process.env.FILE_STORAGE}/users/${user._id}/${getFile.url}/${getFile.name}`;
        res.download(path, getFile.name, (error) => {
          if(error) throw new HttpException(404, 'Not Found');
        });
      }
      else{
        throw new HttpException(404, 'Not Found');
      }
    
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
    
    
  }

  public static async getImages(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const files = await ResourceService.getFiles(user._id);
      if(files){
        const str = '^(?!(index|page1)\.html$).*\.(htm|html|js|css|svg|png)$';
        const regex = new RegExp(str,'g');
        const arrayFiles = files.filter(images => {
          if(regex.test(images.name)){
            return images
          }
          
        });
        const images = arrayFiles.map(image => {
          return {
            name:image.name,
            modified:image.modified,
            url:req.protocol + '://' + process.env.API_GATEWAY + '/api/file/download/'+image._id
          };
        });
        res.json({images});
      }
      else{
        throw new HttpException(404, 'Not Found');
      }
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }

  public static async downloadFolder(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const {folder} = req.body
      var archive = archiver('zip');
      archive.on('error', function(err) {
        throw new HttpException(500, 'Internal error');
      });
      archive.on('end', () => res.end());
      var path = process.env.FILE_STORAGE+"/users/"+user._id+"/"+folder;
      res.attachment(`${folder}.zip`).type('zip');
      var existFolder = fs.existsSync(path);
      if(!existFolder) throw new HttpException(404, 'Not Found');
      archive.directory(path,false);
      archive.pipe(res);
      archive.finalize();
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }

  public static async removeFolder(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const {folder} = req.body
      var path = process.env.FILE_STORAGE+"/users/"+user._id+"/"+folder;
      var existFolder = fs.existsSync(path);
      if(!existFolder) throw new HttpException(404, 'Not Found');
      var removed = await ResourceService.removeFolder(user._id,folder);
      if (!removed) throw new HttpException(404, 'Not Found');
      fs.rmdirSync(path,{ recursive: true });
      res.json({removed});
    
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }

  public static async changeNameFolder(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const {oldFolder, newFolder} = req.body;
      var oldPath = process.env.FILE_STORAGE+"/users/"+user._id+"/"+oldFolder;
      var newPath = process.env.FILE_STORAGE+"/users/"+user._id+"/"+newFolder;
      var existFolder = fs.existsSync(oldPath);
      if(!existFolder) throw new HttpException(404, 'Not Found');
      var changed = await ResourceService.renameFolder(user._id, oldFolder, newFolder);
      if(!changed) throw new HttpException(404, 'Not Found');
      fs.renameSync(oldPath, newPath);
      res.json({changed});
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }





  
}
export default ResourceUserController;
