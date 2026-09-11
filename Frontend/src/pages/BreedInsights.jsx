import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  Dumbbell,
  Heart,
  Info,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Utensils,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

/* =========================================================
   BREED KNOWLEDGE BASE
========================================================= */

const breedData = [
  {
    id: "dog-golden-retriever",
    species: "Dog",
    name: "Golden Retriever",
    size: "Large",
    temperament: "Friendly, intelligent, social, and active",
    lifespan: "10–12 years",
    exercise: "High",

    overview: {
      introduction:
        "Golden Retrievers are active, social, intelligent dogs originally developed for retrieving game. They generally enjoy human interaction, learning, outdoor activity, and structured routines.",
      ownerPoints: [
        "They usually thrive when they receive regular interaction with their family.",
        "Their intelligence means they benefit from both physical activity and mental challenges.",
        "Their energetic nature makes consistent exercise an important part of daily care.",
        "Their individual health, body condition, age, and lifestyle should always be considered when planning care.",
      ],
      important:
        "Breed characteristics describe tendencies, not guarantees. Individual Golden Retrievers can differ significantly in temperament, activity level, and health.",
    },

    personality: {
      introduction:
        "Golden Retrievers are commonly known for being friendly, people-oriented, intelligent, and eager to participate in family activities.",
      traits: [
        {
          title: "Social nature",
          text:
            "Many Golden Retrievers enjoy human companionship and regular social interaction. Long periods without stimulation or interaction may contribute to boredom or unwanted behavior.",
        },
        {
          title: "Intelligence",
          text:
            "They generally learn quickly and can benefit from training games, obedience exercises, retrieving activities, and food puzzles.",
        },
        {
          title: "Playfulness",
          text:
            "Many individuals retain a playful nature well into adulthood. Appropriate play can provide both exercise and mental enrichment.",
        },
        {
          title: "Individual temperament",
          text:
            "Not every Golden Retriever behaves identically. Age, previous experiences, socialization, environment, and health can influence behavior.",
        },
      ],
    },

    exercise: {
      introduction:
        "Golden Retrievers are generally active dogs and need regular physical activity. Exercise should be balanced with the dog's age, fitness, body condition, and health status.",
      recommendations: [
        "Daily walks appropriate to the individual dog's fitness.",
        "Retrieving games such as controlled fetch.",
        "Interactive play and training sessions.",
        "Swimming can be enjoyable for suitable individuals.",
        "Mental enrichment through scent games and food puzzles.",
      ],
      precautions: [
        "Increase exercise gradually rather than suddenly.",
        "Monitor for persistent limping, stiffness, unusual fatigue, or exercise intolerance.",
        "Avoid forcing strenuous activity when the dog is unwell.",
        "Heat can increase exercise risk, so provide suitable rest and hydration opportunities.",
      ],
      ownerTip:
        "A good routine combines physical exercise with mental stimulation rather than relying only on long walks.",
    },

    nutrition: {
      introduction:
        "Nutrition should support healthy body condition, activity, life stage, and individual health needs. Golden Retrievers can be highly food-motivated, making portion management particularly useful.",
      points: [
        {
          title: "Portion control",
          text:
            "Measure meals rather than estimating portions. Feeding amounts should be adjusted according to body condition, activity, age, and veterinary recommendations.",
        },
        {
          title: "Treat management",
          text:
            "Treats contribute calories too. Keep treats controlled and consider their contribution to the overall daily intake.",
        },
        {
          title: "Weight monitoring",
          text:
            "Regularly assess body condition instead of relying only on the number on a weighing scale.",
        },
        {
          title: "Diet changes",
          text:
            "Sudden dietary changes can cause digestive upset. New foods are generally better introduced gradually unless a veterinarian advises otherwise.",
        },
      ],
      ownerTip:
        "If body weight is increasing despite apparently normal feeding, review portions, treats, activity, and discuss the change with a veterinarian.",
    },

    grooming: {
      introduction:
        "Golden Retrievers have a dense double coat and can shed considerably. Grooming is not only cosmetic; it also gives owners an opportunity to inspect the skin, coat, and ears.",
      routine: [
        "Brush the coat regularly to reduce loose hair and prevent tangling.",
        "Check ears regularly for odor, redness, discharge, or irritation.",
        "Keep nails at an appropriate length.",
        "Maintain regular dental hygiene.",
        "Inspect the skin for persistent redness, lumps, wounds, or unusual irritation.",
      ],
      important:
        "Frequent bathing is not automatically better. Grooming frequency should depend on the individual dog's coat, activity, skin condition, and veterinary recommendations.",
    },

    training: {
      introduction:
        "Golden Retrievers are generally intelligent and responsive to training. Positive reinforcement can make learning more engaging while helping establish predictable behavior.",
      principles: [
        {
          title: "Start with basics",
          text:
            "Reliable responses to basic cues, recall, leash behavior, and calm handling are useful foundations.",
        },
        {
          title: "Use positive reinforcement",
          text:
            "Reward desired behaviors with appropriate food rewards, praise, play, or other reinforcers.",
        },
        {
          title: "Socialization",
          text:
            "Controlled exposure to people, animals, environments, sounds, and handling can help develop confidence.",
        },
        {
          title: "Mental stimulation",
          text:
            "Training itself can serve as mental exercise. Short, consistent sessions are often more useful than repetitive sessions that cause boredom.",
        },
      ],
    },

    health: {
      introduction:
        "Golden Retrievers can have increased risk for certain health conditions. A breed predisposition does not mean that every individual dog will develop the condition.",
      conditions: [
        {
          title: "Hip and elbow disorders",
          text:
            "Joint problems can affect mobility and comfort. Owners may notice stiffness, limping, reluctance to climb stairs, difficulty rising, or reduced willingness to exercise.",
        },
        {
          title: "Heart conditions",
          text:
            "Some Golden Retrievers can develop heart problems. Persistent coughing, reduced exercise tolerance, weakness, collapse, or unusual breathing should not be ignored.",
        },
        {
          title: "Eye disorders",
          text:
            "Eye problems can vary in severity. Changes in the appearance of the eye, persistent discharge, squinting, cloudiness, or vision-related behavior changes warrant veterinary attention.",
        },
        {
          title: "Skin and ear problems",
          text:
            "Allergic or inflammatory skin problems and ear infections can occur. Repeated scratching, licking, redness, odor, or discharge should be assessed.",
        },
        {
          title: "Weight-related problems",
          text:
            "Excess body weight can increase strain on joints and affect overall health. Body condition should be monitored throughout life.",
        },
        {
          title: "Cancer",
          text:
            "Golden Retrievers have been the subject of substantial research into breed-associated cancer risk. Owners should not interpret this as a diagnosis, but unexplained lumps, persistent changes, weight loss, or other concerning signs should be evaluated.",
        },
      ],
      ownerTip:
        "The purpose of breed-health information is to help owners know what to monitor and discuss with a veterinarian, not to diagnose conditions at home.",
    },

    preventive: {
      introduction:
        "Preventive care aims to detect problems early and reduce avoidable health risks.",
      checklist: [
        "Keep vaccinations up to date according to veterinary recommendations.",
        "Use appropriate parasite prevention.",
        "Maintain regular veterinary examinations.",
        "Monitor body weight and body condition.",
        "Maintain dental hygiene.",
        "Discuss age-appropriate screening with your veterinarian.",
        "Keep a current record of medications, vaccinations, allergies, and previous medical problems.",
      ],
      ownerTip:
        "Preventive care should be personalized according to the dog's age, location, lifestyle, medical history, and veterinary assessment.",
    },

    monitoring: {
      introduction:
        "Knowing your pet's normal behavior makes it easier to notice meaningful changes.",
      monitor: [
        {
          title: "Appetite",
          text:
            "Watch for persistent reduction or unusual increase in appetite.",
        },
        {
          title: "Weight",
          text:
            "Unexpected weight gain or loss deserves attention, especially when it occurs without an obvious reason.",
        },
        {
          title: "Mobility",
          text:
            "Watch for stiffness, limping, reluctance to jump, difficulty climbing stairs, or difficulty getting up.",
        },
        {
          title: "Exercise tolerance",
          text:
            "Notice whether normal activity suddenly becomes difficult or causes unusual fatigue.",
        },
        {
          title: "Skin and ears",
          text:
            "Monitor persistent itching, redness, odor, discharge, hair loss, or recurring irritation.",
        },
        {
          title: "Behavior",
          text:
            "Changes in sleep, interaction, activity, vocalization, or normal routines can sometimes indicate stress, pain, or illness.",
        },
      ],
    },

    warnings: {
      introduction:
        "Some signs require prompt veterinary assessment. The urgency depends on severity, duration, and the individual animal.",
      signs: [
        "Difficulty breathing or severe respiratory distress",
        "Collapse or inability to remain standing",
        "Sudden severe weakness",
        "Repeated vomiting with weakness or inability to keep water down",
        "Sudden severe pain",
        "Significant bleeding",
        "Sudden loss of mobility",
        "Rapidly worsening symptoms",
      ],
      emergency:
        "If a pet appears critically ill, is struggling to breathe, collapses, or has another obvious emergency, seek veterinary care immediately rather than relying on breed information.",
    },
  },

  {
    id: "dog-labrador-retriever",
    species: "Dog",
    name: "Labrador Retriever",
    size: "Large",
    temperament: "Friendly, outgoing, energetic, and playful",
    lifespan: "10–12 years",
    exercise: "High",

    overview: {
      introduction:
        "Labrador Retrievers are active, social, food-motivated dogs that generally enjoy retrieving games, exercise, training, and family interaction.",
      ownerPoints: [
        "They generally benefit from consistent physical activity.",
        "Food motivation can make training easier but also makes portion control important.",
        "Interactive play and retrieving activities can provide useful enrichment.",
        "Individual exercise requirements vary with age, health, and body condition.",
      ],
      important:
        "A Labrador's friendly reputation does not mean every individual has the same temperament or needs.",
    },

    personality: {
      introduction:
        "Labradors are commonly described as social, playful, energetic, and eager to interact with people.",
      traits: [
        {
          title: "People-oriented",
          text:
            "Many Labradors enjoy spending time with their family and participating in household activities.",
        },
        {
          title: "Playful",
          text:
            "Retrieving, interactive toys, and structured games can provide useful enrichment.",
        },
        {
          title: "Food motivated",
          text:
            "Food rewards can be effective during training, but treats should be included in overall calorie management.",
        },
        {
          title: "Energetic",
          text:
            "Insufficient physical and mental activity may contribute to boredom or unwanted behaviors.",
        },
      ],
    },

    exercise: {
      introduction:
        "Labradors are generally active dogs and often require regular physical and mental activity.",
      recommendations: [
        "Daily walks suited to the individual dog.",
        "Retrieving and fetch-based games.",
        "Swimming for suitable individuals.",
        "Training and scent-based games.",
        "Interactive toys and food puzzles.",
      ],
      precautions: [
        "Avoid sudden increases in intense activity.",
        "Monitor body condition and joint comfort.",
        "Watch for unusual fatigue or reduced exercise tolerance.",
        "Provide suitable rest during hot weather.",
      ],
      ownerTip:
        "For many Labradors, the best routine combines exercise, training, play, and opportunities to use their natural retrieving behavior.",
    },

    nutrition: {
      introduction:
        "Weight management is an important part of Labrador care because some individuals are highly food motivated and can gain excess weight easily.",
      points: [
        {
          title: "Measured meals",
          text:
            "Use measured portions instead of feeding based purely on appetite.",
        },
        {
          title: "Treat control",
          text:
            "Training treats should be accounted for within the overall daily calorie intake.",
        },
        {
          title: "Body condition",
          text:
            "Regularly assess body condition and discuss unexplained weight changes with a veterinarian.",
        },
        {
          title: "Life-stage nutrition",
          text:
            "Nutritional needs change with growth, adulthood, senior years, activity, and medical conditions.",
        },
      ],
      ownerTip:
        "A healthy-looking body condition is more useful than assuming that a heavier dog is automatically healthier.",
    },

    grooming: {
      introduction:
        "Labradors have a short dense double coat and can shed significantly.",
      routine: [
        "Brush regularly to manage loose hair.",
        "Check ears for odor, redness, and discharge.",
        "Maintain nail length.",
        "Maintain dental hygiene.",
        "Check skin regularly for persistent irritation.",
      ],
      important:
        "Routine grooming is also a useful opportunity to notice changes in skin, ears, paws, or coat.",
    },

    training: {
      introduction:
        "Labradors often respond well to reward-based training and can enjoy learning new behaviors.",
      principles: [
        {
          title: "Basic obedience",
          text:
            "Recall, loose-leash walking, calm greetings, and basic cues are useful everyday skills.",
        },
        {
          title: "Impulse control",
          text:
            "Teaching calm behavior around food, toys, doors, and exciting environments can be valuable.",
        },
        {
          title: "Retrieving",
          text:
            "Retrieving games can be incorporated into structured exercise and training.",
        },
        {
          title: "Socialization",
          text:
            "Positive and controlled experiences can help develop appropriate social behavior.",
        },
      ],
    },

    health: {
      introduction:
        "Labradors can be predisposed to several health problems. Individual risk varies.",
      conditions: [
        {
          title: "Obesity",
          text:
            "Excess body weight can increase health risks and place additional stress on joints. Monitor body condition regularly.",
        },
        {
          title: "Hip and elbow problems",
          text:
            "Joint problems may appear as stiffness, limping, difficulty rising, or reduced willingness to exercise.",
        },
        {
          title: "Eye conditions",
          text:
            "Changes such as squinting, cloudiness, persistent discharge, or visual difficulties should be assessed.",
        },
        {
          title: "Ear problems",
          text:
            "Floppy ears and moisture can contribute to ear problems in some dogs. Recurrent odor, redness, or discharge deserves veterinary attention.",
        },
      ],
      ownerTip:
        "Weight, mobility, ears, eyes, and exercise tolerance are useful areas for routine observation.",
    },

    preventive: {
      introduction:
        "Preventive care should be individualized and discussed with a veterinarian.",
      checklist: [
        "Routine veterinary examinations.",
        "Vaccinations according to veterinary recommendations.",
        "Appropriate parasite prevention.",
        "Regular body-condition monitoring.",
        "Dental hygiene.",
        "Age-appropriate screening where indicated.",
      ],
      ownerTip:
        "Keep records of vaccinations, medications, allergies, previous illness, and veterinary recommendations.",
    },

    monitoring: {
      introduction:
        "Small changes can be useful clues when compared with your dog's normal baseline.",
      monitor: [
        {
          title: "Body weight",
          text: "Watch for gradual or unexplained weight changes.",
        },
        {
          title: "Mobility",
          text:
            "Monitor stairs, jumping, walking, running, and getting up.",
        },
        {
          title: "Ears",
          text:
            "Watch for odor, redness, scratching, head shaking, or discharge.",
        },
        {
          title: "Appetite",
          text:
            "Persistent changes in appetite can be meaningful.",
        },
        {
          title: "Activity",
          text:
            "Notice if normal exercise becomes unusually difficult.",
        },
      ],
    },

    warnings: {
      introduction:
        "Severe or rapidly worsening symptoms should not be managed using breed information alone.",
      signs: [
        "Difficulty breathing",
        "Collapse",
        "Severe weakness",
        "Repeated vomiting",
        "Sudden inability to walk",
        "Significant bleeding",
        "Severe pain",
      ],
      emergency:
        "Seek urgent veterinary care when a Labrador shows signs of a potentially serious emergency.",
    },
  },

  {
    id: "dog-german-shepherd",
    species: "Dog",
    name: "German Shepherd",
    size: "Large",
    temperament: "Loyal, confident, intelligent, and protective",
    lifespan: "9–13 years",
    exercise: "High",

    overview: {
      introduction:
        "German Shepherds are intelligent working dogs that generally benefit from structured activity, mental stimulation, socialization, and consistent training.",
      ownerPoints: [
        "They often require both physical exercise and mental work.",
        "Consistent training can help channel their intelligence and energy.",
        "Socialization is important, particularly during development.",
        "Mobility and digestive changes should be monitored throughout life.",
      ],
      important:
        "Protective behavior should be managed through appropriate training and socialization rather than punishment.",
    },

    personality: {
      introduction:
        "German Shepherds are commonly described as intelligent, loyal, alert, and confident.",
      traits: [
        {
          title: "Intelligent",
          text:
            "They often enjoy learning tasks and solving problems.",
        },
        {
          title: "Loyal",
          text:
            "Strong attachment to family can be a positive characteristic when paired with appropriate socialization.",
        },
        {
          title: "Alert",
          text:
            "Their alert nature can make environmental management and training important.",
        },
        {
          title: "Protective tendencies",
          text:
            "Appropriate socialization and positive training help prevent fear or over-reactive behavior from becoming problematic.",
        },
      ],
    },

    exercise: {
      introduction:
        "German Shepherds generally benefit from a structured combination of exercise, training, and mental enrichment.",
      recommendations: [
        "Regular walks and controlled outdoor activity.",
        "Obedience training sessions.",
        "Scent and search games.",
        "Interactive problem-solving activities.",
        "Age-appropriate running or working activities when healthy.",
      ],
      precautions: [
        "Do not ignore persistent stiffness or mobility changes.",
        "Increase activity gradually.",
        "Avoid excessive activity during illness or injury.",
        "Monitor heat and hydration during outdoor exercise.",
      ],
      ownerTip:
        "Mental work can be as important as physical exercise for this breed.",
    },

    nutrition: {
      introduction:
        "Nutrition should support healthy growth, body condition, activity, and life stage.",
      points: [
        {
          title: "Balanced nutrition",
          text:
            "Use a complete diet appropriate for the dog's life stage and individual requirements.",
        },
        {
          title: "Body condition",
          text:
            "Monitor body condition rather than encouraging excessive body weight.",
        },
        {
          title: "Digestive changes",
          text:
            "Persistent vomiting, diarrhea, appetite loss, abdominal discomfort, or other digestive changes deserve veterinary attention.",
        },
        {
          title: "Treats",
          text:
            "Keep treats controlled and include them in overall calorie planning.",
        },
      ],
      ownerTip:
        "Diet should be individualized based on age, activity, body condition, and medical history.",
    },

    grooming: {
      introduction:
        "German Shepherds generally benefit from regular coat maintenance and routine hygiene.",
      routine: [
        "Brush regularly to manage shedding.",
        "Inspect skin and coat for persistent irritation.",
        "Check ears periodically.",
        "Maintain nail length.",
        "Maintain dental hygiene.",
      ],
      important:
        "Regular grooming provides an opportunity to notice skin, coat, paw, and ear changes early.",
    },

    training: {
      introduction:
        "Training and socialization are especially important because German Shepherds are intelligent, active, and often naturally alert.",
      principles: [
        {
          title: "Early socialization",
          text:
            "Controlled exposure to people, environments, sounds, and appropriate animals can help build confidence.",
        },
        {
          title: "Structured obedience",
          text:
            "Consistent cues and predictable expectations help establish reliable behavior.",
        },
        {
          title: "Mental stimulation",
          text:
            "Scent work, puzzle activities, and learning tasks can provide useful enrichment.",
        },
        {
          title: "Positive reinforcement",
          text:
            "Reward desired behavior and avoid methods that increase fear or anxiety.",
        },
      ],
    },

    health: {
      introduction:
        "German Shepherds can experience joint, digestive, skin, and other health problems. Individual risk varies.",
      conditions: [
        {
          title: "Hip and elbow problems",
          text:
            "Watch for stiffness, limping, difficulty rising, reluctance to exercise, or changes in gait.",
        },
        {
          title: "Mobility disorders",
          text:
            "Progressive changes in walking, hind-limb strength, coordination, or posture should be discussed with a veterinarian.",
        },
        {
          title: "Digestive problems",
          text:
            "Persistent vomiting, diarrhea, appetite changes, or abdominal discomfort warrant veterinary assessment.",
        },
        {
          title: "Skin problems",
          text:
            "Persistent itching, redness, hair loss, odor, or recurring skin infections should be investigated.",
        },
      ],
      ownerTip:
        "Do not assume persistent mobility or digestive changes are simply part of the breed.",
    },

    preventive: {
      introduction:
        "Preventive care is especially useful for maintaining mobility and detecting health changes early.",
      checklist: [
        "Routine veterinary examinations.",
        "Vaccinations.",
        "Parasite prevention.",
        "Weight and body-condition monitoring.",
        "Dental care.",
        "Age-appropriate mobility and health assessment.",
      ],
      ownerTip:
        "Keep a detailed medical history because previous conditions and treatments can help your veterinarian make better decisions.",
    },

    monitoring: {
      introduction:
        "Owners should establish a baseline for normal movement, appetite, energy, and behavior.",
      monitor: [
        {
          title: "Mobility",
          text:
            "Watch stairs, walking, running, jumping, and rising from rest.",
        },
        {
          title: "Digestive health",
          text:
            "Monitor appetite, vomiting, diarrhea, and stool changes.",
        },
        {
          title: "Energy",
          text:
            "Notice significant changes in normal activity levels.",
        },
        {
          title: "Skin",
          text:
            "Watch for persistent itching, redness, odor, or hair loss.",
        },
        {
          title: "Behavior",
          text:
            "Sudden changes in behavior can sometimes accompany pain, stress, or illness.",
        },
      ],
    },

    warnings: {
      introduction:
        "Urgent signs require veterinary assessment rather than home diagnosis.",
      signs: [
        "Difficulty breathing",
        "Collapse",
        "Sudden severe weakness",
        "Sudden loss of mobility",
        "Repeated vomiting",
        "Severe abdominal discomfort",
        "Significant bleeding",
      ],
      emergency:
        "If symptoms are severe, sudden, or rapidly worsening, seek urgent veterinary care.",
    },
  },

  {
    id: "dog-beagle",
    species: "Dog",
    name: "Beagle",
    size: "Small–Medium",
    temperament: "Curious, friendly, energetic, and scent-driven",
    lifespan: "10–15 years",
    exercise: "Moderate–High",

    overview: {
      introduction:
        "Beagles are curious scent hounds that often enjoy exploring, following scents, social interaction, and active play.",
      ownerPoints: [
        "Their strong sense of smell can influence behavior.",
        "Secure outdoor areas are important because interesting scents can become highly distracting.",
        "Regular activity and enrichment help prevent boredom.",
        "Weight management and ear care are useful areas to monitor.",
      ],
      important:
        "A Beagle may be friendly and trainable while still becoming highly focused on interesting scents.",
    },

    personality: {
      introduction:
        "Beagles are commonly energetic, curious, social, and strongly motivated by scents.",
      traits: [
        {
          title: "Curiosity",
          text:
            "They often enjoy exploring their environment and investigating scents.",
        },
        {
          title: "Scent-driven behavior",
          text:
            "Following interesting smells can become more rewarding than responding to cues, so recall training is important.",
        },
        {
          title: "Social nature",
          text:
            "Many Beagles enjoy interaction with people and other suitable dogs.",
        },
        {
          title: "Individual differences",
          text:
            "Temperament varies according to genetics, socialization, training, age, and environment.",
        },
      ],
    },

    exercise: {
      introduction:
        "Beagles generally benefit from regular activity combined with opportunities to use their natural scenting behavior.",
      recommendations: [
        "Daily walks.",
        "Controlled scent exploration.",
        "Scent games.",
        "Interactive play.",
        "Food puzzles and enrichment activities.",
      ],
      precautions: [
        "Use secure areas because scent-following can reduce attention to surroundings.",
        "Avoid sudden increases in strenuous activity.",
        "Monitor weight and fitness.",
      ],
      ownerTip:
        "Scent-based enrichment can be an excellent way to provide mental stimulation without relying entirely on physical exercise.",
    },

    nutrition: {
      introduction:
        "Portion management is important for maintaining healthy body condition.",
      points: [
        {
          title: "Measured portions",
          text:
            "Use measured meals and adjust according to body condition and activity.",
        },
        {
          title: "Treats",
          text:
            "Keep treats controlled and avoid allowing food rewards to become excessive.",
        },
        {
          title: "Weight",
          text:
            "Regular weight and body-condition monitoring can help identify gradual changes.",
        },
      ],
      ownerTip:
        "Use part of the daily food allowance for training when appropriate instead of continuously adding extra treats.",
    },

    grooming: {
      introduction:
        "Beagles have relatively short coats but still benefit from routine grooming and hygiene.",
      routine: [
        "Regular brushing.",
        "Routine ear inspection.",
        "Nail trimming.",
        "Dental hygiene.",
        "Skin inspection.",
      ],
      important:
        "Persistent ear odor, redness, scratching, or discharge should be evaluated.",
    },

    training: {
      introduction:
        "Training a scent-driven dog often requires patience, consistency, and highly motivating rewards.",
      principles: [
        {
          title: "Recall",
          text:
            "Reliable recall is particularly useful because Beagles may become distracted by scents.",
        },
        {
          title: "Leash skills",
          text:
            "Reward calm walking and appropriate attention rather than allowing constant pulling toward scents.",
        },
        {
          title: "Scent enrichment",
          text:
            "Use controlled scent games as a positive outlet for natural behavior.",
        },
        {
          title: "Consistency",
          text:
            "Short, regular training sessions are generally easier to maintain than long sessions.",
        },
      ],
    },

    health: {
      introduction:
        "Beagles can experience several health problems, and individual risk varies.",
      conditions: [
        {
          title: "Obesity",
          text:
            "Excess weight can affect mobility and overall health. Monitor body condition regularly.",
        },
        {
          title: "Ear problems",
          text:
            "Floppy ears can contribute to moisture and ear problems in some individuals.",
        },
        {
          title: "Joint problems",
          text:
            "Persistent limping, stiffness, or reluctance to move should be assessed.",
        },
        {
          title: "Eye conditions",
          text:
            "Persistent eye discharge, squinting, cloudiness, or visual changes warrant attention.",
        },
      ],
      ownerTip:
        "Routine observation is particularly useful for weight, ears, mobility, and eyes.",
    },

    preventive: {
      introduction:
        "Preventive care should be tailored to the individual dog.",
      checklist: [
        "Vaccinations.",
        "Parasite prevention.",
        "Routine veterinary examinations.",
        "Weight monitoring.",
        "Dental care.",
        "Regular ear checks.",
      ],
      ownerTip:
        "Maintain an updated record of preventive treatments and veterinary visits.",
    },

    monitoring: {
      introduction:
        "Pay attention to changes from the Beagle's normal baseline.",
      monitor: [
        {
          title: "Weight",
          text: "Monitor gradual weight gain or loss.",
        },
        {
          title: "Ears",
          text:
            "Watch for odor, redness, scratching, head shaking, or discharge.",
        },
        {
          title: "Mobility",
          text:
            "Observe walking, running, stairs, and getting up.",
        },
        {
          title: "Appetite",
          text:
            "Persistent appetite changes should be investigated.",
        },
      ],
    },

    warnings: {
      introduction:
        "Serious or rapidly worsening symptoms require veterinary assessment.",
      signs: [
        "Difficulty breathing",
        "Collapse",
        "Severe weakness",
        "Repeated vomiting",
        "Sudden severe pain",
        "Significant bleeding",
      ],
      emergency:
        "Do not rely on breed information when an animal appears critically ill.",
    },
  },

  {
    id: "dog-pug",
    species: "Dog",
    name: "Pug",
    size: "Small",
    temperament: "Affectionate, playful, social, and companionable",
    lifespan: "12–15 years",
    exercise: "Low–Moderate",

    overview: {
      introduction:
        "Pugs are affectionate companion dogs. Their short facial structure means owners should pay particular attention to breathing, heat tolerance, body weight, eyes, and skin folds.",
      ownerPoints: [
        "Avoid excessive heat and strenuous activity.",
        "Weight management is especially important because excess weight can worsen breathing and mobility.",
        "Skin folds should be kept clean and monitored for irritation.",
        "Breathing changes should not automatically be considered normal for the breed.",
      ],
      important:
        "Noisy breathing or reduced exercise tolerance should not automatically be dismissed as normal for a Pug.",
    },

    personality: {
      introduction:
        "Pugs are often affectionate, social, playful, and strongly attached to their human companions.",
      traits: [
        {
          title: "Companion-oriented",
          text:
            "Many Pugs enjoy close interaction with their family.",
        },
        {
          title: "Playful",
          text:
            "Short periods of play can provide useful activity.",
        },
        {
          title: "Heat sensitivity",
          text:
            "Their facial structure can make heat management particularly important.",
        },
        {
          title: "Individual variation",
          text:
            "Temperament and exercise tolerance vary between individuals.",
        },
      ],
    },

    exercise: {
      introduction:
        "Pugs generally benefit from moderate activity rather than intense or prolonged exercise.",
      recommendations: [
        "Short walks.",
        "Short interactive play sessions.",
        "Indoor enrichment.",
        "Gentle training games.",
        "Activities appropriate to the individual dog's breathing ability.",
      ],
      precautions: [
        "Avoid strenuous activity in hot or humid conditions.",
        "Watch closely for breathing difficulty or overheating.",
        "Do not force exercise when the dog is struggling to breathe.",
        "Maintain healthy body condition.",
      ],
      ownerTip:
        "For a Pug, exercise quality and safety matter more than maximizing exercise duration.",
    },

    nutrition: {
      introduction:
        "Maintaining a healthy body condition is particularly important because excess weight can place additional stress on breathing and movement.",
      points: [
        {
          title: "Portion control",
          text:
            "Use measured portions and avoid excessive treats.",
        },
        {
          title: "Body condition",
          text:
            "Monitor body condition regularly and discuss weight changes with a veterinarian.",
        },
        {
          title: "Treat management",
          text:
            "Keep calorie-dense treats limited.",
        },
      ],
      ownerTip:
        "Weight management should be considered part of breathing and mobility management, not only appearance.",
    },

    grooming: {
      introduction:
        "Pugs need regular grooming and careful attention to skin folds, eyes, ears, and dental health.",
      routine: [
        "Inspect skin folds regularly.",
        "Keep facial folds appropriately clean and dry.",
        "Check eyes for irritation or unusual discharge.",
        "Maintain dental hygiene.",
        "Trim nails regularly.",
      ],
      important:
        "Persistent redness, odor, discharge, or irritation should be evaluated by a veterinarian.",
    },

    training: {
      introduction:
        "Positive reinforcement and short sessions can work well with Pugs.",
      principles: [
        {
          title: "Short sessions",
          text:
            "Short training sessions can be easier to manage, especially when exercise tolerance is limited.",
        },
        {
          title: "Positive reinforcement",
          text:
            "Reward-based training helps make learning enjoyable.",
        },
        {
          title: "Calm handling",
          text:
            "Teach cooperative handling for grooming, nail care, and veterinary visits.",
        },
      ],
    },

    health: {
      introduction:
        "Pugs can have health problems associated with their body structure. Individual severity varies.",
      conditions: [
        {
          title: "Breathing problems",
          text:
            "Short facial structure can contribute to airway problems. Persistent noisy breathing, exercise intolerance, or respiratory distress requires veterinary attention.",
        },
        {
          title: "Overheating",
          text:
            "Heat can be particularly dangerous for dogs with compromised airway function. Avoid excessive heat exposure.",
        },
        {
          title: "Obesity",
          text:
            "Excess weight can make breathing and movement more difficult.",
        },
        {
          title: "Eye problems",
          text:
            "Eye irritation or injury can occur and should not be ignored.",
        },
        {
          title: "Skin-fold problems",
          text:
            "Moisture and friction in skin folds can contribute to irritation or infection.",
        },
        {
          title: "Dental problems",
          text:
            "The facial structure can contribute to dental crowding and oral-care challenges.",
        },
      ],
      ownerTip:
        "Breathing, heat tolerance, weight, eyes, skin folds, and dental health deserve particular attention.",
    },

    preventive: {
      introduction:
        "Preventive care should take the individual dog's anatomy, health status, and lifestyle into account.",
      checklist: [
        "Routine veterinary examinations.",
        "Weight and body-condition monitoring.",
        "Vaccinations.",
        "Parasite prevention.",
        "Dental care.",
        "Breathing and heat-tolerance assessment.",
        "Routine eye and skin-fold checks.",
      ],
      ownerTip:
        "Discuss persistent breathing noise or exercise intolerance with your veterinarian rather than assuming it is normal.",
    },

    monitoring: {
      introduction:
        "Owners should know their Pug's normal breathing, activity, appetite, and behavior.",
      monitor: [
        {
          title: "Breathing",
          text:
            "Monitor breathing at rest and during normal activity.",
        },
        {
          title: "Heat tolerance",
          text:
            "Watch for signs of overheating during warm weather.",
        },
        {
          title: "Weight",
          text:
            "Monitor body condition closely.",
        },
        {
          title: "Eyes",
          text:
            "Watch for squinting, cloudiness, redness, or unusual discharge.",
        },
        {
          title: "Skin folds",
          text:
            "Monitor for redness, odor, moisture, or irritation.",
        },
      ],
    },

    warnings: {
      introduction:
        "Breathing emergencies require immediate veterinary attention.",
      signs: [
        "Severe breathing difficulty",
        "Blue, grey, or unusually pale gums",
        "Collapse",
        "Severe overheating",
        "Sudden severe weakness",
        "Severe eye injury",
      ],
      emergency:
        "If a Pug is struggling to breathe or collapses, seek emergency veterinary care immediately.",
    },
  },

  {
    id: "dog-shih-tzu",
    species: "Dog",
    name: "Shih Tzu",
    size: "Small",
    temperament: "Affectionate, friendly, playful, and companionable",
    lifespan: "10–16 years",
    exercise: "Low–Moderate",

    overview: {
      introduction:
        "Shih Tzus are small companion dogs that generally enjoy human interaction, short activity sessions, and predictable routines.",
      ownerPoints: [
        "Regular coat and facial care are important.",
        "Dental hygiene deserves consistent attention.",
        "Short walks and indoor play can provide suitable activity.",
        "Eye, ear, skin, and breathing changes should be monitored.",
      ],
      important:
        "Individual grooming and health needs vary, particularly with coat length and facial structure.",
    },

    personality: {
      introduction:
        "Shih Tzus are commonly affectionate, social, playful, and companion-oriented.",
      traits: [
        {
          title: "Affectionate",
          text:
            "Many enjoy close interaction with their owners.",
        },
        {
          title: "Playful",
          text:
            "Short play sessions can provide useful enrichment.",
        },
        {
          title: "Social",
          text:
            "Positive socialization can help support confident behavior.",
        },
      ],
    },

    exercise: {
      introduction:
        "Shih Tzus generally do not require extremely intense exercise.",
      recommendations: [
        "Short walks.",
        "Indoor play.",
        "Interactive toys.",
        "Short training sessions.",
      ],
      precautions: [
        "Avoid excessive heat.",
        "Monitor breathing during activity.",
        "Adjust exercise according to age and health.",
      ],
      ownerTip:
        "Consistent short activity sessions can be more practical than prolonged strenuous exercise.",
    },

    nutrition: {
      introduction:
        "Small dogs can consume excess calories easily when treats are not measured.",
      points: [
        {
          title: "Portion control",
          text:
            "Use appropriately measured meals.",
        },
        {
          title: "Treats",
          text:
            "Keep treats small and controlled.",
        },
        {
          title: "Dental health",
          text:
            "Nutrition should be combined with regular dental hygiene.",
        },
      ],
      ownerTip:
        "Monitor body condition rather than judging health only by appearance.",
    },

    grooming: {
      introduction:
        "Shih Tzus can require substantial grooming depending on coat length.",
      routine: [
        "Regular brushing.",
        "Facial and eye-area cleaning as appropriate.",
        "Ear checks.",
        "Nail trimming.",
        "Dental hygiene.",
        "Regular professional grooming where appropriate.",
      ],
      important:
        "Matting can hide skin problems and cause discomfort, so coat maintenance is an important part of health care.",
    },

    training: {
      introduction:
        "Positive reinforcement and consistent routines are useful for companion dogs.",
      principles: [
        {
          title: "House training",
          text:
            "Consistency and predictable routines are particularly important.",
        },
        {
          title: "Handling",
          text:
            "Teach calm cooperation for brushing, eye care, nail trimming, and veterinary examination.",
        },
        {
          title: "Socialization",
          text:
            "Positive exposure to people, environments, and handling can support confidence.",
        },
      ],
    },

    health: {
      introduction:
        "Shih Tzus can experience dental, eye, skin, ear, and breathing problems.",
      conditions: [
        {
          title: "Dental disease",
          text:
            "Small dogs can be prone to dental problems. Bad breath, visible tartar, difficulty chewing, or mouth discomfort should be assessed.",
        },
        {
          title: "Eye problems",
          text:
            "Persistent discharge, redness, squinting, cloudiness, or injury requires attention.",
        },
        {
          title: "Skin problems",
          text:
            "Persistent itching, odor, redness, or hair loss can indicate skin disease.",
        },
        {
          title: "Ear problems",
          text:
            "Monitor for odor, redness, scratching, head shaking, or discharge.",
        },
        {
          title: "Breathing problems",
          text:
            "Some individuals can have airway-related problems. Persistent breathing difficulty should be assessed.",
        },
      ],
      ownerTip:
        "Dental, eye, ear, coat, skin, and breathing health are useful areas for routine monitoring.",
    },

    preventive: {
      introduction:
        "Preventive care should be individualized according to age and health.",
      checklist: [
        "Routine veterinary examinations.",
        "Vaccinations.",
        "Parasite prevention.",
        "Regular dental care.",
        "Eye and ear checks.",
        "Weight monitoring.",
        "Regular grooming.",
      ],
      ownerTip:
        "Keep grooming and veterinary records together so recurring problems are easier to identify.",
    },

    monitoring: {
      introduction:
        "Routine observation can help identify changes early.",
      monitor: [
        {
          title: "Eyes",
          text:
            "Monitor discharge, redness, squinting, and cloudiness.",
        },
        {
          title: "Mouth",
          text:
            "Watch for bad breath, difficulty chewing, or oral discomfort.",
        },
        {
          title: "Skin and coat",
          text:
            "Monitor matting, redness, itching, and odor.",
        },
        {
          title: "Breathing",
          text:
            "Notice unusual respiratory effort or reduced tolerance for activity.",
        },
      ],
    },

    warnings: {
      introduction:
        "Serious or rapidly worsening symptoms require veterinary care.",
      signs: [
        "Severe breathing difficulty",
        "Collapse",
        "Severe weakness",
        "Sudden severe eye injury",
        "Repeated vomiting",
        "Difficulty urinating",
      ],
      emergency:
        "Seek urgent veterinary assessment if your Shih Tzu shows severe or rapidly worsening symptoms.",
    },
  },

  {
    id: "cat-indian-domestic",
    species: "Cat",
    name: "Indian Domestic Shorthair",
    size: "Small–Medium",
    temperament: "Adaptable, independent, social, and affectionate",
    lifespan: "12–18 years",
    exercise: "Moderate",

    overview: {
      introduction:
        "Domestic shorthair cats have diverse appearances and personalities. Their care should be based heavily on the individual cat's age, environment, health, nutrition, and behavior.",
      ownerPoints: [
        "Provide safe opportunities for play and exploration.",
        "Maintain healthy body condition.",
        "Monitor litter-box habits.",
        "Keep vaccinations and parasite prevention appropriate to lifestyle.",
      ],
      important:
        "Domestic shorthair is a broad category rather than a single standardized breed, so individual variation can be substantial.",
    },

    personality: {
      introduction:
        "Domestic cats can range from highly social to relatively independent.",
      traits: [
        {
          title: "Individual temperament",
          text:
            "Personality can vary widely even between cats living in the same household.",
        },
        {
          title: "Environmental sensitivity",
          text:
            "Changes in household routine, resources, or other animals can influence behavior.",
        },
        {
          title: "Enrichment needs",
          text:
            "Play, scratching, climbing, hiding spaces, and interactive activities can support wellbeing.",
        },
      ],
    },

    exercise: {
      introduction:
        "Cats benefit from opportunities to stalk, chase, climb, explore, and play.",
      recommendations: [
        "Interactive wand-toy play.",
        "Short play sessions throughout the day.",
        "Climbing and elevated resting spaces.",
        "Scratching surfaces.",
        "Food puzzles and enrichment.",
      ],
      precautions: [
        "Avoid forcing interaction when the cat is stressed.",
        "Keep toys and environments safe.",
        "Adjust activity for age and health.",
      ],
      ownerTip:
        "Several short play sessions can be more practical than expecting a cat to exercise continuously.",
    },

    nutrition: {
      introduction:
        "Cats require species-appropriate complete nutrition and appropriate calorie intake.",
      points: [
        {
          title: "Portion management",
          text:
            "Monitor food amounts and body condition to reduce the risk of excess weight.",
        },
        {
          title: "Water",
          text:
            "Fresh water should be available and water-intake changes should be noticed.",
        },
        {
          title: "Diet changes",
          text:
            "Sudden dietary changes may cause digestive problems in some cats.",
        },
      ],
      ownerTip:
        "Discuss specialized diets with a veterinarian rather than making major nutritional changes based only on internet advice.",
    },

    grooming: {
      introduction:
        "Short-haired cats generally require less coat maintenance than long-haired cats, but routine grooming remains useful.",
      routine: [
        "Regular coat inspection.",
        "Nail trimming when needed.",
        "Dental care.",
        "Ear checks when appropriate.",
        "Skin inspection.",
      ],
      important:
        "Changes in grooming behavior can sometimes indicate discomfort or illness.",
    },

    training: {
      introduction:
        "Cats respond best to positive reinforcement and environmental management.",
      principles: [
        {
          title: "Positive reinforcement",
          text:
            "Reward desired behaviors rather than using punishment.",
        },
        {
          title: "Carrier training",
          text:
            "Gradual positive carrier training can make veterinary visits less stressful.",
        },
        {
          title: "Environmental enrichment",
          text:
            "Scratching posts, hiding spaces, climbing areas, and interactive toys can support normal behavior.",
        },
      ],
    },

    health: {
      introduction:
        "Domestic cats can experience many common feline health problems. Early recognition of changes in normal behavior is valuable.",
      conditions: [
        {
          title: "Dental disease",
          text:
            "Bad breath, difficulty eating, drooling, or changes in chewing can indicate oral problems.",
        },
        {
          title: "Obesity",
          text:
            "Excess body weight can contribute to multiple health problems.",
        },
        {
          title: "Urinary problems",
          text:
            "Changes in urination, frequent litter-box attempts, straining, or producing very little urine should be taken seriously.",
        },
        {
          title: "Parasites",
          text:
            "External and internal parasites can affect cats depending on lifestyle and exposure.",
        },
        {
          title: "Skin problems",
          text:
            "Persistent itching, hair loss, wounds, or skin irritation should be evaluated.",
        },
      ],
      ownerTip:
        "For cats, changes in litter-box behavior can be particularly important and should not be dismissed.",
    },

    preventive: {
      introduction:
        "Preventive care should reflect the cat's age, lifestyle, environment, and medical history.",
      checklist: [
        "Routine veterinary examinations.",
        "Vaccinations according to veterinary advice.",
        "Appropriate parasite prevention.",
        "Dental care.",
        "Weight monitoring.",
        "Routine observation of litter-box behavior.",
      ],
      ownerTip:
        "Indoor cats can still require preventive veterinary care; lifestyle should be discussed with the veterinarian.",
    },

    monitoring: {
      introduction:
        "Cats can hide signs of illness, so subtle changes from normal behavior can be meaningful.",
      monitor: [
        {
          title: "Appetite",
          text:
            "Monitor persistent changes in eating behavior.",
        },
        {
          title: "Water intake",
          text:
            "Notice significant changes in drinking.",
        },
        {
          title: "Urination",
          text:
            "Watch frequency, effort, amount, and litter-box behavior.",
        },
        {
          title: "Grooming",
          text:
            "Reduced grooming or excessive grooming can both be meaningful changes.",
        },
        {
          title: "Behavior",
          text:
            "Hiding, withdrawal, unusual vocalization, or reduced interaction can indicate stress, pain, or illness.",
        },
      ],
    },

    warnings: {
      introduction:
        "Certain feline symptoms can become serious quickly.",
      signs: [
        "Difficulty urinating or repeated unsuccessful litter-box attempts",
        "Difficulty breathing",
        "Collapse",
        "Repeated vomiting",
        "Severe weakness",
        "Significant bleeding",
      ],
      emergency:
        "A male cat that is repeatedly attempting to urinate but producing little or no urine may have a potentially life-threatening urinary obstruction and requires immediate veterinary care.",
    },
  },

  {
    id: "cat-persian",
    species: "Cat",
    name: "Persian",
    size: "Medium",
    temperament: "Calm, affectionate, gentle, and quiet",
    lifespan: "12–17 years",
    exercise: "Low–Moderate",

    overview: {
      introduction:
        "Persian cats are generally calm companion cats. Their long coat and facial structure mean grooming, eye care, dental care, weight monitoring, and breathing should receive attention.",
      ownerPoints: [
        "Regular coat grooming helps prevent matting.",
        "Eye-area care can be important.",
        "Monitor breathing and heat tolerance.",
        "Maintain healthy body condition.",
      ],
      important:
        "Individual Persian cats can vary considerably in facial structure, coat, temperament, and health needs.",
    },

    personality: {
      introduction:
        "Persians are commonly associated with calm and affectionate companion behavior.",
      traits: [
        {
          title: "Calm",
          text:
            "Many prefer quieter environments and predictable routines.",
        },
        {
          title: "Affectionate",
          text:
            "Many enjoy gentle human interaction.",
        },
        {
          title: "Individual preferences",
          text:
            "Every cat has its own tolerance for handling and interaction.",
        },
      ],
    },

    exercise: {
      introduction:
        "Persians generally benefit from gentle daily activity and interactive play.",
      recommendations: [
        "Short interactive play sessions.",
        "Gentle chasing games.",
        "Climbing and resting areas.",
        "Food puzzles.",
      ],
      precautions: [
        "Monitor heat tolerance.",
        "Avoid forcing strenuous activity.",
        "Adjust play for age and breathing ability.",
      ],
      ownerTip:
        "Regular gentle activity can help maintain healthy body condition without requiring intense exercise.",
    },

    nutrition: {
      introduction:
        "Appropriate calorie intake and body condition are important, especially for less active cats.",
      points: [
        {
          title: "Portion control",
          text:
            "Measure food and monitor body condition.",
        },
        {
          title: "Hydration",
          text:
            "Provide access to fresh water and observe changes in drinking.",
        },
        {
          title: "Dental considerations",
          text:
            "Discuss appropriate dental care with a veterinarian.",
        },
      ],
      ownerTip:
        "Weight gain should be addressed early because excess weight can affect mobility and general health.",
    },

    grooming: {
      introduction:
        "Persian cats generally require more grooming than short-haired cats.",
      routine: [
        "Frequent brushing.",
        "Regular mat prevention.",
        "Eye-area monitoring and cleaning when appropriate.",
        "Nail trimming.",
        "Dental care.",
        "Skin inspection.",
      ],
      important:
        "Severe matting can cause discomfort and may hide skin problems.",
    },

    training: {
      introduction:
        "Gentle positive reinforcement and cooperative handling can make grooming and veterinary care easier.",
      principles: [
        {
          title: "Handling training",
          text:
            "Gradually teach tolerance of brushing, eye care, nail trimming, and carrier handling.",
        },
        {
          title: "Positive reinforcement",
          text:
            "Reward calm behavior with appropriate rewards.",
        },
        {
          title: "Predictable routines",
          text:
            "Consistent routines can reduce stress for some cats.",
        },
      ],
    },

    health: {
      introduction:
        "Persian cats can have health concerns involving eyes, skin, teeth, breathing, and body condition.",
      conditions: [
        {
          title: "Eye problems",
          text:
            "Persistent discharge, redness, squinting, cloudiness, or obvious discomfort should be evaluated.",
        },
        {
          title: "Dental disease",
          text:
            "Oral problems may cause bad breath, eating changes, or discomfort.",
        },
        {
          title: "Skin and coat problems",
          text:
            "Matting, irritation, or persistent itching should not be ignored.",
        },
        {
          title: "Breathing problems",
          text:
            "Some Persian cats can have airway-related difficulties. Breathing changes deserve attention.",
        },
        {
          title: "Weight-related problems",
          text:
            "Lower activity can make excess calorie intake more significant.",
        },
      ],
      ownerTip:
        "Eyes, coat, breathing, dental health, and body condition are particularly useful areas to monitor.",
    },

    preventive: {
      introduction:
        "Preventive care should be individualized according to the cat's age and health.",
      checklist: [
        "Routine veterinary examinations.",
        "Vaccinations.",
        "Parasite prevention.",
        "Dental care.",
        "Regular grooming.",
        "Weight monitoring.",
        "Eye and breathing assessment when indicated.",
      ],
      ownerTip:
        "Discuss recurring eye, breathing, or skin problems with your veterinarian.",
    },

    monitoring: {
      introduction:
        "Changes from the cat's normal behavior can be important.",
      monitor: [
        {
          title: "Eyes",
          text:
            "Watch discharge, redness, squinting, or cloudiness.",
        },
        {
          title: "Breathing",
          text:
            "Notice changes in breathing effort or activity tolerance.",
        },
        {
          title: "Coat",
          text:
            "Monitor matting, skin irritation, and grooming changes.",
        },
        {
          title: "Weight",
          text:
            "Monitor body condition regularly.",
        },
      ],
    },

    warnings: {
      introduction:
        "Severe symptoms require veterinary attention.",
      signs: [
        "Difficulty breathing",
        "Collapse",
        "Severe weakness",
        "Sudden severe eye injury",
        "Repeated vomiting",
        "Difficulty urinating",
      ],
      emergency:
        "Seek urgent veterinary care for severe respiratory, urinary, neurological, or other rapidly worsening symptoms.",
    },
  },

  {
    id: "cat-siamese",
    species: "Cat",
    name: "Siamese",
    size: "Medium",
    temperament: "Social, vocal, intelligent, and active",
    lifespan: "12–20 years",
    exercise: "Moderate–High",

    overview: {
      introduction:
        "Siamese cats are often highly social, vocal, active, and intelligent. They generally benefit from interaction, enrichment, play, and predictable routines.",
      ownerPoints: [
        "Interactive play can help meet their high activity needs.",
        "Mental stimulation is important.",
        "They may seek considerable human interaction.",
        "Behavioral changes can be meaningful because they are often expressive cats.",
      ],
      important:
        "Individual personality varies and should be considered alongside breed tendencies.",
    },

    personality: {
      introduction:
        "Siamese cats are commonly known for being social, vocal, curious, and intelligent.",
      traits: [
        {
          title: "Social",
          text:
            "Many enjoy substantial human interaction and may become frustrated when under-stimulated.",
        },
        {
          title: "Vocal",
          text:
            "Vocal communication can be normal, but a sudden change in vocalization should be noticed.",
        },
        {
          title: "Intelligent",
          text:
            "Puzzle toys, training, and interactive play can provide useful mental stimulation.",
        },
      ],
    },

    exercise: {
      introduction:
        "Siamese cats often benefit from active daily enrichment.",
      recommendations: [
        "Interactive wand toys.",
        "Climbing structures.",
        "Puzzle feeders.",
        "Short frequent play sessions.",
        "Chasing and stalking games.",
      ],
      precautions: [
        "Provide safe climbing and play environments.",
        "Adjust activity according to age and health.",
        "Avoid forcing interaction when the cat is stressed.",
      ],
      ownerTip:
        "Mental stimulation is particularly important for active and intelligent cats.",
    },

    nutrition: {
      introduction:
        "Provide complete nutrition and monitor body condition rather than feeding according to appetite alone.",
      points: [
        {
          title: "Portions",
          text:
            "Use measured portions appropriate for the cat's size and activity.",
        },
        {
          title: "Hydration",
          text:
            "Maintain access to fresh water and monitor changes in drinking.",
        },
        {
          title: "Treats",
          text:
            "Keep treats controlled and appropriate for the cat.",
        },
      ],
      ownerTip:
        "Major dietary changes should be discussed with a veterinary professional when health concerns are present.",
    },

    grooming: {
      introduction:
        "Siamese cats generally have relatively simple coat-care needs.",
      routine: [
        "Regular coat inspection.",
        "Nail care.",
        "Dental hygiene.",
        "Routine ear checks.",
        "Skin observation.",
      ],
      important:
        "Changes in grooming behavior can sometimes signal discomfort or illness.",
    },

    training: {
      introduction:
        "Their intelligence can make interactive training and enrichment especially useful.",
      principles: [
        {
          title: "Positive reinforcement",
          text:
            "Reward desired behavior with appropriate rewards.",
        },
        {
          title: "Interactive learning",
          text:
            "Puzzle feeders and simple training exercises can provide mental enrichment.",
        },
        {
          title: "Carrier training",
          text:
            "Gradual positive carrier training can reduce veterinary-visit stress.",
        },
      ],
    },

    health: {
      introduction:
        "Siamese cats can experience dental, respiratory, eye, weight, and behavioral health concerns.",
      conditions: [
        {
          title: "Dental disease",
          text:
            "Bad breath, chewing changes, drooling, or mouth discomfort should be assessed.",
        },
        {
          title: "Respiratory problems",
          text:
            "Persistent coughing, breathing difficulty, or changes in respiratory effort require veterinary assessment.",
        },
        {
          title: "Eye conditions",
          text:
            "Squinting, discharge, redness, or visual changes should be monitored.",
        },
        {
          title: "Stress-related behavior",
          text:
            "Environmental changes and insufficient enrichment may affect behavior in some individuals.",
        },
      ],
      ownerTip:
        "Changes in vocalization, behavior, appetite, litter-box use, and activity can be useful clues.",
    },

    preventive: {
      introduction:
        "Preventive care should be based on age, lifestyle, environment, and veterinary recommendations.",
      checklist: [
        "Routine veterinary examinations.",
        "Vaccinations.",
        "Parasite prevention.",
        "Dental care.",
        "Weight monitoring.",
        "Environmental enrichment.",
      ],
      ownerTip:
        "Keep veterinary records updated and note changes in normal behavior.",
    },

    monitoring: {
      introduction:
        "Because Siamese cats can be expressive, changes from their normal behavior may be easier for owners to notice.",
      monitor: [
        {
          title: "Vocalization",
          text:
            "Notice sudden or persistent changes from normal vocal behavior.",
        },
        {
          title: "Appetite",
          text:
            "Monitor eating patterns.",
        },
        {
          title: "Litter box",
          text:
            "Monitor urination and bowel habits.",
        },
        {
          title: "Activity",
          text:
            "Notice significant reduction in normal play or movement.",
        },
        {
          title: "Breathing",
          text:
            "Monitor persistent coughing or respiratory changes.",
        },
      ],
    },

    warnings: {
      introduction:
        "Severe symptoms require prompt veterinary attention.",
      signs: [
        "Difficulty breathing",
        "Difficulty urinating",
        "Collapse",
        "Repeated vomiting",
        "Severe weakness",
        "Significant bleeding",
      ],
      emergency:
        "Do not delay veterinary care when a cat has severe respiratory or urinary symptoms.",
    },
  },

  {
    id: "cat-maine-coon",
    species: "Cat",
    name: "Maine Coon",
    size: "Large",
    temperament: "Gentle, social, intelligent, and playful",
    lifespan: "10–13 years",
    exercise: "Moderate",

    overview: {
      introduction:
        "Maine Coons are large, social cats that often benefit from interactive play, climbing opportunities, grooming, and routine health monitoring.",
      ownerPoints: [
        "Provide sturdy climbing and resting structures.",
        "Maintain coat care.",
        "Monitor body condition.",
        "Pay attention to mobility and heart-related signs.",
      ],
      important:
        "Large body size can influence nutrition, environment, and mobility considerations.",
    },

    personality: {
      introduction:
        "Maine Coons are commonly described as social, gentle, intelligent, and playful.",
      traits: [
        {
          title: "Social",
          text:
            "Many enjoy interaction with people while still retaining typical feline independence.",
        },
        {
          title: "Playful",
          text:
            "Interactive games and climbing opportunities can provide enrichment.",
        },
        {
          title: "Intelligent",
          text:
            "Puzzle activities and positive reinforcement can support mental stimulation.",
        },
      ],
    },

    exercise: {
      introduction:
        "Moderate daily activity combined with climbing and interactive play can support healthy body condition.",
      recommendations: [
        "Interactive play.",
        "Climbing structures.",
        "Chasing games.",
        "Puzzle feeders.",
        "Environmental exploration.",
      ],
      precautions: [
        "Use sturdy climbing structures.",
        "Monitor mobility as the cat ages.",
        "Avoid excessive calorie intake.",
      ],
      ownerTip:
        "A large cat benefits from an environment designed around its size and movement needs.",
    },

    nutrition: {
      introduction:
        "Nutrition should support body condition and healthy growth while avoiding excessive calories.",
      points: [
        {
          title: "Body condition",
          text:
            "Monitor body condition rather than assuming a large cat should be overweight.",
        },
        {
          title: "Portions",
          text:
            "Use measured feeding amounts.",
        },
        {
          title: "Hydration",
          text:
            "Maintain access to fresh water.",
        },
      ],
      ownerTip:
        "Discuss nutritional needs with a veterinarian if growth, weight, or health conditions are unusual.",
    },

    grooming: {
      introduction:
        "The longer coat benefits from regular brushing.",
      routine: [
        "Regular brushing.",
        "Mat prevention.",
        "Nail care.",
        "Dental hygiene.",
        "Skin inspection.",
      ],
      important:
        "Regular grooming helps identify skin changes and prevents severe matting.",
    },

    training: {
      introduction:
        "Positive reinforcement can be useful for carrier training, handling, and enrichment.",
      principles: [
        {
          title: "Handling",
          text:
            "Teach calm cooperation with grooming and veterinary handling.",
        },
        {
          title: "Enrichment",
          text:
            "Use interactive toys, climbing, and food puzzles.",
        },
        {
          title: "Carrier training",
          text:
            "Gradual positive carrier training can reduce travel stress.",
        },
      ],
    },

    health: {
      introduction:
        "Maine Coons can have health concerns involving the heart, joints, dental health, body weight, and skin or coat.",
      conditions: [
        {
          title: "Heart disease",
          text:
            "Some individuals can develop heart conditions. Reduced activity, breathing changes, weakness, or collapse should be evaluated.",
        },
        {
          title: "Joint problems",
          text:
            "Large body size can make mobility monitoring useful. Watch for stiffness or reluctance to move.",
        },
        {
          title: "Dental disease",
          text:
            "Oral health should be monitored through routine dental care.",
        },
        {
          title: "Obesity",
          text:
            "Excess weight can contribute to mobility and general health problems.",
        },
      ],
      ownerTip:
        "Monitor breathing, activity, mobility, weight, and dental health over time.",
    },

    preventive: {
      introduction:
        "Routine preventive care can help identify health changes early.",
      checklist: [
        "Routine veterinary examinations.",
        "Vaccinations.",
        "Parasite prevention.",
        "Dental care.",
        "Weight monitoring.",
        "Age-appropriate health screening.",
      ],
      ownerTip:
        "Discuss breed-associated screening options with your veterinarian when appropriate.",
    },

    monitoring: {
      introduction:
        "Establish a normal baseline for activity, appetite, grooming, and mobility.",
      monitor: [
        {
          title: "Breathing",
          text:
            "Watch for persistent respiratory changes.",
        },
        {
          title: "Mobility",
          text:
            "Monitor jumping, climbing, walking, and getting up.",
        },
        {
          title: "Weight",
          text:
            "Monitor body condition.",
        },
        {
          title: "Coat",
          text:
            "Watch for matting and skin changes.",
        },
      ],
    },

    warnings: {
      introduction:
        "Severe or sudden changes require veterinary attention.",
      signs: [
        "Difficulty breathing",
        "Collapse",
        "Sudden severe weakness",
        "Sudden loss of mobility",
        "Repeated vomiting",
        "Difficulty urinating",
      ],
      emergency:
        "Seek urgent veterinary care for severe respiratory, urinary, neurological, or cardiovascular signs.",
    },
  },

  {
    id: "cat-bengal",
    species: "Cat",
    name: "Bengal",
    size: "Medium–Large",
    temperament: "Active, curious, intelligent, and playful",
    lifespan: "12–16 years",
    exercise: "High",

    overview: {
      introduction:
        "Bengal cats are often highly active and intelligent. They generally benefit from a stimulating environment, interactive play, climbing, and problem-solving activities.",
      ownerPoints: [
        "Provide frequent interactive enrichment.",
        "Use climbing and scratching opportunities.",
        "Monitor body condition.",
        "Provide predictable routines and safe environmental stimulation.",
      ],
      important:
        "High activity does not eliminate the need for routine veterinary and preventive care.",
    },

    personality: {
      introduction:
        "Bengals are commonly curious, energetic, playful, and intelligent.",
      traits: [
        {
          title: "Active",
          text:
            "They often need more stimulation than a very sedentary cat.",
        },
        {
          title: "Curious",
          text:
            "They benefit from safe opportunities to investigate their environment.",
        },
        {
          title: "Intelligent",
          text:
            "Puzzle toys and interactive learning can provide useful enrichment.",
        },
      ],
    },

    exercise: {
      introduction:
        "Bengals often benefit from substantial interactive and environmental enrichment.",
      recommendations: [
        "Interactive wand play.",
        "Climbing structures.",
        "Puzzle feeders.",
        "Chasing games.",
        "Scent and exploration activities.",
      ],
      precautions: [
        "Ensure climbing structures are secure.",
        "Provide safe enrichment rather than unsupervised hazardous exploration.",
        "Adjust activity for age and health.",
      ],
      ownerTip:
        "A stimulating environment can help reduce boredom-related behaviors.",
    },

    nutrition: {
      introduction:
        "Provide complete nutrition with portions appropriate to body condition and activity.",
      points: [
        {
          title: "Portion control",
          text:
            "High activity does not automatically mean unlimited food.",
        },
        {
          title: "Hydration",
          text:
            "Fresh water should always be available.",
        },
        {
          title: "Body condition",
          text:
            "Monitor weight and muscle condition over time.",
        },
      ],
      ownerTip:
        "Diet should be adjusted based on individual health and activity rather than breed assumptions alone.",
    },

    grooming: {
      introduction:
        "Bengals generally have relatively simple coat-care needs.",
      routine: [
        "Routine coat checks.",
        "Nail care.",
        "Dental hygiene.",
        "Ear checks.",
        "Skin inspection.",
      ],
      important:
        "Changes in grooming behavior or coat condition can sometimes indicate discomfort or illness.",
    },

    training: {
      introduction:
        "Their intelligence can make interactive training and enrichment especially useful.",
      principles: [
        {
          title: "Positive reinforcement",
          text:
            "Reward desired behaviors with appropriate rewards.",
        },
        {
          title: "Puzzle activities",
          text:
            "Food puzzles and problem-solving games provide mental stimulation.",
        },
        {
          title: "Handling",
          text:
            "Gradually teach cooperation with carrier use, grooming, and veterinary handling.",
        },
      ],
    },

    health: {
      introduction:
        "Bengal cats can experience several health concerns, but individual risk varies.",
      conditions: [
        {
          title: "Dental disease",
          text:
            "Monitor oral health, breath, eating behavior, and chewing.",
        },
        {
          title: "Heart conditions",
          text:
            "Persistent breathing changes, weakness, reduced activity, or collapse require veterinary assessment.",
        },
        {
          title: "Digestive problems",
          text:
            "Persistent vomiting, diarrhea, appetite loss, or other digestive changes should be evaluated.",
        },
        {
          title: "Stress-related behavior",
          text:
            "Environmental changes or insufficient enrichment may affect behavior in some individuals.",
        },
      ],
      ownerTip:
        "Activity level should not be used to dismiss changes in appetite, behavior, breathing, or litter-box use.",
    },

    preventive: {
      introduction:
        "Preventive care should be individualized.",
      checklist: [
        "Routine veterinary examinations.",
        "Vaccinations.",
        "Parasite prevention.",
        "Dental care.",
        "Weight monitoring.",
        "Environmental enrichment.",
      ],
      ownerTip:
        "Maintain an updated health record for vaccinations, medications, and previous illnesses.",
    },

    monitoring: {
      introduction:
        "Observe changes from the cat's normal active behavior.",
      monitor: [
        {
          title: "Activity",
          text:
            "Notice a significant reduction in normal play or movement.",
        },
        {
          title: "Appetite",
          text:
            "Monitor eating behavior.",
        },
        {
          title: "Digestion",
          text:
            "Watch for persistent vomiting or diarrhea.",
        },
        {
          title: "Breathing",
          text:
            "Monitor respiratory changes.",
        },
        {
          title: "Behavior",
          text:
            "Notice changes in interaction, vocalization, or hiding.",
        },
      ],
    },

    warnings: {
      introduction:
        "Severe symptoms require prompt veterinary care.",
      signs: [
        "Difficulty breathing",
        "Collapse",
        "Repeated vomiting",
        "Severe weakness",
        "Difficulty urinating",
        "Significant bleeding",
      ],
      emergency:
        "Seek urgent veterinary care for severe or rapidly worsening symptoms.",
    },
  },

  {
    id: "cat-british-shorthair",
    species: "Cat",
    name: "British Shorthair",
    size: "Medium–Large",
    temperament: "Calm, independent, affectionate, and easygoing",
    lifespan: "12–20 years",
    exercise: "Moderate",

    overview: {
      introduction:
        "British Shorthairs are generally calm companion cats. Regular play, body-condition monitoring, dental care, and routine veterinary care are important.",
      ownerPoints: [
        "Encourage regular movement.",
        "Monitor body condition because calm cats may become less active.",
        "Maintain dental hygiene.",
        "Provide enrichment even when the cat appears content to rest.",
      ],
      important:
        "A calm temperament should not be confused with low health needs.",
    },

    personality: {
      introduction:
        "British Shorthairs are commonly described as calm, independent, affectionate, and adaptable.",
      traits: [
        {
          title: "Calm",
          text:
            "Many prefer predictable environments and moderate activity.",
        },
        {
          title: "Independent",
          text:
            "They may enjoy companionship while also valuing personal space.",
        },
        {
          title: "Affectionate",
          text:
            "Individual cats differ in how much physical interaction they prefer.",
        },
      ],
    },

    exercise: {
      introduction:
        "Moderate daily activity can help maintain healthy body condition.",
      recommendations: [
        "Interactive play.",
        "Chasing games.",
        "Climbing opportunities.",
        "Food puzzles.",
        "Short play sessions throughout the day.",
      ],
      precautions: [
        "Monitor body condition.",
        "Adjust activity for age and mobility.",
        "Provide safe climbing and play areas.",
      ],
      ownerTip:
        "Encouraging regular movement can be especially useful for cats that spend much of the day resting.",
    },

    nutrition: {
      introduction:
        "Portion control is important when activity levels are relatively moderate.",
      points: [
        {
          title: "Measured meals",
          text:
            "Use measured portions and monitor body condition.",
        },
        {
          title: "Treats",
          text:
            "Keep treats controlled.",
        },
        {
          title: "Hydration",
          text:
            "Provide fresh water and monitor significant changes in drinking.",
        },
      ],
      ownerTip:
        "Gradual weight gain is easier to address when detected early.",
    },

    grooming: {
      introduction:
        "British Shorthairs have dense coats that benefit from routine grooming.",
      routine: [
        "Regular brushing.",
        "Dental care.",
        "Nail care.",
        "Ear checks.",
        "Skin inspection.",
      ],
      important:
        "Grooming is also an opportunity to monitor for skin changes and parasites.",
    },

    training: {
      introduction:
        "Positive reinforcement can support handling, carrier training, and enrichment.",
      principles: [
        {
          title: "Carrier training",
          text:
            "Gradual positive training can make veterinary travel easier.",
        },
        {
          title: "Handling",
          text:
            "Teach calm tolerance of grooming and veterinary handling.",
        },
        {
          title: "Enrichment",
          text:
            "Interactive play and food puzzles help maintain activity and engagement.",
        },
      ],
    },

    health: {
      introduction:
        "British Shorthairs can experience weight-related, dental, cardiac, joint, and skin or coat problems.",
      conditions: [
        {
          title: "Obesity",
          text:
            "Lower activity combined with excess calories can contribute to weight gain.",
        },
        {
          title: "Dental disease",
          text:
            "Oral health should be monitored regularly.",
        },
        {
          title: "Heart disease",
          text:
            "Breathing changes, weakness, reduced activity, or collapse should be evaluated.",
        },
        {
          title: "Joint problems",
          text:
            "Stiffness or reduced mobility can become more noticeable with age or excess weight.",
        },
      ],
      ownerTip:
        "Weight, activity, breathing, mobility, and dental health are useful long-term monitoring areas.",
    },

    preventive: {
      introduction:
        "Routine preventive care should be adapted to age and individual health.",
      checklist: [
        "Routine veterinary examinations.",
        "Vaccinations.",
        "Parasite prevention.",
        "Dental care.",
        "Weight monitoring.",
        "Age-appropriate health screening.",
      ],
      ownerTip:
        "Discuss any breed-associated screening options with your veterinarian.",
    },

    monitoring: {
      introduction:
        "Calm cats can sometimes show illness through subtle changes.",
      monitor: [
        {
          title: "Weight",
          text:
            "Monitor body condition regularly.",
        },
        {
          title: "Activity",
          text:
            "Notice significant reductions in normal movement.",
        },
        {
          title: "Breathing",
          text:
            "Monitor unusual respiratory effort.",
        },
        {
          title: "Appetite",
          text:
            "Persistent changes in eating behavior deserve attention.",
        },
        {
          title: "Mobility",
          text:
            "Observe jumping, stairs, walking, and getting up.",
        },
      ],
    },

    warnings: {
      introduction:
        "Severe or sudden symptoms require veterinary assessment.",
      signs: [
        "Difficulty breathing",
        "Collapse",
        "Sudden severe weakness",
        "Difficulty urinating",
        "Repeated vomiting",
        "Significant bleeding",
      ],
      emergency:
        "Seek urgent veterinary care when symptoms are severe or rapidly worsening.",
    },
  },
];

