/**
 * Tipos compartilhados do RespondeZap AI.
 * Mantidos em um único lugar para refletir o schema do Supabase (ver supabase/schema.sql).
 */

export type AttendanceTone = "formal" | "amigavel" | "tecnico";

export interface Company {
  id: string;
  user_id: string;
  name: string;
  segment: string;
  products_services: string;
  business_hours: string;
  tone: AttendanceTone;
  created_at: string;
  updated_at: string;
}

export interface GeneratedResponse {
  id: string;
  user_id: string;
  company_id: string | null;
  customer_message: string;
  ai_response: string;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}
