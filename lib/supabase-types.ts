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
      messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          last_modified_at: string
          note_id: string
          server_created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          last_modified_at?: string
          note_id: string
          server_created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          last_modified_at?: string
          note_id?: string
          server_created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          created_at: string
          date: string
          deleted_at: string | null
          id: string
          last_modified_at: string
          note_type: Database["public"]["Enums"]["note_type"]
          server_created_at: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          deleted_at?: string | null
          id?: string
          last_modified_at?: string
          note_type?: Database["public"]["Enums"]["note_type"]
          server_created_at?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          deleted_at?: string | null
          id?: string
          last_modified_at?: string
          note_type?: Database["public"]["Enums"]["note_type"]
          server_created_at?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_message: {
        Args: {
          p_id: string
          p_note_id: string
          p_user_id: string
          p_content: string
          p_created_at: string
          p_updated_at: string
        }
        Returns: string
      }
      create_note:
        | {
            Args: {
              p_id: string
              p_user_id: string
              p_title: string
              p_note_type: Database["public"]["Enums"]["note_type"]
              p_date: string
              p_created_at: string
              p_updated_at: string
            }
            Returns: string
          }
        | {
            Args: {
              p_id: string
              p_user_id: string
              p_title: string
              p_note_type: Database["public"]["Enums"]["note_type"]
              p_date: string
              p_created_at: string
              p_updated_at: string
            }
            Returns: string
          }
      epoch_to_timestamp: {
        Args: {
          epoch: string
        }
        Returns: string
      }
      pull:
        | {
            Args: {
              last_pulled_at?: number
            }
            Returns: Json
          }
        | {
            Args: {
              last_pulled_at?: number
              p_user_id?: string
            }
            Returns: Json
          }
      push: {
        Args: {
          changes: Json
        }
        Returns: undefined
      }
      timestamp_to_epoch: {
        Args: {
          ts: string
        }
        Returns: number
      }
      update_message: {
        Args: {
          p_id: string
          p_content: string
          p_updated_at: string
        }
        Returns: boolean
      }
      update_note:
        | {
            Args: {
              p_id: string
              p_title: string
              p_note_type: Database["public"]["Enums"]["note_type"]
              p_date: string
              p_updated_at: string
            }
            Returns: boolean
          }
        | {
            Args: {
              p_id: string
              p_title: string
              p_note_type: Database["public"]["Enums"]["note_type"]
              p_date: string
              p_updated_at: string
            }
            Returns: boolean
          }
    }
    Enums: {
      note_type: "regular" | "daily"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
