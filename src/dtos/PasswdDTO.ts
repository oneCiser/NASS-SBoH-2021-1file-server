import { IsString, IsNotEmpty} from 'class-validator';

/**
 *
 * 
 * @category DTOs
 * @class PasswdDTO
 * @param {string} password password of user
 */
class PasswdDTO {
    @IsString()
    @IsNotEmpty()
    public password: string;

    /**
     * 
     * @param password password of user
     * @memberof PasswdDTO
     */
    constructor(password:string){
        this.password = password;
    }
}

export default PasswdDTO;