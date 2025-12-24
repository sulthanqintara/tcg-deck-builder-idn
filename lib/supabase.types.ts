export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      idn_card_abilities: {
        Row: {
          card_id: string
          created_at: string | null
          effect: string
          id: number
          name: string
          position: number | null
          type: string | null
        }
        Insert: {
          card_id: string
          created_at?: string | null
          effect: string
          id?: number
          name: string
          position?: number | null
          type?: string | null
        }
        Update: {
          card_id?: string
          created_at?: string | null
          effect?: string
          id?: number
          name?: string
          position?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idn_card_abilities_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "idn_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      idn_card_attacks: {
        Row: {
          card_id: string
          cost: string[] | null
          created_at: string | null
          damage: string | null
          effect: string | null
          id: number
          name: string
          position: number | null
        }
        Insert: {
          card_id: string
          cost?: string[] | null
          created_at?: string | null
          damage?: string | null
          effect?: string | null
          id?: number
          name: string
          position?: number | null
        }
        Update: {
          card_id?: string
          cost?: string[] | null
          created_at?: string | null
          damage?: string | null
          effect?: string | null
          id?: number
          name?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "idn_card_attacks_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "idn_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      idn_card_search_text: {
        Row: {
          card_id: string
          search_text: string
          updated_at: string | null
        }
        Insert: {
          card_id: string
          search_text: string
          updated_at?: string | null
        }
        Update: {
          card_id?: string
          search_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idn_card_search_text_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "idn_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      idn_cards: {
        Row: {
          category: string
          created_at: string | null
          effect_text: string | null
          flavor_text: string | null
          hp: number | null
          id: string
          illustrator: string | null
          image_url: string
          local_id: string
          name: string
          pokedex_number: number | null
          rarity: string | null
          regulation_mark: string | null
          resistance: Json | null
          retreat_cost: number | null
          set_id: string | null
          stage: string | null
          subtype: string | null
          types: string[] | null
          updated_at: string | null
          weakness: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          effect_text?: string | null
          flavor_text?: string | null
          hp?: number | null
          id: string
          illustrator?: string | null
          image_url: string
          local_id: string
          name: string
          pokedex_number?: number | null
          rarity?: string | null
          regulation_mark?: string | null
          resistance?: Json | null
          retreat_cost?: number | null
          set_id?: string | null
          stage?: string | null
          subtype?: string | null
          types?: string[] | null
          updated_at?: string | null
          weakness?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          effect_text?: string | null
          flavor_text?: string | null
          hp?: number | null
          id?: string
          illustrator?: string | null
          image_url?: string
          local_id?: string
          name?: string
          pokedex_number?: number | null
          rarity?: string | null
          regulation_mark?: string | null
          resistance?: Json | null
          retreat_cost?: number | null
          set_id?: string | null
          stage?: string | null
          subtype?: string | null
          types?: string[] | null
          updated_at?: string | null
          weakness?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "idn_cards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "idn_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      idn_sets: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          total_cards: number | null
        }
        Insert: {
          created_at?: string | null
          id: string
          logo_url?: string | null
          name: string
          total_cards?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          total_cards?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
