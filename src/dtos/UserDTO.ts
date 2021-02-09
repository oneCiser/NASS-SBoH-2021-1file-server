/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-constructor */

import { IsString, IsNotEmpty,IsNumber } from 'class-validator';

/**
 *
 * DTO for resource example
 * @category DTOs
 * @class UserDTO
 * @param {string} user- the tile of resource
 * @param {string} password
 * @param {string} type_user
 * @param {number} maxsize
 */
class UserDTO {
    @IsNotEmpty()
    @IsString()
    public user: string;
    @IsNotEmpty()
    @IsString()
    public password: string;
    @IsNotEmpty()
    @IsString()
    public type_user: string;
    @IsNotEmpty()
    @IsNumber()
    public maxsize: number;


    /**
   * Creates an instance of UserDTO.
   * @param {string} user- the tile of resource
   * @param {string} password
   * @param {string} type_user
   * @param {number} maxsize
   * @memberof UserDTO
   */
    constructor(user: string, password: string, type_user: string, maxsize: number) {
      this.user = user;
      this.password = password;
      this.type_user = type_user;
      this.maxsize = maxsize;
    }
}

export default UserDTO;
