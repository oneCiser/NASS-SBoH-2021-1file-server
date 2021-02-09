/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ICrud, IUser } from '../interfaces';
import { ResourceUser } from '../models';

/**
 *
 * The repository of resources
 * @category Repositorys
 * @class ResourceRepository
 * @implements {ICrud<IUser, string>}
 */
class ResourceUserRepository implements ICrud<IUser, string> {
  /**
   *
   *
   * @param {IUser} task - The resource to create
   * @return {Promise<IUser>}  A resource created
   * @memberof ResourceRepository
   */
  async create(task: IUser): Promise<IUser> {
    return task.save();
  }

  /**
   *
   *
   * @return {Promise<Array<IUser>>}  A list of resourceS
   * @memberof ResourceRepository
   */
  async list(): Promise<Array<IUser>> {
    return ResourceUser.find({});
  }

  /**
   *
   *
   * @param {string} id - The id to find
   * @return {Promise<IUser>}  A resource
   * @memberof Resourceepository
   */
  async getById(id: string): Promise<IUser | null> {
    return ResourceUser.findById(id);
  }

  /**
   *
   *
   * @param {IUser} resource - The resource to remove
   * @return {Promise<IUser>}  A resource removed
   * @memberof ResourceRepository
   */
  async remove(resource: IUser): Promise<IUser> {
    if (resource._id) await resource.remove();
    return resource;
  }

  /**
   *
   *
   * @param {string} id - The id to find
   * @return {Promise<IUser>}  A resource removed
   * @memberof ResourceRepository
   */
  async removeById(id: string): Promise<IUser | null> {
    const resourceToDelete = await this.getById(id);
    if (resourceToDelete) await resourceToDelete.remove();
    return resourceToDelete;
  }

  /**
   *
   *
   * @param {IUser} resource - The resource to updated
   * @return {Promise<IUser>}  A resource updated
   * @memberof ResourceRepository
   */
  async update(resource: IUser): Promise<IUser> {
    if (resource._id) await resource.update();
    return resource;
  }

  /**
   *
   *
   * @param {string} id - The id to find
   * @param {IUser} resource - The resource to updated
   * @return {Promise<IUser>} A resource updated
   * @memberof ResourceRepository
   */
  async updateById(id: string, resource: IUser):
  Promise<IUser | null > {
    const resourceToUpdate = await this.getById(id);
    if (resourceToUpdate) {
      resourceToUpdate.user = resource.user;
      await resourceToUpdate.update();
    }
    return resourceToUpdate;
  }
}
export default new ResourceUserRepository();
