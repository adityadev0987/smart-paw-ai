const API_BASE_URL = "http://localhost:5000/api";

export async function getPets() {
  const response = await fetch(`${API_BASE_URL}/pets`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch pets.");
  }

  return result.data;
}

export async function getPetById(id) {
  const response = await fetch(`${API_BASE_URL}/pets/${id}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch pet.");
  }

  return result.data;
}

export async function updatePet(id, petData) {
  const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(petData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update pet.");
  }

  return result.data;
}

export async function createPet(petData) {
  const response = await fetch(`${API_BASE_URL}/pets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(petData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create pet.");
  }

  return result.data;
}

export async function deletePet(id) {
  const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete pet.");
  }

  return result;
}

export async function getHealthRecords(petId) {
  const response = await fetch(
    `${API_BASE_URL}/health-records?petId=${petId}`,
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch health records.",
    );
  }

  return result.data;
}

export async function createHealthRecord(recordData) {
  const response = await fetch(
    `${API_BASE_URL}/health-records`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recordData),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to create health record.",
    );
  }

  return result.data;
}

export async function updateHealthRecord(id, recordData) {
  const response = await fetch(
    `${API_BASE_URL}/health-records/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recordData),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to update health record.",
    );
  }

  return result.data;
}

export async function deleteHealthRecord(id) {
  const response = await fetch(
    `${API_BASE_URL}/health-records/${id}`,
    {
      method: "DELETE",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to delete health record.",
    );
  }

  return result;
}
export async function getTasks(petId) {
  const response = await fetch(
    `${API_BASE_URL}/tasks?petId=${petId}`,
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch tasks.",
    );
  }

  return result.data;
}

export async function createTask(taskData) {
  const response = await fetch(
    `${API_BASE_URL}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to create task.",
    );
  }

  return result.data;
}

export async function updateTask(id, taskData) {
  const response = await fetch(
    `${API_BASE_URL}/tasks/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to update task.",
    );
  }

  return result.data;
}

export async function deleteTask(id) {
  const response = await fetch(
    `${API_BASE_URL}/tasks/${id}`,
    {
      method: "DELETE",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to delete task.",
    );
  }

  return result;
}