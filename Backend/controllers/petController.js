import Pet from "../models/Pet.js";

// ============================================================
// Helper: Remove empty string values from request data
// ============================================================
// Frontend forms often send "" for fields that were not filled.
// Mongoose enum fields reject "" when it is not part of the enum.
//
// We keep:
// - false
// - 0
// - null
// - actual strings
// - arrays
// - objects
//
// We remove only empty strings.
const cleanEmptyStrings = (value) => {
  if (Array.isArray(value)) {
    return value.map(cleanEmptyStrings);
  }

  if (value && typeof value === "object") {
    const cleaned = {};

    for (const [key, currentValue] of Object.entries(value)) {
      if (currentValue === "") {
        continue;
      }

      cleaned[key] = cleanEmptyStrings(currentValue);
    }

    return cleaned;
  }

  return value;
};

// ============================================================
// CREATE PET
// ============================================================

export const createPet = async (req, res) => {
  try {
    // --------------------------------------------------------
    // Authentication check
    // --------------------------------------------------------

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------------
    // Required fields
    // --------------------------------------------------------

    const {
      name,
      breed,
      age,
      gender,
    } = req.body;

    if (
      !name ||
      !breed ||
      age === undefined ||
      age === null ||
      !gender
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, breed, age and gender are required.",
      });
    }

    // --------------------------------------------------------
    // Clean optional empty values
    // --------------------------------------------------------

    const cleanedData = cleanEmptyStrings(req.body);

    // Never allow frontend to control ownership
    delete cleanedData.userId;

    // --------------------------------------------------------
    // Create pet
    // --------------------------------------------------------

    const pet = await Pet.create({
      ...cleanedData,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Pet created successfully.",
      data: pet,
    });
  } catch (error) {
    console.error("Create pet error:", error);

    // --------------------------------------------------------
    // Mongoose validation error
    // --------------------------------------------------------

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "Some pet information is invalid. Please check the entered details.",
        errors: Object.values(error.errors).map(
          (item) => ({
            field: item.path,
            message: item.message,
          }),
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create pet.",
    });
  }
};

// ============================================================
// GET ALL PETS
// ============================================================

export const getPets = async (req, res) => {
  try {
    // --------------------------------------------------------
    // Authentication check
    // --------------------------------------------------------

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------------
    // Fetch only current user's pets
    // --------------------------------------------------------

    const pets = await Pet.find({
      userId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: pets.length,
      data: pets,
    });
  } catch (error) {
    console.error("Get pets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pets.",
    });
  }
};

// ============================================================
// GET PET BY ID
// ============================================================

export const getPetById = async (req, res) => {
  try {
    // --------------------------------------------------------
    // Authentication check
    // --------------------------------------------------------

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------------
    // Find pet belonging to current user
    // --------------------------------------------------------

    const pet = await Pet.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error("Get pet error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pet.",
    });
  }
};

// ============================================================
// UPDATE PET
// ============================================================

export const updatePet = async (req, res) => {
  try {
    // --------------------------------------------------------
    // Authentication check
    // --------------------------------------------------------

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------------
    // Required fields
    // --------------------------------------------------------

    const {
      name,
      breed,
      age,
      gender,
    } = req.body;

    if (
      !name ||
      !breed ||
      age === undefined ||
      age === null ||
      !gender
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, breed, age and gender are required.",
      });
    }

    // --------------------------------------------------------
    // Clean empty strings
    // --------------------------------------------------------

    const cleanedData = cleanEmptyStrings(req.body);

    // Never allow frontend to change ownership
    delete cleanedData.userId;

    // Never allow frontend to change MongoDB ID
    delete cleanedData._id;

    // --------------------------------------------------------
    // Update pet
    // --------------------------------------------------------
    //
    // returnDocument: "after"
    // replaces deprecated:
    //
    // new: true
    //
    // runValidators ensures schema validation still works.

    const pet = await Pet.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        $set: cleanedData,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    // --------------------------------------------------------
    // Pet not found
    // --------------------------------------------------------

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Pet updated successfully.",
      data: pet,
    });
  } catch (error) {
    console.error("Update pet error:", error);

    // --------------------------------------------------------
    // Mongoose validation error
    // --------------------------------------------------------

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "Some pet information is invalid. Please check the entered details.",
        errors: Object.values(error.errors).map(
          (item) => ({
            field: item.path,
            message: item.message,
          }),
        ),
      });
    }

    // --------------------------------------------------------
    // Invalid MongoDB ID
    // --------------------------------------------------------

    if (error?.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid pet ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update pet.",
    });
  }
};

// ============================================================
// DELETE PET
// ============================================================

export const deletePet = async (req, res) => {
  try {
    // --------------------------------------------------------
    // Authentication check
    // --------------------------------------------------------

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------------
    // Delete only current user's pet
    // --------------------------------------------------------

    const pet = await Pet.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pet deleted successfully.",
    });
  } catch (error) {
    console.error("Delete pet error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete pet.",
    });
  }
};