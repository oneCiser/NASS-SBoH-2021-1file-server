import mongoose, { Model, Schema } from 'mongoose';
import { IUser,IFile } from '../interfaces';

const FileSchema: Schema<IFile> = new Schema({
  name: {type:String, required:true},
  url: {type:String, required:true},
  size: {type:Number, required:true},
  modified: {type:Date, default:Date.now},
  share:{type:[],required:false}
})

const ResourceUserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  email: {type: String, required:true, unique: true},
  password: {type: String, required:true},
  name: {type: String, required:true},
  type_user:{type:String, required:true},
  maxsize: {type:Number,required:true},
  directory: {type:[FileSchema],required:false},
  share_in: {type:[],required:false}
});


ResourceUserSchema.methods.haveSpace = function(fileSize:number){
  
  const actualSize = this.directory.reduce((prev: number, file:IFile) => prev + file.size, 0);
  if(this.maxsize >= fileSize + actualSize) return true;
  return false;
}


const ResourceUser: Model<IUser> = mongoose.model('ResourceUser', ResourceUserSchema);
export default ResourceUser;
