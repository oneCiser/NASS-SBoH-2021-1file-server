import { Document } from 'mongoose';

/**
 * Define a interface of resource to managament with mongoose
 * @category Interfaces
 * @interface IUser
 * @extends {Document}
 */
interface IUser extends Document{
    user: { type: String, required: true },
    password: {type: String, required:true},
    type_user:{type:String, required:true},
    maxsize: {type:Number,required:true},
    directory: {type:[],required:false},
    share_out: {type:[],required:false},
    share_in: {type:[],required:false}
}
export default IUser;
