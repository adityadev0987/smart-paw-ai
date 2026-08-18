import Pet from "../models/Pet.js";
import HealthRecord from "../models/HealthRecord.js";

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
    name: pet.name,
    breed: pet.breed,
    age: pet.age,
    gender: pet.gender,
  };
}

export async function getHealthRecords(petId) {
  if (!petId) {
    throw new Error("Pet ID is required.");
  }

  const records = await HealthRecord.find({
    petId,
  })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  return records.map((record) => ({
    id: record._id.toString(),
    title: record.title,
    date: record.date,
    type: record.type,
    notes: record.notes || "",
  }));
}