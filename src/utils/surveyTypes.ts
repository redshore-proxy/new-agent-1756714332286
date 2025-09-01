export interface Ancestry {
  label: string;
  other_note: string | null;
}

export interface Condition {
  label: string;  start_year: number | null;
  other_note: string | null;
}

export interface Allergy {
  label: string;
  reaction: string | null;
  other_note: string | null;
}

export interface MedicationOrSupplement {
  name: string;
  dose_strength: string | null;
  frequency: string | null;
  purpose: string | null;
}

export interface SurveyData {
  meta: {
    assistant_version: "v1";
    completed_at: string | null;
    progress: {
      total_questions: number;
      answered: number;
    };
  };
  basic_profile: {
    age: number | null;
    weight_pounds: number | null;
    height: string | null;
    height_inches_total: number | null;
    sex_assigned_at_birth: string | null;
    ancestries: Ancestry[];
  };
  medical_history: {
    conditions: Condition[];
    surgeries_or_hospital_stays: string[];
    allergies: Allergy[];
  };
  medications_and_supplements: {
    medications: MedicationOrSupplement[];
    supplements: MedicationOrSupplement[];
  };
  miscellaneous: {
    cam_fields: string[];
    wearable_devices: string[];
  };
}

export const MEDICAL_HISTORY_ENUM = [
  "Anxiety disorder", "Arthritis", "Asthma", "Bleeding disorder", "Blood clots/DVT",
  "Cancer", "Coronary artery disease", "Claustrophobic", "Diabetes (insulin)",
  "Diabetes (non-insulin)", "Dialysis", "Diverticulitis", "Fibromyalgia", "Gout",
  "Has pacemaker", "Heart attack", "Heart murmur", "Hiatal hernia/reflux disease",
  "HIV/AIDS", "High cholesterol", "High blood pressure", "Overactive thyroid",
  "Kidney disease", "Kidney stones", "Leg/foot ulcers", "Liver disease", "Osteoporosis",
  "Polio", "Pulmonary embolism", "Reflux/ulcers", "Stroke", "Tuberculosis",
  "Other", "None"
] as const;

export const ANCESTRIES_ENUM = [
  "African-American", "East Asian", "Northern European/Caucasian",
  "Hispanic/Latino", "Native American", "Pacific Islander", "South Asian",
  "Mediterranean", "Middle Eastern", "Ashkenazi Jewish", "Other"
] as const;

export const ALLERGENS_ENUM = [
  "Artificial Colors & Dyes (FD&C Yellow No. 5)", "Nuts", "Dairy", "Egg", "Gluten",
  "Soy", "Fish (e.g., Salmon, Tuna)", "Shellfish (e.g., Shrimp, Crab, Lobster)",
  "Sesame", "Corn", "Gelatin", "Other Allergens"
] as const;

export const CAM_FIELDS_ENUM = [
  "Functional Medicine", "Ayurveda", "Traditional Chinese Medicine",
  "Homeopathy", "Hanyak", "All"
] as const;

export const WEARABLES_ENUM = [
  "OURA Ring", "Apple Watch", "Google Pixel Watch", "Fitbit", "None"
] as const;

export const initialSurveyData: SurveyData = {
  meta: {    assistant_version: "v1",
    completed_at: null,
    progress: {
      total_questions: 12,
      answered: 0,
    },
  },
  basic_profile: {
    age: null,
    weight_pounds: null,
    height: null,
    height_inches_total: null,
    sex_assigned_at_birth: null,ancestries: [],
  },
  medical_history: {
    conditions: [],
    surgeries_or_hospital_stays: [],
    allergies: [],
  },
  medications_and_supplements: {
    medications: [],
    supplements: [],
  },
  miscellaneous: {
    cam_fields: [],
    wearable_devices: [],
  },
};