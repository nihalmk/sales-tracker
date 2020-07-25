import {
  Resolver,
  Query,
  Authorized,
  Ctx,
  Arg,
  Mutation,
  registerEnumType,
} from 'type-graphql';
import { CTX } from '../../interfaces/common';
import { ShopService } from './shop.service';
import { Shop, ShopType } from './shop.model';
import { ObjectId } from 'mongodb';
import { CreateShopInput } from './shop.input';
import { LabelValueObj } from '../common/Types/InputTypes';

registerEnumType(ShopType, {
  name: 'ShopType',
});

/**
 * Mutations and Queries for getting shops / updating shop data
 */
@Resolver(Shop)
export default class ShopResolver {
  constructor() {}

  // Queries
  // Get the shop for the logged in user from ctx.user

  @Query((_returns) => Shop, { nullable: true })
  @Authorized()
  async getShopForUser(@Ctx() ctx: CTX): Promise<Shop | null | void> {
    const shopService = new ShopService(ctx);
    if (ctx.user && ctx.user.shop) {
      return await shopService.getShop(ctx.user.shop as ObjectId);
    }
  }

  @Query((_returns) => [LabelValueObj], { nullable: true })
  @Authorized()
  async getShopTypes(@Ctx() ctx: CTX): Promise<LabelValueObj[]> {
    const shopService = new ShopService(ctx);
    return await shopService.getDistinctTypes();
  }

  // Mutations

  @Mutation((_returns) => Shop, { nullable: true })
  @Authorized()
  async createShop(
    @Ctx() ctx: CTX,
    @Arg('shop', (_returns) => CreateShopInput)
    shop: CreateShopInput,
  ): Promise<Shop> {
    const shopService = new ShopService(ctx);
    return await shopService.createShop(shop);
  }
}
