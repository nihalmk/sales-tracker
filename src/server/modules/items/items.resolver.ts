import { Resolver, Query, Authorized, Ctx, Arg, Mutation } from 'type-graphql';
import { CTX } from '../../interfaces/common';
import { ItemsService } from './items.service';
import { Items, PaginatedItems, BulkUpdateItemsResult } from './items.model';
import {
  CreateItemsInput,
  UpdateItemsInput,
  BulkUpdateItemInput,
} from './items.input';

/**
 * Mutations and Queries for getting items / updating items data
 */
@Resolver(Items)
export default class ItemsResolver {
  constructor() {}

  // Queries
  // Get the items for the logged in user from ctx.user

  @Query((_returns) => PaginatedItems)
  @Authorized()
  async getItemsForUser(
    @Ctx() ctx: CTX,
    @Arg('search', (_returns) => String, { nullable: true })
    search?: string,
    @Arg('page', (_returns) => Number, { nullable: true, defaultValue: 1 })
    page?: number,
    @Arg('limit', (_returns) => Number, { nullable: true, defaultValue: 0 })
    limit?: number,
    @Arg('category', (_returns) => String, { nullable: true })
    category?: string,
  ): Promise<PaginatedItems> {
    const itemsService = new ItemsService(ctx);
    return await itemsService.getItems(search, page, limit, category);
  }

  @Query((_returns) => [String])
  @Authorized()
  async getCategories(@Ctx() ctx: CTX): Promise<string[]> {
    const itemsService = new ItemsService(ctx);
    return await itemsService.getCategories();
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

  // CSV import — the client sends this in small batches (see
  // ImportItemsModal.tsx) rather than one giant call, both so it can show
  // real incremental progress and so one bad batch doesn't risk the whole
  // import.
  @Mutation((_returns) => BulkUpdateItemsResult)
  @Authorized()
  async bulkUpdateItemsByShortId(
    @Ctx() ctx: CTX,
    @Arg('items', (_returns) => [BulkUpdateItemInput])
    items: BulkUpdateItemInput[],
  ): Promise<BulkUpdateItemsResult> {
    const itemsService = new ItemsService(ctx);
    return await itemsService.bulkUpdateByShortId(items);
  }
}
