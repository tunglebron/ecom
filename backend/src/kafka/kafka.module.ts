import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer/consumer.service';
import { KafkaService } from './kafka.service';
import { ProducerService } from './consumer/producer.service';

@Module({
  providers: [
    {
      provide: 'KafkaProducerInterface',
      useClass: ProducerService,
    },
    {
      provide: 'KafkaConsumerInterface',
      useClass: ConsumerService,
    },
    KafkaService,
  ],
  exports: [KafkaService, 'KafkaProducerInterface', 'KafkaConsumerInterface'],
})
export class KafkaModule {}