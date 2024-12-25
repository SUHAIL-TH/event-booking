const express = require("express");
const { body, param, validationResult } = require("express-validator");

module.exports = (Event, Booking, redisClient, rabbitMQChannel) => {
  const router = express.Router();
  const eventController = require("../controllers/eventController")(
    Event,
    Booking,
    redisClient,
    rabbitMQChannel
  );

 //express validators
  const validate = (validations) => {
    return async (req, res, next) => {
      for (let validation of validations) {
        const result = await validation.run(req);
        if (result.errors.length) break;
      }

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      return res.status(400).json({ errors: errors.array() });
    };
  };

  // Create Event Validation
  const createEventValidations = [
    body("name").trim().notEmpty().withMessage("Event name is required"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be a positive number"),
  ];

  // Book Event Validations
  const bookEventValidations = [
    body("eventId").isInt().withMessage("Valid event ID is required"),
    body("userId").notEmpty().withMessage("Userid Cannot be empty"),
  ];

  // Get Event Booking Validations
  const getEventBookingValidations = [
    param("eventId").isInt().withMessage("Valid event ID is required"),
  ];

  // Routes
  router.post("/createevent",validate(createEventValidations),eventController.createEvent);

  router.post("/createbookings",validate(bookEventValidations),eventController.bookEvent);

  router.get("/events/:eventId",validate(getEventBookingValidations),eventController.getEventBookingCount);

  return router;
};
