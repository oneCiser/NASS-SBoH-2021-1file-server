import { Document } from 'mongoose';
/**
 * Define a interface of resource to managament with mongoose
 * @category Interfaces
 * @interface IFile
 * @extends {Document}
 */
 interface IFile extends Document {
    name:string,
    url:string,
    size:number,
    modified:Date
}
export default IFile;