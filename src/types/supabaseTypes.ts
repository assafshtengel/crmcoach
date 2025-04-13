
export interface LandingPage {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  profile_image_path?: string | null;
  coach_id?: string;
  is_published?: boolean;
  created_at?: string;
}
