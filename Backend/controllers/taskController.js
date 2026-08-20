import mongoose from "mongoose";
import Task from "../models/Task.js";
import Pet from "../models/Pet.js";

export const createTask = async (req, res) => {
  try {
    const {
      petId,
      title,
      date,
      type,
      completed,
    } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!petId || !title || !date || !type) {
      return res.status(400).json({
        success: false,
        message: "Pet ID, title, date and type are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pet ID.",
      });
    }

    const pet = await Pet.findOne({
      _id: petId,
      userId: req.user.id,
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    const task = await Task.create({
      petId,
      title,
      date,
      type,
      completed: completed ?? false,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create task.",
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { petId } = req.query;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Pet ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pet ID.",
      });
    }

    const pet = await Pet.findOne({
      _id: petId,
      userId: req.user.id,
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    const tasks = await Task.find({ petId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks.",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, date, type, completed } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const pet = await Pet.findOne({
      _id: task.petId,
      userId: req.user.id,
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    task.title = title;
    task.date = date;
    task.type = type;
    task.completed = completed;

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update task.",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const pet = await Pet.findOne({
      _id: task.petId,
      userId: req.user.id,
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete task.",
    });
  }
};