"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "./MultiSelect";

// Define the JSON Schema types
interface Ancestry {label: string;
  other_note: string | null;
}

interface Condition {
  label: string;
  start_year: number | null;
  other_note: string | null;
}

interface Allergy {
  label: string;
  reaction: string | null;
  other_note: string | null;
}

interface MedicationOrSupplement {
  name: string;
  dose_strength: string;
  frequency: string;
  purpose: string;
}

interface SurveyData {
  meta: {
    assistant_version: string;
    completed_at: string;
    progress: {      total_questions: number;
      answered: number;
    };
  };
  basic_profile: {
    age: number | null;
    weight_pounds: number | null; // Storing raw string initially, agent converts
    height: string | null; // Storing raw string initially, agent converts
    height_inches_total: number | null; // Derived by agent
    sex_assigned_at_birth: string | null;
    ancestries: Ancestry[];
  };
  medical_history: {
    conditions: Condition[];
    surgeries_or_hospital_stays: string[];
    allergies: Allergy[];  };
  medications_and_supplements: {
    medications: MedicationOrSupplement[];
    supplements: MedicationOrSupplement[];
  };
  miscellaneous: {
    cam_fields: string[];
    wearable_devices: string[];
  };
}

// Enumerations
const MEDICAL_CONDITIONS_OPTIONS = [
  "Anxiety disorder", "Arthritis", "Asthma", "Bleeding disorder", "Blood clots/DVT",
  "Cancer", "Coronary artery disease", "Claustrophobic", "Diabetes (insulin)",
  "Diabetes (non-insulin)", "Dialysis", "Diverticulitis", "Fibromyalgia", "Gout",
  "Has pacemaker", "Heart attack", "Heart murmur", "Hiatal hernia/reflux disease",
  "HIV/AIDS", "High cholesterol", "High blood pressure", "Overactive thyroid",
  "Kidney disease", "Kidney stones", "Leg/foot ulcers", "Liver disease", "Osteoporosis",
  "Polio", "Pulmonary embolism", "Reflux/ulcers", "Stroke", "Tuberculosis",
  "Other", "None"
].map(item => ({ label: item, value: item }));

const ANCESTRIES_OPTIONS = [
  "African-American", "East Asian", "Northern European/Caucasian",
  "Hispanic/Latino", "Native American", "Pacific Islander", "South Asian",
  "Mediterranean", "Middle Eastern", "Ashkenazi Jewish", "Other"
].map(item => ({ label: item, value: item }));

const ALLERGENS_OPTIONS = [
  "Artificial Colors & Dyes (FD&C Yellow No. 5)", "Nuts", "Dairy", "Egg", "Gluten",
  "Soy", "Fish (e.g., Salmon, Tuna)", "Shellfish (e.g., Shrimp, Crab, Lobster)",
  "Sesame", "Corn", "Gelatin", "Other Allergens"
].map(item => ({ label: item, value: item }));

const CAM_FIELDS_OPTIONS = [
  "Functional Medicine", "Ayurveda", "Traditional Chinese Medicine",
  "Homeopathy", "Hanyak", "All"
].map(item => ({ label: item, value: item }));

const WEARABLES_OPTIONS = [
  "OURA Ring", "Apple Watch", "Google Pixel Watch", "Fitbit", "None"
].map(item => ({ label: item, value: item }));

// Initial survey state
const initialSurveyData: SurveyData = {
  meta: {
    assistant_version: "v1",
    completed_at: "",
    progress: {
      total_questions: 12,
      answered: 0,
    },
  },
  basic_profile: {    age: null,
    weight_pounds: null,
    height: null,
    height_inches_total: null,
    sex_assigned_at_birth: null,
    ancestries: [],  },
  medical_history: {
    conditions: [],
    surgeries_or_hospital_stays: [],
    allergies: [],
  },
  medications_and_supplements: {medications: [],
    supplements: [],
  },
  miscellaneous: {
    cam_fields: [],
    wearable_devices: [],
  },
};

