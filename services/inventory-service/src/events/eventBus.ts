import amqp, { Connection, Channel } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function initializeEventBus(): Promise<void> {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    await channel.assertExchange('pos_events', 'topic', { durable: true });

    console.log('✓ Event bus connected');

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.warn('RabbitMQ connection closed');
    });
  } catch (error) {
    console.error('Failed to connect to event bus:', error);
    console.warn('Running without event bus - events will not be published');
  }
}

export async function publishEvent(event: any): Promise<boolean> {
  if (!channel) {
    console.warn('Event bus not available, skipping event:', event.type);
    return false;
  }

  try {
    const exchange = 'pos_events';
    const routingKey = event.type;
    const message = JSON.stringify(event);

    channel.publish(exchange, routingKey, Buffer.from(message), {
      persistent: true,
      timestamp: Date.now(),
    });

    console.log(`Published event: ${event.type}`);
    return true;
  } catch (error) {
    console.error('Failed to publish event:', error);
    return false;
  }
}
