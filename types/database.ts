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
          imageUrl: string | null
          min_spots: number
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
          imageUrl?: string | null
          min_spots?: number
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
          imageUrl?: string | null
          min_spots?: number
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
          email: string
          end: string | null
          event: number | null
          exclusive: boolean
          id: number
          info: string | null
          name: string
          number: string
          paymentIdentifier: string | null
          paymentNeeded: boolean
          spots: number
          start: string
          theme: string | null
          type: Database['public']['Enums']['bookingType']
        }
        Insert: {
          created_at?: string
          day: string
          email: string
          end?: string | null
          event?: number | null
          exclusive?: boolean
          id?: number
          info?: string | null
          name: string
          number: string
          paymentIdentifier?: string | null
          paymentNeeded?: boolean
          spots: number
          start: string
          theme?: string | null
          type: Database['public']['Enums']['bookingType']
        }
        Update: {
          created_at?: string
          day?: string
          email?: string
          end?: string | null
          event?: number | null
          exclusive?: boolean
          id?: number
          info?: string | null
          name?: string
          number?: string
          paymentIdentifier?: string | null
          paymentNeeded?: boolean
          spots?: number
          start?: string
          theme?: string | null
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
      roster: {
        Row: {
          created_at: string
          day: string
          end: string
          id: number
          minSpots: number
          start: string
          status: Database['public']['Enums']['rosterStatus']
        }
        Insert: {
          created_at?: string
          day: string
          end: string
          id?: number
          minSpots: number
          start: string
          status?: Database['public']['Enums']['rosterStatus']
        }
        Update: {
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
      themes: {
        Row: {
          created_at: string
          id: number
          label: string
        }
        Insert: {
          created_at?: string
          id?: number
          label: string
        }
        Update: {
          created_at?: string
          id?: number
          label?: string
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

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
  Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
  PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
    PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
