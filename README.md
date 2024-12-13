<!-- node version  -->
20.11.0




#  Overview
The Event Booking System is a Node.js-based application designed to manage events and user bookings. It provides a robust
 architecture to handle event creation, user bookings, and notifications efficiently, ensuring high performance and scalability.

# Features
 Event Management: Create and manage events with customizable capacity.
 User Bookings: Allow users to book events while ensuring no duplicate bookings and capacity limits.
 Real-time Updates: Cache booking counts using Redis for fast data retrieval.
 Notifications: Use RabbitMQ for handling email notification messages asynchronously.
 Scalable Architecture: Built with Sequelize ORM, PostgreSQL, Redis, and RabbitMQ for a production-ready, scalable solution.

# Technology Stack
Backend: Node.js, Express
Database: Mysql with Sequelize 
Caching: Redis
Messaging Queue: RabbitMQ




# clone the git repository

https://github.com/SUHAIL-TH/event-booking.git


# run npm install 
To install all the dependencies

# change the env.example to .env
        fill the required myql passowrd,username 
        redis is running locally
        rabbitmq is configured locally ------- # install the redis and rabbitmq in your mechine locally 

# npm start 
    to start the application


# apis
postman link----> https://web.postman.co/workspace/160b1c40-d6e7-4bef-aab1-d9cab8937d8f/collection/36314667-14121cae-f318-4ddb-9ff4-e63b910e7ef6

copy this link and past and run in the postman locally
