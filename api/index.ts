import express from "express";
import QRCode from "qrcode";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple parking rates endpoint
app.get("/api/parking-rates", async (req, res) => {
  try {
    // Return mock data for now to test
    const rates = [
      { id: 1, durationType: "1_hour", price: "2.50", durationHours: 1, description: "1 Hour", updatedAt: new Date() },
      { id: 2, durationType: "2_hours", price: "4.00", durationHours: 2, description: "2 Hours", updatedAt: new Date() },
      { id: 3, durationType: "4_hours", price: "8.00", durationHours: 4, description: "4 Hours", updatedAt: new Date() },
      { id: 4, durationType: "8_hours", price: "15.00", durationHours: 8, description: "8 Hours", updatedAt: new Date() },
      { id: 5, durationType: "12_hours", price: "20.00", durationHours: 12, description: "12 Hours", updatedAt: new Date() },
      { id: 6, durationType: "24_hours", price: "32.00", durationHours: 24, description: "24 Hours", updatedAt: new Date() },
    ];
    
    res.json(rates);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching rates: " + error.message });
  }
});

// QR generator endpoint with real QR code generation
app.get("/api/generate-qr", async (req, res) => {
  try {
    const { location = "default" } = req.query;
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:5000` 
      : `https://${req.get('host')}`;
    
    const paymentUrl = `${baseUrl}/payment?location=${encodeURIComponent(location as string)}`;
    
    // Generate real QR code
    const qrCode = await QRCode.toDataURL(paymentUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    res.json({ 
      qrCode, 
      paymentUrl,
      location: location as string 
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error generating QR code: " + error.message });
  }
});

// Simple parking registration endpoint
app.post("/api/parking-registration", async (req, res) => {
  try {
    const { licensePlate, durationType, email } = req.body;
    
    // Mock registration response
    const registration = {
      id: Math.floor(Math.random() * 10000),
      licensePlate: licensePlate.toUpperCase(),
      email,
      durationType,
      amount: "4.00", // Mock amount
      status: "pending",
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      createdAt: new Date(),
      updatedAt: new Date(),
      receiptSent: false,
    };
    
    res.json(registration);
  } catch (error: any) {
    console.error("Error creating registration:", error);
    res.status(400).json({ message: "Error creating registration: " + (error.message || error) });
  }
});

// Simple staff exemptions endpoint
app.get("/api/staff-exemptions", async (req, res) => {
  try {
    // Return mock data
    const exemptions = [
      { id: 1, licensePlate: "STAFF001", startDate: "2025-01-01", endDate: "2025-12-31", isActive: true },
      { id: 2, licensePlate: "STAFF002", startDate: "2025-01-01", endDate: "2025-12-31", isActive: true },
    ];
    res.json(exemptions);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching exemptions: " + error.message });
  }
});

// Simple parking registrations endpoint
app.get("/api/parking-registrations", async (req, res) => {
  try {
    // Return mock data
    const registrations = [
      {
        id: 1,
        licensePlate: "ABC123",
        email: "test@example.com",
        durationType: "2_hours",
        amount: "4.00",
        status: "paid",
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        receiptSent: true,
      }
    ];
    res.json(registrations);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching registrations: " + error.message });
  }
});

// Export for Vercel
export default app; 