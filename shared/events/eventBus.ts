// Event Bus client for RabbitMQ
import amqp, { Connection, Channel } from 'amqplib';
import { createLogger } from '../utils/logger';
import { Event } from '../types';

export class EventBus {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private logger = createLogger('EventBus');
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  async connect(): Promise<void> {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      this.logger.info(`Connected to RabbitMQ for ${this.serviceName}`);

      // Handle connection errors
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed, attempting reconnect...');
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(event: Event): Promise<boolean> {
    if (!this.channel) {
      this.logger.error('Channel not available for publishing');
      return false;
    }

    try {
      const exchange = 'pos_events';
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      const routingKey = event.type;
      const message = JSON.stringify(event);

      this.channel.publish(exchange, routingKey, Buffer.from(message), {
        persistent: true,
        timestamp: Date.now(),
      });

      this.logger.debug(`Published event: ${event.type}`, { id: event.id });
      return true;
    } catch (error) {
      this.logger.error('Failed to publish event', error);
      return false;
    }
  }

  async subscribe(
    eventTypes: string[],
    handler: (event: Event) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      this.logger.error('Channel not available for subscription');
      return;
    }

    try {
      const exchange = 'pos_events';
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      const queue = `${this.serviceName}_queue`;
      await this.channel.assertQueue(queue, { durable: true });

      // Bind queue to all event types
      for (const eventType of eventTypes) {
        await this.channel.bindQueue(queue, exchange, eventType);
        this.logger.info(`Subscribed to ${eventType}`);
      }

      // Consume messages
      this.channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              const event: Event = JSON.parse(msg.content.toString());
              this.logger.debug(`Received event: ${event.type}`, { id: event.id });
              await handler(event);
              this.channel!.ack(msg);
            } catch (error) {
              this.logger.error('Error processing event', error);
              this.channel!.nack(msg, false, false); // Don't requeue
            }
          }
        },
        { noAck: false }
      );
    } catch (error) {
      this.logger.error('Failed to subscribe to events', error);
    }
  }

  async close(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.info('EventBus connection closed');
    } catch (error) {
      this.logger.error('Error closing EventBus connection', error);
    }
  }
}

export const createEventBus = (serviceName: string): EventBus => {
  return new EventBus(serviceName);
};
