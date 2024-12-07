import { KafkaMessage } from 'kafkajs';

export interface KafkaConsumerInterface {
  consume(topic: string, message: KafkaMessage): Promise<void>;
}