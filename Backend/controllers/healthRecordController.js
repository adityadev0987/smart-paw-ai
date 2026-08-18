import HealthRecord from "../models/HealthRecord.js";

export const createHealthRecord = async (req, res) => {
  try {
    const { petId, title, date, type, notes } = req.body;

    if (!petId || !title || !date || !type) {
      return res.status(400).json({
        success: false,
        message: "Pet ID, title, date and type are required.",
      });
    }

    const record = await HealthRecord.create({
      petId,
      title,
      date,
      type,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Health record created successfully.",
      data: record,
    });
  } catch (error) {
    console.error("Create health record error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create health record.",
    });
  }
};

export const getHealthRecords = async (req, res) => {
  try {
    const { petId } = req.query;

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Pet ID is required.",
      });
    }

    const records = await HealthRecord.find({ petId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get health records error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch health records.",
    });
  }
};

export const updateHealthRecord = async (req, res) => {
  try {
    const { title, date, type, notes } = req.body;

    const record = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      {
        title,
        date,
        type,
        notes,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Health record not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Health record updated successfully.",
      data: record,
    });
  } catch (error) {
    console.error("Update health record error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update health record.",
    });
  }
};

export const deleteHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findByIdAndDelete(
      req.params.id,
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Health record not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Health record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete health record error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete health record.",
    });
  }
};