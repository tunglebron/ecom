import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { KafkaService } from '../kafka/kafka.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  private topic: string;
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private kafkaService: KafkaService,
    private configService: ConfigService
  ) {
    this.topic = this.topic = this.configService.get<string>('KAFKA_TOPIC');
  }

  async createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create({
      userId,
      ...createOrderDto,
      status: 'pending',
    });
    const savedOrder = await this.ordersRepository.save(order);
    
    // Publish order created event to Kafka
    await this.kafkaService.produceMessage(this.topic, JSON.stringify(savedOrder));
    
    return savedOrder;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({ where: { userId } });
  }

  async getOrderDetails(userId: number, orderId: number): Promise<Order> {
    return this.ordersRepository.findOne({ where: { id: orderId, userId } });
  }
}