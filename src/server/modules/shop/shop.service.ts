import { ShopModel, Shop } from './shop.model';
import { ObjectId } from 'mongodb';
import { CreateShopInput } from './shop.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';

// Queries on models to to get/create/update shop data

export class ShopService {
  readonly model: typeof ShopModel;
  readonly ctx: CTX;
  readonly userService: UserService;

  constructor(ctx: CTX) {
    this.model = ShopModel;
    this.ctx = ctx;
    this.userService = new UserService();
  }

  // get Shop by given id

  async getShop(id: ObjectId): Promise<Shop | null> {
    return this.model.findOne({
      _id: id,
    });
  }

  // Create a new shop

  async createShop(shop: CreateShopInput): Promise<Shop> {
    const createdShop = await this.model.create(shop);
    await this.userService.updateUserShop(
      (this.ctx.userId as unknown) as ObjectId,
      createdShop._id,
    );
    return createdShop;
  }
}
