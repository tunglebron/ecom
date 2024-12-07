import { Injectable, Inject } from '@nestjs/common';
import { KafkaProducerInterface } from './kafka-producer.interface';
import { KafkaConsumerInterface } from './kafka-consumer.interface';

@Injectable()
export class KafkaService {
  constructor(
    @Inject('KafkaProducerInterface')
    private kafkaProducer: KafkaProducerInterface,
    @Inject('KafkaConsumerInterface')
    private kafkaConsumer: KafkaConsumerInterface,
  ) {}

  async produceMessage(topic: string, message: any) {
    await this.kafkaProducer.produce(topic, message);
  }

  // You can add more methods here that use the consumer if needed 
}