/* =========================================================
   FALLBACKS
========================================================= */

const speciesFallbacks = {
  Dog: {
    id: "fallback-dog",
    species: "Dog",
    name: "Dog — General Guidance",
    size: "Varies",
    temperament: "Varies by individual",
    lifespan: "Varies",
    exercise: "Varies",

    overview: {
      introduction:
        "Dogs have diverse breed and individual characteristics. Their care should be based on age, size, health, activity level, environment, nutrition, and behavior.",
      ownerPoints: [
        "Maintain routine veterinary care.",
        "Provide appropriate exercise and mental stimulation.",
        "Maintain healthy body condition.",
        "Keep vaccinations and parasite prevention current.",
      ],
      important:
        "Species-level guidance is general and cannot replace individualized veterinary advice.",
    },

    personality: {
      introduction:
        "Dog temperament varies widely between breeds and individuals.",
      traits: [
        {
          title: "Individual differences",
          text:
            "Genetics, socialization, previous experiences, environment, and health can all affect behavior.",
        },
        {
          title: "Socialization",
          text:
            "Positive exposure to appropriate people, animals, environments, and handling can support confident behavior.",
        },
      ],
    },

    exercise: {
      introduction:
        "Exercise should be appropriate for the dog's age, size, fitness, breed tendencies, and health.",
      recommendations: [
        "Age-appropriate walks.",
        "Interactive play.",
        "Training exercises.",
        "Mental enrichment.",
      ],
      precautions: [
        "Avoid sudden increases in intense activity.",
        "Monitor for pain, weakness, or exercise intolerance.",
      ],
      ownerTip:
        "Exercise should support health rather than exhaust the animal.",
    },

    nutrition: {
      introduction:
        "Dogs should receive complete nutrition appropriate for their life stage and individual needs.",
      points: [
        {
          title: "Portion control",
          text:
            "Measure meals and monitor body condition.",
        },
        {
          title: "Treats",
          text:
            "Keep treats controlled.",
        },
        {
          title: "Diet changes",
          text:
            "Introduce major diet changes carefully and seek veterinary advice when medical diets are involved.",
        },
      ],
      ownerTip:
        "Discuss specialized nutrition with a veterinary professional.",
    },

    grooming: {
      introduction:
        "Grooming needs vary substantially by coat type and individual health.",
      routine: [
        "Coat and skin checks.",
        "Nail care.",
        "Dental hygiene.",
        "Ear checks.",
      ],
      important:
        "Routine grooming provides opportunities to identify changes early.",
    },

    training: {
      introduction:
        "Positive reinforcement and appropriate socialization are useful foundations for most dogs.",
      principles: [
        {
          title: "Consistency",
          text:
            "Use clear and predictable expectations.",
        },
        {
          title: "Positive reinforcement",
          text:
            "Reward desired behavior.",
        },
      ],
    },

    health: {
      introduction:
        "Dogs can experience a wide range of health conditions. Individual risk depends on breed, age, genetics, environment, and lifestyle.",
      conditions: [
        {
          title: "Obesity",
          text:
            "Excess weight can contribute to multiple health problems.",
        },
        {
          title: "Dental disease",
          text:
            "Oral health should be monitored routinely.",
        },
        {
          title: "Parasites",
          text:
            "Preventive care should reflect local and lifestyle-related exposure.",
        },
        {
          title: "Joint problems",
          text:
            "Limping, stiffness, or mobility changes deserve attention.",
        },
      ],
      ownerTip:
        "Regular veterinary examinations remain important even when a dog appears healthy.",
    },

    preventive: {
      introduction:
        "Preventive care helps reduce avoidable risks and detect disease early.",
      checklist: [
        "Vaccinations.",
        "Parasite prevention.",
        "Routine veterinary examinations.",
        "Dental care.",
        "Weight monitoring.",
      ],
      ownerTip:
        "Preventive care should be personalized with your veterinarian.",
    },

    monitoring: {
      introduction:
        "Monitor changes from the dog's normal baseline.",
      monitor: [
        {
          title: "Appetite",
          text:
            "Watch persistent changes.",
        },
        {
          title: "Energy",
          text:
            "Notice significant reductions in normal activity.",
        },
        {
          title: "Weight",
          text:
            "Monitor body condition.",
        },
        {
          title: "Behavior",
          text:
            "Notice unusual changes in interaction or routine.",
        },
      ],
    },

    warnings: {
      introduction:
        "Severe or rapidly worsening symptoms require veterinary assessment.",
      signs: [
        "Difficulty breathing",
        "Collapse",
        "Severe weakness",
        "Repeated vomiting",
        "Significant bleeding",
        "Rapidly worsening symptoms",
      ],
      emergency:
        "Seek urgent veterinary care when a dog appears critically ill.",
    },
  },

  Cat: {
    id: "fallback-cat",
    species: "Cat",
    name: "Cat — General Guidance",
    size: "Varies",
    temperament: "Varies by individual",
    lifespan: "Varies",
    exercise: "Moderate",

    overview: {
      introduction:
        "Cats have diverse individual needs. Their health and wellbeing depend on nutrition, enrichment, preventive care, environment, and close observation of normal behavior.",
      ownerPoints: [
        "Provide safe environmental enrichment.",
        "Maintain healthy body condition.",
        "Monitor litter-box habits.",
        "Keep preventive veterinary care appropriate to lifestyle.",
      ],
      important:
        "Species-level guidance is general and should not replace veterinary assessment.",
    },

    personality: {
      introduction:
        "Cat behavior varies considerably between individuals.",
      traits: [
        {
          title: "Individual temperament",
          text:
            "Some cats are highly social while others prefer more independence.",
        },
        {
          title: "Environmental needs",
          text:
            "Safe hiding spaces, scratching areas, elevated spaces, and enrichment can support wellbeing.",
        },
      ],
    },

    exercise: {
      introduction:
        "Cats benefit from activities that encourage stalking, chasing, climbing, and exploration.",
      recommendations: [
        "Interactive play.",
        "Climbing opportunities.",
        "Scratching surfaces.",
        "Food puzzles.",
      ],
      precautions: [
        "Use safe toys and environments.",
        "Adjust activity for age and health.",
      ],
      ownerTip:
        "Several short play sessions can work well for many cats.",
    },

    nutrition: {
      introduction:
        "Cats require species-appropriate complete nutrition and appropriate calorie intake.",
      points: [
        {
          title: "Portion management",
          text:
            "Monitor food amounts and body condition.",
        },
        {
          title: "Hydration",
          text:
            "Provide fresh water and notice significant drinking changes.",
        },
      ],
      ownerTip:
        "Discuss therapeutic diets with a veterinarian.",
    },

    grooming: {
      introduction:
        "Grooming requirements vary by coat type.",
      routine: [
        "Coat checks.",
        "Dental care.",
        "Nail care.",
        "Ear checks.",
        "Skin inspection.",
      ],
      important:
        "Changes in grooming behavior can sometimes indicate discomfort or illness.",
    },

    training: {
      introduction:
        "Positive reinforcement and environmental management are preferred approaches for cats.",
      principles: [
        {
          title: "Carrier training",
          text:
            "Gradual positive training can reduce veterinary-visit stress.",
        },
        {
          title: "Enrichment",
          text:
            "Provide safe opportunities for normal feline behaviors.",
        },
      ],
    },

    health: {
      introduction:
        "Cats can develop a range of health conditions, and subtle behavioral changes can be meaningful.",
      conditions: [
        {
          title: "Dental disease",
          text:
            "Bad breath, eating changes, or oral discomfort should be evaluated.",
        },
        {
          title: "Obesity",
          text:
            "Excess body weight can affect overall health.",
        },
        {
          title: "Urinary problems",
          text:
            "Changes in urination should be taken seriously.",
        },
        {
          title: "Parasites",
          text:
            "Risk depends on lifestyle and exposure.",
        },
      ],
      ownerTip:
        "Litter-box changes are particularly important observations in cats.",
    },

    preventive: {
      introduction:
        "Preventive care should reflect age, lifestyle, and individual health.",
      checklist: [
        "Vaccinations.",
        "Parasite prevention.",
        "Routine veterinary examinations.",
        "Dental care.",
        "Weight monitoring.",
      ],
      ownerTip:
        "Indoor lifestyle does not eliminate the need for veterinary care.",
    },

    monitoring: {
      introduction:
        "Cats can hide illness, making observation of normal behavior particularly important.",
      monitor: [
        {
          title: "Appetite",
          text:
            "Monitor persistent eating changes.",
        },
        {
          title: "Water intake",
          text:
            "Notice significant changes in drinking.",
        },
        {
          title: "Urination",
          text:
            "Monitor litter-box frequency and effort.",
        },
        {
          title: "Behavior",
          text:
            "Watch for hiding, withdrawal, or unusual vocalization.",
        },
      ],
    },

    warnings: {
      introduction:
        "Some feline emergencies can become serious quickly.",
      signs: [
        "Difficulty urinating",
        "Difficulty breathing",
        "Collapse",
        "Repeated vomiting",
        "Severe weakness",
        "Significant bleeding",
      ],
      emergency:
        "Seek immediate veterinary care for severe respiratory signs, collapse, or suspected urinary obstruction.",
    },
  },

  Other: {
    id: "fallback-other",
    species: "Other",
    name: "General Pet Guidance",
    size: "Varies",
    temperament: "Varies",
    lifespan: "Varies",
    exercise: "Varies",

    overview: {
      introduction:
        "Care requirements vary significantly between species. Species-specific veterinary guidance should be used for animals outside common dog and cat categories.",
      ownerPoints: [
        "Use species-appropriate nutrition.",
        "Provide an appropriate environment.",
        "Monitor normal behavior and health.",
        "Maintain species-appropriate veterinary care.",
      ],
      important:
        "Do not apply dog or cat care recommendations to another species without professional guidance.",
    },

    personality: {
      introduction:
        "Behavior and social needs depend strongly on species.",
      traits: [
        {
          title: "Species-specific needs",
          text:
            "Different species have very different communication, environmental, and social requirements.",
        },
      ],
    },

    exercise: {
      introduction:
        "Activity should be appropriate to species, age, health, and natural behavior.",
      recommendations: [
        "Species-appropriate activity.",
        "Safe environmental enrichment.",
      ],
      precautions: [
        "Avoid applying dog or cat exercise recommendations to other species.",
      ],
      ownerTip:
        "Consult an appropriate veterinary professional for species-specific guidance.",
    },

    nutrition: {
      introduction:
        "Nutrition varies substantially between species.",
      points: [
        {
          title: "Species-appropriate diet",
          text:
            "Use nutrition designed for the animal's species and life stage.",
        },
      ],
      ownerTip:
        "Avoid experimenting with unfamiliar foods without appropriate guidance.",
    },

    grooming: {
      introduction:
        "Grooming needs depend strongly on species.",
      routine: [
        "Species-appropriate grooming.",
        "Skin and coat or body-condition observation.",
      ],
      important:
        "Use species-specific veterinary or husbandry guidance.",
    },

    training: {
      introduction:
        "Training and handling methods should be species appropriate.",
      principles: [
        {
          title: "Positive reinforcement",
          text:
            "Reward-based approaches are generally preferable to punishment.",
        },
      ],
    },

    health: {
      introduction:
        "Health risks vary substantially by species.",
      conditions: [
        {
          title: "Species-specific disease",
          text:
            "Use appropriate veterinary resources for the animal's species.",
        },
      ],
      ownerTip:
        "Do not rely on dog or cat health information for other species.",
    },

    preventive: {
      introduction:
        "Preventive care should be species-specific.",
      checklist: [
        "Routine veterinary examinations.",
        "Species-appropriate vaccinations where applicable.",
        "Appropriate parasite prevention.",
        "Nutrition monitoring.",
      ],
      ownerTip:
        "Work with a veterinarian familiar with the species.",
    },

    monitoring: {
      introduction:
        "Establish a clear baseline for normal behavior and health.",
      monitor: [
        {
          title: "Appetite",
          text:
            "Monitor normal feeding behavior.",
        },
        {
          title: "Energy",
          text:
            "Notice changes in normal activity.",
        },
        {
          title: "Behavior",
          text:
            "Watch for unusual changes.",
        },
      ],
    },

    warnings: {
      introduction:
        "Severe or rapidly worsening symptoms require professional veterinary assessment.",
      signs: [
        "Difficulty breathing",
        "Collapse",
        "Severe weakness",
        "Repeated vomiting",
        "Significant bleeding",
        "Rapidly worsening symptoms",
      ],
      emergency:
        "Seek appropriate emergency veterinary care when the animal appears critically ill.",
    },
  },
};

