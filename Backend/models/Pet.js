import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    dose: {
      type: String,
      trim: true,
    },
    frequency: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { _id: true },
);

const vaccinationSchema = new mongoose.Schema(
  {
    vaccine: {
      type: String,
      trim: true,
    },
    dateGiven: {
      type: Date,
    },
    nextDueDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

const surgerySchema = new mongoose.Schema(
  {
    procedure: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

const observationSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

const petSchema = new mongoose.Schema(
  {
    // =========================
    // OWNERSHIP
    // =========================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    // =========================
    // GENERAL / BASIC
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    species: {
      type: String,
      required: false,
      default:"Unknown",
      trim: true,
    },

    breed: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },

    reproductiveStatus: {
      type: String,
      enum: [
        "Intact",
        "Neutered",
        "Spayed",
        "Unknown",
      ],
      default: "Unknown",
    },

    weight: {
      value: {
        type: Number,
        min: 0,
      },
      unit: {
        type: String,
        enum: ["kg", "lb"],
        default: "kg",
      },
    },

    color: {
      type: String,
      trim: true,
    },

    microchipId: {
      type: String,
      trim: true,
    },

    acquisition: {
      date: Date,
      source: {
        type: String,
        enum: [
          "Adopted",
          "Breeder",
          "Rescue",
          "Stray",
          "Other",
          "Unknown",
        ],
      },
    },

    // =========================
    // MEDICAL
    // =========================
    medical: {
      healthStatus: {
        type: String,
        enum: [
          "Healthy",
          "Minor Concern",
          "Chronic Condition",
          "Under Treatment",
          "Unknown",
        ],
        default: "Unknown",
      },

      conditions: [
        {
          type: String,
          trim: true,
        },
      ],

      previousIllnesses: [
        {
          type: String,
          trim: true,
        },
      ],

      allergies: [
        {
          type: String,
          trim: true,
        },
      ],

      surgeries: [surgerySchema],

      previousHospitalizations: [
        {
          type: String,
          trim: true,
        },
      ],

      medications: [medicationSchema],

      supplements: [medicationSchema],
    },

    // =========================
    // PREVENTIVE CARE
    // =========================
    preventiveCare: {
      vaccinations: [vaccinationSchema],

      parasitePrevention: {
        flea: {
          product: String,
          lastGiven: Date,
          nextDue: Date,
        },

        tick: {
          product: String,
          lastGiven: Date,
          nextDue: Date,
        },

        deworming: {
          product: String,
          lastGiven: Date,
          nextDue: Date,
        },

        heartworm: {
          product: String,
          lastGiven: Date,
          nextDue: Date,
        },
      },
    },

    // =========================
    // NUTRITION
    // =========================
    nutrition: {
      foodType: {
        type: String,
        enum: [
          "",
          "Dry",
          "Wet",
          "Raw",
          "Homemade",
          "Mixed",
          "Other",
        ],
        default:"",
      },

      foodBrand: {
        type: String,
        trim: true,
      },

      feedingAmount: {
        type: String,
        trim: true,
      },

      mealsPerDay: {
        type: Number,
        min: 0,
      },

      feedingSchedule: {
        type: String,
        trim: true,
      },

      treats: {
        type: String,
        trim: true,
      },

      humanFood: {
        type: String,
        trim: true,
      },

      recentDietChange: {
        type: Boolean,
        default: false,
      },

      waterIntake: {
        type: String,
        enum: [
          "Normal",
          "Less Than Usual",
          "More Than Usual",
          "Unknown",
        ],
        default: "Unknown",
      },

      waterNotes: {
        type: String,
        trim: true,
      },
    },

    // =========================
    // BEHAVIOR
    // =========================
    behavior: {
      temperament: [
        {
          type: String,
          trim: true,
        },
      ],

      behavioralConcerns: [
        {
          type: String,
          trim: true,
        },
      ],

      separationAnxiety: {
        type: Boolean,
        default: false,
      },

      aggression: {
        type: Boolean,
        default: false,
      },

      excessiveVocalization: {
        type: Boolean,
        default: false,
      },

      notes: {
        type: String,
        trim: true,
      },
    },

    // =========================
    // LIFESTYLE / ENVIRONMENT
    // =========================
    lifestyle: {
      activityLevel: {
        type: String,
        enum: [
          "Low",
          "Moderate",
          "High",
          "Very High",
          "Unknown",
        ],
        default: "Unknown",
      },

      exerciseType: {
        type: String,
        trim: true,
      },

      exerciseDuration: {
        type: String,
        trim: true,
      },

      exerciseFrequency: {
        type: String,
        trim: true,
      },

      housing: {
        type: String,
        enum: [
          "Apartment",
          "House",
          "Farm",
          "Other",
          "Unknown",
        ],
      },

      indoorOutdoor: {
        type: String,
        enum: [
          "Indoor",
          "Outdoor",
          "Both",
          "Unknown",
        ],
        default: "Unknown",
      },

      otherPets: {
        type: Boolean,
        default: false,
      },

      otherPetsDetails: {
        type: String,
        trim: true,
      },

      childrenAtHome: {
        type: Boolean,
        default: false,
      },

      travelFrequency: {
        type: String,
        trim: true,
      },

      environmentalChanges: {
        type: String,
        trim: true,
      },

      exposureNotes: {
        type: String,
        trim: true,
      },
    },

    // =========================
    // GROOMING & DENTAL
    // =========================
    groomingDental: {
      groomingFrequency: {
        type: String,
        trim: true,
      },

      bathingFrequency: {
        type: String,
        trim: true,
      },

      brushingFrequency: {
        type: String,
        trim: true,
      },

      nailTrimmingFrequency: {
        type: String,
        trim: true,
      },

      earCleaningFrequency: {
        type: String,
        trim: true,
      },

      skinCoatIssues: {
        type: String,
        trim: true,
      },

      toothBrushing: {
        type: Boolean,
        default: false,
      },

      dentalCleaningFrequency: {
        type: String,
        trim: true,
      },

      dentalProblems: {
        type: String,
        trim: true,
      },

      badBreath: {
        type: Boolean,
        default: false,
      },
    },

    // =========================
    // HEALTH MONITORING
    // =========================
    healthMonitoring: {
      baseline: {
        appetite: {
          type: String,
          enum: ["Normal", "Low", "High", "Unknown"],
          default: "Unknown",
        },

        energy: {
          type: String,
          enum: ["Normal", "Low", "High", "Unknown"],
          default: "Unknown",
        },

        sleep: {
          type: String,
          enum: ["Normal", "Reduced", "Increased", "Unknown"],
          default: "Unknown",
        },

        urination: {
          type: String,
          enum: ["Normal", "Abnormal", "Unknown"],
          default: "Unknown",
        },

        bowelMovements: {
          type: String,
          enum: ["Normal", "Abnormal", "Unknown"],
          default: "Unknown",
        },

        breathing: {
          type: String,
          enum: ["Normal", "Abnormal", "Unknown"],
          default: "Unknown",
        },

        behavior: {
          type: String,
          enum: ["Normal", "Changed", "Unknown"],
          default: "Unknown",
        },
      },

      observations: [observationSchema],
    },

    // =========================
    // REPRODUCTIVE / FAMILY
    // =========================
    reproductiveFamily: {
      pregnancyHistory: {
        type: String,
        trim: true,
      },

      reproductiveComplications: {
        type: String,
        trim: true,
      },

      geneticConditions: [
        {
          type: String,
          trim: true,
        },
      ],

      familyHistory: {
        type: String,
        trim: true,
      },
    },

    // =========================
    // EMERGENCY
    // =========================
    emergency: {
      primaryVet: {
        name: {
          type: String,
          trim: true,
        },

        clinic: {
          type: String,
          trim: true,
        },

        phone: {
          type: String,
          trim: true,
        },
      },

      emergencyVet: {
        name: {
          type: String,
          trim: true,
        },

        clinic: {
          type: String,
          trim: true,
        },

        phone: {
          type: String,
          trim: true,
        },
      },

      emergencyNotes: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Pet = mongoose.model("Pet", petSchema);

export default Pet;