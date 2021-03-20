/* eslint-disable class-methods-use-this */
import {  IUser, IFile } from '../interfaces';
import { ResourceUserRepository } from '../repository';
import { ResourceUser } from '../models';
import {findInArray} from '../utils';

/**
 *
 * The resource service,layer of repository pattern
 * @category Services
 * @class ResourceService
 * @implements {ICrud<IUser, string>}
 */
class ResourceService  {

  /**
   * 
   * @param {string} username 
   * @return {Promise<IUser>}
   * @memberof ResourceService
   */
   async getByUsername(username: string): Promise<IUser | null> {
    return ResourceUserRepository.getByUsername(username);
  }



  /**
   *
   * Create a resource if no exist o make static update(only change size and date of modified)
   * @param {IUser} resource - The resource to create
   * @return {Promise<IUser>}  A resource created
   * @memberof ResourceService
   */
  async uploadFile(username:string, file:IFile): Promise<IFile | null>{
    
    const user = <IUser> await this.getByUsername(username);
    if(user){
      if(!file) return null;
      const index = findInArray(user.directory,file);
      let updateUser = null
      if(index>-1){
        updateUser = await ResourceUserRepository.staticUpdateFile(user,file);
      } 
      else{
        updateUser = await ResourceUserRepository.newFile(user,file);
      }
      
      
      if(updateUser) return file;
      return null
    } 
    return null
  }
  /**
   * only update exist file
   * @param {IUser} user user to update
   * @param {IFile} file file to update
   * @returns {Promise<IFile | null>}
   */
  async updateExistFile(user:IUser, file:IFile): Promise<IFile | null> {
    return await ResourceUserRepository.fileUpdate(user, file);
  }
  /**
   * return file by id
   * @param {String} _idUser id of user
   * @param {String} _idFile id of file
   * @returns {Promise<IFile | null>} file if exist, else null
   */
  async getFileById(_idUser:string, _idFile:string): Promise<IFile | null> {
    return await ResourceUserRepository.getFileById(_idUser,_idFile);
  }
  /**
   * return all files of user
   * @param {String} _idUser id of user
   * @returns {Promise<IFile[] | null>} all files of exist user, else null
   */
  async getFiles(_idUser:string): Promise<IFile[] | null> {
    return await ResourceUserRepository.getFiles(_idUser);
  }
  /**
   * 
   * @param {String} _idUser 
   * @param {String} _idFile 
   * @returns {Promise<boolean>}
   */
  async removeFileById(_idUser:string, _idFile:string): Promise<boolean> {
    return await ResourceUserRepository.removeFileById(_idUser, _idFile);
  }
  
  async removeFolder(_idUser:string, folder:string): Promise<boolean>{
    return await ResourceUserRepository.removeFolder(_idUser, folder);
  }
  async renameFolder(_idUser:string, oldFolder:string, newFolder:string): Promise<boolean>{
    return await ResourceUserRepository.renameFolder(_idUser, oldFolder, newFolder);
  }
  
}

export default new ResourceService();
