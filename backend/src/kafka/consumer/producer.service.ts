import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { KafkaProducerInterface } from '../kafka-producer.interface';

@Injectable()
export class ProducerService
  implements KafkaProducerInterface, OnModuleInit, OnModuleDestroy
{
  private kafka: Kafka;
  private producer: Producer;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: `ecommerce-producer-${uuidv4()}`,
      brokers: [
        this.configService.get<string>('KAFKA_BROKER', 'localhost:9092'),
      ],
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    await this.producer.connect();
  }

  private async disconnect() {
    await this.producer.disconnect();
  }

  async produce(topic: string, message: any) {
    console.log(`[x] Sending ${JSON.stringify(message)} to ${topic}`);
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
}
