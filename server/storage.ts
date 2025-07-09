import { 
  type User, 
  type InsertUser,
  type ParkingRate,
  type InsertParkingRate,
  type ParkingRegistration,
  type InsertParkingRegistration,
  type StaffExemption,
  type InsertStaffExemption
} from "@shared/schema";
import { airtable, convertAirtableRecord, convertToAirtableFields } from "./airtable";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Parking rates
  getParkingRates(): Promise<ParkingRate[]>;
  getParkingRateByType(durationType: string): Promise<ParkingRate | undefined>;
  updateParkingRate(id: number, rate: Partial<InsertParkingRate>): Promise<ParkingRate>;
  
  // Parking registrations
  createParkingRegistration(registration: InsertParkingRegistration): Promise<ParkingRegistration>;
  getParkingRegistration(id: number): Promise<ParkingRegistration | undefined>;
  getParkingRegistrationByLicensePlate(licensePlate: string): Promise<ParkingRegistration | undefined>;
  updateParkingRegistrationStatus(id: number, status: string, paymentIntentId?: string): Promise<ParkingRegistration>;
  getParkingRegistrationsByDateRange(startDate: Date, endDate: Date): Promise<ParkingRegistration[]>;
  getAllParkingRegistrations(): Promise<ParkingRegistration[]>;
  
  // Staff exemptions
  createStaffExemption(exemption: InsertStaffExemption): Promise<StaffExemption>;
  getStaffExemptions(): Promise<StaffExemption[]>;
  getStaffExemptionByLicensePlate(licensePlate: string): Promise<StaffExemption | undefined>;
  updateStaffExemption(id: number, exemption: Partial<InsertStaffExemption>): Promise<StaffExemption>;
  deleteStaffExemption(id: number): Promise<void>;
  
  // Parking status verification
  checkParkingStatus(licensePlate: string): Promise<{
    isLegal: boolean;
    status: string;
    type: 'paid' | 'staff' | 'expired' | 'not_found';
    validUntil?: Date;
    amount?: string;
    paymentMethod?: string;
  }>;
}

