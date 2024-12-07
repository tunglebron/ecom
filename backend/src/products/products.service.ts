import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async findAll(): Promise<Product[]> {
    const cachedProducts = await this.cacheManager.get<Product[]>('all_products');
    if (cachedProducts) {
      return cachedProducts;
    }

    const products = await this.productsRepository.find();
    await this.cacheManager.set('all_products', products, 60000); // Cache for 1 minute
    return products;
  }

  async findOne(id: number): Promise<Product> {
    const cachedProduct = await this.cacheManager.get<Product>(`product_${id}`);
    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.cacheManager.set(`product_${id}`, product, 60000); // Cache for 1 minute
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    await this.clearCache();
    return this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    await this.clearCache();
    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    await this.clearCache();
  }

  async clearCache() {
    await this.cacheManager.del('all_products');
    // You might want to clear individual product caches as well
    // This could be done by maintaining a list of product IDs and clearing them individually
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.name LIKE :query OR product.description LIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    if (product.stock < quantity) {
      throw new Error('Not enough stock');
    }
    product.stock -= quantity;
    await this.clearCache();
    return this.productsRepository.save(product);
  }
}