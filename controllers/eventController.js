const createRabbitMQService = require('../services/rabbit');

const createEventController = (Event, Booking, redisClient, rabbitMQChannel) => {
    const createEvent = async (req, res) => {
        try {
            const { name, capacity } = req.body;
            
            if (!name || capacity <= 0) {
                return res.status(400).json({ error: 'Invalid event details' });
            }

            const event = await Event.create({ 
                name, 
                capacity
            });
            // if (rabbitMQChannel) {
            //     try {
            //         rabbitMQChannel.sendToQueue(
            //             'event_created', 
            //             Buffer.from(JSON.stringify(event))
            //         );
            //     } catch (notificationError) {
            //         console.error('Notification send failed:', notificationError);
            //     }
            // }

            res.status(201).json(event);
        } catch (error) {
            console.error('Event Creation Error:', error);
            res.status(500).json({ 
               message:"somthing went worng"
            });
        }
    };

    const bookEvent = async (req, res) => {
        const { eventId, userId } = req.body;
        const transaction = await Event.sequelize.transaction();
        

        try {
            const event = await Event.findByPk(eventId, { transaction, lock: true });

            if (!event) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Event not found' });
            }

     
            const currentBookings = await Booking.count({
                where: { 
                    event_id: eventId,
                    status: 'CONFIRMED'
                },
                transaction
            });

      
            if (currentBookings >= event.capacity) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Event is fully booked' });
            }

            const booking = await Booking.create(
                { 
                    event_id: eventId, 
                    user_id: userId,
                    status: 'CONFIRMED'
                },
                { transaction }
            );

            // Update Redis cache
            const bookingCount = currentBookings + 1;
            if (redisClient) {
                await redisClient.set(`event:${eventId}:bookings`, bookingCount);
            }

            // Send notification via RabbitMQ
            if (rabbitMQChannel) {
                const rabbitMQService = createRabbitMQService();
                await rabbitMQService.sendNotification(rabbitMQChannel, {
                    eventId,
                    userId,
                    bookingId: booking.id
                });
            }

            await transaction.commit();
            res.status(201).json(booking);
        } catch (error) {
            await transaction.rollback();
            
          
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'Booking already exists' });
            }
            
            res.status(500).json({ 
               message:"somthing went wrong" 
            });
        }
    };

    const getEventBookingCount = async (req, res) => {
        const { eventId } = req.params;

        try {
            // Try to get count from Redis first
            let cachedCount = null;
           
            if (redisClient) {
                cachedCount = await redisClient.get(`event:${eventId}:bookings`);
            }

            if (cachedCount) {
                return res.json({status:"success", bookingCount: parseInt(cachedCount) });
            }
                
            // If no cache, query database
            let bookingCount = await Booking.count({
                where: { 
                    event_id: eventId,
                    status: 'CONFIRMED'
                }
            });

            


            // Update Redis cache
            if (redisClient) {
                await redisClient.set(`event:${eventId}:bookings`, bookingCount);
            }

            res.json({ status:"success",bookingcount:bookingCount });
        } catch (error) {
            console.error('Booking Count Error:', error);
            res.status(500).json({ 
                message:"somthing went wrong" 
            });
        }
    };

    return {
        createEvent,
        bookEvent,
        getEventBookingCount
    };
};

module.exports = createEventController;