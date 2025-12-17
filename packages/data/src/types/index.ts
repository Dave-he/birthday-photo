export interface Scene {
  id: string;
  name: string;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  avatar_url: string;
}

export interface Photo {
  id: string;
  image_url: string;
  title: string;
  description: string;
  position_index: number;
  scene_id?: string;
  member_id?: string;
  tags?: string[];
  
  // Relations (Fetched via join)
  members?: Member; 
}

export interface Settings {
  id?: string;
  bg_music_url: string;
  snow_density: number;
  is_snowing: boolean;
  greeting_title: string;
  auto_mode_cycle_enabled?: boolean;
  mode_cycle_min_seconds?: number;
  mode_cycle_max_seconds?: number;
  low_quality_mode?: boolean;
  particle_multiplier?: number;
  rotate_speed?: number;
}