// Questions definition
const questions = [  {
    id: 0,
    step: "Intro",
    title: "Welcome!",
    description: "Hi, I’m your survey assistant. We’ll go through 12 quick questions (~3 minutes). No rush — your progress is saved automatically. Ready?",
    type: "intro",
  },
  {
    id: 1,
    step: "Basic Profile",
    title: "Question 1/12: Age",
    description: "How old are you?",
    type: "input",
    key: "basic_profile.age",
    inputType: "number",
  },{
    id: 2,
    step: "Basic Profile",
    title: "Question 2/12: Weight",
    description: "What is your weight? (e.g., '150 lbs' or '68 kg')",
    type: "input",
    key: "basic_profile.weight_pounds",
    inputType: "text",
  },
  {
    id: 3,    step: "Basic Profile",
    title: "Question 3/12: Height",
    description: "What is your height? (e.g., '5ft 10in' or '178 cm')",
    type: "input",
    key: "basic_profile.height",
    inputType: "text",
  },
  {
    id: 4,
    step: "Basic Profile",
    title: "Question 4/12: Sex Assigned at Birth",
    description: "What was your sex assigned at birth?",
    type: "input",
    key: "basic_profile.sex_assigned_at_birth",
    inputType: "text",
  },
  {
    id: 5,
    step: "Basic Profile",
    title: "Question 5/12: Ancestries",
    description: "Which ancestries apply to you? (Choose from the list. If ‘Other’, please specify in the text box below.)",
    type: "multi-select-with-other",key: "basic_profile.ancestries",
    options: ANCESTRIES_OPTIONS,
  },
  {
    id: 6,
    step: "Medical History",
    title: "Question6/12: Medical Conditions",
    description: "Please select any conditions from this list. (If ‘Other’, specify in the text box below. If ‘None’, choose only ‘None’. The AI agent would then ask for the start year for each selected condition.)",
    type: "multi-select-with-other",
    key: "medical_history.conditions",
    options: MEDICAL_CONDITIONS_OPTIONS,
  },{
    id: 7,
    step: "Medical History",
    title: "Question 7/12: Surgeries or Hospital Stays",
    description: "Any surgeries or overnight hospital stays? (List as “procedure (year)”. Say “none” if none. The AI agent will parse this free text.)",
    type: "textarea",
    key: "medical_history.surgeries_or_hospital_stays",
  },
  {
    id: 8,
    step: "Medical History",
    title: "Question 8/12: Allergies",
    description: "Do you have any allergies? (Choose from allergens list. If “Other Allergens”, please specify allergen name(s) in the text box below. The AI agent would then ask for the reaction for each selected allergy.)",
    type: "multi-select-with-other",
    key: "medical_history.allergies",
    options: ALLERGENS_OPTIONS,
  },
  {
    id: 9,
    step: "Medications & Supplements",
    title: "Question 9/12: Medications",
    description: "Do you take any medications? (For each: Name, Dose/Strength, Frequency, Purpose. List each medication on a new line. Say “none” if none. The AI agent will parse this free text.)",
    type: "textarea",
    key: "medications_and_supplements.medications",
  },
  {
    id: 10,
    step: "Medications & Supplements",
    title: "Question 10/12: Supplements",
    description: "Do you take any supplements? (For each: Name, Dose/Strength, Frequency, Purpose. List each supplement on a new line. Say “none” if none. The AI agent will parse this free text.)",
    type: "textarea",
    key: "medications_and_supplements.supplements",
  },
  {
    id: 11,
    step: "Miscellaneous",
    title: "Question 11/12: CAM Fields",
    description: "Which complementary & alternative medicine (CAM) fields do you prefer? (Options: Functional Medicine, Ayurveda, Traditional Chinese Medicine, Homeopathy, Hanyak, All. 'All' expands to all options except 'All'.)",    type: "multi-select",
    key: "miscellaneous.cam_fields",
    options: CAM_FIELDS_OPTIONS,
  },
  {
    id: 12,
    step: "Miscellaneous",
    title: "Question 12/12: Wearable Devices",
    description: "Do you use any of these wearable devices? (OURA Ring, Apple Watch, Google Pixel Watch, Fitbit, None.)",
    type: "multi-select",
    key: "miscellaneous.wearable_devices",
    options: WEARABLES_OPTIONS,
  },
];

