// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      order_deliverables: {
        Row: {
          created_at: string
          id: string
          order_id: string
          title: string
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          title: string
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          title?: string
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_deliverables_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
        ]
      }
      order_photos: {
        Row: {
          created_at: string
          id: string
          order_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_photos_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: {
          client_email: string
          client_name: string
          client_whatsapp: string | null
          created_at: string
          dimensions: string | null
          display_id: number
          id: string
          notes: string | null
          plan: string
          preferences: string | null
          property_type: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          client_email: string
          client_name: string
          client_whatsapp?: string | null
          created_at?: string
          dimensions?: string | null
          display_id?: number
          id?: string
          notes?: string | null
          plan: string
          preferences?: string | null
          property_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_whatsapp?: string | null
          created_at?: string
          dimensions?: string | null
          display_id?: number
          id?: string
          notes?: string | null
          plan?: string
          preferences?: string | null
          property_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_media: {
        Row: {
          created_at: string
          description: string | null
          id: string
          materials_used: string | null
          plants_used: string | null
          project_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          materials_used?: string | null
          plants_used?: string | null
          project_id: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          materials_used?: string | null
          plants_used?: string | null
          project_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_media_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          client_name: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      revision_requests: {
        Row: {
          created_at: string
          description: string
          id: string
          order_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          order_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          order_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'revision_requests_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
        ]
      }
      site_settings: {
        Row: {
          accent_color: string | null
          address: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          cta_button_link: string | null
          cta_button_text: string | null
          cta_text: string | null
          cta_title: string | null
          hero_button_link: string | null
          hero_button_text: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          instagram_link: string | null
          logo_url: string | null
          primary_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          cta_button_link?: string | null
          cta_button_text?: string | null
          cta_text?: string | null
          cta_title?: string | null
          hero_button_link?: string | null
          hero_button_text?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram_link?: string | null
          logo_url?: string | null
          primary_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          cta_button_link?: string | null
          cta_button_text?: string | null
          cta_text?: string | null
          cta_title?: string | null
          hero_button_link?: string | null
          hero_button_text?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram_link?: string | null
          logo_url?: string | null
          primary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_client_order: {
        Args: { p_email: string; p_id: string }
        Returns: {
          client_email: string
          client_name: string
          client_whatsapp: string | null
          created_at: string
          dimensions: string | null
          display_id: number
          id: string
          notes: string | null
          plan: string
          preferences: string | null
          property_type: string | null
          status: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: '*'
          to: 'orders'
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
