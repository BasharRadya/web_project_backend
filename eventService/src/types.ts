export interface EventData {
  title: string;
  category: string;
  description: string;
  organizer: string;
  start_date: Date;
  end_date: Date;
  location: string;
  tickets: {
    name: string;
    quantity: number;
    price: number;
  }[];
}
