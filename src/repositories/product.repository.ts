import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, PopulateOptions, UpdateQuery } from 'mongoose';
import { Product } from '../schemas';
import { Schemas } from '../enums';
import { CreateProductDto } from '../dtos';
import { ProjectionType } from '../types';

@Injectable()
class ProductRepository {
  constructor(@InjectModel(Schemas.PRODUCT) private readonly productModel: Model<Product>) {}

  public async find(filter: FilterQuery<Product> = {}, projection: ProjectionType<Product> = {}, population: PopulateOptions[] = []) {
    return this.productModel.find(filter, projection).populate(population).lean();
  }

  public async findOne(filter: FilterQuery<Product> = {}, projection: ProjectionType<Product> = {}, population: PopulateOptions[] = []) {
    return this.productModel.findOne(filter, projection).populate(population).lean();
  }

  public async findById(id: Product['_id']) {
    return this.productModel.findById(id).lean();
  }

  public async countDocuments(filter: FilterQuery<Product> = {}): Promise<number> {
    return this.productModel.countDocuments(filter);
  }

  public async create(product: CreateProductDto) {
    return this.productModel.create(product);
  }

  public async findOneAndUpdate(productId: Product['_id'], productUpdated: UpdateQuery<Product>) {
    await this.productModel.updateOne({ _id: productId }, productUpdated).lean();
    return this.findById(productId);
  }

  public async findByIdAndDelete(productId: Product['_id']) {
    return this.productModel.findByIdAndDelete(productId).lean();
  }

  public async deleteMany(filter: FilterQuery<Product>) {
    return this.productModel.deleteMany(filter);
  }

  public async aggregate(pipeline: PipelineStage[]) {
    return this.productModel.aggregate(pipeline);
  }
}

export { ProductRepository };
