export interface KafkaProducerInterface {
  produce(topic: string, message: any): Promise<void>;
}
