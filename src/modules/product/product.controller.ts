import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductEndpoints } from './endpoints.enum';
import { Controllers } from '../../enums';
import { Product } from '../../schemas';
import { CreateProductDto, ProductDto, UpdateProductDto } from '../../dtos';
import { Sort } from '../../types';
import { parseMongoAggregationFilter } from '../../helpers';
import { ProductCrudService } from '../../cruds';
import { User } from '../../decorators';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller(Controllers.PRODUCT)
export class ProductController {
  constructor(
    @Inject(ProductCrudService)
    private readonly productCrudService: ProductCrudService,
  ) {}

  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @Get(ProductEndpoints.GET_PAGINATED)
  public async getPaginated(
    @Query('filter') filter?: string,
    @Query('sort') sort?: string,
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
  ): Promise<{ items: ProductDto[]; itemsCount: number; itemsCountTotal: number }> {
    let filterParsed: any = {};
    let sortParsed: Sort | null = null;
    if (filter) {
      filterParsed = parseMongoAggregationFilter(filter);
    }
    if (sort) {
      sortParsed = JSON.parse(sort);
    }
    return await this.productCrudService.getPaginated(filterParsed, sortParsed, skip, limit);
  }

  @ApiParam({
    name: 'productId',
    required: true,
    type: String,
  })
  @Get(ProductEndpoints.GET_PRODUCT_BY_ID)
  public async getProductById(@Param('productId') productId: Product['_id']) {
    await this.productCrudService.findById(productId);
  }

  @Post(ProductEndpoints.POST_CREATE_PRODUCT)
  public async createProduct(@User() user, @Body() body: CreateProductDto) {
    await this.productCrudService.create(body, user._id);
  }

  @ApiParam({
    name: 'productId',
    required: true,
    type: String,
  })
  @Patch(ProductEndpoints.PATCH_UPDATE_PRODUCT)
  public async updateProductById(@User() user, @Param('productId') productId: Product['_id'], @Body() body: UpdateProductDto) {
    await this.productCrudService.update(productId, body, user._id);
  }

  @ApiParam({
    name: 'productId',
    required: true,
    type: String,
  })
  @Delete(ProductEndpoints.DELETE_REMOVE_PRODUCT)
  public async deleteProductById(@User() user, @Param('productId') productId: Product['_id']) {
    return await this.productCrudService.delete(productId, user._id);
  }
}
