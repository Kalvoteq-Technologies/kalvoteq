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
    PostgrestVersion: "14.17"
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
      career_applications: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          role: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          role: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          role?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          company_name: string
          company_size: string | null
          country: string | null
          created_at: string
          industry: string | null
          logo_path: string | null
          needs: string
          role_title: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          company_size?: string | null
          country?: string | null
          created_at?: string
          industry?: string | null
          logo_path?: string | null
          needs?: string
          role_title?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          country?: string | null
          created_at?: string
          industry?: string | null
          logo_path?: string | null
          needs?: string
          role_title?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      client_requests: {
        Row: {
          body: string
          client_id: string
          created_at: string
          id: string
          priority: string
          project_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          body?: string
          client_id: string
          created_at?: string
          id?: string
          priority?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          client_id?: string
          created_at?: string
          id?: string
          priority?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sources: {
        Row: {
          category: string
          created_at: string
          enabled: boolean
          feed_url: string
          fetch_frequency_minutes: number
          id: string
          last_checked_at: string | null
          last_error: string | null
          name: string
          source_type: Database["public"]["Enums"]["content_source_type"]
          trust_score: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          enabled?: boolean
          feed_url: string
          fetch_frequency_minutes?: number
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          name: string
          source_type?: Database["public"]["Enums"]["content_source_type"]
          trust_score?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          enabled?: boolean
          feed_url?: string
          fetch_frequency_minutes?: number
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          name?: string
          source_type?: Database["public"]["Enums"]["content_source_type"]
          trust_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      deliverables: {
        Row: {
          client_id: string
          created_at: string
          description: string
          file_name: string | null
          file_path: string | null
          id: string
          mime_type: string | null
          project_id: string
          size_bytes: number
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          mime_type?: string | null
          project_id: string
          size_bytes?: number
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          mime_type?: string | null
          project_id?: string
          size_bytes?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_name: string
          file_path: string
          id: string
          mime_type: string
          size_bytes: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type?: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string
          size_bytes?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string
          size_bytes?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      developer_profiles: {
        Row: {
          availability: string | null
          company_name: string | null
          created_at: string
          github_url: string | null
          headline: string
          portfolio_url: string | null
          primary_stack: string | null
          skills: string[]
          timezone: string | null
          updated_at: string
          user_id: string
          years_experience: number
        }
        Insert: {
          availability?: string | null
          company_name?: string | null
          created_at?: string
          github_url?: string | null
          headline: string
          portfolio_url?: string | null
          primary_stack?: string | null
          skills?: string[]
          timezone?: string | null
          updated_at?: string
          user_id: string
          years_experience?: number
        }
        Update: {
          availability?: string | null
          company_name?: string | null
          created_at?: string
          github_url?: string | null
          headline?: string
          portfolio_url?: string | null
          primary_stack?: string | null
          skills?: string[]
          timezone?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: number
        }
        Relationships: []
      }
      discovered_stories: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          discovered_at: string
          external_id: string
          id: string
          overall_score: number
          post_id: string | null
          published_at: string | null
          score_breakdown: Json
          source_id: string
          source_url: string
          status: Database["public"]["Enums"]["discovered_story_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          discovered_at?: string
          external_id: string
          id?: string
          overall_score: number
          post_id?: string | null
          published_at?: string | null
          score_breakdown?: Json
          source_id: string
          source_url: string
          status?: Database["public"]["Enums"]["discovered_story_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          discovered_at?: string
          external_id?: string
          id?: string
          overall_score?: number
          post_id?: string | null
          published_at?: string | null
          score_breakdown?: Json
          source_id?: string
          source_url?: string
          status?: Database["public"]["Enums"]["discovered_story_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovered_stories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovered_stories_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "content_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          client_id: string
          created_at: string
          currency: string
          description: string
          due_on: string | null
          id: string
          issued_on: string
          number: string
          project_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          client_id: string
          created_at?: string
          currency?: string
          description?: string
          due_on?: string | null
          id?: string
          issued_on?: string
          number: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_id?: string
          created_at?: string
          currency?: string
          description?: string
          due_on?: string | null
          id?: string
          issued_on?: string
          number?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          origin: Database["public"]["Enums"]["post_origin"]
          published_at: string | null
          reading_time: string | null
          research_job_id: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at: string
          verification_status:
            | Database["public"]["Enums"]["post_verification_status"]
            | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          origin?: Database["public"]["Enums"]["post_origin"]
          published_at?: string | null
          reading_time?: string | null
          research_job_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["post_verification_status"]
            | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          origin?: Database["public"]["Enums"]["post_origin"]
          published_at?: string | null
          reading_time?: string | null
          research_job_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["post_verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_research_job_id_fkey"
            columns: ["research_job_id"]
            isOneToOne: false
            referencedRelation: "research_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      project_requests: {
        Row: {
          additional_information: string | null
          approximate_budget_range: string
          business_email: string
          company: string
          created_at: string
          current_stage: string
          expected_timeline: string
          id: string
          name: string
          project_description: string
          project_type: string
          required_technologies: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          additional_information?: string | null
          approximate_budget_range: string
          business_email: string
          company: string
          created_at?: string
          current_stage: string
          expected_timeline: string
          id?: string
          name: string
          project_description: string
          project_type: string
          required_technologies?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          additional_information?: string | null
          approximate_budget_range?: string
          business_email?: string
          company?: string
          created_at?: string
          current_stage?: string
          expected_timeline?: string
          id?: string
          name?: string
          project_description?: string
          project_type?: string
          required_technologies?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_id: string
          created_at: string
          id: string
          name: string
          next_milestone: string | null
          progress: number
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          summary: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          name: string
          next_milestone?: string | null
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          next_milestone?: string | null
          progress?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      request_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          request_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          request_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "client_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      research_jobs: {
        Row: {
          briefing: Json | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          status: Database["public"]["Enums"]["research_job_status"]
          story_id: string
        }
        Insert: {
          briefing?: Json | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          status?: Database["public"]["Enums"]["research_job_status"]
          story_id: string
        }
        Update: {
          briefing?: Json | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          status?: Database["public"]["Enums"]["research_job_status"]
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_jobs_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "discovered_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      talent_requests: {
        Row: {
          additional_information: string | null
          business_email: string
          company: string
          country: string
          created_at: string
          expected_engagement_duration: string
          expected_start_date: string
          full_name: string
          id: string
          number_of_engineers: string
          preferred_timezone_overlap: string
          project_description: string
          required_role: string
          required_skills: string
          seniority: string
          status: Database["public"]["Enums"]["lead_status"]
          technology_stack: string
          updated_at: string
        }
        Insert: {
          additional_information?: string | null
          business_email: string
          company: string
          country: string
          created_at?: string
          expected_engagement_duration: string
          expected_start_date: string
          full_name: string
          id?: string
          number_of_engineers: string
          preferred_timezone_overlap: string
          project_description: string
          required_role: string
          required_skills: string
          seniority: string
          status?: Database["public"]["Enums"]["lead_status"]
          technology_stack: string
          updated_at?: string
        }
        Update: {
          additional_information?: string | null
          business_email?: string
          company?: string
          country?: string
          created_at?: string
          expected_engagement_duration?: string
          expected_start_date?: string
          full_name?: string
          id?: string
          number_of_engineers?: string
          preferred_timezone_overlap?: string
          project_description?: string
          required_role?: string
          required_skills?: string
          seniority?: string
          status?: Database["public"]["Enums"]["lead_status"]
          technology_stack?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "client" | "developer"
      content_source_type: "rss" | "api" | "manual"
      discovered_story_status:
        | "new"
        | "researching"
        | "researched"
        | "drafted"
        | "rejected"
        | "archived"
      invoice_status: "draft" | "sent" | "paid" | "overdue"
      lead_status: "new" | "contacted" | "archived"
      post_origin: "manual" | "ai"
      post_status: "draft" | "published"
      post_verification_status: "verified" | "partially_verified" | "unverified"
      project_status: "discovery" | "in_progress" | "on_hold" | "delivered"
      request_status: "open" | "in_progress" | "resolved"
      research_job_status: "pending" | "completed" | "failed"
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
    Enums: {
      app_role: ["admin", "client", "developer"],
      content_source_type: ["rss", "api", "manual"],
      discovered_story_status: [
        "new",
        "researching",
        "researched",
        "drafted",
        "rejected",
        "archived",
      ],
      invoice_status: ["draft", "sent", "paid", "overdue"],
      lead_status: ["new", "contacted", "archived"],
      post_origin: ["manual", "ai"],
      post_status: ["draft", "published"],
      post_verification_status: ["verified", "partially_verified", "unverified"],
      project_status: ["discovery", "in_progress", "on_hold", "delivered"],
      request_status: ["open", "in_progress", "resolved"],
      research_job_status: ["pending", "completed", "failed"],
    },
  },
} as const
