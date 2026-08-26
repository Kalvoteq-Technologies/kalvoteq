import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type LeadStatus = "new" | "contacted" | "archived";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  archived: "Archived",
};

export interface TalentRequestLead {
  id: string;
  full_name: string;
  business_email: string;
  company: string;
  country: string;
  required_role: string;
  required_skills: string;
  technology_stack: string;
  number_of_engineers: string;
  seniority: string;
  expected_start_date: string;
  expected_engagement_duration: string;
  preferred_timezone_overlap: string;
  project_description: string;
  additional_information: string | null;
  status: LeadStatus;
  created_at: string;
}

export interface ProjectRequestLead {
  id: string;
  name: string;
  company: string;
  business_email: string;
  project_type: string;
  project_description: string;
  current_stage: string;
  expected_timeline: string;
  approximate_budget_range: string;
  required_technologies: string | null;
  additional_information: string | null;
  status: LeadStatus;
  created_at: string;
}

export interface CareerApplicationLead {
  id: string;
  name: string;
  email: string;
  role: string;
  message: string;
  status: LeadStatus;
  created_at: string;
}

export const talentRequestsQuery = () =>
  queryOptions({
    queryKey: ["leads", "talent-requests"],
    queryFn: async (): Promise<TalentRequestLead[]> => {
      const { data, error } = await supabase
        .from("talent_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TalentRequestLead[];
    },
  });

export const projectRequestsQuery = () =>
  queryOptions({
    queryKey: ["leads", "project-requests"],
    queryFn: async (): Promise<ProjectRequestLead[]> => {
      const { data, error } = await supabase
        .from("project_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectRequestLead[];
    },
  });

export const careerApplicationsQuery = () =>
  queryOptions({
    queryKey: ["leads", "career-applications"],
    queryFn: async (): Promise<CareerApplicationLead[]> => {
      const { data, error } = await supabase
        .from("career_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CareerApplicationLead[];
    },
  });

export async function setTalentRequestStatus(id: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase.from("talent_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function setProjectRequestStatus(id: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase.from("project_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function setCareerApplicationStatus(id: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase.from("career_applications").update({ status }).eq("id", id);
  if (error) throw error;
}
