export type RawDeal = {
  asin: string;
  title: string;
  brand: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  droppedAt: string;
};

export const mockDeals: RawDeal[] = [
  {
    asin: "B07P1",
    title: "18V Brushless Drill Driver Kit",
    brand: "Makita",
    image: "https://images-na.ssl-images-amazon.com/images/I/71W0zW2qytL._AC_SL1500_.jpg",
    currentPrice: 149.99,
    originalPrice: 219.99,
    droppedAt: "2024-05-30T10:15:00Z"
  },
  {
    asin: "B08Z2",
    title: "20V Max Cordless Impact Wrench",
    brand: "DeWalt",
    image: "https://images-na.ssl-images-amazon.com/images/I/61Qh4b3XeYL._AC_SL1500_.jpg",
    currentPrice: 179.0,
    originalPrice: 249.0,
    droppedAt: "2024-06-02T08:45:00Z"
  },
  {
    asin: "B0A22",
    title: "Heavy Duty 52-Inch Garage Storage Cabinet",
    brand: "Gladiator",
    image: "https://images-na.ssl-images-amazon.com/images/I/71Q3hD6i9GL._AC_SL1500_.jpg",
    currentPrice: 429.0,
    originalPrice: 599.0,
    droppedAt: "2024-05-28T18:05:00Z"
  },
  {
    asin: "B0B12",
    title: "Smart Laser Distance Measure",
    brand: "Bosch",
    image: "https://images-na.ssl-images-amazon.com/images/I/61X4pW5X6EL._AC_SL1500_.jpg",
    currentPrice: 79.99,
    originalPrice: 119.99,
    droppedAt: "2024-06-01T14:20:00Z"
  },
  {
    asin: "B09C9",
    title: "Rolling Tool Chest with Soft-Close Drawers",
    brand: "Husky",
    image: "https://images-na.ssl-images-amazon.com/images/I/71hZ7P1EKQL._AC_SL1500_.jpg",
    currentPrice: 548.0,
    originalPrice: 699.0,
    droppedAt: "2024-05-25T09:30:00Z"
  }
];
