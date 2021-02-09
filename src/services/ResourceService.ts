/* eslint-disable class-methods-use-this */
import { ICrud, IUser } from '../interfaces';
import { ResourceUserRepository } from '../repository';
import { ResourceUser } from '../models';

/**
 *
 * The resource service,layer of repository pattern
 * @category Services
 * @class ResourceService
 * @implements {ICrud<IUser, string>}
 */
class ResourceService implements ICrud<IUser, string> {
  /**
   *
   * Create a resource
   * @param {IUser} resource - The resource to create
   * @return {Promise<IUser>}  A resource created
   * @memberof ResourceService
   */
  async create(resource: IUser): Promise<IUser> {
    return ResourceUserRepository.create(resource);
  }

  /**
   *
   * List all resources
   * @return {Promise<Array<IUser>>}  A list of tasks
   * @memberof ResourceService
   */
  async list(): Promise<Array<IUser>> {
    return ResourceUserRepository.list();
  }

  /**
   *
   * Find by id a resource
   * @param {string} id - The id to find
   * @return {Promise<IUser>}  A resource
   * @memberof ResourceService
   */
  async getById(id: string): Promise<IUser | null> {
    return ResourceUserRepository.getById(id);
  }

  /**
   *
   * Remove a resource
   * @param {IUser} resource - The resource to remove
   * @return {Promise<IUser>}  A resource removed
   * @memberof ResourceService
   */
  async remove(resource: IUser): Promise<IUser> {
    return ResourceUserRepository.remove(resource);
  }

  /**
   *
   * Remove by id a resource
   * @param {string} id - The id to find
   * @return {Promise<IUser>}  A resource removed
   * @memberof ResourceService
   */
  async removeById(id: string): Promise<IUser | null> {
    const taskToDelete = await this.getById(id);
    if (taskToDelete) await taskToDelete.remove();
    return taskToDelete;
  }

  /**
   *
   * Update a resource
   * @param {IUser} resource - The resource to updated
   * @return {Promise<IUser>}  A resource updated
   * @memberof ResourceService
   */
  async update(resource: IUser): Promise<IUser> {
    return ResourceUserRepository.update(resource);
  }

  /**
   *
   * Update by id a resource
   * @param {string} id - The id to find
   * @param {IUser} resource - The resource to updated
   * @return {Promise<IUser>} A resource updated
   * @memberof ResourceService
   */
  async updateById(id: string, body: Object): Promise<IUser | null > {
    // eslint-disable-next-line no-unused-vars
    return new Promise<IUser | null>((resolve, _) => {
      ResourceUser.findOneAndUpdate({ _id: id }, { ...body }, { new: true },
        (error, task: IUser | null) => resolve(task));
    });
  }
}

export default new ResourceService();