const SurveyAssistant: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [surveyData, setSurveyData] = useState<SurveyData>(initialSurveyData);
  const [showJson, setShowJson] = useState(false);
  const [otherNotes, setOtherNotes] = useState<Record<string, string>>({}); // For "Other" specifications

  const currentQuestion = questions[currentQuestionIndex];

  // Helper to get nested value from an object
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  // Helper to set nested value in an object
  const setNestedValue = (obj: any, path: string, value: any) => {
    const parts = path.split(".");    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  };

  const handleAnswer = (value: any) => {
    if (currentQuestion.key) {
      const newSurveyData = { ...surveyData };
      let processedValue = value;

      // Special handling for multi-selects that map to objects in schema      if (currentQuestion.type === "multi-select-with-other") {
        const selectedLabels = value as string[];
        const otherLabelKey = currentQuestion.key === "basic_profile.ancestries" ? "Other" :
                              currentQuestion.key === "medical_history.conditions" ? "Other" :
                              currentQuestion.key === "medical_history.allergies" ? "Other Allergens" : "";
        const hasOther = selectedLabels.includes(otherLabelKey);

        processedValue = selectedLabels.map(label => {
          const item: { label: string; other_note: string | null; start_year?: number | null; reaction?: string | null } = { label, other_note: null };
          if (label === otherLabelKey) {
            item.other_note = otherNotes[currentQuestion.key as string] || null;
          }
          // For conditions and allergies, the agent would ask for start_year/reaction.
          // Here, we just store the label. The agent's logic would enrich this.
          return item;});

        // Handle "None" for conditions and allergies
        if (selectedLabels.includes("None")) {
          processedValue = [{ label: "None", other_note: null }];
        }
      } else if (currentQuestion.type === "multi-select") {
        const selectedLabels = value as string[];
        // Handle "All" for CAM fields
        if (currentQuestion.key === "miscellaneous.cam_fields" && selectedLabels.includes("All")) {
          processedValue = CAM_FIELDS_OPTIONS.filter(o => o.value !== "All").map(o => o.value);
          // Handle synonymsprocessedValue = processedValue.map((item: string) => {
            if (item === "TCM") return "Traditional Chinese Medicine";
            if (item === "Hanbang/Korean Medicine") return "Hanyak";
            return item;
          });
        }
        // Handle "None" for wearables
        if (currentQuestion.key === "miscellaneous.wearable_devices" && selectedLabels.includes("None")) {          processedValue = ["None"];
        }
      } else if (currentQuestion.type === "textarea") {
        // For surgeries, medications, supplements, store as raw string for agent to parse
        const rawText = value as string;
        const items = rawText.split(/[,/\n]/).map((s: string) => s.trim()).filter(Boolean);
        if (items.length === 1 && (items[0].toLowerCase() === "none" || items[0].toLowerCase() === "not sure" || items[0].toLowerCase() === "skip")) {
          processedValue = [];
        } else {
          // For medications/supplements, the agent would parse into objects.
          // For surgeries, it's an array of strings.
          // Here, we just store the raw parsed strings.
          processedValue = items;
        }
      } else if (currentQuestion.inputType === "number") {
        processedValue = value === "" ? null : Number(value);
      } else if (value === "skip" || value === "none" || value === "not sure" || value === "") {
        processedValue = null;
        if (currentQuestion.type === "multi-select" || currentQuestion.type === "multi-select-with-other" || currentQuestion.type === "textarea") {
          processedValue = [];
        }
      }

      setNestedValue(newSurveyData, currentQuestion.key, processedValue);
      setSurveyData(newSurveyData);
    }  };

  const handleOtherNoteChange = (key: string, value: string) => {
    setOtherNotes(prev => ({ ...prev, [key]: value }));
    // If "Other" is selected, update the surveyData with the new other_note
    if (currentQuestion.key === key && currentQuestion.type === "multi-select-with-other") {
      const currentSelected = getNestedValue(surveyData, key) as { label: string; other_note: string | null }[];
      const otherLabelKey = key === "basic_profile.ancestries" ? "Other" :
                            key === "medical_history.conditions" ? "Other" :
                            key === "medical_history.allergies" ? "Other Allergens" : "";
      const updatedSelected = currentSelected.map(item =>
        item.label === otherLabelKey ? { ...item, other_note: value || null } : item
      );
      setNestedValue(surveyData, key, updatedSelected);
      setSurveyData({ ...surveyData });
    }
  };const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishSurvey();}
  };

  const finishSurvey = () => {
    const finalSurveyData = JSON.parse(JSON.stringify(surveyData)); // Deep copy to avoid direct state mutation

    // Calculate answered questions
    let answeredCount = 0;
    if (finalSurveyData.basic_profile.age !== null) answeredCount++;
    if (finalSurveyData.basic_profile.weight_pounds !== null && finalSurveyData.basic_profile.weight_pounds !== "") answeredCount++;
    if (finalSurveyData.basic_profile.height !== null && finalSurveyData.basic_profile.height !== "") answeredCount++;
    if (finalSurveyData.basic_profile.sex_assigned_at_birth !== null && finalSurveyData.basic_profile.sex_assigned_at_birth !== "") answeredCount++;
    if (finalSurveyData.basic_profile.ancestries.length > 0 && finalSurveyData.basic_profile.ancestries[0].label !== "None") answeredCount++;
    if (finalSurveyData.medical_history.conditions.length > 0 && finalSurveyData.medical_history.conditions[0].label !== "None") answeredCount++;
    if (finalSurveyData.medical_history.surgeries_or_hospital_stays.length > 0) answeredCount++;
    if (finalSurveyData.medical_history.allergies.length > 0 && finalSurveyData.medical_history.allergies[0].label !== "None") answeredCount++;
    if (finalSurveyData.medications_and_supplements.medications.length > 0) answeredCount++;
    if (finalSurveyData.medications_and_supplements.supplements.length > 0) answeredCount++;
    if (finalSurveyData.miscellaneous.cam_fields.length > 0) answeredCount++;
    if (finalSurveyData.miscellaneous.wearable_devices.length > 0 && finalSurveyData.miscellaneous.wearable_devices[0] !== "None") answeredCount++;

    finalSurveyData.meta.progress.answered = answeredCount;
    finalSurveyData.meta.completed_at = new Date().toISOString();

    // --- SIMULATED AGENT NORMALIZATION (for demonstration purposes) ---
    // In a real scenario, the AI agent would perform these robustly.
    // Here, we do a basic attempt to show the expected output format.

    // Weight conversion: kg to lbs
    if (typeof finalSurveyData.basic_profile.weight_pounds === 'string') {
      const weightStr = finalSurveyData.basic_profile.weight_pounds.toLowerCase();
      if (weightStr.includes("kg")) {
        const kg = parseFloat(weightStr.replace("kg", "").trim());
        if (!isNaN(kg)) {
          finalSurveyData.basic_profile.weight_pounds = Math.round(kg * 2.20462);
        } else {
          finalSurveyData.basic_profile.weight_pounds = null;
        }
      } else if (weightStr.includes("lbs")) {
        finalSurveyData.basic_profile.weight_pounds = parseFloat(weightStr.replace("lbs", "").trim());
      } else {
        finalSurveyData.basic_profile.weight_pounds = parseFloat(weightStr);
      }
      if (isNaN(finalSurveyData.basic_profile.weight_pounds)) {
        finalSurveyData.basic_profile.weight_pounds = null;
      }    }

    // Height conversion: ft/in or cm to height_inches_total
    if (typeof finalSurveyData.basic_profile.height === 'string') {
      const heightStr = finalSurveyData.basic_profile.height.toLowerCase();
      if (heightStr.includes("ft") && heightStr.includes("in")) {
        const parts = heightStr.match(/(\d+)\s*ft\s*(\d+)\s*in/);
        if (parts) {
          const feet = parseInt(parts[1]);
          const inches = parseInt(parts[2]);
          finalSurveyData.basic_profile.height_inches_total = feet * 12 + inches;
        } else {
          finalSurveyData.basic_profile.height_inches_total = null;
        }
      } else if (heightStr.includes("cm")) {
        const cm = parseFloat(heightStr.replace("cm", "").trim());
        if (!isNaN(cm)) {
          finalSurveyData.basic_profile.height_inches_total = Math.round(cm / 2.54);
        } else {
          finalSurveyData.basic_profile.height_inches_total = null;
        }
      } else {
        finalSurveyData.basic_profile.height_inches_total = null;
      }
    }

    // For medications and supplements, the agent would parse the free text into objects.
    // Here, we'll just keep them as string arrays for simplicity in this UI demo.
    // A real agent would implement the parsing logic for name, dose_strength, frequency, purpose.
    if (Array.isArray(finalSurveyData.medications_and_supplements.medications)) {
      finalSurveyData.medications_and_supplements.medications = finalSurveyData.medications_and_supplements.medications.map((item: string) => ({
        name: item,
        dose_strength: "N/A (Agent parses)",
        frequency: "N/A (Agent parses)",
        purpose: "N/A (Agent parses)",
      }));
    }
    if (Array.isArray(finalSurveyData.medications_and_supplements.supplements)) {
      finalSurveyData.medications_and_supplements.supplements = finalSurveyData.medications_and_supplements.supplements.map((item: string) => ({
        name: item,
        dose_strength: "N/A (Agent parses)",
        frequency: "N/A (Agent parses)",
        purpose: "N/A (Agent parses)",
      }));
    }

    setSurveyData(finalSurveyData);
    setShowJson(true);
  };

  // Simulate "done/finish/stop" command from user input  useEffect(() => {
    if (currentQuestion.type === "input" || currentQuestion.type === "textarea") {
      const currentValue = getNestedValue(surveyData, currentQuestion.key as string);if (typeof currentValue === 'string' && (currentValue.toLowerCase() === "done" || currentValue.toLowerCase() === "finish" || currentValue.toLowerCase() === "stop")) {
        finishSurvey();
      }}
  }, [currentQuestionIndex, surveyData, currentQuestion.type, currentQuestion.key]);

  if (showJson) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Survey Completed!</CardTitle>
          <CardDescription>
            Here is the normalized JSON output. Note that complex parsing and detailed validation (e.g., asking for start years, reactions, or detailed medication info) would be handled by the AI agent as described in your prompt. This UI provides a structured input and demonstrates the final JSON format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs">
            {JSON.stringify(surveyData, null, 2)}
          </pre>
        </CardContent>
        <CardFooter>
          <Button onClick={() => {
            setCurrentQuestionIndex(0);
            setSurveyData(initialSurveyData);
            setShowJson(false);
            setOtherNotes({});
          }}>Start New Survey</Button>
        </CardFooter>
      </Card>
    );
  }

  return (    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>{currentQuestion.title}</CardTitle>
        <CardDescription>{currentQuestion.description}</CardDescription>
        {currentQuestion.step && (
          <p className="text-sm text-muted-foreground mt-2">Step: {currentQuestion.step}</p>
        )}      </CardHeader>
      <CardContent>
        {currentQuestion.type === "intro" && (
          <Button onClick={handleNext}>Start Survey</Button>
        )}

        {currentQuestion.type === "input" && (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor={currentQuestion.key as string}>{currentQuestion.description}</Label>
            <Input
              id={currentQuestion.key as string}
              type={currentQuestion.inputType}
              value={getNestedValue(surveyData, currentQuestion.key as string) || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here..."
            />
          </div>
        )}

        {currentQuestion.type === "textarea" && (
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor={currentQuestion.key as string}>{currentQuestion.description}</Label>
            <Textarea
              id={currentQuestion.key as string}              value={Array.isArray(getNestedValue(surveyData, currentQuestion.key as string)) ? getNestedValue(surveyData, currentQuestion.key as string).join("\n") : ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here, one item per line or separated by commas..."
              rows={4}
            />
          </div>
        )}

        {(currentQuestion.type === "multi-select" || currentQuestion.type === "multi-select-with-other") && (
          <div className="grid w-full items-center gap-1.5">
            <Label>{currentQuestion.description}</Label>
            <MultiSelect
              options={currentQuestion.options || []}
              selected={getNestedValue(surveyData, currentQuestion.key as string)?.map((item: any) => item.label || item) || []}
              onSelect={(selectedValues) => handleAnswer(selectedValues)}
              placeholder="Select options..."
            />
            {currentQuestion.type === "multi-select-with-other" &&
              (getNestedValue(surveyData, currentQuestion.key as string)?.some((item: any) => item.label === "Other" || item.label === "Other Allergens")) && (<div className="mt-2">
                  <Label htmlFor={`${currentQuestion.key}-other-note`}>Please specify "Other":</Label>
                  <Input
                    id={`${currentQuestion.key}-other-note`}
                    value={otherNotes[currentQuestion.key as string] || ""}
                    onChange={(e) => handleOtherNoteChange(currentQuestion.key as string, e.target.value)}
                    placeholder="Specify other details..."
                  />
                </div>
              )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentQuestionIndex > 0 && currentQuestion.type !== "intro" && (
          <Button variant="outline" onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}>
            Previous
          </Button>
        )}
        {currentQuestion.type !== "intro" && (
          <Button onClick={handleNext}>
            {currentQuestionIndex === questions.length - 1 ? "Finish Survey" : "Next Question"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SurveyAssistant;