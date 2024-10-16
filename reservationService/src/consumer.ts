import * as amqp from "amqplib";
// import ProductService from "./ProductService.js";

import { deleteReservation } from "./routes.js";
// const productService = new ProductService();

const amqpKey = "amqps://leivdnnl:wAU6uYYHla3Fmpg6wG-Xm05BYh5h_cDw@hummingbird.rmq.cloudamqp.com/leivdnnl";

export const consumeMessages = async () => {
    try {
        // connect to RabbitMQ
        const conn = await amqp.connect(
            amqpKey);
        const channel = await conn.createChannel();

        // create the exchange if it doesn't exist
        const exchange = "reservation_exchange";
        await channel.assertExchange(exchange, "fanout", { durable: false });

        // create the queue if it doesn't exist
        const queue = "reservation_queue";
        await channel.assertQueue(queue, { durable: false });

        // bind the queue to the exchange
        await channel.bindQueue(queue, exchange, "");

        // consume messages from the queue
        await channel.consume(queue, async (msg) => {
            deleteReservation(msg.content.toString());
        },{noAck: true});
    } catch (error) {
        console.error(error);
    }
};

// // start consuming messages
// consumeMessages();