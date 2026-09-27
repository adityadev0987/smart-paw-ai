import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// --------------------------------------------------
// REGISTER
// --------------------------------------------------

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "owner",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create account.",
    });
  }
};

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.role === "doctor" && !user.doctorProfile?.isApproved) {
      return res.status(403).json({ success: false, message: "This veterinarian account is awaiting approval." });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          doctorProfile: user.role === "doctor" ? user.doctorProfile : undefined,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login.",
    });
  }
};

// --------------------------------------------------
// GET CURRENT USER
// --------------------------------------------------

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          doctorProfile: user.role === "doctor" ? user.doctorProfile : undefined,
        },
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user.",
    });
  }
};

export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, registrationKey, qualification, specialization, experience, profilePhoto, availableDays = [], timeSlots = [] } = req.body;
    if (!process.env.DOCTOR_REGISTRATION_KEY || registrationKey !== process.env.DOCTOR_REGISTRATION_KEY) return res.status(403).json({ success: false, message: "A valid veterinarian registration key is required." });
    if (!name || !email || !password || !qualification || !specialization || !Number.isFinite(Number(experience)) || !Array.isArray(availableDays) || !Array.isArray(timeSlots)) return res.status(400).json({ success: false, message: "Complete the veterinarian profile and login fields." });
    if (String(password).length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: "An account with this email already exists." });
    const specialties = Array.isArray(specialization) ? specialization : String(specialization).split(",");
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), role: "doctor", doctorProfile: { profilePhoto: profilePhoto || "", qualification: String(qualification).trim(), specialization: specialties.map((s) => String(s).trim()).filter(Boolean), experience: Number(experience), isApproved: true, isAcceptingConsultations: false, availableDays, timeSlots } });
    return res.status(201).json({ success: true, message: "Veterinarian account created. Sign in to publish availability.", data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Doctor registration error:", error);
    return res.status(500).json({ success: false, message: "Unable to register veterinarian account." });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const { profilePhoto, qualification, specialization, experience, availableDays, timeSlots, isAcceptingConsultations } = req.body;
    const updates = {};
    if (profilePhoto !== undefined) updates["doctorProfile.profilePhoto"] = String(profilePhoto).slice(0, 2048);
    if (qualification !== undefined) updates["doctorProfile.qualification"] = String(qualification).slice(0, 160);
    if (specialization !== undefined) updates["doctorProfile.specialization"] = (Array.isArray(specialization) ? specialization : String(specialization).split(",")).map((s) => String(s).trim()).filter(Boolean);
    if (experience !== undefined) updates["doctorProfile.experience"] = Math.max(0, Number(experience) || 0);
    if (availableDays !== undefined) updates["doctorProfile.availableDays"] = availableDays;
    if (timeSlots !== undefined) updates["doctorProfile.timeSlots"] = timeSlots;
    if (isAcceptingConsultations !== undefined) updates["doctorProfile.isAcceptingConsultations"] = Boolean(isAcceptingConsultations);
    const user = await User.findOneAndUpdate({ _id: req.user.id, role: "doctor" }, { $set: updates }, { new: true, runValidators: true }).select("name email role doctorProfile");
    if (!user) return res.status(404).json({ success: false, message: "Doctor profile not found." });
    return res.json({ success: true, data: { user } });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Unable to update doctor availability." });
  }
};
