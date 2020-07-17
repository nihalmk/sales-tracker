import { Resolver, Query, Authorized, Ctx, Arg, Mutation } from 'type-graphql';
import { CTX } from '../../interfaces/common';
import { SaleService } from './sale.service';
import { Sale } from './sale.model';
import { CreateSaleInput, UpdateSaleInput } from './sale.input';
import { DateRange } from '../common/Types/InputTypes';

/**
 * Mutations and Queries for getting sale / updating sale data
 */
@Resolver(Sale)
export default class SaleResolver {
  constructor() {}

  // Queries
  // Get the sale for the logged in user from ctx.user

  @Query((_returns) => [Sale])
  @Authorized()
  async getSalesForUser(
    @Ctx() ctx: CTX,
    @Arg('date', (_returns) => DateRange) date: DateRange,
  ): Promise<Sale[]> {
    const saleService = new SaleService(ctx);
    return await saleService.getSales(date);
  }

  @Query((_returns) => Sale, { nullable: true })
  @Authorized()
  async getLastSale(
    @Ctx() ctx: CTX,
  ): Promise<Sale | null> {
    const saleService = new SaleService(ctx);
    return await saleService.getLastSale();
  }


  @Query((_returns) => [Sale])
  @Authorized()
  async getSaleByBillNumber(
    @Ctx() ctx: CTX,
    @Arg('billNumber', (_returns) => String) billNumber: string,
  ): Promise<Sale[]> {
    const saleService = new SaleService(ctx);
    return await saleService.getSaleByBillNumber(billNumber);
  }

  @Query((_returns) => [Sale])
  @Authorized()
  async getSaleByCustomerName(
    @Ctx() ctx: CTX,
    @Arg('customer', (_returns) => String) customer: string,
  ): Promise<Sale[]> {
    const saleService = new SaleService(ctx);
    return await saleService.getSaleByCustomerName(customer);
  }

  @Query((_returns) => [Sale])
  @Authorized()
  async getSaleByCustomerPhone(
    @Ctx() ctx: CTX,
    @Arg('contact', (_returns) => String) contact: string,
  ): Promise<Sale[]> {
    const saleService = new SaleService(ctx);
    return await saleService.getSaleByCustomerPhone(contact);
  }

  // Mutations

  @Mutation((_returns) => Sale, { nullable: true })
  @Authorized()
  async createSale(
    @Ctx() ctx: CTX,
    @Arg('sale', (_returns) => CreateSaleInput)
    sale: CreateSaleInput,
  ): Promise<Sale> {
    const saleService = new SaleService(ctx);
    return await saleService.createSale(sale);
  }

  @Mutation((_returns) => Sale, { nullable: true })
  @Authorized()
  async updateSale(
    @Ctx() ctx: CTX,
    @Arg('sale', (_returns) => UpdateSaleInput)
    sale: UpdateSaleInput,
  ): Promise<Sale> {
    const saleService = new SaleService(ctx);
    return await saleService.updateSale(sale);
  }
}