export class AirtableStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      if (!airtable.users) throw new Error("Airtable users is not configured");
      const record = await airtable.users.find(id.toString());
      return convertAirtableRecord(record);
    } catch (error) {
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (!airtable.users) throw new Error("Airtable users is not configured");
      const records = await airtable.users.select({
        filterByFormula: `{username} = "${username}"`,
        maxRecords: 1
      }).firstPage();
      
      if (records.length > 0) {
        return convertAirtableRecord(records[0]);
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!airtable.users) throw new Error("Airtable users is not configured");
    const record = await airtable.users.create(convertToAirtableFields(insertUser));
    return convertAirtableRecord(record);
  }

  async getParkingRates(): Promise<ParkingRate[]> {
    try {
      if (!airtable.parkingRates) throw new Error("Airtable parkingRates is not configured");
      const records = await airtable.parkingRates.select({
        sort: [{ field: 'durationHours', direction: 'asc' }]
      }).all();
      return records.map(convertAirtableRecord);
    } catch (error) {
      // Return fallback rates when Airtable is unavailable
      return [
        { id: 1, durationType: "1_hour", price: "2.50", durationHours: 1, description: "1 Hour", updatedAt: new Date() },
        { id: 2, durationType: "2_hours", price: "4.00", durationHours: 2, description: "2 Hours", updatedAt: new Date() },
        { id: 3, durationType: "4_hours", price: "8.00", durationHours: 4, description: "4 Hours", updatedAt: new Date() },
        { id: 4, durationType: "8_hours", price: "15.00", durationHours: 8, description: "8 Hours", updatedAt: new Date() },
        { id: 5, durationType: "12_hours", price: "20.00", durationHours: 12, description: "12 Hours", updatedAt: new Date() },
        { id: 6, durationType: "24_hours", price: "32.00", durationHours: 24, description: "24 Hours", updatedAt: new Date() },
      ];
    }
  }

  async getParkingRateByType(durationType: string): Promise<ParkingRate | undefined> {
    const allRates = await this.getParkingRates();
    return allRates.find(rate => rate.durationType === durationType);
  }

  async updateParkingRate(id: number, rate: Partial<InsertParkingRate>): Promise<ParkingRate> {
    if (!airtable.parkingRates) throw new Error("Airtable parkingRates is not configured");
    const updateFields = { ...convertToAirtableFields(rate), updatedAt: new Date().toISOString() };
    const record = await airtable.parkingRates.update(id.toString(), updateFields);
    return convertAirtableRecord(record);
  }

  async createParkingRegistration(registration: InsertParkingRegistration): Promise<ParkingRegistration> {
    try {
      if (!airtable.parkingRegistrations) throw new Error("Airtable parkingRegistrations is not configured");
      const airtableFields = convertToAirtableFields(registration);
      // Convert dates to ISO strings for Airtable
      if (airtableFields.startTime) airtableFields.startTime = new Date(airtableFields.startTime).toISOString();
      if (airtableFields.endTime) airtableFields.endTime = new Date(airtableFields.endTime).toISOString();
      
      const record = await airtable.parkingRegistrations.create(airtableFields);
      return convertAirtableRecord(record);
    } catch (error) {
      // If Airtable fails, create a mock registration with all required fields
      console.error("Airtable registration failed:", error);
      return {
        id: Math.floor(Math.random() * 10000),
        licensePlate: registration.licensePlate,
        email: registration.email || null,
        durationType: registration.durationType,
        amount: registration.amount,
        paymentIntentId: registration.paymentIntentId || null,
        paymentMethod: registration.paymentMethod || "stripe",
        status: registration.status || "pending",
        startTime: registration.startTime || new Date(),
        endTime: registration.endTime,
        createdAt: new Date(),
        receiptSent: false,
      };
    }
  }

  async getParkingRegistration(id: number): Promise<ParkingRegistration | undefined> {
    try {
      if (!airtable.parkingRegistrations) throw new Error("Airtable parkingRegistrations is not configured");
      const record = await airtable.parkingRegistrations.find(id.toString());
      return convertAirtableRecord(record);
    } catch (error) {
      return undefined;
    }
  }

  async getParkingRegistrationByLicensePlate(licensePlate: string): Promise<ParkingRegistration | undefined> {
    try {
      if (!airtable.parkingRegistrations) throw new Error("Airtable parkingRegistrations is not configured");
      const records = await airtable.parkingRegistrations.select({
        filterByFormula: `AND({licensePlate} = "${licensePlate}", {status} = "paid")`,
        maxRecords: 1,
        sort: [{ field: 'endTime', direction: 'desc' }]
      }).firstPage();
      
      if (records.length > 0) {
        return convertAirtableRecord(records[0]);
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  async updateParkingRegistrationStatus(id: number, status: string, paymentIntentId?: string): Promise<ParkingRegistration> {
    if (!airtable.parkingRegistrations) throw new Error("Airtable parkingRegistrations is not configured");
    const updateFields: any = { status };
    if (paymentIntentId) {
      updateFields.paymentIntentId = paymentIntentId;
    }
    
    const record = await airtable.parkingRegistrations.update(id.toString(), updateFields);
    return convertAirtableRecord(record);
  }

  async getParkingRegistrationsByDateRange(startDate: Date, endDate: Date): Promise<ParkingRegistration[]> {
    if (!airtable.parkingRegistrations) throw new Error("Airtable parkingRegistrations is not configured");
    const startIso = startDate.toISOString().split('T')[0];
    const endIso = endDate.toISOString().split('T')[0];
    
    const records = await airtable.parkingRegistrations.select({
      filterByFormula: `AND(IS_AFTER({startTime}, "${startIso}"), IS_BEFORE({startTime}, "${endIso}"))`,
      sort: [{ field: 'startTime', direction: 'desc' }]
    }).all();
    
    return records.map(convertAirtableRecord);
  }

  async getAllParkingRegistrations(): Promise<ParkingRegistration[]> {
    if (!airtable.parkingRegistrations) throw new Error("Airtable parkingRegistrations is not configured");
    const records = await airtable.parkingRegistrations.select({
      sort: [{ field: 'startTime', direction: 'desc' }]
    }).all();
    return records.map(convertAirtableRecord);
  }

  async createStaffExemption(exemption: InsertStaffExemption): Promise<StaffExemption> {
    if (!airtable.staffExemptions) throw new Error("Airtable staffExemptions is not configured");
    const airtableFields = convertToAirtableFields(exemption);
    // Convert dates to ISO strings for Airtable
    if (airtableFields.startDate) airtableFields.startDate = new Date(airtableFields.startDate).toISOString().split('T')[0];
    if (airtableFields.endDate) airtableFields.endDate = new Date(airtableFields.endDate).toISOString().split('T')[0];
    
    const record = await airtable.staffExemptions.create(airtableFields);
    return convertAirtableRecord(record);
  }

  async getStaffExemptions(): Promise<StaffExemption[]> {
    if (!airtable.staffExemptions) throw new Error("Airtable staffExemptions is not configured");
    const records = await airtable.staffExemptions.select({
      sort: [{ field: 'startDate', direction: 'asc' }]
    }).all();
    return records.map(convertAirtableRecord);
  }

  async getStaffExemptionByLicensePlate(licensePlate: string): Promise<StaffExemption | undefined> {
    try {
      if (!airtable.staffExemptions) throw new Error("Airtable staffExemptions is not configured");
      const today = new Date().toISOString().split('T')[0];
      const records = await airtable.staffExemptions.select({
        filterByFormula: `AND({licensePlate} = "${licensePlate}", {isActive} = 1, IS_BEFORE("${today}", {endDate}), IS_AFTER("${today}", {startDate}))`,
        maxRecords: 1
      }).firstPage();
      
      if (records.length > 0) {
        return convertAirtableRecord(records[0]);
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  async updateStaffExemption(id: number, exemption: Partial<InsertStaffExemption>): Promise<StaffExemption> {
    if (!airtable.staffExemptions) throw new Error("Airtable staffExemptions is not configured");
    const updateFields = convertToAirtableFields(exemption);
    // Convert dates to ISO strings for Airtable
    if (updateFields.startDate) updateFields.startDate = new Date(updateFields.startDate).toISOString().split('T')[0];
    if (updateFields.endDate) updateFields.endDate = new Date(updateFields.endDate).toISOString().split('T')[0];
    
    const record = await airtable.staffExemptions.update(id.toString(), updateFields);
    return convertAirtableRecord(record);
  }

  async deleteStaffExemption(id: number): Promise<void> {
    if (!airtable.staffExemptions) throw new Error("Airtable staffExemptions is not configured");
    await airtable.staffExemptions.destroy(id.toString());
  }

  async checkParkingStatus(licensePlate: string): Promise<{
    isLegal: boolean;
    status: string;
    type: 'paid' | 'staff' | 'expired' | 'not_found';
    validUntil?: Date;
    amount?: string;
    paymentMethod?: string;
  }> {
    const now = new Date();
    
    // Check for active staff exemption
    const staffExemption = await this.getStaffExemptionByLicensePlate(licensePlate);
    if (staffExemption) {
      return {
        isLegal: true,
        status: 'Staff parking - valid exemption',
        type: 'staff',
        validUntil: new Date(staffExemption.endDate),
      };
    }
    
    // Check for paid parking registration
    const registration = await this.getParkingRegistrationByLicensePlate(licensePlate);
    if (registration) {
      const endTime = new Date(registration.endTime);
      const isValid = endTime > now;
      
      return {
        isLegal: isValid,
        status: isValid ? 'Valid paid parking' : 'Parking expired',
        type: isValid ? 'paid' : 'expired',
        validUntil: endTime,
        amount: registration.amount,
        paymentMethod: registration.paymentMethod || 'card',
      };
    }
    
    return {
      isLegal: false,
      status: 'No valid parking found',
      type: 'not_found',
    };
  }
}

export const storage = new AirtableStorage();