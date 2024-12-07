import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, KafkaMessage } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { KafkaConsumerInterface } from '../kafka-consumer.interface';

@Injectable()
export class ConsumerService
  implements KafkaConsumerInterface, OnModuleInit, OnModuleDestroy
{
  private kafka: Kafka;
  private consumer: Consumer;
  private readonly topic: string;
  private readonly groupId: string;

  constructor(private configService: ConfigService) {
    this.topic = this.configService.get<string>('KAFKA_TOPIC');
    this.groupId = this.configService.get<string>('KAFKA_GROUP_ID');

    if (!this.topic || !this.groupId) {
      throw new Error(
        'KAFKA_TOPIC and KAFKA_GROUP_ID must be defined in environment variables',
      );
    }

    this.kafka = new Kafka({
      clientId: `ecommerce-consumer-${uuidv4()}`,
      brokers: [
        this.configService.get<string>('KAFKA_BROKER', 'localhost:9092'),
      ],
    });

    this.consumer = this.kafka.consumer({ groupId: this.groupId });
  }

  /**
   * TODO: Process orders
   * @param topic 
   * @param message 
   * @returns 
   */
  consume(topic: string, message: KafkaMessage): Promise<void> {
    console.log(`[${topic}] Processing order: ${JSON.stringify(message.value)}`);
    return;
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await this.consume(topic, message);
      },
    });
  }

  private async disconnect() {
    await this.consumer.disconnect();
  }
}
