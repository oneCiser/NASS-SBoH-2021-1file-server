import mongoose, { Model, Schema } from 'mongoose';
import { IUser } from '../interfaces';

const ResourceUserSchema: Schema<IUser> = new Schema({
  user: { type: String, required: true },
  password: {type: String, required:true},
  type_user:{type:String, required:true},
  maxsize: {type:Number,required:true},
  directory: {type:[],required:false},
  share_out: {type:[],required:false},
  share_in: {type:[],required:false}
});

const ResourceUser: Model<IUser> = mongoose.model('ResourceUser', ResourceUserSchema);
export default ResourceUser;
