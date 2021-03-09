import { IsString, IsNotEmpty} from 'class-validator';


/**
 *
 * 
 * @category DTOs
 * @class AuthDTO
 * @param {string} username- the tile of resource
 * @param {string} password
 */
class AuthDTO {
    @IsString()
    @IsNotEmpty()
    public username: string;
    @IsNotEmpty()
    @IsString()
    public password: string;

    /**
     * 
     * @param username username of user
     * @param password password of user
     * @memberof AuthDTO
     */
    constructor(username:string, password:string){
        this.username = username;
        this.password = password;
    }
}

export default AuthDTO