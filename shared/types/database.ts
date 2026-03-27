export type Json
  = | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.0.2 (a4e00ff)'
  }
  public: {
    Tables: {
      events: {
        Row: {
          bookingDeadline: string
          created_at: string
          day: string
          description: string | null
          end: string | null
          external: boolean
          id: number
          minSpots: number
          name: string
          onlinePayment: boolean
          price: number | null
          spots: number | null
          start: string
          theme: string
          unitPrice: boolean | null
        }
        Insert: {
          bookingDeadline: string
          created_at?: string
          day: string
          description?: string | null
          end?: string | null
          external?: boolean
          id?: number
          minSpots?: number
          name: string
          onlinePayment?: boolean
          price?: number | null
          spots?: number | null
          start: string
          theme: string
          unitPrice?: boolean | null
        }
        Update: {
          bookingDeadline?: string
          created_at?: string
          day?: string
          description?: string | null
          end?: string | null
          external?: boolean
          id?: number
          minSpots?: number
          name?: string
          onlinePayment?: boolean
          price?: number | null
          spots?: number | null
          start?: string
          theme?: string
          unitPrice?: boolean | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          day: string
          email: string | null
          end: string | null
          event: number | null
          exclusive: boolean
          id: number
          info: string | null
          name: string
          number: string | null
          paymentIdentifier: string | null
          paymentNeeded: boolean
          spots: number
          start: string
          type: Database['public']['Enums']['bookingType']
        }
        Insert: {
          created_at?: string
          day: string
          email?: string | null
          end?: string | null
          event?: number | null
          exclusive?: boolean
          id?: number
          info?: string | null
          name: string
          number?: string | null
          paymentIdentifier?: string | null
          paymentNeeded?: boolean
          spots: number
          start: string
          type: Database['public']['Enums']['bookingType']
        }
        Update: {
          created_at?: string
          day?: string
          email?: string | null
          end?: string | null
          event?: number | null
          exclusive?: boolean
          id?: number
          info?: string | null
          name?: string
          number?: string | null
          paymentIdentifier?: string | null
          paymentNeeded?: boolean
          spots?: number
          start?: string
          type?: Database['public']['Enums']['bookingType']
        }
        Relationships: [
          {
            foreignKeyName: 'public_reservation_event_fkey'
            columns: ['event']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      rosters: {
        Row: {
          allowReservation: boolean | null
          created_at: string
          day: string
          end: string
          id: number
          minSpots: number
          start: string
          status: Database['public']['Enums']['rosterStatus']
        }
        Insert: {
          allowReservation?: boolean | null
          created_at?: string
          day: string
          end: string
          id?: number
          minSpots: number
          start: string
          status?: Database['public']['Enums']['rosterStatus']
        }
        Update: {
          allowReservation?: boolean | null
          created_at?: string
          day?: string
          end?: string
          id?: number
          minSpots?: number
          start?: string
          status?: Database['public']['Enums']['rosterStatus']
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
      bookingType: 'game' | 'reservation' | 'event'
      rosterStatus: 'occupied' | 'game' | 'reservation'
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
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables']
    & DefaultSchema['Views'])
    ? (DefaultSchema['Tables']
      & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
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
    Enums: {
      bookingType: ['game', 'reservation', 'event'],
      rosterStatus: ['occupied', 'game', 'reservation'],
    },
  },
} as const
