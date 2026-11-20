export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DE' | 'DT' | 'LB' | 'CB' | 'S' | 'K' | 'P'
export type CareerStage = 'high_school' | 'college' | 'nfl' | 'retired'
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
export type GameplayMode = 'simple' | 'advanced' | 'none'
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'
export type NotificationType = 'friend_request' | 'achievement' | 'challenge_complete' | 'shop_refresh' | 'reward' | 'leaderboard' | 'career_milestone'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          coins: number
          xp: number
          level: number
          battle_pass_tier: number
          battle_pass_premium: boolean
          favorite_team: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      players: {
        Row: {
          id: string
          user_id: string
          name: string
          nickname: string | null
          position: Position
          skin_tone: string
          hair_style: string
          hair_color: string
          face_style: string
          body_build: 'slim' | 'athletic' | 'power' | 'big'
          height_inches: number
          weight_lbs: number
          jersey_number: number
          helmet_style: string
          visor: string | null
          gloves: string | null
          cleats: string | null
          sleeve: string | null
          accessories: string[]
          primary_color: string
          secondary_color: string
          uniform_style: string
          celebration: string
          overall: number
          speed: number
          strength: number
          agility: number
          awareness: number
          stamina: number
          throw_power: number | null
          throw_accuracy: number | null
          throw_on_run: number | null
          pocket_presence: number | null
          catching: number | null
          route_running: number | null
          break_tackle: number | null
          carrying: number | null
          pass_block: number | null
          run_block: number | null
          tackle: number | null
          pursuit: number | null
          play_recognition: number | null
          press_coverage: number | null
          man_coverage: number | null
          zone_coverage: number | null
          block_shedding: number | null
          kick_power: number | null
          kick_accuracy: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['players']['Insert']>
      }
      careers: {
        Row: {
          id: string
          user_id: string
          player_id: string
          stage: CareerStage
          current_year: number
          season: number
          hs_school: string | null
          hs_state: string | null
          hs_championships: number
          college: string | null
          college_conference: string | null
          college_championships: number
          heisman_winner: boolean
          all_american: boolean
          nfl_team: string | null
          draft_round: number | null
          draft_pick: number | null
          contracts_signed: number
          super_bowl_wins: number
          mvp_awards: number
          pro_bowl_selections: number
          all_pro_selections: number
          hall_of_fame: boolean
          reputation_score: number
          fan_favorite: boolean
          career_stats: Json
          story_flags: Json
          is_active: boolean
          retired_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['careers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['careers']['Insert']>
      }
      game_results: {
        Row: {
          id: string
          career_id: string
          user_id: string
          season: number
          week: number
          stage: string
          game_type: 'regular' | 'playoff' | 'championship' | 'bowl' | 'super_bowl'
          player_team: string
          opponent_team: string
          player_score: number
          opponent_score: number
          won: boolean
          stats: Json
          gameplay_mode: GameplayMode
          game_rating: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['game_results']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['game_results']['Insert']>
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: FriendshipStatus
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['friendships']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['friendships']['Insert']>
      }
      shop_items: {
        Row: {
          id: string
          name: string
          description: string | null
          category: 'helmet' | 'gloves' | 'cleats' | 'uniform' | 'celebration' | 'player_card' | 'profile_cosmetic' | 'accessory' | 'special'
          rarity: Rarity
          coin_price: number
          image_url: string | null
          item_data: Json
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['shop_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['shop_items']['Insert']>
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          challenge_type: 'daily' | 'weekly'
          positions: string[]
          objective_type: string
          objective_target: number
          coin_reward: number
          xp_reward: number
          valid_from: string
          valid_until: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['challenges']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>
      }
      challenge_progress: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          career_id: string | null
          current_value: number
          completed: boolean
          rewarded: boolean
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['challenge_progress']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['challenge_progress']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          data: Json
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      leaderboard_entries: {
        Row: {
          id: string
          user_id: string
          career_id: string
          week_start: string
          score: number
          rank: number | null
          stat_summary: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leaderboard_entries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leaderboard_entries']['Insert']>
      }
      hall_of_fame: {
        Row: {
          id: string
          user_id: string
          career_id: string
          player_name: string
          position: Position
          inducted_at: string
          career_summary: Json
          highlight: string | null
        }
        Insert: Omit<Database['public']['Tables']['hall_of_fame']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['hall_of_fame']['Insert']>
      }
      battle_pass_tiers: {
        Row: {
          tier: number
          season: number
          xp_required: number
          free_reward_type: string | null
          free_reward_value: Json
          free_reward_label: string | null
          premium_reward_type: string | null
          premium_reward_value: Json
          premium_reward_label: string | null
        }
        Insert: Database['public']['Tables']['battle_pass_tiers']['Row']
        Update: Partial<Database['public']['Tables']['battle_pass_tiers']['Row']>
      }
      daily_shop: {
        Row: {
          id: string
          shop_date: string
          items: Json
          featured_item_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_shop']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['daily_shop']['Insert']>
      }
      owned_items: {
        Row: {
          id: string
          user_id: string
          shop_item_id: string
          equipped_to: string | null
          acquired_at: string
        }
        Insert: Omit<Database['public']['Tables']['owned_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['owned_items']['Insert']>
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          shop_item_id: string
          coins_spent: number
          purchased_at: string
        }
        Insert: Omit<Database['public']['Tables']['purchases']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['purchases']['Insert']>
      }
      story_events: {
        Row: {
          id: string
          career_id: string
          event_type: string
          title: string
          description: string
          choice_made: string | null
          outcome: string | null
          reputation_change: number
          season: number
          week: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['story_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['story_events']['Insert']>
      }
    }
    Functions: {
      award_coins: {
        Args: { p_user_id: string; p_amount: number; p_source: string; p_reference_id?: string }
        Returns: number
      }
      award_xp: {
        Args: { p_user_id: string; p_amount: number; p_source: string }
        Returns: { new_xp: number; new_level: number; leveled_up: boolean }[]
      }
    }
  }
}
