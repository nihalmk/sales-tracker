import { Resolver, Query, Arg } from 'type-graphql';
import { StoreService } from './store.service';
import { PublicShop, PaginatedPublicItems } from './store.model';

// Every query here is intentionally unauthenticated - this is the public
// storefront at /store/<slug>, reachable by anyone with the link.
@Resolver()
export default class StoreResolver {
  private readonly service = new StoreService();

  @Query((_returns) => PublicShop, { nullable: true })
  async getPublicShop(
    @Arg('slug', (_returns) => String) slug: string,
  ): Promise<PublicShop | null> {
    return await this.service.getPublicShop(slug);
  }

  @Query((_returns) => PaginatedPublicItems)
  async getPublicShopItems(
    @Arg('slug', (_returns) => String) slug: string,
    @Arg('search', (_returns) => String, { nullable: true })
    search?: string,
    @Arg('category', (_returns) => String, { nullable: true })
    category?: string,
    @Arg('page', (_returns) => Number, { nullable: true, defaultValue: 1 })
    page?: number,
    @Arg('limit', (_returns) => Number, { nullable: true, defaultValue: 20 })
    limit?: number,
  ): Promise<PaginatedPublicItems> {
    return await this.service.getPublicItems(
      slug,
      search,
      category,
      page,
      limit,
    );
  }

  @Query((_returns) => [String])
  async getPublicShopCategories(
    @Arg('slug', (_returns) => String) slug: string,
  ): Promise<string[]> {
    return await this.service.getPublicCategories(slug);
  }
}
