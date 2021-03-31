import util from 'util';
import multer from 'multer';
import '../config/dotenv';
import fs from 'fs';
import { IUser, IFile, IUploadFile, IPayLoad } from '../interfaces';

/**
 *
 * Upload file
 * @category Middlewares
 * @param {Request} req - request
 * @param {File} file file of upload
 * @return {File}  file object
 */
const storage = multer.diskStorage({
    // destination: (req, file, cb) => {
    //     const token = <IPayLoad>req.user;
    //     const {_id} = <IUser>token.user;
    //     const pathStart = `${process.env.FILE_STORAGE}/tmp/${_id}/`;
    //     const pathExist = fs.existsSync(pathStart);
    //     if(!pathExist) fs.mkdirSync(pathStart, {recursive:true});
    //     return cb(null, pathStart);

    // },
    filename: (req, file, cb) => {
        cb(null,file.originalname);
    }
});
const upload = multer({storage}).single('file');
const uploadFileMiddleware = util.promisify(upload);
export default uploadFileMiddleware;