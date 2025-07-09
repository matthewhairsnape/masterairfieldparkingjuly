import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("user"), // user, admin
});

export const parkingRates = pgTable("parking_rates", {
  id: serial("id").primaryKey(),
  durationType: text("duration_type").notNull(), // half_day, full_day, weekly, monthly
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  durationHours: integer("duration_hours").notNull(),
  description: text("description").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const parkingRegistrations = pgTable("parking_registrations", {
  id: serial("id").primaryKey(),
  licensePlate: text("license_plate").notNull(),
  email: text("email"),
  durationType: text("duration_type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentIntentId: text("payment_intent_id"),
  paymentMethod: text("payment_method").notNull().default("stripe"),
  status: text("status").notNull().default("pending"), // pending, paid, expired
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  receiptSent: boolean("receipt_sent").default(false),
});

export const staffExemptions = pgTable("staff_exemptions", {
  id: serial("id").primaryKey(),
  licensePlate: text("license_plate").notNull(),
  staffName: text("staff_name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parkingRatesRelations = relations(parkingRates, ({ many }) => ({
  registrations: many(parkingRegistrations),
}));

export const parkingRegistrationsRelations = relations(parkingRegistrations, ({ one }) => ({
  rate: one(parkingRates, {
    fields: [parkingRegistrations.durationType],
    references: [parkingRates.durationType],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertParkingRateSchema = createInsertSchema(parkingRates).omit({
  id: true,
  updatedAt: true,
});

export const insertParkingRegistrationSchema = createInsertSchema(parkingRegistrations).omit({
  id: true,
  createdAt: true,
  receiptSent: true,
}).extend({
  amount: z.string(),
  endTime: z.date(),
  startTime: z.date().optional(),
});

export const insertStaffExemptionSchema = createInsertSchema(staffExemptions).omit({
  id: true,
  createdAt: true,
});

export const searchRegistrationSchema = z.object({
  licensePlate: z.string().min(1).max(20),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ParkingRate = typeof parkingRates.$inferSelect;
export type InsertParkingRate = z.infer<typeof insertParkingRateSchema>;
export type ParkingRegistration = typeof parkingRegistrations.$inferSelect;
export type InsertParkingRegistration = z.infer<typeof insertParkingRegistrationSchema>;
export type StaffExemption = typeof staffExemptions.$inferSelect;
export type InsertStaffExemption = z.infer<typeof insertStaffExemptionSchema>;
export type SearchRegistration = z.infer<typeof searchRegistrationSchema>;
