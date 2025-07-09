import Airtable from 'airtable';

// For local development, create mock Airtable if credentials are not provided
const isDevelopment = process.env.NODE_ENV === 'development';
const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey && !isDevelopment) {
  throw new Error('Missing required Airtable API key: AIRTABLE_API_KEY');
}
if (!baseId && !isDevelopment) {
  throw new Error('Missing required Airtable base ID: AIRTABLE_BASE_ID');
}

// Create mock Airtable for development if credentials are missing
const base = (apiKey && baseId)
  ? new Airtable({ apiKey: apiKey! }).base(baseId!)
  : null;

if (isDevelopment && (!apiKey || !baseId)) {
  console.log('⚠️  Running in development mode with mock Airtable. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID for full functionality.');
}

export const airtable = {
  users: base ? base('Users') : null,
  parkingRates: base ? base('Parking Rates') : null,
  parkingRegistrations: base ? base('Parking Registrations') : null,
  staffExemptions: base ? base('Staff Exemptions') : null,
};

// Helper functions to convert Airtable records to our schema types
export const convertAirtableRecord = (record: any) => {
  const fields = { ...record.fields };
  if (fields.price !== undefined && fields.price !== null) {
    fields.price = fields.price.toString();
  }
  return {
    id: record.id,
    ...fields,
  };
};

export const convertToAirtableFields = (data: any) => {
  const { id, ...fields } = data;
  return fields;
};