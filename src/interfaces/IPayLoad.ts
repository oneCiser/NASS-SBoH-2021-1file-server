import IUser from './IUser'

/**
 * @category Interfaces
 * @description payload of auth
 * @interface IPayLoad
 */
interface IPayLoad {
    user:IUser,
    token_type:string,
    createdAt:Date
};

export default  IPayLoad;