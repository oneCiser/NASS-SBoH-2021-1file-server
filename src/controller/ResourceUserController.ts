/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { NextFunction, Response, Request, json } from 'express';
import { IUser, IFile, IUploadFile, IPayLoad } from '../interfaces';
import { ResourceUser } from '../models';
import { HttpException } from '../exceptions';
import { ResourceService } from '../services';
import {uploadFileMiddleware} from '../middlewares';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminOptipng from 'imagemin-optipng';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import {findInArray , encryptBuffer, decryptBuffer, encryptAndSaveFile, decryptFile } from '../utils';
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
      
      // await uploadFileMiddleware(req, res);
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      let newFile:IFile =  req.body;
      const {originalname} = req.file;
      newFile.name = originalname;
      newFile.size = req.file.size;
      newFile.mimetype = req.file.mimetype;
      const ifExistFile = findInArray(user.directory,newFile);
      let haveSpace = false;
      if(ifExistFile>-1){
        const getExistFile = user.directory[ifExistFile];
        haveSpace = user.haveSpace(Math.abs(newFile.size - getExistFile.size));
      }
      else{
        haveSpace = user.haveSpace(newFile.size);
      }
      if(!haveSpace) throw new HttpException(400, 'Bad Request');
      let realPath = `${process.env.FILE_STORAGE}/users/${user._id}/${newFile.url}/`;
      
      if(newFile.url == "") realPath = `${process.env.FILE_STORAGE}/users/${user._id}/`;
      console.log(realPath)
      const pathExist = fs.existsSync(realPath);
      if(!pathExist) fs.mkdirSync(realPath , {recursive:true});
      const fileBufferEncrypt = await encryptAndSaveFile(req.file.buffer, `${realPath}${newFile.name}`);

      if(!newFile || !fileBufferEncrypt) throw new HttpException(400, 'Bad Request');
      newFile.modified = new Date(Date.now());
      const saveFile = await ResourceService.uploadFile(<string>user.username,newFile);
      if(!saveFile) {
        fs.unlinkSync(`${realPath}${newFile.name}`);
        throw new HttpException(404, 'Not Found');
      }
      
      res.json(saveFile);
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
      var archive = archiver('zip',{
        zlib: { level: 9 } // Sets the compression level.
      });
      archive.on('error', function(err) {
        console.log(err)
        throw new HttpException(500, 'Internal error');
      });
      archive.on('end', () => res.end());
      const path = process.env.FILE_STORAGE+"/users/"+user._id+"/";
      
      // const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      const getFile = await ResourceService.getFileById(user._id, id);
      if(getFile){
        const realName = getFile.name.split('.');
        res.attachment(`${realName[0]}.zip`).type('zip');
        let path = `${process.env.FILE_STORAGE}/users/${user._id}/${getFile.url}/${getFile.name}`;
        if(getFile.url == "") path = `${process.env.FILE_STORAGE}/users/${user._id}/${getFile.name}`;
        const bufferDecrypt = await decryptFile(path);
        // res.attachment(getFile.name).type(getFile.mimetype);
        // res.setHeader('Content-Length', bufferDecrypt.length);
        // res.send(bufferDecrypt)
        archive.append(bufferDecrypt,{ name: getFile.name})
        archive.pipe(res);
        archive.finalize();
        // res.download(path, getFile.name, (error) => {
        //   if(error) throw new HttpException(404, 'Not Found');
        // });
      }
      else{
        throw new HttpException(404, 'Not Found');
      }
    
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
    
    
  }

  public static async getImg(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const id = req.params.id;
      
      const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      const getFile = await ResourceService.getFileById(user._id, id);
      if(getFile){
        let pathImg = `${process.env.FILE_STORAGE}/users/${user._id}/${getFile.url}/${getFile.name}`;
        if(getFile.url == "") pathImg = `${process.env.FILE_STORAGE}/users/${user._id}/${getFile.name}`;
        res.type(getFile.mimetype)
        let file = await decryptFile(pathImg);
        let compressImg = await imagemin.buffer(file,{plugins:[imageminJpegtran(), imageminOptipng()]});
        let fileData = compressImg.toString('base64');
        
        res.send(fileData)
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
      const str = /^.*\.(htm|html|js|css|svg|png|jpg|gif)$/;
      if(files){
        
        
        const arrayFiles = files.filter(images => {
          let match = str.test(images.name);
          if(match){
            
            return images
          }
          
        });
        
        const images = arrayFiles.map(image => {
          return {
            name:image.name,
            modified:image.modified,
            url:req.protocol + '://' + process.env.API_GATEWAY + '/api/file/img/'+image._id
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
  public static async getVideos(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const files = await ResourceService.getFiles(user._id);
      const str = /^.*\.(ogg|mp4|webm)$/;
      if(files){
        const arrayFiles = files.filter(videos => {
          let match = str.test(videos.name);
          if(match){
            return videos
          }
        });
        
        const videos = arrayFiles.map(video => {
          return {
            name:video.name,
            modified:video.modified,
            url:req.protocol + '://' + process.env.API_GATEWAY + '/api/file/video/'+video._id
          };
        });

        res.json({videos});
      }
      else{
        throw new HttpException(404, 'Not Found');
      }
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }
  public static async loadVideo(req: Request, res: Response, next: NextFunction){
    try{
      const token = <IPayLoad>req.user;// paso el token
      const user = <IUser>token.user; // recupero el usuario
      const id = req.params.id; // recupero el id
      const range = req.headers.range; //paso el rango
      if (!range) {
        throw new HttpException(400, 'Require range');
      }
      const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl; //devuelve la url que consulto acá
      const getFile = await ResourceService.getFileById(user._id, id); // traigo objeto que contiene el video
      if(getFile && range){
        let pathVideo = `${process.env.FILE_STORAGE}/users/${user._id}/${getFile.url}/${getFile.name}`;//fichero que contiene el video
        if(getFile.url == "") pathVideo = `${process.env.FILE_STORAGE}/users/${user._id}/${getFile.name}`;
        let file = await decryptFile(pathVideo);
        const videoPath = file;
        const videoSize =videoPath.length;
        //console.log(videoSize)
        
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, "")); // warnign si no espeficia el rango se puede romper
        //console.log(start)
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        //console.log(end)
        const contentLength = end - start + 1;
        const headers = {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4",
        };

        //console.log(file.slice(start, end))
        res.writeHead(206, headers);
        //res.write(file.slice(start, end))
        res.end(file.slice(start, end))
      }
      else{
        throw new HttpException(404, 'Not Found');
      }
    }catch(error) {
      return next(new HttpException(error.status || 500, error.message));

    }
  }
  public static async downloadFolder(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const {folder} = req.body
      var archive = archiver('zip',{
        zlib: { level: 9 } // Sets the compression level.
      });
      archive.on('error', function(err) {
        console.log(err)
        throw new HttpException(500, 'Internal error');
      });
      archive.on('end', () => res.end());
      const path = process.env.FILE_STORAGE+"/users/"+user._id+"/";
      res.attachment(`${folder}.zip`).type('zip');
      const existFolder = fs.existsSync(path+folder);
      const folderFiles = await ResourceService.getFileByFolder(user._id, folder);
      if(!existFolder || !folderFiles) throw new HttpException(404, 'Not Found');
      for (let index = 0; index < folderFiles.length; index++) {
        let file = folderFiles[index];
        let filePath = `${file.url}/${file.name}`;
        if(file.url == "") filePath = `${file.name}`;
        let bufferFileDecrypt = await decryptFile(`${path}${filePath}`);
        console.log(bufferFileDecrypt)
        archive.append(bufferFileDecrypt,{ name: filePath })
      }
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

  public static async shareFile(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const {username, id_file, write} = req.body;
      const shared = await ResourceService.shareFile(user._id, username, id_file, write);
      res.json({shared});
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }
  public static async unShareFile(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const {username, id_file} = req.body;
      const unShared = await ResourceService.unShareFile(user._id, username, id_file);
      res.json({unShared});
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }
  public static async getUsersToShare(req: Request, res: Response, next: NextFunction){
    try {
      const token = <IPayLoad>req.user;
      const user = <IUser>token.user;
      const users = await ResourceService.getUsersToShare(user._id);
      if(!users) throw new HttpException(404, 'Not Found');
      res.json({users});
    } catch (error) {
      return next(new HttpException(error.status || 500, error.message));
    }
  }





  
}
export default ResourceUserController;
