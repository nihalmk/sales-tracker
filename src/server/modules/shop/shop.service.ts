import { ShopModel, Shop } from './shop.model';
import { ObjectId } from 'mongodb';
import { CreateShopInput, UpdateShopSettingsInput } from './shop.input';
import { CTX } from '../../interfaces/common';
import { UserService } from '../user/user.service';
import { LabelValueObj } from '../common/Types/InputTypes';
import { generateUniqueSlug } from './slug';

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
    const slug = await generateUniqueSlug(shop.name);
    const createdShop = await this.model.create({ ...shop, slug });
    await this.userService.updateUserShop(
      this.ctx.userId as unknown as ObjectId,
      createdShop._id,
    );
    return createdShop;
  }

  // Store-facing settings (contact info + publish toggle) for the logged
  // in user's own shop only - never accepts a shop id from the caller.
  async updateShopSettings(settings: UpdateShopSettingsInput): Promise<Shop> {
    const filter: Record<string, unknown> = { _id: this.ctx.user.shop };
    const update: Record<string, unknown> = { ...settings };
    return this.model.findOneAndUpdate(filter, { $set: update }, { new: true });
  }

  async getDistinctTypes(): Promise<LabelValueObj[]> {
    const types = await this.model.distinct('type');
    let typeLabelValue: LabelValueObj[] = [];
    for (const type of types) {
      typeLabelValue.push({
        label: type,
        value: type,
      });
    }
    return typeLabelValue;
  }
}
