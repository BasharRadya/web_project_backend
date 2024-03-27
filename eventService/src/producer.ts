import * as amqp from "amqplib";
import * as dotenv from "dotenv";
dotenv.config();

const amqpKey = "amqps://leivdnnl:wAU6uYYHla3Fmpg6wG-Xm05BYh5h_cDw@hummingbird.rmq.cloudamqp.com/leivdnnl";


export class Producer {
  channel: amqp.Channel;
  async createChannel() {
    const connection = await amqp.connect(amqpKey);
    this.channel = await connection.createChannel();
  }
  async sendEvent(msg: string) {
    try{
    if (!this.channel) {
      await this.createChannel();
    }
    const exchange = "order_exchange";
    // create the exchange if it doesn't exist
    await this.channel.assertExchange(exchange, "fanout", { durable: false });
    // publish the message to the exchange
    await this.channel.publish(exchange, "", Buffer.from(msg));
    console.log(
      `Pro >>> | message "${msg}" published to exchange "${exchange}"`
    );
  } catch (error) {
        console.error("Error sending order to message broker", error);
    }
}   
}