import { Resolver, Query, Authorized, Ctx, Arg, Mutation } from 'type-graphql';
import { CTX } from '../../interfaces/common';
import { PurchaseService } from './purchase.service';
import { Purchase } from './purchase.model';
import { CreatePurchaseInput, UpdatePurchaseInput } from './purchase.input';
import { DateRange } from '../common/Types/InputTypes';

/**
 * Mutations and Queries for getting purchase / updating purchase data
 */
@Resolver(Purchase)
export default class PurchaseResolver {
  constructor() {}

  // Queries
  // Get the purchase for the logged in user from ctx.user

  @Query((_returns) => [Purchase])
  @Authorized()
  async getPurchasesForUser(
    @Ctx() ctx: CTX,
    @Arg('date', (_returns) => DateRange) date: DateRange,
  ): Promise<Purchase[]> {
    const purchaseService = new PurchaseService(ctx);
    return await purchaseService.getPurchases(date);
  }

  @Query((_returns) => Purchase, { nullable: true })
  @Authorized()
  async getLastPurchase(
    @Ctx() ctx: CTX,
  ): Promise<Purchase | null> {
    const purchaseService = new PurchaseService(ctx);
    return await purchaseService.getLastPurchase();
  }


  @Query((_returns) => [Purchase], { nullable: true })
  @Authorized()
  async getPurchaseWithoutClosing(
    @Ctx() ctx: CTX,
  ): Promise<Purchase[]> {
    const purchaseService = new PurchaseService(ctx);
    return await purchaseService.getPurchaseWithoutClosing();
  }


  @Query((_returns) => [Purchase])
  @Authorized()
  async getPurchaseByBillNumber(
    @Ctx() ctx: CTX,
    @Arg('billNumber', (_returns) => String) billNumber: string,
  ): Promise<Purchase[]> {
    const purchaseService = new PurchaseService(ctx);
    return await purchaseService.getPurchaseByBillNumber(billNumber);
  }

  @Query((_returns) => [Purchase])
  @Authorized()
  async getPurchaseByVendorName(
    @Ctx() ctx: CTX,
    @Arg('vendor', (_returns) => String) vendor: string,
  ): Promise<Purchase[]> {
    const purchaseService = new PurchaseService(ctx);
    return await purchaseService.getPurchaseByVendorName(vendor);
  }

  @Query((_returns) => [Purchase])
  @Authorized()
  async getPurchaseByVendorPhone(
    @Ctx() ctx: CTX,
    @Arg('contact', (_returns) => String) contact: string,
  ): Promise<Purchase[]> {
    const purchaseService = new PurchaseService(ctx);
    return await purchaseService.getPurchaseByVendorPhone(contact);
  }

  // Mutations

  @Mutation((_returns) => Purchase, { nullable: true })
  @Authorized()
  async createPurchase(
    @Ctx() ctx: CTX,
    @Arg('purchase', (_returns) => CreatePurchaseInput)
    purchase: CreatePurchaseInput,
  ): Promise<Purchase> {
    const purchaseService = new PurchaseService(ctx);
    return await purchaseService.createPurchase(purchase);
  }

  @Mutation((_returns) => Purchase, { nullable: true })
  @Authorized()
  async updatePurchase(
    @Ctx() ctx: CTX,
    @Arg('purchase', (_returns) => UpdatePurchaseInput)
    purchase: UpdatePurchaseInput,
  ): Promise<Purchase> {
    const purchaseService = new PurchaseService(ctx);
    return await purchaseService.updatePurchase(purchase);
  }
}
