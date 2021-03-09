/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-constructor */

import { IsString, IsNotEmpty,IsNumber } from 'class-validator';

/**
 *
 * 
 * @category DTOs
 * @class UserDTO
 * @param {string} username- the tile of resource
 * @param {string} password
 * @param {string} email
 * @param {string} type_user
 * @param {number} maxsize
 */
class UserDTO {
    @IsNotEmpty()
    @IsString()
    public username: string;
    @IsNotEmpty()
    @IsString()
    public email: string;
    @IsNotEmpty()
    @IsString()
    public name: string;
    @IsNotEmpty()
    @IsString()
    public type_user: string;
    @IsNotEmpty()
    @IsNumber()
    public maxsize: number;


    /**
   * Creates an instance of UserDTO.
   * @param {string} username username
   * @param {string} email email
   * @param {string} name the name of user
   * @param {string} type_user type of user
   * @param {number} maxsize maxsize of capacity
   * @memberof UserDTO
   */
    constructor(username: string,  email:string, name:string,type_user: string, maxsize: number) {
      this.username = username;
      this.email = email;
      this.name = name
      this.type_user = type_user;
      this.maxsize = maxsize;
    }
}

export default UserDTO;
