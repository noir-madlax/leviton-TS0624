// Lutron price segment data processing
export interface LutronProduct {
  id: string
  name: string
  brand: string
  price: number
  unitPrice: number
  revenue: number
  volume: number
  url: string
  category: string
  productSegment: string
  packCount: number
}

// Lutron product data from frontend-old
export const lutronProducts: LutronProduct[] = [
  {
    "id": "d_9",
    "name": "Lutron Caseta Original Smart Dimmer Switch Kit, 2 Dimmer Switches, 2 Wall Plates, 2 Pico Remotes, and Smart Hub, Works with Alexa, Apple Home, Google Home, 3 Way, 150W, No Neutral, P-BDG-PKG2W-A",
    "brand": "Lutron",
    "price": 189.9,
    "unitPrice": 94.95,
    "revenue": 75960,
    "volume": 400,
    "url": "https://www.amazon.com/dp/B01M3XJUAD",
    "category": "Dimmer Switches",
    "productSegment": "Smart Hub-Dependent Dimmer Switches",
    "packCount": 2
  },
  {
    "id": "d_15",
    "name": "Lutron Caseta 3 Way Smart Dimmer Switch Kit, w/ Wireless 3 way Pico Remote and Bracket, Light Switch for LED Lights, No Neutral Required, P-PKG1WB-WH",
    "brand": "Lutron",
    "price": 69.95,
    "unitPrice": 69.95,
    "revenue": 69950,
    "volume": 1000,
    "url": "https://www.amazon.com/dp/B07HM6L48C",
    "category": "Dimmer Switches",
    "productSegment": "Smart Hub-Dependent Dimmer Switches",
    "packCount": 1
  },
  {
    "id": "d_1",
    "name": "Lutron Ariadni/Toggler LED+ Dimmer Light Switch for Dimmable LED, Halogen and Incandescent Dimmer Switch, 150W, Single-Pole/3-Way, AYCL-153P-WH, White",
    "brand": "Lutron",
    "price": 19.47,
    "unitPrice": 19.47,
    "revenue": 38940,
    "volume": 2000,
    "url": "https://www.amazon.com/dp/B006UTQCA2",
    "category": "Dimmer Switches",
    "productSegment": "LED Optimized Dimmer Switches",
    "packCount": 1
  },
  {
    "id": "d_29",
    "name": "Lutron Diva Smart Dimmer Switch for Caseta Smart Lighting (Lutron Smart Hub Required) w/ Wall Plate, for LED Lights, 150 Watt, Single-Pole/3Way, No Neutral Required, DVRFW-6L-WH-A, White",
    "brand": "Lutron",
    "price": 73.9,
    "unitPrice": 73.9,
    "revenue": 36950,
    "volume": 500,
    "url": "https://www.amazon.com/dp/B0BSHKS26L",
    "category": "Dimmer Switches",
    "productSegment": "Smart Hub-Dependent Dimmer Switches",
    "packCount": 1
  },
  {
    "id": "d_16",
    "name": "Lutron Maestro LED+ Dual Dimmer and Switch | 75-Watt LED Bulbs/2.5A Fans, Single-Pole | MACL-L3S25-WH | White",
    "brand": "Lutron",
    "price": 71.38,
    "unitPrice": 71.38,
    "revenue": 35690,
    "volume": 500,
    "url": "https://www.amazon.com/dp/B0CT3RFY6K",
    "category": "Dimmer Switches",
    "productSegment": "Dual Circuit Dimmer Switches",
    "packCount": 1
  },
  {
    "id": "d_3",
    "name": "Lutron Diva Smart Dimmer Switch for Caseta Smart Lighting (Lutron Smart Hub Required), for LED Lights, 150 Watt, Single-Pole/3Way, No Neutral Required, DVRF-6LS-WH-9, White, 9 Pack",
    "brand": "Lutron",
    "price": 629.55,
    "unitPrice": 69.95,
    "revenue": 31477,
    "volume": 50,
    "url": "https://www.amazon.com/dp/B0C7LTX71C",
    "category": "Dimmer Switches",
    "productSegment": "Smart Hub-Dependent Dimmer Switches",
    "packCount": 9
  },
  {
    "id": "s_34",
    "name": "Lutron Caseta Original Smart Switch (Lutron Smart Hub Required), for LED Lights and Fans, 6 Amp, Single-Pole/3-Way, Neutral Required, PD-6ANS-WH, White",
    "brand": "Lutron",
    "price": 59.95,
    "unitPrice": 59.95,
    "revenue": 29975,
    "volume": 500,
    "url": "https://www.amazon.com/dp/B017LRCG38",
    "category": "Light Switches",
    "productSegment": "Smart Hub Dependent Switches",
    "packCount": 1
  },
  {
    "id": "d_8",
    "name": "Lutron Caseta Smart Lamp Dimmer 3-Way Kit and Pico Remote, for Floor and Table Lamps, for Dimmable LED Lights, 100 Watt, Single-Pole/3-Way, P-PKG1P-WH",
    "brand": "Lutron",
    "price": 52.99,
    "unitPrice": 52.99,
    "revenue": 26495,
    "volume": 500,
    "url": "https://www.amazon.com/dp/B00JJY1QG0",
    "category": "Dimmer Switches",
    "productSegment": "Plug-In Portable Dimmer Controls",
    "packCount": 1
  },
  {
    "id": "d_2",
    "name": "Lutron Diva LED+ Dimmer Switch for Dimmable LED, Halogen and Incandescent Bulbs, Single-Pole or 3-Way, DVCL-153P-WH, White (2-Pack)",
    "brand": "Lutron",
    "price": 56.76,
    "unitPrice": 28.38,
    "revenue": 17028,
    "volume": 300,
    "url": "https://www.amazon.com/dp/B085D8M2MR",
    "category": "Dimmer Switches",
    "productSegment": "LED Optimized Dimmer Switches",
    "packCount": 2
  },
  {
    "id": "d_10",
    "name": "Lutron Aurora Smart Bulb Dimmer Switch | for Philips Hue Smart Bulbs | Z3-1BRL-WH-L0 | White",
    "brand": "Lutron",
    "price": 39.95,
    "unitPrice": 39.95,
    "revenue": 15980,
    "volume": 400,
    "url": "https://www.amazon.com/dp/B07RJ14FBS",
    "category": "Dimmer Switches",
    "productSegment": "Smart Hub-Dependent Dimmer Switches",
    "packCount": 1
  }
]

// Define price segments
export const getPriceSegments = () => {
  const segments = {
    "Budget ($0-$30)": 0,
    "Mid-Range ($30-$70)": 0,
    "Premium ($70-$150)": 0,
    "High-End ($150+)": 0
  }

  lutronProducts.forEach(product => {
    if (product.price <= 30) {
      segments["Budget ($0-$30)"] += product.revenue
    } else if (product.price <= 70) {
      segments["Mid-Range ($30-$70)"] += product.revenue
    } else if (product.price <= 150) {
      segments["Premium ($70-$150)"] += product.revenue
    } else {
      segments["High-End ($150+)"] += product.revenue
    }
  })

  return Object.entries(segments).map(([name, value]) => ({
    name,
    value
  }))
}

export const getTotalRevenue = () => {
  return lutronProducts.reduce((total, product) => total + product.revenue, 0)
} 