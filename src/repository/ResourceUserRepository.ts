/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { IFile, IUser } from '../interfaces';
import { ResourceUser } from '../models';

/**
 *
 * The repository of resources
 * @category Repositorys
 * @class ResourceRepository
 * @implements {ICrud<IUser, string>}
 */
class ResourceUserRepository{
 /**
   * 
   * @param {string} username - username
   * @return {Promise<IUser>} resource user
   * @memberof Resourceepository
   */
  async getByUsername(username: string): Promise<IUser | null> {
    return await ResourceUser.findOne({username});
  }

  /**
   *static update of user, only change the size and modified
   *@param {IUser} user user of file to update
   * @param {IFile} file - file to update
   * @return {Promise<IFile | null>}  A resource updated
   * @memberof ResourceRepository
   */
   async staticUpdateFile(user:IUser,file: IFile): Promise<IFile | null> {
    if (user._id && file.name && file.url){
        await ResourceUser.findOneAndUpdate({
          _id:user._id,
          directory:{$elemMatch:{name:file.name, url:file.url}}
        },{
          $set:{
            "directory.$":file
          }
        }, { multi: true });
        return file;
      }
      return null;
    }
  /**
   *create a file
   *@param {IUser} user user of file to update
   * @param {IFile} file - file to update
   * @return {Promise<IFile | null>}  A resource updated
   * @memberof ResourceRepository
   */
    async newFile(user:IUser, file: IFile): Promise<IFile | null> {
      if(user._id && file.name && file.url && file.size){
        await ResourceUser.findByIdAndUpdate(user._id,{
          $push:{
            directory:file
          }
        }, { multi: true });
        return file;
      }
      return null;
    }

    /**
     * update file, should exist
     * @param {IUser} user user to update file
     * @param {IFile} file file update
     * @returns {Promise<IFile | null>}
     * @memberof ResourceRepository
     */
    async fileUpdate(user:IUser,file: IFile): Promise<IFile | null> {
      if (user._id && file._id){
        await ResourceUser.findOneAndUpdate({
          _id:user._id,
          directory:{$elemMatch:{_id:file._id}}
        },{
          $set:{
            "directory.$.name":file.name,
            "directory.$.url":file.url,
            "directory.$.modified":Date.now()
          }
        }, { multi: true });
        return file;
      }
      return null;
    }

    /**
     * Return file by id if exist
     * @param {string} _idUser _id of user
     * @param {string} _idFile _id of file
     * @returns {Promise<IFile | null>} return file if exist
     * @memberof ResourceRepository
     */
    async getFileById(_idUser:string, _idFile:string): Promise<IFile | null>  {
      const user = await ResourceUser.findById(_idUser);
      if(user){
        return user.directory.filter(file => file._id == _idFile)[0];
      }
      return null
    }

    async getFiles(_idUser:string): Promise<IFile[] | null> {
      const user = await ResourceUser.findById(_idUser);
      if(user) return user.directory;
      return null
    }
    /**
     * remove file by id
     * @param {string} _idUser id of user
     * @param {string} _idFile id of file
     * @returns {boolean} 
     */
    async removeFileById(_idUser:string, _idFile:string): Promise<boolean> {
      const user = await ResourceUser.findById(_idUser);
      if(user){
        await ResourceUser.findByIdAndUpdate(_idUser, {
          $pull:{
            directory: {_id:_idFile}
          }
        }, { multi: true });
        return true;
      }
      return false;
    }
}
export default new ResourceUserRepository();
