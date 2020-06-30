import {
  Resolver,
  Query,
  Authorized,
  Ctx,
  Arg,
  Mutation,
} from 'type-graphql';
import { CTX } from '../../interfaces/common';
import { ItemsService } from './items.service';
import { Items } from './items.model';
import { CreateItemsInput, UpdateItemsInput } from './items.input';

/**
 * Mutations and Queries for getting items / updating items data
 */
@Resolver(Items)
export default class ItemsResolver {
  constructor() {}

  // Queries
  // Get the items for the logged in user from ctx.user

  @Query((_returns) => [Items])
  @Authorized()
  async getItemsForUser(@Ctx() ctx: CTX): Promise<Items[]> {
    const itemsService = new ItemsService(ctx);
    return await itemsService.getItems();
  }

  // Mutations

  @Mutation((_returns) => Items, { nullable: true })
  @Authorized()
  async createItem(
    @Ctx() ctx: CTX,
    @Arg('item', (_returns) => CreateItemsInput)
    item: CreateItemsInput,
  ): Promise<Items> {
    const itemsService = new ItemsService(ctx);
    return await itemsService.createItem(item);
  }

  @Mutation((_returns) => Items, { nullable: true })
  @Authorized()
  async updateItem(
    @Ctx() ctx: CTX,
    @Arg('item', (_returns) => UpdateItemsInput)
    item: UpdateItemsInput,
  ): Promise<Items> {
    const itemsService = new ItemsService(ctx);
    return await itemsService.updateItems(item);
  }
}
