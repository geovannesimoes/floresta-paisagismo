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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customer_profiles: {
        Row: {
          cpf: string | null
          created_at: string | null
          full_name: string | null
          id: string
          must_change_password: boolean | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          must_change_password?: boolean | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          must_change_password?: boolean | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      email_outbox: {
        Row: {
          created_at: string
          error: string | null
          event_type: string
          html: string | null
          id: string
          provider_message_id: string | null
          related_order_id: string | null
          related_user_id: string | null
          status: string
          subject: string
          to_emails: string[]
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type: string
          html?: string | null
          id?: string
          provider_message_id?: string | null
          related_order_id?: string | null
          related_user_id?: string | null
          status?: string
          subject: string
          to_emails: string[]
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string
          html?: string | null
          id?: string
          provider_message_id?: string | null
          related_order_id?: string | null
          related_user_id?: string | null
          status?: string
          subject?: string
          to_emails?: string[]
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      order_checklist_items: {
        Row: {
          created_at: string
          id: string
          is_done: boolean | null
          order_id: string
          sort_order: number | null
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_done?: boolean | null
          order_id: string
          sort_order?: number | null
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_done?: boolean | null
          order_id?: string
          sort_order?: number | null
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_checklist_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
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
            foreignKeyName: "order_deliverables_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
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
            foreignKeyName: "order_photos_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          asaas_checkout_id: string | null
          asaas_checkout_url: string | null
          asaas_customer_id: string | null
          asaas_invoice_url: string | null
          asaas_payment_id: string | null
          asaas_status: string | null
          asaas_webhook_last_event_at: string | null
          client_cpf_cnpj: string | null
          client_email: string
          client_name: string
          client_whatsapp: string | null
          code: string
          created_at: string
          delivered_at: string | null
          delivery_deadline_days: number | null
          dimensions: string | null
          display_id: number
          id: string
          is_test: boolean | null
          notes: string | null
          paid_at: string | null
          payment_mode: string | null
          payment_status: string | null
          plan: string
          plan_id: string | null
          plan_snapshot_features: Json | null
          plan_snapshot_name: string | null
          plan_snapshot_price_cents: number | null
          preferences: string | null
          price: number | null
          property_type: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          asaas_checkout_id?: string | null
          asaas_checkout_url?: string | null
          asaas_customer_id?: string | null
          asaas_invoice_url?: string | null
          asaas_payment_id?: string | null
          asaas_status?: string | null
          asaas_webhook_last_event_at?: string | null
          client_cpf_cnpj?: string | null
          client_email: string
          client_name: string
          client_whatsapp?: string | null
          code: string
          created_at?: string
          delivered_at?: string | null
          delivery_deadline_days?: number | null
          dimensions?: string | null
          display_id?: number
          id?: string
          is_test?: boolean | null
          notes?: string | null
          paid_at?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          plan: string
          plan_id?: string | null
          plan_snapshot_features?: Json | null
          plan_snapshot_name?: string | null
          plan_snapshot_price_cents?: number | null
          preferences?: string | null
          price?: number | null
          property_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          asaas_checkout_id?: string | null
          asaas_checkout_url?: string | null
          asaas_customer_id?: string | null
          asaas_invoice_url?: string | null
          asaas_payment_id?: string | null
          asaas_status?: string | null
          asaas_webhook_last_event_at?: string | null
          client_cpf_cnpj?: string | null
          client_email?: string
          client_name?: string
          client_whatsapp?: string | null
          code?: string
          created_at?: string
          delivered_at?: string | null
          delivery_deadline_days?: number | null
          dimensions?: string | null
          display_id?: number
          id?: string
          is_test?: boolean | null
          notes?: string | null
          paid_at?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          plan?: string
          plan_id?: string | null
          plan_snapshot_features?: Json | null
          plan_snapshot_name?: string | null
          plan_snapshot_price_cents?: number | null
          preferences?: string | null
          price?: number | null
          property_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_features: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          cta: string | null
          description: string | null
          highlight: boolean | null
          id: string
          is_active: boolean
          name: string
          price_cents: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta?: string | null
          description?: string | null
          highlight?: boolean | null
          id?: string
          is_active?: boolean
          name: string
          price_cents?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta?: string | null
          description?: string | null
          highlight?: boolean | null
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
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
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
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
            foreignKeyName: "revision_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
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
          cta_background_image_url: string | null
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
          cta_background_image_url?: string | null
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
          cta_background_image_url?: string | null
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
      confirm_order_payment: {
        Args: { p_email: string; p_order_code: string; p_order_id: string }
        Returns: {
          asaas_checkout_id: string | null
          asaas_checkout_url: string | null
          asaas_customer_id: string | null
          asaas_invoice_url: string | null
          asaas_payment_id: string | null
          asaas_status: string | null
          asaas_webhook_last_event_at: string | null
          client_cpf_cnpj: string | null
          client_email: string
          client_name: string
          client_whatsapp: string | null
          code: string
          created_at: string
          delivered_at: string | null
          delivery_deadline_days: number | null
          dimensions: string | null
          display_id: number
          id: string
          is_test: boolean | null
          notes: string | null
          paid_at: string | null
          payment_mode: string | null
          payment_status: string | null
          plan: string
          plan_id: string | null
          plan_snapshot_features: Json | null
          plan_snapshot_name: string | null
          plan_snapshot_price_cents: number | null
          preferences: string | null
          price: number | null
          property_type: string | null
          status: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_order_and_return: {
        Args: {
          p_client_cpf_cnpj: string
          p_client_email: string
          p_client_name: string
          p_client_whatsapp: string
          p_dimensions: string
          p_notes: string
          p_plan: string
          p_plan_id?: string
          p_plan_snapshot_features?: Json
          p_plan_snapshot_name?: string
          p_plan_snapshot_price_cents?: number
          p_preferences: string
          p_property_type: string
        }
        Returns: {
          asaas_checkout_id: string | null
          asaas_checkout_url: string | null
          asaas_customer_id: string | null
          asaas_invoice_url: string | null
          asaas_payment_id: string | null
          asaas_status: string | null
          asaas_webhook_last_event_at: string | null
          client_cpf_cnpj: string | null
          client_email: string
          client_name: string
          client_whatsapp: string | null
          code: string
          created_at: string
          delivered_at: string | null
          delivery_deadline_days: number | null
          dimensions: string | null
          display_id: number
          id: string
          is_test: boolean | null
          notes: string | null
          paid_at: string | null
          payment_mode: string | null
          payment_status: string | null
          plan: string
          plan_id: string | null
          plan_snapshot_features: Json | null
          plan_snapshot_name: string | null
          plan_snapshot_price_cents: number | null
          preferences: string | null
          price: number | null
          property_type: string | null
          status: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_client_order:
        | {
            Args: { p_code: string; p_email: string }
            Returns: {
              asaas_checkout_id: string | null
              asaas_checkout_url: string | null
              asaas_customer_id: string | null
              asaas_invoice_url: string | null
              asaas_payment_id: string | null
              asaas_status: string | null
              asaas_webhook_last_event_at: string | null
              client_cpf_cnpj: string | null
              client_email: string
              client_name: string
              client_whatsapp: string | null
              code: string
              created_at: string
              delivered_at: string | null
              delivery_deadline_days: number | null
              dimensions: string | null
              display_id: number
              id: string
              is_test: boolean | null
              notes: string | null
              paid_at: string | null
              payment_mode: string | null
              payment_status: string | null
              plan: string
              plan_id: string | null
              plan_snapshot_features: Json | null
              plan_snapshot_name: string | null
              plan_snapshot_price_cents: number | null
              preferences: string | null
              price: number | null
              property_type: string | null
              status: string | null
              updated_at: string
            }[]
            SetofOptions: {
              from: "*"
              to: "orders"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { p_email: string; p_id: string }
            Returns: {
              asaas_checkout_id: string | null
              asaas_checkout_url: string | null
              asaas_customer_id: string | null
              asaas_invoice_url: string | null
              asaas_payment_id: string | null
              asaas_status: string | null
              asaas_webhook_last_event_at: string | null
              client_cpf_cnpj: string | null
              client_email: string
              client_name: string
              client_whatsapp: string | null
              code: string
              created_at: string
              delivered_at: string | null
              delivery_deadline_days: number | null
              dimensions: string | null
              display_id: number
              id: string
              is_test: boolean | null
              notes: string | null
              paid_at: string | null
              payment_mode: string | null
              payment_status: string | null
              plan: string
              plan_id: string | null
              plan_snapshot_features: Json | null
              plan_snapshot_name: string | null
              plan_snapshot_price_cents: number | null
              preferences: string | null
              price: number | null
              property_type: string | null
              status: string | null
              updated_at: string
            }[]
            SetofOptions: {
              from: "*"
              to: "orders"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_client_order_details: {
        Args: { p_code: string; p_email: string }
        Returns: Json
      }
      get_order_by_code: {
        Args: { p_code: string }
        Returns: {
          asaas_checkout_id: string | null
          asaas_checkout_url: string | null
          asaas_customer_id: string | null
          asaas_invoice_url: string | null
          asaas_payment_id: string | null
          asaas_status: string | null
          asaas_webhook_last_event_at: string | null
          client_cpf_cnpj: string | null
          client_email: string
          client_name: string
          client_whatsapp: string | null
          code: string
          created_at: string
          delivered_at: string | null
          delivery_deadline_days: number | null
          dimensions: string | null
          display_id: number
          id: string
          is_test: boolean | null
          notes: string | null
          paid_at: string | null
          payment_mode: string | null
          payment_status: string | null
          plan: string
          plan_id: string | null
          plan_snapshot_features: Json | null
          plan_snapshot_name: string | null
          plan_snapshot_price_cents: number | null
          preferences: string | null
          price: number | null
          property_type: string | null
          status: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
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
  public: {
    Enums: {},
  },
} as const

