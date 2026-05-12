'use server';
/**
 * @fileOverview A Genkit flow for generating personalized 4-week training blocks.
 *
 * - generateTrainingBlock - A function that handles the training block generation process.
 * - GenerateTrainingBlockInput - The input type for the generateTrainingBlock function.
 * - GenerateTrainingBlockOutput - The return type for the generateTrainingBlock function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTrainingBlockInputSchema = z.object({
  currentVDOT: z.number().describe('Current VDOT score, indicating running fitness level.'),
  hrZone1End: z.number().describe('Heart rate at the end of Zone 1.'),
  hrZone2End: z.number().describe('Heart rate at the end of Zone 2.'),
  hrZone3End: z.number().describe('Heart rate at the end of Zone 3.'),
  hrZone4End: z.number().describe('Heart rate at the end of Zone 4.'),
  hrMax: z.number().describe('Maximum heart rate.'),
  trainingBlockType: z
    .enum(['Base', 'Construction', 'Polishing'])
    .describe('Type of training block to generate (Base, Construction, or Polishing).'),
  weeklyMileageGoal: z.number().describe('Target weekly mileage in miles or kilometers.'),
  targetRaceDistance: z.string().describe('Target race distance (e.g., 5K, 10K, Half Marathon, Marathon).'),
  targetRaceTime: z.string().optional().describe('Optional: Target race time (e.g., 1:30:00).'),
  currentLongRunDistance: z.number().describe('Current longest run distance in miles or kilometers.'),
  currentLongRunPace: z.string().describe('Current longest run pace (e.g., 8:00/mile or 5:00/km).'),
  weeklyAvailability: z.string().describe('Description of weekly availability for training, including days and hours.'),
  injuryHistory: z.string().describe('Any relevant injury history to consider.'),
  preferredWorkoutDays: z.string().describe('Preferred days for hard workouts (e.g., Tuesday, Thursday).'),
});

export type GenerateTrainingBlockInput = z.infer<typeof GenerateTrainingBlockInputSchema>;

const WeeklyPlanSchema = z.object({
  weekNumber: z.number().describe('The number of the week in the training block (1-4).'),
  focus: z.string().describe('Primary focus for the week (e.g., Endurance, Speed, Recovery, Strength).'),
  runs: z.array(
    z.object({
      day: z.string().describe('Day of the week for the run (e.g., Monday, Tuesday).'),
      type: z.string().describe('Type of run workout (e.g., Easy Run, Tempo, Intervals, Long Run, Recovery).'),
      distance: z.string().describe('Distance for the run (e.g., 5 miles, 8 km).'),
      paceZone: z.string().describe('Recommended pace zone or specific pace (e.g., Zone 2 HR, VDOT I-pace, 8:00/mile).'),
      description: z.string().describe('Detailed description of the workout, including warm-up/cool-down, specific intervals, etc.'),
    })
  ).describe('List of running workouts for the week.'),
  strength: z.string().describe('Strength training recommendations for the week.'),
  crossTraining: z.string().describe('Cross-training recommendations for the week (e.g., cycling, swimming, yoga).'),
  notes: z.string().describe('General notes or advice for the week.'),
});

const GenerateTrainingBlockOutputSchema = z.object({
  blockType: z.string().describe('The type of training block generated (Base, Construction, or Polishing).'),
  durationWeeks: z.literal(4).describe('The duration of the training block in weeks, always 4.'),
  weeklyPlans: z.array(WeeklyPlanSchema).length(4).describe('An array of 4 weekly training plans.'),
});

export type GenerateTrainingBlockOutput = z.infer<typeof GenerateTrainingBlockOutputSchema>;

export async function generateTrainingBlock(input: GenerateTrainingBlockInput): Promise<GenerateTrainingBlockOutput> {
  return generateTrainingBlockFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrainingBlockPrompt',
  input: { schema: GenerateTrainingBlockInputSchema },
  output: { schema: GenerateTrainingBlockOutputSchema },
  prompt: `You are an AI-powered running coach specializing in generating personalized 4-week training blocks based on VDOT logic and heart rate zones.
Your goal is to create a structured and progressive training plan for a runner, helping them achieve their goals while minimizing injury risk.

Here are the runner's current metrics and goals:

Runner Profile:
- Current VDOT Score: {{{currentVDOT}}}
- Heart Rate Zones (BPM): Zone 1 ends at {{{hrZone1End}}}, Zone 2 ends at {{{hrZone2End}}}, Zone 3 ends at {{{hrZone3End}}}, Zone 4 ends at {{{hrZone4End}}}. Max HR: {{{hrMax}}}.
- Desired Training Block Type: {{{trainingBlockType}}} (This will guide the overall focus: Base for building aerobic capacity, Construction for developing race-specific fitness, Polishing for sharpening and recovery before a race).
- Target Weekly Mileage: {{{weeklyMileageGoal}}} (Ensure progressive overload but avoid drastic jumps).
- Target Race Distance: {{{targetRaceDistance}}}{{#if targetRaceTime}} (Target Time: {{{targetRaceTime}}}){{/if}}
- Current Long Run Distance: {{{currentLongRunDistance}}} at a pace of {{{currentLongRunPace}}}
- Weekly Availability for Training: {{{weeklyAvailability}}}
- Injury History: {{{injuryHistory}}} (Factor this into workload and exercise selection).
- Preferred Hard Workout Days: {{{preferredWorkoutDays}}}

Design a comprehensive 4-week training block. Each week should progressively build upon the last, aligning with VDOT principles for pace guidance and heart rate zones for effort control. The plan should include a mix of easy runs, long runs, speed work (intervals/tempo), strength training, and cross-training.

Structure the output as a JSON object strictly following the output schema provided. Ensure all fields are populated appropriately. Pay close attention to progressive overload, proper recovery, and the specific focus of the '{{{trainingBlockType}}}' block type.

For VDOT paces, assume standard VDOT calculation for Easy, Marathon, Tempo, Interval, and Repetition paces are implied by the VDOT score. Translate these VDOT paces into descriptive pace zones for the runner, potentially referencing HR zones for easy/recovery efforts.

Ensure that the weekly mileage goal is a target and adjust run distances accordingly across the 4 weeks, often with a slight reduction in volume in week 4 for recovery/taper if applicable.

Provide clear, actionable descriptions for each workout.

Example of a structured run description:
"Warm-up: 10-15 min easy jog. Main Set: 4 x 800m at VDOT I-pace with 400m easy jog recovery. Cool-down: 10 min easy jog."

Remember to explicitly state the 'blockType' and 'durationWeeks' in the output, and ensure the 'weeklyPlans' array contains exactly 4 entries, each following the 'WeeklyPlanSchema'.

If the block type is 'Polishing', ensure a significant taper in volume and intensity towards the end of the block.
`,
});

const generateTrainingBlockFlow = ai.defineFlow(
  {
    name: 'generateTrainingBlockFlow',
    inputSchema: GenerateTrainingBlockInputSchema,
    outputSchema: GenerateTrainingBlockOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
