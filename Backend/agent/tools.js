import Pet from "../models/Pet.js";
import HealthRecord from "../models/HealthRecord.js";

function clean(value) {
  if (value === undefined) return null;
  return value;
}

function cleanArray(value) {
  return Array.isArray(value) ? value : [];
}

export async function getPetProfile(petId) {
  if (!petId) {
    throw new Error("Pet ID is required.");
  }

  const pet = await Pet.findById(petId).lean();

  if (!pet) {
    throw new Error("Pet not found.");
  }

  return {
    id: pet._id.toString(),

    general: {
      name: clean(pet.name),
      species: clean(pet.species),
      breed: clean(pet.breed),
      age: clean(pet.age),
      gender: clean(pet.gender),
      reproductiveStatus: clean(pet.reproductiveStatus),
      weight: clean(pet.weight),
      color: clean(pet.color),
    },

    medical: {
      healthStatus: clean(pet.medical?.healthStatus),

      conditions: cleanArray(pet.medical?.conditions),

      previousIllnesses: cleanArray(
        pet.medical?.previousIllnesses,
      ),

      allergies: cleanArray(
        pet.medical?.allergies,
      ),

      surgeries: cleanArray(
        pet.medical?.surgeries,
      ).map((item) => ({
        procedure: item.procedure,
        date: item.date,
        reason: item.reason,
        notes: item.notes,
      })),

      previousHospitalizations: cleanArray(
        pet.medical?.previousHospitalizations,
      ),

      medications: cleanArray(
        pet.medical?.medications,
      ).map((item) => ({
        name: item.name,
        dose: item.dose,
        frequency: item.frequency,
        reason: item.reason,
        startDate: item.startDate,
        endDate: item.endDate,
      })),

      supplements: cleanArray(
        pet.medical?.supplements,
      ).map((item) => ({
        name: item.name,
        dose: item.dose,
        frequency: item.frequency,
        reason: item.reason,
        startDate: item.startDate,
        endDate: item.endDate,
      })),
    },

    preventiveCare: {
      vaccinations: cleanArray(
        pet.preventiveCare?.vaccinations,
      ).map((item) => ({
        vaccine: item.vaccine,
        dateGiven: item.dateGiven,
        nextDueDate: item.nextDueDate,
        notes: item.notes,
      })),

      parasitePrevention: {
        flea: clean(
          pet.preventiveCare?.parasitePrevention?.flea,
        ),

        tick: clean(
          pet.preventiveCare?.parasitePrevention?.tick,
        ),

        deworming: clean(
          pet.preventiveCare?.parasitePrevention?.deworming,
        ),

        heartworm: clean(
          pet.preventiveCare?.parasitePrevention?.heartworm,
        ),
      },
    },

    nutrition: {
      foodType: clean(pet.nutrition?.foodType),
      foodBrand: clean(pet.nutrition?.foodBrand),
      feedingAmount: clean(pet.nutrition?.feedingAmount),
      mealsPerDay: clean(pet.nutrition?.mealsPerDay),
      feedingSchedule: clean(pet.nutrition?.feedingSchedule),
      treats: clean(pet.nutrition?.treats),
      humanFood: clean(pet.nutrition?.humanFood),
      recentDietChange: clean(pet.nutrition?.recentDietChange),
      waterIntake: clean(pet.nutrition?.waterIntake),
      waterNotes: clean(pet.nutrition?.waterNotes),
    },

    behavior: {
      temperament: cleanArray(
        pet.behavior?.temperament,
      ),

      behavioralConcerns: cleanArray(
        pet.behavior?.behavioralConcerns,
      ),

      separationAnxiety: clean(
        pet.behavior?.separationAnxiety,
      ),

      aggression: clean(
        pet.behavior?.aggression,
      ),

      excessiveVocalization: clean(
        pet.behavior?.excessiveVocalization,
      ),

      notes: clean(pet.behavior?.notes),
    },

    lifestyle: {
      activityLevel: clean(
        pet.lifestyle?.activityLevel,
      ),

      exerciseType: clean(
        pet.lifestyle?.exerciseType,
      ),

      exerciseDuration: clean(
        pet.lifestyle?.exerciseDuration,
      ),

      exerciseFrequency: clean(
        pet.lifestyle?.exerciseFrequency,
      ),

      housing: clean(
        pet.lifestyle?.housing,
      ),

      indoorOutdoor: clean(
        pet.lifestyle?.indoorOutdoor,
      ),

      otherPets: clean(
        pet.lifestyle?.otherPets,
      ),

      otherPetsDetails: clean(
        pet.lifestyle?.otherPetsDetails,
      ),

      childrenAtHome: clean(
        pet.lifestyle?.childrenAtHome,
      ),

      travelFrequency: clean(
        pet.lifestyle?.travelFrequency,
      ),

      environmentalChanges: clean(
        pet.lifestyle?.environmentalChanges,
      ),

      exposureNotes: clean(
        pet.lifestyle?.exposureNotes,
      ),
    },

    groomingDental: {
      skinCoatIssues: clean(
        pet.groomingDental?.skinCoatIssues,
      ),

      toothBrushing: clean(
        pet.groomingDental?.toothBrushing,
      ),

      dentalCleaningFrequency: clean(
        pet.groomingDental?.dentalCleaningFrequency,
      ),

      dentalProblems: clean(
        pet.groomingDental?.dentalProblems,
      ),

      badBreath: clean(
        pet.groomingDental?.badBreath,
      ),
    },

    healthMonitoring: {
      baseline: clean(
        pet.healthMonitoring?.baseline,
      ),

      observations: cleanArray(
        pet.healthMonitoring?.observations,
      ).map((item) => ({
        date: item.date,
        type: item.type,
        description: item.description,
      })),
    },

    reproductiveFamily: {
      pregnancyHistory: clean(
        pet.reproductiveFamily?.pregnancyHistory,
      ),

      reproductiveComplications: clean(
        pet.reproductiveFamily?.reproductiveComplications,
      ),

      geneticConditions: cleanArray(
        pet.reproductiveFamily?.geneticConditions,
      ),

      familyHistory: clean(
        pet.reproductiveFamily?.familyHistory,
      ),
    },
  };
}

export async function getHealthRecords(petId) {
  if (!petId) {
    throw new Error("Pet ID is required.");
  }

  const records = await HealthRecord.find({
    petId,
  })
    .sort({
      date: -1,
      createdAt: -1,
    })
    .lean();

  return records.map((record) => ({
    id: record._id.toString(),
    title: record.title,
    date: record.date,
    type: record.type,
    notes: record.notes || "",
  }));
}