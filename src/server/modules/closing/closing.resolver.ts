import { Resolver, Query, Authorized, Ctx, Arg, Mutation } from 'type-graphql';
import { CTX } from '../../interfaces/common';
import { ClosingService } from './closing.service';
import { Closing } from './closing.model';
import { CreateClosingInput, UpdateClosingInput } from './closing.input';
import { DateRange } from '../common/Types/InputTypes';

/**
 * Mutations and Queries for getting closing / updating closing data
 */
@Resolver(Closing)
export default class ClosingResolver {
  constructor() {}

  // Queries
  // Get the closing for the logged in user from ctx.user

  @Query((_returns) => [Closing])
  @Authorized()
  async getClosingForUser(
    @Ctx() ctx: CTX,
    @Arg('date', (_returns) => DateRange) date: DateRange,
  ): Promise<Closing[]> {
    const closingService = new ClosingService(ctx);
    return await closingService.getClosings(date);
  }


  @Query((_returns) => [Closing])
  @Authorized()
  async getClosingByClosingId(
    @Ctx() ctx: CTX,
    @Arg('closingId', (_returns) => String) closingId: string,
  ): Promise<Closing[]> {
    const closingService = new ClosingService(ctx);
    return await closingService.getClosingByClosingId(closingId);
  }

  // Mutations

  @Mutation((_returns) => Closing, { nullable: true })
  @Authorized()
  async createClosing(
    @Ctx() ctx: CTX,
    @Arg('closing', (_returns) => CreateClosingInput)
    closing: CreateClosingInput,
  ): Promise<Closing> {
    const closingService = new ClosingService(ctx);
    return await closingService.createClosing(closing);
  }

  @Mutation((_returns) => Closing, { nullable: true })
  @Authorized()
  async updateClosing(
    @Ctx() ctx: CTX,
    @Arg('closing', (_returns) => UpdateClosingInput)
    closing: UpdateClosingInput,
  ): Promise<Closing> {
    const closingService = new ClosingService(ctx);
    return await closingService.updateClosing(closing);
  }
}
