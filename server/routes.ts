import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import QRCode from "qrcode";
import { storage } from "./storage";
import { insertParkingRegistrationSchema, insertStaffExemptionSchema, searchRegistrationSchema } from "@shared/schema";
import { z } from "zod";

// For local development, create mock Stripe if credentials are not provided
const isDevelopment = process.env.NODE_ENV === 'development';
const hasStripeCredentials = process.env.STRIPE_SECRET_KEY;

if (!hasStripeCredentials && !isDevelopment) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = hasStripeCredentials 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-06-30.basil",
    })
  : null;

if (isDevelopment && !hasStripeCredentials) {
  console.log('⚠️  Running in development mode with mock Stripe. Set STRIPE_SECRET_KEY for payment functionality.');
} else if (hasStripeCredentials) {
  console.log('✅ Stripe is configured and ready for real payments!');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default parking rates
  app.get("/api/init-rates", async (req, res) => {
    try {
      const existingRates = await storage.getParkingRates();
      if (existingRates.length === 0) {
        // Create default rates using Airtable
        const { airtable } = await import("./airtable");
        if (!airtable.parkingRates) throw new Error("Airtable parkingRates is not configured");
        const defaultRates = [
          { durationType: "1_hour", price: "2.5", durationHours: 1, description: "1 Hour" },
          { durationType: "2_hours", price: "4.0", durationHours: 2, description: "2 Hours" },
          { durationType: "4_hours", price: "8.0", durationHours: 4, description: "4 Hours" },
          { durationType: "8_hours", price: "15.0", durationHours: 8, description: "8 Hours" },
          { durationType: "12_hours", price: "20.0", durationHours: 12, description: "12 Hours" },
          { durationType: "24_hours", price: "32.0", durationHours: 24, description: "24 Hours" },
        ];
        // Create all rates in Airtable
        await Promise.all(defaultRates.map(rate => airtable.parkingRates!.create(rate)));
        const newRates = await storage.getParkingRates();
        res.json({ message: "Default rates initialized", rates: newRates });
      } else {
        res.json({ message: "Rates already exist", rates: existingRates });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error initializing rates: " + error.message });
    }
  });

  // Get parking rates
  app.get("/api/parking-rates", async (req, res) => {
    try {
      let rates = await storage.getParkingRates();
      
      // If no rates exist, initialize with default rates
      if (rates.length === 0) {
        const { airtable } = await import("./airtable");
        if (!airtable.parkingRates) throw new Error("Airtable parkingRates is not configured");
        const defaultRates = [
          { durationType: "1_hour", price: "2.5", durationHours: 1, description: "1 Hour" },
          { durationType: "2_hours", price: "4.0", durationHours: 2, description: "2 Hours" },
          { durationType: "4_hours", price: "8.0", durationHours: 4, description: "4 Hours" },
          { durationType: "8_hours", price: "15.0", durationHours: 8, description: "8 Hours" },
          { durationType: "12_hours", price: "20.0", durationHours: 12, description: "12 Hours" },
          { durationType: "24_hours", price: "32.0", durationHours: 24, description: "24 Hours" },
        ];
        
        // Create all rates in Airtable
        try {
          for (const rate of defaultRates) {
            await airtable.parkingRates!.create(rate);
          }
          // Fetch the newly created rates
          rates = await storage.getParkingRates();
        } catch (error) {
          console.error("Error creating default rates:", error);
          // Return default rates as fallback
          rates = defaultRates.map((rate, index) => ({
            id: index + 1,
            ...rate,
            updatedAt: new Date(),
          }));
        }
      }
      
      res.json(rates);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching rates: " + error.message });
    }
  });

  // Update parking rate
  app.patch("/api/parking-rates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { price } = req.body;
      
      const updatedRate = await storage.updateParkingRate(parseInt(id), { price });
      res.json(updatedRate);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating rate: " + error.message });
    }
  });

  // Create parking registration
  app.post("/api/parking-registration", async (req, res) => {
    try {
      // Get the rate first to calculate amount and endTime
      const rate = await storage.getParkingRateByType(req.body.durationType);
      console.log("Found rate:", rate, "for durationType:", req.body.durationType);
      if (!rate) {
        return res.status(400).json({ message: "Invalid duration type" });
      }
      
      const startTime = req.body.startTime ? new Date(req.body.startTime) : new Date();
      const endTime = new Date(startTime.getTime() + (rate.durationHours * 60 * 60 * 1000));
      
      // Prepare data with calculated fields
      const registrationData = {
        ...req.body,
        licensePlate: req.body.licensePlate.toUpperCase(),
        amount: rate.price.toString(), // Convert to string to match schema
        startTime,
        endTime,
        status: req.body.status || 'pending',
      };
      
      const validatedData = insertParkingRegistrationSchema.parse(registrationData);
      const registration = await storage.createParkingRegistration(validatedData);
      
      res.json(registration);
    } catch (error: any) {
      console.error("Error creating registration:", error);
      res.status(400).json({ message: "Error creating registration: " + (error.message || error) });
    }
  });

  // Stripe payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, registrationId } = req.body;
      
      if (!stripe) {
        // Mock payment intent for development
        const mockClientSecret = 'pi_mock_' + Math.random().toString(36).substr(2, 9);
        res.json({ clientSecret: mockClientSecret });
        return;
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to pence
        currency: "gbp",
        metadata: {
          registrationId: registrationId?.toString() || '',
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Confirm payment
  app.post("/api/confirm-payment", async (req, res) => {
    try {
      const { registrationId, paymentIntentId } = req.body;
      
      const updatedRegistration = await storage.updateParkingRegistrationStatus(
        parseInt(registrationId),
        'paid',
        paymentIntentId
      );
      
      res.json(updatedRegistration);
    } catch (error: any) {
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  // Get parking registrations
  app.get("/api/parking-registrations", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let registrations;
      if (startDate && endDate) {
        registrations = await storage.getParkingRegistrationsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        registrations = await storage.getAllParkingRegistrations();
      }
      
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching registrations: " + error.message });
    }
  });

  // Search parking registration
  app.post("/api/search-registration", async (req, res) => {
    try {
      const { licensePlate } = searchRegistrationSchema.parse(req.body);
      
      const status = await storage.checkParkingStatus(licensePlate);
      res.json(status);
    } catch (error: any) {
      res.status(400).json({ message: "Error searching registration: " + error.message });
    }
  });

  // Staff exemptions
  app.get("/api/staff-exemptions", async (req, res) => {
    try {
      const exemptions = await storage.getStaffExemptions();
      res.json(exemptions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching exemptions: " + error.message });
    }
  });

  app.post("/api/staff-exemptions", async (req, res) => {
    try {
      const validatedData = insertStaffExemptionSchema.parse(req.body);
      const exemption = await storage.createStaffExemption(validatedData);
      res.json(exemption);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating exemption: " + error.message });
    }
  });

  app.patch("/api/staff-exemptions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertStaffExemptionSchema.partial().parse(req.body);
      
      const updatedExemption = await storage.updateStaffExemption(parseInt(id), validatedData);
      res.json(updatedExemption);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating exemption: " + error.message });
    }
  });

  app.delete("/api/staff-exemptions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStaffExemption(parseInt(id));
      res.json({ message: "Exemption deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting exemption: " + error.message });
    }
  });

  // Generate QR Code for parking location
  app.get("/api/generate-qr", async (req, res) => {
    try {
      const { location = "default" } = req.query;
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? `http://localhost:5000` 
        : `https://${req.get('host')}`;
      
      const paymentUrl = `${baseUrl}/payment?location=${encodeURIComponent(location as string)}`;
      
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

  // Export registrations as CSV
  app.get("/api/export-registrations", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let registrations;
      if (startDate && endDate) {
        registrations = await storage.getParkingRegistrationsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        registrations = await storage.getAllParkingRegistrations();
      }
      
      // Generate CSV content
      const csvHeaders = [
        'License Plate',
        'Duration',
        'Amount',
        'Payment Method',
        'Date & Time',
        'Status',
        'Valid Until'
      ];
      
      const csvRows = registrations.map((reg: any) => [
        reg.licensePlate,
        reg.durationType,
        `$${reg.amount}`,
        reg.paymentMethod,
        reg.createdAt.toISOString(),
        reg.status,
        reg.endTime.toISOString()
      ]);
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: any) => row.join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=parking-registrations.csv');
      res.send(csvContent);
    } catch (error: any) {
      res.status(500).json({ message: "Error exporting registrations: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