const mixedBreedFallback = {
  id: "mixed-breed",
  species: "Mixed",
  name: "Mixed Breed",
  size: "Varies",
  temperament: "Varies by individual",
  lifespan: "Varies",
  exercise: "Varies",

  overview: {
    introduction:
      "Mixed-breed pets can inherit characteristics from multiple breeds or populations. Their individual characteristics should be considered more important than assumptions based on a single breed.",
    ownerPoints: [
      "Use the individual pet's age, size, health, activity, and behavior to guide care.",
      "Monitor body condition regularly.",
      "Maintain routine preventive veterinary care.",
      "Observe the pet's own normal baseline rather than comparing it to a breed standard.",
    ],
    important:
      "Mixed-breed status does not mean a pet has no health risks. Individual genetics, environment, and lifestyle still matter.",
  },

  personality: {
    introduction:
      "Temperament in mixed-breed pets can vary widely.",
    traits: [
      {
        title: "Individual variation",
        text:
          "Behavior can be influenced by genetics, early experiences, socialization, environment, and health.",
      },
      {
        title: "Observe the individual",
        text:
          "Owner observations are often more useful than making assumptions from breed labels alone.",
      },
    ],
  },

  exercise: {
    introduction:
      "Exercise should be based on the pet's age, body condition, health, and observed activity level.",
    recommendations: [
      "Regular age-appropriate activity.",
      "Interactive play.",
      "Mental enrichment.",
      "Activities the individual pet enjoys.",
    ],
    precautions: [
      "Avoid sudden increases in exercise.",
      "Monitor for pain, weakness, or exercise intolerance.",
    ],
    ownerTip:
      "Let the individual pet's health and fitness guide exercise planning.",
  },

  nutrition: {
    introduction:
      "Nutrition should be based on the individual pet's species, age, size, activity, body condition, and health.",
    points: [
      {
        title: "Measured feeding",
        text:
          "Use appropriate portions and monitor body condition.",
      },
      {
        title: "Treat control",
        text:
          "Keep treats appropriate to the pet's overall diet.",
      },
    ],
    ownerTip:
      "Discuss unusual nutritional needs with a veterinarian.",
  },

  grooming: {
    introduction:
      "Grooming needs depend on coat type, species, lifestyle, and individual health.",
    routine: [
      "Regular coat or body inspection.",
      "Nail care where applicable.",
      "Dental care where appropriate.",
      "Ear and skin observation.",
    ],
    important:
      "Grooming can help owners notice skin changes, wounds, parasites, or unusual lumps.",
  },

  training: {
    introduction:
      "Positive reinforcement and consistent routines are useful for many companion animals.",
    principles: [
      {
        title: "Positive reinforcement",
        text:
          "Reward desired behavior rather than relying on punishment.",
      },
      {
        title: "Consistency",
        text:
          "Use predictable routines and clear expectations.",
      },
    ],
  },

  health: {
    introduction:
      "Mixed-breed pets can still develop health conditions. Their individual medical history remains important.",
    conditions: [
      {
        title: "Weight-related problems",
        text:
          "Maintain healthy body condition and monitor gradual weight changes.",
      },
      {
        title: "Dental disease",
        text:
          "Maintain appropriate dental care.",
      },
      {
        title: "Parasites",
        text:
          "Use prevention appropriate to species and lifestyle.",
      },
      {
        title: "Joint problems",
        text:
          "Monitor persistent stiffness or mobility changes.",
      },
    ],
    ownerTip:
      "Use individual health history rather than assuming that mixed-breed status guarantees lower health risk.",
  },

  preventive: {
    introduction:
      "Preventive care should be individualized.",
    checklist: [
      "Routine veterinary examinations.",
      "Vaccinations where appropriate.",
      "Parasite prevention.",
      "Dental care.",
      "Weight monitoring.",
    ],
    ownerTip:
      "Keep the pet's complete health record updated.",
  },

  monitoring: {
    introduction:
      "Monitoring the individual pet's normal baseline is especially important.",
    monitor: [
      {
        title: "Appetite",
        text:
          "Monitor persistent changes.",
      },
      {
        title: "Weight",
        text:
          "Monitor body condition.",
      },
      {
        title: "Energy",
        text:
          "Notice significant changes in activity.",
      },
      {
        title: "Behavior",
        text:
          "Watch for unusual changes from normal routines.",
      },
    ],
  },

  warnings: {
    introduction:
      "Severe or rapidly worsening symptoms require veterinary assessment.",
    signs: [
      "Difficulty breathing",
      "Collapse",
      "Severe weakness",
      "Repeated vomiting",
      "Significant bleeding",
      "Rapidly worsening symptoms",
    ],
    emergency:
      "Seek urgent veterinary care for severe or rapidly worsening symptoms.",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
}

function getSpeciesBreeds(species) {
  return breedData.filter(
    (breed) =>
      normalize(breed.species) === normalize(species),
  );
}

function getPetBreedInsight(pet) {
  if (!pet) {
    return {
      insight: speciesFallbacks.Other,
      matched: false,
      reason: "no-pet",
    };
  }

  const species = pet.species || "Other";
  const breed = normalize(pet.breed);

  if (
    breed.includes("mixed") ||
    breed.includes("cross") ||
    breed.includes("mix")
  ) {
    return {
      insight: mixedBreedFallback,
      matched: false,
      reason: "mixed",
    };
  }

  if (!breed) {
    return {
      insight:
        speciesFallbacks[species] ||
        speciesFallbacks.Other,
      matched: false,
      reason: "unknown",
    };
  }

  const exactMatch = breedData.find(
    (item) =>
      normalize(item.species) === normalize(species) &&
      normalize(item.name) === breed,
  );

  if (exactMatch) {
    return {
      insight: exactMatch,
      matched: true,
      reason: "matched",
    };
  }

  const partialMatch = breedData.find(
    (item) =>
      normalize(item.species) === normalize(species) &&
      (normalize(item.name).includes(breed) ||
        breed.includes(normalize(item.name))),
  );

  if (partialMatch) {
    return {
      insight: partialMatch,
      matched: true,
      reason: "partial-match",
    };
  }

  return {
    insight:
      speciesFallbacks[species] ||
      speciesFallbacks.Other,
    matched: false,
    reason: "unavailable",
  };
}

/* =========================================================
   SECTION CONFIG
========================================================= */

const sections = [
  { id: "overview", label: "Overview", icon: Info },
  {
    id: "personality",
    label: "Personality & Behavior",
    icon: Brain,
  },
  {
    id: "exercise",
    label: "Exercise & Stimulation",
    icon: Dumbbell,
  },
  {
    id: "nutrition",
    label: "Nutrition & Weight",
    icon: Utensils,
  },
  {
    id: "grooming",
    label: "Grooming & Hygiene",
    icon: Sparkles,
  },
  {
    id: "training",
    label: "Training & Socialization",
    icon: ShieldCheck,
  },
  {
    id: "health",
    label: "Common Health Concerns",
    icon: Heart,
  },
  {
    id: "preventive",
    label: "Preventive Care",
    icon: CheckCircle2,
  },
  {
    id: "monitoring",
    label: "What to Monitor",
    icon: Activity,
  },
  {
    id: "warnings",
    label: "Warning Signs",
    icon: AlertTriangle,
  },
];

/* =========================================================
   UI COMPONENTS
========================================================= */

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-7">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-500">
        <Icon size={16} />
        {eyebrow}
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}

function TextCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#18212B]">
      {title && (
        <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      <div className="text-sm leading-6 text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex items-start gap-3 text-sm leading-6 text-gray-700 dark:text-gray-300"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DetailList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={`${item.title}-${index}`}
          className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-[#111820]"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {item.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   SECTION CONTENT
========================================================= */

function SectionContent({ section, breed }) {
  const data = breed[section];

  if (!data) {
    return (
      <TextCard>
        Information for this section is not available yet.
      </TextCard>
    );
  }

  if (section === "overview") {
    return (
      <div className="space-y-5">
        <TextCard>{data.introduction}</TextCard>

        <TextCard title="What Owners Should Know">
          <BulletList items={data.ownerPoints} />
        </TextCard>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-orange-500"
            />

            <div>
              <h3 className="text-sm font-bold text-orange-600 dark:text-orange-300">
                Important
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                {data.important}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === "personality") {
    return (
      <div className="space-y-5">
        <TextCard>{data.introduction}</TextCard>

        <DetailList items={data.traits} />

        <TextCard title="Owner Perspective">
          Personality is influenced by genetics, socialization,
          previous experiences, environment, age, and health.
          Treat breed tendencies as general patterns rather than
          a fixed description of your individual pet.
        </TextCard>
      </div>
    );
  }

  if (section === "exercise") {
    return (
      <div className="space-y-5">
        <TextCard>{data.introduction}</TextCard>

        <TextCard title="Recommended Activities">
          <BulletList items={data.recommendations} />
        </TextCard>

        <TextCard title="Exercise Precautions">
          <BulletList items={data.precautions} />
        </TextCard>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <div className="flex gap-3">
            <Dumbbell
              size={19}
              className="mt-0.5 shrink-0 text-orange-500"
            />

            <div>
              <h3 className="text-sm font-bold text-orange-600 dark:text-orange-300">
                Smart Care Tip
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                {data.ownerTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === "nutrition") {
    return (
      <div className="space-y-5">
        <TextCard>{data.introduction}</TextCard>

        <DetailList items={data.points} />

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <div className="flex gap-3">
            <Utensils
              size={19}
              className="mt-0.5 shrink-0 text-orange-500"
            />

            <div>
              <h3 className="text-sm font-bold text-orange-600 dark:text-orange-300">
                Owner Tip
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                {data.ownerTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === "grooming") {
    return (
      <div className="space-y-5">
        <TextCard>{data.introduction}</TextCard>

        <TextCard title="Routine Care">
          <BulletList items={data.routine} />
        </TextCard>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-[#18212B]">
          <div className="flex gap-3">
            <Sparkles
              size={18}
              className="mt-0.5 shrink-0 text-orange-500"
            />

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Why It Matters
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {data.important}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === "training") {
    return (
      <div className="space-y-5">
        <TextCard>{data.introduction}</TextCard>

        <DetailList items={data.principles} />

        <TextCard title="Training Philosophy">
          Reward desired behavior consistently, keep sessions
          appropriate for the individual pet, and avoid punishment
          methods that may increase fear or anxiety.
        </TextCard>
      </div>
    );
  }

  if (section === "health") {
    return (
      <div className="space-y-5">
        <TextCard>{data.introduction}</TextCard>

        <div className="space-y-4">
          {data.conditions.map((condition, index) => (
            <div
              key={`${condition.title}-${index}`}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#18212B]"
            >
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-[#111820]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                    <Heart size={16} />
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {condition.title}
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {condition.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <div className="flex gap-3">
            <Stethoscope
              size={19}
              className="mt-0.5 shrink-0 text-orange-500"
            />

            <div>
              <h3 className="text-sm font-bold text-orange-600 dark:text-orange-300">
                Important
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                {data.ownerTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === "preventive") {
    return (
      <div className="space-y-5">
        <TextCard>{data.introduction}</TextCard>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.checklist.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-[#18212B]"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 size={16} />
              </div>

              <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                {item}
              </p>
            </div>
          ))}
        </div>

        <TextCard title="Personalization">
          {data.ownerTip}
        </TextCard>
      </div>
    );
  }

  if (section === "monitoring") {
    return (
      <div className="space-y-5">
        <TextCard>{data.introduction}</TextCard>

        <DetailList items={data.monitor} />

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <div className="flex gap-3">
            <Activity
              size={19}
              className="mt-0.5 shrink-0 text-orange-500"
            />

            <div>
              <h3 className="text-sm font-bold text-orange-600 dark:text-orange-300">
                Build Your Pet's Baseline
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                Knowing what is normal for your individual pet
                makes changes easier to recognize. Track appetite,
                activity, weight, behavior, drinking, elimination,
                and other normal routines when possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === "warnings") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
              {data.introduction}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {data.signs.map((sign, index) => (
            <div
              key={`${sign}-${index}`}
              className="flex items-start gap-3 rounded-xl border border-red-500/10 bg-gray-50 p-4 dark:bg-[#18212B]"
            >
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />

              <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                {sign}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-sm leading-6 text-red-700 dark:text-red-200">
            {data.emergency}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

/* =========================================================
   MAIN
========================================================= */

function BreedInsights() {
  const { currentPet } = useAppContext();

  const petInsight = getPetBreedInsight(currentPet);

  const [selectedBreed, setSelectedBreed] = useState(
    petInsight.insight,
  );

  const [selectedSection, setSelectedSection] =
    useState("overview");

  const [isBreedOpen, setIsBreedOpen] =
    useState(false);

  const dropdownRef = useRef(null);

  const availableBreeds = currentPet
    ? getSpeciesBreeds(currentPet.species)
    : breedData;

  useEffect(() => {
    const nextInsight =
      getPetBreedInsight(currentPet);

    setSelectedBreed(nextInsight.insight);
    setSelectedSection("overview");
    setIsBreedOpen(false);
  }, [
    currentPet?._id,
    currentPet?.id,
    currentPet?.species,
    currentPet?.breed,
  ]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsBreedOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const handleBreedSelect = (breed) => {
    setSelectedBreed(breed);
    setSelectedSection("overview");
    setIsBreedOpen(false);
  };

  const isSelectedPetBreed =
    currentPet &&
    normalize(selectedBreed.name) ===
      normalize(currentPet.breed);

  const activeSection = sections.find(
    (section) =>
      section.id === selectedSection,
  );

  const ActiveIcon =
    activeSection?.icon || Info;

  return (
    <section className="relative min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-8 transition-colors dark:bg-[#0B0F14] sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none fixed -left-40 top-20 h-80 w-80 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="pointer-events-none fixed -right-40 bottom-10 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <PawPrint size={14} />
            Breed Knowledge Base
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Breed Insights
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
            A practical breed guide covering behavior, daily
            care, nutrition, grooming, training, health risks,
            preventive care, and important warning signs.
          </p>
        </div>

        {/* Current Pet */}
        {currentPet && (
          <div className="mb-5 overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-white p-4 dark:to-[#111820] sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                  <PawPrint size={21} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-500">
                    Current Pet
                  </p>

                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {currentPet.name}
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPet.species ||
                      "Pet"}{" "}
                    •{" "}
                    {currentPet.breed ||
                      "Breed not specified"}{" "}
                    •{" "}
                    {currentPet.age != null
                      ? `${currentPet.age} years old`
                      : "Age not specified"}
                  </p>
                </div>
              </div>

              {petInsight.matched ? (
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                  <ShieldCheck size={14} />
                  Breed matched
                </div>
              ) : (
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  <Info size={14} />
                  General guidance
                </div>
              )}
            </div>
          </div>
        )}

        {/* Breed Selector */}
        <div
          ref={dropdownRef}
          className="relative mb-5"
        >
          <button
            type="button"
            onClick={() =>
              setIsBreedOpen(
                (current) => !current,
              )
            }
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-orange-500/30 dark:border-gray-800 dark:bg-[#111820]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <PawPrint size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Selected Breed
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                    {selectedBreed.name}
                  </span>

                  {isSelectedPetBreed && (
                    <span className="shrink-0 rounded-full bg-orange-500/10 px-2 py-1 text-[9px] font-bold text-orange-600 dark:text-orange-400">
                      Your pet
                    </span>
                  )}
                </div>
              </div>
            </div>

            <ChevronDown
              size={18}
              className={`shrink-0 text-gray-500 transition-transform ${
                isBreedOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isBreedOpen && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-700 dark:bg-[#111820]">
              {availableBreeds.map((breed) => {
                const isSelected =
                  selectedBreed.id ===
                  breed.id;

                const isPetBreed =
                  currentPet?.breed &&
                  normalize(
                    currentPet.breed,
                  ) ===
                    normalize(
                      breed.name,
                    );

                return (
                  <button
                    key={breed.id}
                    type="button"
                    onClick={() =>
                      handleBreedSelect(
                        breed,
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                      isSelected
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PawPrint
                        size={15}
                        className={
                          isSelected
                            ? "text-orange-500"
                            : "text-gray-500"
                        }
                      />

                      <span className="text-sm font-medium">
                        {breed.name}
                      </span>

                      {isPetBreed && (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Your pet
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <span className="text-orange-500">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

              <button
                type="button"
                onClick={() =>
                  handleBreedSelect(
                    currentPet?.species ===
                      "Dog"
                      ? speciesFallbacks.Dog
                      : currentPet?.species ===
                          "Cat"
                        ? speciesFallbacks.Cat
                        : speciesFallbacks.Other,
                  )
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <Info size={15} />
                General{" "}
                {currentPet?.species ||
                  "Pet"}{" "}
                Guidance
              </button>

              {(currentPet?.species ===
                "Dog" ||
                currentPet?.species ===
                  "Cat") && (
                <button
                  type="button"
                  onClick={() =>
                    handleBreedSelect(
                      mixedBreedFallback,
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <PawPrint size={15} />
                  Mixed Breed Guidance
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile section selector */}
        <div className="mb-5 lg:hidden">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Read Section
          </label>

          <select
            value={selectedSection}
            onChange={(event) =>
              setSelectedSection(
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-orange-500 dark:border-gray-700 dark:bg-[#111820] dark:text-gray-200"
          >
            {sections.map((section) => (
              <option
                key={section.id}
                value={section.id}
              >
                {section.label}
              </option>
            ))}
          </select>
        </div>

        {/* Documentation layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#111820]">
              <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-500">
                  Breed Guide
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Explore topic
                </p>
              </div>

              <nav className="p-2">
                {sections.map((section) => {
                  const Icon =
                    section.icon;

                  const active =
                    selectedSection ===
                    section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() =>
                        setSelectedSection(
                          section.id,
                        )
                      }
                      className={`mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${
                        active
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      <Icon
                        size={15}
                        className={
                          active
                            ? "text-orange-500"
                            : "text-gray-500"
                        }
                      />

                      <span className="leading-4">
                        {section.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right content */}
          <main className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#111820]">
              <div className="border-b border-gray-200 bg-gradient-to-r from-orange-500/5 to-transparent px-5 py-6 dark:border-gray-800 sm:px-7 sm:py-7">
                <SectionTitle
                  icon={ActiveIcon}
                  eyebrow={
                    selectedBreed.species ===
                    "Mixed"
                      ? "Mixed Breed Guide"
                      : `${selectedBreed.name} Guide`
                  }
                  title={
                    activeSection?.label ||
                    "Overview"
                  }
                  description={`Detailed information about ${
                    activeSection?.label?.toLowerCase() ||
                    "this breed"
                  } for pet owners.`}
                />
              </div>

              <div className="p-5 sm:p-7">
                <SectionContent
                  section={selectedSection}
                  breed={selectedBreed}
                />
              </div>

              {/* Bottom navigation */}
              <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-[#0D141B] sm:px-7">
                <div className="flex items-center justify-between gap-3">
                  {(() => {
                    const currentIndex =
                      sections.findIndex(
                        (item) =>
                          item.id ===
                          selectedSection,
                      );

                    const previous =
                      sections[
                        currentIndex - 1
                      ];

                    const next =
                      sections[
                        currentIndex + 1
                      ];

                    return (
                      <>
                        {previous ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSection(
                                previous.id,
                              )
                            }
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-orange-500/30 hover:text-orange-600 dark:border-gray-700 dark:bg-[#18212B] dark:text-gray-300 dark:hover:text-orange-400"
                          >
                            ← {previous.label}
                          </button>
                        ) : (
                          <div />
                        )}

                        {next ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSection(
                                next.id,
                              )
                            }
                            className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-2.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-500/15 dark:text-orange-400"
                          >
                            {next.label} →
                          </button>
                        ) : (
                          <div />
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Pet context */}
            {currentPet && (
              <div className="mt-5 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
                <div className="flex gap-3">
                  <Sparkles
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Smart Paw context for{" "}
                      {currentPet.name}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-400">
                      These insights are being shown in the
                      context of{" "}
                      <span className="font-semibold text-gray-800 dark:text-gray-300">
                        {currentPet.name}
                      </span>
                      's selected profile. Breed information
                      is general guidance and should be
                      considered together with the pet's age,
                      weight, health history, medications,
                      nutrition, and lifestyle.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-5 flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#111820]">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-gray-500"
              />

              <p className="text-xs leading-5 text-gray-500">
                Breed Insights provides general educational
                information and does not diagnose, treat, or
                replace veterinary advice. Individual animals
                can differ significantly from breed tendencies.
                For severe, sudden, or concerning symptoms,
                consult a qualified veterinarian.
              </p>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default BreedInsights;