export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_featured: boolean | null
          member_id: string | null
          position_index: number
          scene_id: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          member_id?: string | null
          position_index: number
          scene_id?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          member_id?: string | null
          position_index?: number
          scene_id?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_scene_id_fkey"
            columns: ["scene_id"]
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          }
        ]
      }
      scenes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          auto_mode_cycle_enabled: boolean | null
          bg_music_url: string | null
          created_at: string
          greeting_title: string | null
          id: string
          is_snowing: boolean | null
          low_quality_mode: boolean | null
          mode_cycle_max_seconds: number | null
          mode_cycle_min_seconds: number | null
          particle_multiplier: number | null
          rotate_speed: number | null
          snow_density: number | null
        }
        Insert: {
          auto_mode_cycle_enabled?: boolean | null
          bg_music_url?: string | null
          created_at?: string
          greeting_title?: string | null
          id?: string
          is_snowing?: boolean | null
          low_quality_mode?: boolean | null
          mode_cycle_max_seconds?: number | null
          mode_cycle_min_seconds?: number | null
          particle_multiplier?: number | null
          rotate_speed?: number | null
          snow_density?: number | null
        }
        Update: {
          auto_mode_cycle_enabled?: boolean | null
          bg_music_url?: string | null
          created_at?: string
          greeting_title?: string | null
          id?: string
          is_snowing?: boolean | null
          low_quality_mode?: boolean | null
          mode_cycle_max_seconds?: number | null
          mode_cycle_min_seconds?: number | null
          particle_multiplier?: number | null
          rotate_speed?: number | null
          snow_density?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
