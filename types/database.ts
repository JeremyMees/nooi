export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      citext: {
        Args: { '': boolean } | { '': string } | { '': unknown }
        Returns: string
      }
      citext_hash: {
        Args: { '': string }
        Returns: number
      }
      citextin: {
        Args: { '': unknown }
        Returns: string
      }
      citextout: {
        Args: { '': string }
        Returns: unknown
      }
      citextrecv: {
        Args: { '': unknown }
        Returns: string
      }
      citextsend: {
        Args: { '': string }
        Returns: string
      }
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

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
    Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
  Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema['CompositeTypes']
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
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
