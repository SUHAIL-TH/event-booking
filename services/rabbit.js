const amqp = require('amqplib');


// RabbitMQ Service
const createRabbitMQService = () => {
    const NOTIFICATION_QUEUE = 'email_notifications';
    const connect = async () => {
        try {
            const connection = await amqp.connect('amqp://localhost');
            const channel = await connection.createChannel();
            await channel.assertQueue(NOTIFICATION_QUEUE);
            
            return { connection, channel };
        } catch (error) {
            console.error('RabbitMQ Connection Error: ', error);
            throw error;
        }
    };

    const sendNotification = async (channel, bookingDetails) => {
        try {
            channel.sendToQueue(
                NOTIFICATION_QUEUE, 
                Buffer.from(JSON.stringify(bookingDetails))
            );
            console.log('Notification sent to queue');
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const startConsumer = async (channel) => {
        try {
            channel.consume(NOTIFICATION_QUEUE, (msg) => {
                if (msg !== null) {
                    const bookingDetails = JSON.parse(msg.content.toString());
                    console.log('Email Notification Processed:', bookingDetails);
                    channel.ack(msg);
                }
            });
            console.log('RabbitMQ Consumer started');
        } catch (error) {
            console.error('RabbitMQ Consumer Error:', error);
        }
    };

    return {
        connect,
        sendNotification,
        startConsumer
    };
};

module.exports = createRabbitMQService;