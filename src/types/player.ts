
export interface PlayerFormData {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  notes?: string;
}

export interface PlayerWithId extends PlayerFormData {
  id: string;
}

export interface PlayerFullData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  coach_id?: string;
  birthdate?: string;
  city?: string;
  club?: string;
  year_group?: string;
  injuries?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  notes?: string;
  sport_field?: string;
  profile_image?: string;
  position?: string;
  created_at?: string;
}
