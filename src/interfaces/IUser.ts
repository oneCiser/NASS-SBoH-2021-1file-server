import { Document } from 'mongoose';
import IFile from './IFile';

/**
 * Define a interface of resource to managament with mongoose
 * @category Interfaces
 * @interface IUser
 * @extends {Document}
 */
interface IUser extends Document{
    username: String,
    password: String,
    email: String,
    type_user: String,
    maxsize: Number,
    directory: Array<IFile>,
    share_out: Array<any>,
    share_in: Array<any>,
    haveSpace: Function
}
export default IUser;
