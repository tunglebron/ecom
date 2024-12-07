import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async getCart(userId: number): Promise<Cart> {
    return this.cartRepository.findOne({ where: { userId } });
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    let cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
    }
    const existingItem = cart.items.find(item => item.productId === addToCartDto.productId);
    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
    } else {
      cart.items.push(addToCartDto);
    }
    return this.cartRepository.save(cart);
  }

  async updateCartItem(userId: number, productId: number, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }
    if (updateCartItemDto.quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = updateCartItemDto.quantity;
    }
    return this.cartRepository.save(cart);
  }

  async removeFromCart(userId: number, productId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    cart.items = cart.items.filter(item => item.productId !== productId);
    return this.cartRepository.save(cart);
  }
}