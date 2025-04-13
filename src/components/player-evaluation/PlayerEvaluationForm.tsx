
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  strengths: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  weaknesses: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  opportunities: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  threats: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  overall: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  positioning: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  technicalSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  physicalConditioning: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  mentalFortitude: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  teamwork: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  leadership: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coachability: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  gameIntelligence: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  consistency: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptability: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  initiative: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  communication: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ethics: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attendance: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  punctuality: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  respect: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attitude: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  effort: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  focus: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  resilience: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  confidence: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  emotionalControl: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  decisionMaking: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  problemSolving: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  creativity: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  vision: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  anticipation: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  awareness: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTactical: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTechnical: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityPhysical: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityMental: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  speed: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  agility: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  strength: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  endurance: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  power: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  flexibility: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  balance: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coordination: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  reactionTime: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ballControl: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  passingAccuracy: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  shootingAccuracy: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  tacklingTechnique: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  headingAbility: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  setPieceDelivery: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  dribblingSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  finishingAbility: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  defensiveSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attackingSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  transitionSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  setPieceSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  goalkeepingSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  communicationSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  tacticalUnderstanding: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  positionalAwareness: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  decisionMakingSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  gameReadingAbility: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  leadershipQualities: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  teamworkAbility: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  workEthic: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  discipline: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  mentalToughness: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  emotionalIntelligence: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coachabilitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  initiativeSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  communicationSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ethicsSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attendanceSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  punctualitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  respectSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attitudeSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  effortSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  focusSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  resilienceSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  confidenceSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  emotionalControlSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  decisionMakingSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  problemSolvingSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  creativitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  visionSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  anticipationSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  awarenessSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTacticalSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTechnicalSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityPhysicalSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityMentalSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  speedSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  agilitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  strengthSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  enduranceSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  powerSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  flexibilitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  balanceSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coordinationSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  reactionTimeSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ballControlSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  passingAccuracySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  shootingAccuracySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  tacklingTechniqueSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  headingAbilitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  setPieceDeliverySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  dribblingSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  finishingAbilitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  defensiveSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attackingSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  transitionSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  setPieceSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  goalkeepingSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  communicationSkills5: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  tacticalUnderstandingSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  positionalAwarenessSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  decisionMakingSkills5: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  gameReadingAbilitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  leadershipQualitiesSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  teamworkAbilitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  workEthicSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  disciplineSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  mentalToughnessSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  emotionalIntelligenceSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coachabilitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  initiativeSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  communicationSkills6: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ethicsSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attendanceSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  punctualitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  respectSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attitudeSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  effortSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  focusSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  resilienceSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  confidenceSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  emotionalControlSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  decisionMakingSkills6: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  problemSolvingSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  creativitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  visionSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  anticipationSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  awarenessSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTacticalSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTechnicalSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityPhysicalSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityMentalSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  speedSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  agilitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  strengthSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  enduranceSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  powerSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  flexibilitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  balanceSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coordinationSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  reactionTimeSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ballControlSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  passingAccuracySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  shootingAccuracySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  tacklingTechniqueSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  headingAbilitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  setPieceDeliverySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  dribblingSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  finishingAbilitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  defensiveSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attackingSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  transitionSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  setPieceSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  goalkeepingSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  communicationSkills7: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  tacticalUnderstandingSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  positionalAwarenessSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  decisionMakingSkills7: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  gameReadingAbilitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  leadershipQualitiesSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  teamworkAbilitySkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  workEthicSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  disciplineSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  mentalToughnessSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  emotionalIntelligenceSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coachabilitySkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilitySkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  initiativeSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  communicationSkills8: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ethicsSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attendanceSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  punctualitySkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  respectSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attitudeSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  effortSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  focusSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  resilienceSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  confidenceSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  emotionalControlSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  decisionMakingSkills8: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  problemSolvingSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  creativitySkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  visionSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  anticipationSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  awarenessSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTacticalSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTechnicalSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityPhysicalSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityMentalSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  speedSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  agilitySkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  strengthSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  enduranceSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  powerSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  flexibilitySkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  balanceSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coordinationSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  reactionTimeSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ballControlSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  passingAccuracySkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  shootingAccuracySkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  })
});

export const PlayerEvaluationForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strengths: "",
      weaknesses: "",
      opportunities: "",
      threats: "",
      // Include other required fields with default values
    }
  });
  
  const onSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('player_evaluations')
        .insert([data]);
        
      if (error) throw error;
      
      toast({
        title: "הצלחה",
        description: "הערכת השחקן נשמרה בהצלחה",
      });
      
      navigate('/players');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בשמירת הערכת השחקן",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>טופס הערכת שחקן</CardTitle>
        <CardDescription>מלא את הטופס להערכת יכולות השחקן</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic example fields - just as a placeholder */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="strengths"
                render={({ field }) => (
                  <FormItem>
                    <Label>חוזקות</Label>
                    <FormControl>
                      <Textarea placeholder="תיאור החוזקות של השחקן" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weaknesses"
                render={({ field }) => (
                  <FormItem>
                    <Label>חולשות</Label>
                    <FormControl>
                      <Textarea placeholder="תיאור החולשות של השחקן" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? "שומר..." : "שמור הערכה"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
