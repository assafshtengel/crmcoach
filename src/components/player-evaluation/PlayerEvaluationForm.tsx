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
  attitudeSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  effortSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  focusSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  resilienceSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  confidenceSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  emotionalControlSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  decisionMakingSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  problemSolvingSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  creativitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  visionSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  anticipationSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  awarenessSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTacticalSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityTechnicalSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityPhysicalSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilityMentalSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  speedSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  agilitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  strengthSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  enduranceSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  powerSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  flexibilitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  balanceSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coordinationSkills: z.string().min(2, {
    message: צריך להכניס לפחות 2 תווים",
  }),
  reactionTimeSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ballControlSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  passingAccuracySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  shootingAccuracySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  tacklingTechniqueSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  headingAbilitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  setPieceDeliverySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  dribblingSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  finishingAbilitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  defensiveSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attackingSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  transitionSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  setPieceSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  goalkeepingSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  communicationSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  tacticalUnderstandingSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  positionalAwarenessSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  decisionMakingSkills3: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  gameReadingAbilitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  leadershipQualitiesSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  teamworkAbilitySkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  workEthicSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  disciplineSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  mentalToughnessSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  emotionalIntelligenceSkills: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  coachabilitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  adaptabilitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  initiativeSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  communicationSkills4: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  ethicsSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  attendanceSkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  punctualitySkills2: z.string().min(2, {
    message: "צריך להכניס לפחות 2 תווים",
  }),
  respectSkills2: z.string().min(2, {
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
    message: "צריך להכ
