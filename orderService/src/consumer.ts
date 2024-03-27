import * as amqp from "amqplib";
// import ProductService from "./ProductService.js";

import { createOrder } from "./routes.js";
// const productService = new ProductService();

const amqpKey = "amqps://leivdnnl:wAU6uYYHla3Fmpg6wG-Xm05BYh5h_cDw@hummingbird.rmq.cloudamqp.com/leivdnnl";

export const consumeMessages = async () => {
    try {
        // connect to RabbitMQ
        const conn = await amqp.connect(
            amqpKey);
        const channel = await conn.createChannel();

        // create the exchange if it doesn't exist
        const exchange = "order_exchange";
        await channel.assertExchange(exchange, "fanout", { durable: false });

        // create the queue if it doesn't exist
        const queue = "order_queue";
        await channel.assertQueue(queue, { durable: false });

        // bind the queue to the exchange
        await channel.bindQueue(queue, exchange, "");

        // consume messages from the queue
        // await channel.consume(queue, async (items: any[]) => {
        //     console.log("updating Stock");

        //     // for (let item of items) {
        //     //     const product = await productService.getProductById(item.prodId);
        //     //     const newStock = product.stock - item.count;
        //     //     await productService.updateProduct({ id: product.id, name: product.name, category: product.category, description: product.description, price: product.price, stock: newStock, image: product.image })
        //     // }
        // });
        await channel.consume(queue, async (msg) => {
            createOrder(JSON.parse(msg.content.toString()));
        },{noAck: true});
    } catch (error) {
        console.error(error);
    }
};

// // start consuming messages
// consumeMessages();