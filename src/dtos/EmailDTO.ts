import { IsString, IsNotEmpty} from 'class-validator';

/**
 *
 * 
 * @category DTOs
 * @class EmailDTO
 * @param {string} email email of the user
 */
class EmailDTO {
    @IsString()
    @IsNotEmpty()
    public email: string;

    /**
     * 
     * @param email email of the user
     * @memberof EmailDTO
     */
    constructor(email:string){
        this.email = email;
    }
}

export default EmailDTO