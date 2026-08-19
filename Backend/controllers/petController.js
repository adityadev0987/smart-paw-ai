import Pet from "../models/Pet.js";

export const createPet = async (req, res) => {
  try {
    const { name, breed, age, gender } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!name || !breed || age === undefined || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name, breed, age and gender are required.",
      });
    }

    const pet = await Pet.create({
      userId: req.user.id,
      name,
      breed,
      age,
      gender,
    });

    res.status(201).json({
      success: true,
      message: "Pet created successfully.",
      data: pet,
    });
  } catch (error) {
    console.error("Create pet error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create pet.",
    });
  }
};

export const getPets = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const pets = await Pet.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pets.length,
      data: pets,
    });
  } catch (error) {
    console.error("Get pets error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pets.",
    });
  }
};

export const getPetById = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

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

    res.status(200).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error("Get pet error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pet.",
    });
  }
};

export const updatePet = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { name, breed, age, gender } = req.body;

    const pet = await Pet.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        name,
        breed,
        age,
        gender,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pet updated successfully.",
      data: pet,
    });
  } catch (error) {
    console.error("Update pet error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update pet.",
    });
  }
};

export const deletePet = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

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

    res.status(200).json({
      success: true,
      message: "Pet deleted successfully.",
    });
  } catch (error) {
    console.error("Delete pet error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete pet.",
    });
  }
};