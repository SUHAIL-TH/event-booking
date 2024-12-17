const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');

// Event Model
const createEventModel = () => {
    const Event = sequelize.define('Event', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Event name cannot be empty" },
                len: { args: [2, 255], msg: "Event name must be between 2 and 255 characters" }
            }
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: { args: [1], msg: "Capacity must be at least 1" }
            }
        },
    }, {
        tableName: 'events',
        timestamps: true,
        indexes: [{ name: 'idx_event_name', fields: ['name'] }]
    });

    return Event;
};

// Booking Model
const createBookingModel = (Event) => {
    const Booking = sequelize.define('Booking', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Event,
                key: 'id'
            },
            validate: {
                notNull: { msg: "Event ID is required" }
            }
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "User ID cannot be empty" }
            }
        },
        status: {
            type: DataTypes.ENUM('CONFIRMED', 'CANCELLED', 'PENDING'),
            defaultValue: 'CONFIRMED'
        }
    }, {
        tableName: 'bookings',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['event_id', 'user_id']
            }
        ]
    });

    // Associations
    Booking.belongsTo(Event, { 
        foreignKey: 'event_id', 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    Event.hasMany(Booking, { 
        foreignKey: 'event_id',
        as: 'bookings'
    });

    return Booking;
};

// Sync Models
const syncModels = async () => {
    try {
        const Event = createEventModel();
        const Booking = createBookingModel(Event);
        
        await sequelize.sync({ force: false });
        console.log('All models were synchronized successfully.');
        
        return { Event, Booking };
    } catch (error) {
        console.error('Error synchronizing models:', error);
        throw error;
    }
};

module.exports = {
    createEventModel,
    createBookingModel,
    syncModels
};