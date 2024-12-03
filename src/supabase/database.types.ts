export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      certifications: {
        Row: {
          cv_id: string | null;
          id: number;
          name: string | null;
          received: string | null;
          user_id: string;
          valid_until: string | null;
        };
        Insert: {
          cv_id?: string | null;
          id?: number;
          name?: string | null;
          received?: string | null;
          user_id: string;
          valid_until?: string | null;
        };
        Update: {
          cv_id?: string | null;
          id?: number;
          name?: string | null;
          received?: string | null;
          user_id?: string;
          valid_until?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'certifications_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cvs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'certifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      cvs: {
        Row: {
          created_at: string;
          id: string;
          title: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          title?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          title?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cvs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      keywords: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      managers: {
        Row: {
          id: number;
          user_id: string;
        };
        Insert: {
          id?: number;
          user_id: string;
        };
        Update: {
          id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'managers_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          description: string | null;
          education: string | null;
          email: string;
          first_name: string | null;
          id: number;
          last_name: string | null;
          metadata: string | null;
          profile_pic: string | null;
          social_media_links: string | null;
          title: string | null;
          user_id: string;
        };
        Insert: {
          description?: string | null;
          education?: string | null;
          email: string;
          first_name?: string | null;
          id?: number;
          last_name?: string | null;
          metadata?: string | null;
          profile_pic?: string | null;
          social_media_links?: string | null;
          title?: string | null;
          user_id: string;
        };
        Update: {
          description?: string | null;
          education?: string | null;
          email?: string;
          first_name?: string | null;
          id?: number;
          last_name?: string | null;
          metadata?: string | null;
          profile_pic?: string | null;
          social_media_links?: string | null;
          title?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      project_categories: {
        Row: {
          cv_id: string | null;
          description: string | null;
          end_date: string | null;
          id: number;
          start_date: string | null;
          title: string | null;
          user_id: string | null;
        };
        Insert: {
          cv_id?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: number;
          start_date?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Update: {
          cv_id?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: number;
          start_date?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'project_categories_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      project_keywords: {
        Row: {
          id: number;
          keyword_id: number;
          project_id: number;
        };
        Insert: {
          id?: number;
          keyword_id: number;
          project_id: number;
        };
        Update: {
          id?: number;
          keyword_id?: number;
          project_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'project_keywords_keyword_id_fkey';
            columns: ['keyword_id'];
            isOneToOne: false;
            referencedRelation: 'keywords';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'project_keywords_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      projects: {
        Row: {
          company: string | null;
          cv_id: string | null;
          description: string | null;
          end_date: string | null;
          id: number;
          image_url: string | null;
          name: string | null;
          project_category: number | null;
          project_url: string | null;
          role: string | null;
          start_date: string | null;
          user_id: string;
        };
        Insert: {
          company?: string | null;
          cv_id?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: number;
          image_url?: string | null;
          name?: string | null;
          project_category?: number | null;
          project_url?: string | null;
          role?: string | null;
          start_date?: string | null;
          user_id: string;
        };
        Update: {
          company?: string | null;
          cv_id?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: number;
          image_url?: string | null;
          name?: string | null;
          project_category?: number | null;
          project_url?: string | null;
          role?: string | null;
          start_date?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cvs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'projects_project_category_fkey';
            columns: ['project_category'];
            isOneToOne: false;
            referencedRelation: 'project_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      skills: {
        Row: {
          cv_id: string | null;
          id: number;
          level: number | null;
          skill: string | null;
          user_id: string;
        };
        Insert: {
          cv_id?: string | null;
          id?: number;
          level?: number | null;
          skill?: string | null;
          user_id: string;
        };
        Update: {
          cv_id?: string | null;
          id?: number;
          level?: number | null;
          skill?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'skills_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cvs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'skills_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_projects: {
        Args: {
          query_embedding: number[];
          match_count: number;
        };
        Returns: {
          project_id: number;
          user_id: number;
          similarity: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

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
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

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
    : never;
