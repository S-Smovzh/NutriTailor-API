import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { ProductRepository } from '../repositories';
import { Product, User } from '../schemas';
import { CreateProductDto, ProductDto } from '../dtos';
import { combinePipeline, DEFAULT_LIMIT, DEFAULT_SKIP } from '../helpers';
import { Sort } from '../types';

@Injectable()
export class ProductCrudService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,
  ) {}

  public async create(createProduct: CreateProductDto, userId: User['_id']): Promise<ProductDto[]> {
    const productExists = await this.productRepository.findOne({
      name: createProduct.name,
      user: userId,
    });

    if (productExists) {
      await this.productRepository.findOneAndUpdate(productExists._id, {
        amount: productExists.amount + createProduct.amount,
      });
    } else {
      const product = await this.productRepository.create(createProduct);

      if (!product) {
        throw new BadRequestException("Couldn't add new product.");
      }
    }

    const products = await this.productRepository.find({ user: userId });
    return products.map((product) => plainToInstance(ProductDto, product));
  }

  public async delete(productId: Product['_id'], userId: User['_id']): Promise<ProductDto[]> {
    await this.productRepository.findByIdAndDelete(productId);
    const products = await this.productRepository.find({ user: userId });
    return products.map((product) => plainToInstance(ProductDto, product));
  }

  public async deleteAllUserProducts(userId: User['_id']): Promise<ProductDto[]> {
    await this.productRepository.deleteMany({ user: userId });
    const products = await this.productRepository.find({ user: userId });
    return products.map((product) => plainToInstance(ProductDto, product));
  }

  public async update(productId: Product['_id'], updateProduct: UpdateQuery<Product>, userId: User['_id']): Promise<ProductDto[]> {
    const product = await this.productRepository.findOneAndUpdate(productId, updateProduct);

    if (!product) {
      throw new BadRequestException("Couldn't update the product.");
    }

    const products = await this.productRepository.find({ user: userId });
    return products.map((product) => plainToInstance(ProductDto, product));
  }

  public async findById(productId: Product['_id']): Promise<ProductDto> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new BadRequestException('The product account not found.');
    }
    return plainToInstance(ProductDto, product);
  }

  public async findOne(filter: any): Promise<ProductDto> {
    const product = await this.productRepository.findOne(filter);

    if (!product) {
      throw new BadRequestException('The product account not found.');
    }

    return plainToInstance(ProductDto, product);
  }

  public async find(filter: any): Promise<ProductDto[]> {
    const products = await this.productRepository.find(filter);
    if (!products) {
      this.logger.error('Products accounts not found.');
      return null;
    }
    return products.map((product) => plainToInstance(ProductDto, product));
  }

  public async getPaginated(
    filter: any,
    sort: Sort,
    skip = DEFAULT_SKIP,
    limit = DEFAULT_LIMIT,
  ): Promise<{
    items: ProductDto[];
    itemsCount: number;
    itemsCountTotal: number;
  }> {
    const pipeline = combinePipeline(skip, limit, sort, filter);
    const products = await this.productRepository.aggregate(pipeline);
    if (!products) {
      throw new BadRequestException("Products' read operation failed.");
    }
    return {
      items: products.map((doc: Product) => plainToInstance(ProductDto, doc)),
      itemsCount: await this.productRepository.countDocuments(filter),
      itemsCountTotal: await this.productRepository.countDocuments(),
    };
  }
}
