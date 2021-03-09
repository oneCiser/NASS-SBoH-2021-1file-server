import IFile from './IFile';
/**
 * Define a interface of resource to managament with mongoose
 * @category Interfaces
 * @interface IUploadFile
 * @extends {Document}
 */
 interface IUploadFile {
    property:IFile,
    file:any
}
export default IUploadFile;