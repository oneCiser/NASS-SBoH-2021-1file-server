/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { IFile, IUser, IShare, IAccessUser } from '../interfaces';
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
      console.log(file)
      if(user._id && file.name && (file.url || file.url == "") && file.size){
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

    async removeFolder(_idUser:string, folder:string): Promise<boolean>{
      const user = await ResourceUser.findById(_idUser);
      if(user){
        await ResourceUser.findByIdAndUpdate(_idUser, {
          $pull:{
            directory:{url:{
              $regex:`^${folder}`, $options:'i'
            }}
          }
        }, { multi: true });
        return true;
      }
      return false;
    }

    async renameFolder(_idUser:string, oldFolder:string, newFolder:string): Promise<boolean> {
      var user = await ResourceUser.findById(_idUser);
      var regex = new RegExp(`^${oldFolder}`,'i');
      if(user){
        user.directory.forEach((file) => {
          if(file.url.match(regex)){
            
            file.url = file.url.replace(oldFolder, newFolder);
          }
        });
        var update = await ResourceUser.findByIdAndUpdate(_idUser,{
          directory:user.directory
        },{multi: true });
        if(!update) return false;
        return true;
      }
      return false;
    }
    async getFileByFolder(_idUser:string, folder:string): Promise<IFile[] | null> {
      var user = await ResourceUser.findById(_idUser);
      var regex = new RegExp(`^${folder}`,'i');
      if(user){
        const folderFiles = user.directory.filter((file) => {
          if(file.url.match(regex)){
            return file
          }
        });
        return folderFiles
      }
      return null;
    }
    async shareFile(_idUser_out: string, username: string, _idFile:string, write:boolean): Promise<boolean> {
      var user = await ResourceUser.findById(_idUser_out);
      var userShared = await ResourceUser.findOne({username:username});
      
      if(user && userShared){
        var files = user.directory.filter((file) => {
          if(file._id == _idFile){
            return file
          }
        })
        if(files.length > 0){
          var share = files[0].share;
          var shared = false;
          share.forEach(element => {
            if(element.user_id == username){
              element.write = write;
              shared = true;
            };
          });
          if(!shared) {
            share.push({
              user_id:username,
              write:write
            });
            await ResourceUser.findOneAndUpdate( {
              username:username,
              share_in:{$ne:_idUser_out}
            },{
              $push:{
                share_in:_idUser_out
              }
            }, { multi: true });
          }
          await ResourceUser.findOneAndUpdate({
            _id:user._id,
            directory:{$elemMatch:{_id:_idFile}}
          },{
            $set:{
              "directory.$.share": share
            }
          }, { multi: true });

          return true;

        }
        return false;

      }
      return false;
    }
    async unShareFile(_idUser_out: string, username: string, _idFile:string): Promise<boolean> {
      var user = await ResourceUser.findById(_idUser_out);
      var userShared = await ResourceUser.findOne({username:username});
      
      if(user && userShared){
        var haveAnotherSharedFile = user.directory.find(file => {
          if(file._id == _idFile) return null;
          var find = file.share.find(element => {
            if(element.user_id == username) return element;
          })
          if(find) return file;
          return null;
        })
        var files = user.directory.filter((file) => {
          if(file._id == _idFile){
            return file
          }
        })
        if(files.length > 0){
          var share = files[0].share.filter(element => {
            if(element.user_id != username) return element
          });
          console.log(haveAnotherSharedFile)
          if(!haveAnotherSharedFile){
            await ResourceUser.findOneAndUpdate( {username:username},{
              $pull:{
                share_in:{
                  $in:[_idUser_out]
                }
              }
            }, { multi: true });
          }

          
          await ResourceUser.findOneAndUpdate({
            _id:user._id,
            directory:{$elemMatch:{_id:_idFile}}
          },{
            $set:{
              "directory.$.share": share
            }
          }, { multi: true });

          return true;

        }
        return false;

      }
      return false;
    }
    async getUsersToShare(_idUser:string): Promise<IAccessUser[]> {
      const users = await ResourceUser.find({_id:{$ne:_idUser},type_user:'CLIENT'});
      const usersToShare = users.map(user => {
        return {
          username:<string>user.username,
          _id:user._id
        }
      });
      return usersToShare;
    }

    // async getSharedFiles(_idUser:string): Promise<IFile[] | null>{
      
    // }
}
export default new ResourceUserRepository();
