const API_BASE_URL = "http://localhost:5000/api";

// --------------------------------------------------
// Authentication helpers
// --------------------------------------------------

function getToken() {
  return localStorage.getItem("smartPawToken");
}

function clearExpiredAuthentication() {
  localStorage.removeItem("smartPawToken");
  localStorage.removeItem("smartPawUser");

  window.dispatchEvent(
    new CustomEvent("smartPawAuthExpired"),
  );
}

function getAuthHeaders() {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// --------------------------------------------------
// Generic response handler
// --------------------------------------------------

async function parseResponse(response) {
  let result = null;

  try {
    result = await response.json();
  } catch {
    // Keep null for non-JSON responses.
  }

  // Token expired / unauthorized
  if (response.status === 401) {
    const message =
      result?.message ||
      "Authentication required.";

    if (
      message.toLowerCase().includes("token") ||
      message.toLowerCase().includes("expired") ||
      message.toLowerCase().includes("authentication") ||
      message.toLowerCase().includes("unauthorized")
    ) {
      clearExpiredAuthentication();
    }

    throw new Error(message);
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Something went wrong. Please try again.",
    );
  }

  return result;
}

// --------------------------------------------------
// Pets
// --------------------------------------------------

export async function getPets() {
  const response = await fetch(
    `${API_BASE_URL}/pets`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  const result = await parseResponse(response);

  return result?.data || [];
}

export async function getPetById(id) {
  if (!id) {
    throw new Error("Pet ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/pets/${id}`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  const result = await parseResponse(response);

  return result?.data;
}

export async function createPet(petData) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Please login before creating a pet.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/pets`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(petData),
    },
  );

  const result = await parseResponse(response);

  return result?.data;
}

export async function updatePet(
  id,
  petData,
) {
  if (!id) {
    throw new Error("Pet ID is required.");
  }

  const token = getToken();

  if (!token) {
    throw new Error(
      "Please login before updating a pet.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/pets/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(petData),
    },
  );

  const result = await parseResponse(response);

  return result?.data;
}

export async function deletePet(id) {
  if (!id) {
    throw new Error("Pet ID is required.");
  }

  const token = getToken();

  if (!token) {
    throw new Error(
      "Please login before deleting a pet.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/pets/${id}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  const result = await parseResponse(response);

  return result;
}

export async function getCommunityPostsForPet(petId) {
  if (!petId) {
    throw new Error("Pet ID is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/community/pets/${encodeURIComponent(petId)}/posts`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  const result = await parseResponse(response);
  return Array.isArray(result?.posts) ? result.posts : [];
}

export function getCommunityMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, API_BASE_URL).toString();
}

// --------------------------------------------------
// Health Records
// --------------------------------------------------

export async function getHealthRecords(
  petId,
) {
  if (!petId) {
    throw new Error(
      "Pet ID is required.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/health-records?petId=${petId}`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  const result = await parseResponse(response);

  return result?.data || [];
}

export async function createHealthRecord(
  recordData,
) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Please login before creating a health record.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/health-records`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(recordData),
    },
  );

  const result = await parseResponse(response);

  return result?.data;
}

export async function updateHealthRecord(
  id,
  recordData,
) {
  if (!id) {
    throw new Error(
      "Health record ID is required.",
    );
  }

  const token = getToken();

  if (!token) {
    throw new Error(
      "Please login before updating a health record.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/health-records/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(recordData),
    },
  );

  const result = await parseResponse(response);

  return result?.data;
}

export async function deleteHealthRecord(
  id,
) {
  if (!id) {
    throw new Error(
      "Health record ID is required.",
    );
  }

  const token = getToken();

  if (!token) {
    throw new Error(
      "Please login before deleting a health record.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/health-records/${id}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  const result = await parseResponse(response);

  return result;
}

// --------------------------------------------------
// Tasks
// --------------------------------------------------

export async function getTasks(petId) {
  if (!petId) {
    throw new Error(
      "Pet ID is required.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tasks?petId=${petId}`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  const result = await parseResponse(response);

  return result?.data || [];
}

export async function createTask(
  taskData,
) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Please login before creating a task.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(taskData),
    },
  );

  const result = await parseResponse(response);

  return result?.data;
}

export async function updateTask(
  id,
  taskData,
) {
  if (!id) {
    throw new Error(
      "Task ID is required.",
    );
  }

  const token = getToken();

  if (!token) {
    throw new Error(
      "Please login before updating a task.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tasks/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(taskData),
    },
  );

  const result = await parseResponse(response);

  return result?.data;
}

export async function deleteTask(id) {
  if (!id) {
    throw new Error(
      "Task ID is required.",
    );
  }

  const token = getToken();

  if (!token) {
    throw new Error(
      "Please login before deleting a task.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tasks/${id}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  const result = await parseResponse(response);

  return result;
}

export async function getConsultations() {
  const response = await fetch(`${API_BASE_URL}/consultations`, { headers: getAuthHeaders() });
  return parseResponse(response);
}

export async function createConsultationAssessment(assessmentData) {
  const response = await fetch(`${API_BASE_URL}/consultations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(assessmentData),
  });
  return parseResponse(response);
}

export async function requestConsultation(id, bookingData) {
  const response = await fetch(`${API_BASE_URL}/consultations/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(bookingData),
  });
  return parseResponse(response);
}

async function consultationRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { ...getAuthHeaders(), ...(options.headers || {}) } });
  return parseResponse(response);
}

export const getDoctorConsultations = () => consultationRequest("/doctor/consultations");
export const updateDoctorConsultationStatus = (id, status) => consultationRequest(`/doctor/consultations/${encodeURIComponent(id)}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
export const updateDoctorConsultationNotes = (id, notes) => consultationRequest(`/doctor/consultations/${encodeURIComponent(id)}/notes`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notes) });
export const getConsultationMessages = (id) => consultationRequest(`/consultations/${encodeURIComponent(id)}/messages`);
export const sendConsultationMessage = (id, message) => consultationRequest(`/consultations/${encodeURIComponent(id)}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
export const updateDoctorPresence = (isOnline) => consultationRequest("/doctor/presence", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isOnline }) });
export const updateDoctorProfile = (profile) => consultationRequest("/auth/doctors/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
export async function registerDoctorAccount(profile) {
  const response = await fetch(`${API_BASE_URL}/auth/doctors/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
  return parseResponse(response);
}
export const getNotifications = () => consultationRequest("/notifications");
export const markNotificationRead = (id) => consultationRequest(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
export const cancelConsultation = (id) => consultationRequest(`/consultations/${encodeURIComponent(id)}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CANCELLED" }) });
export const rescheduleConsultation = (id, booking) => consultationRequest(`/consultations/${encodeURIComponent(id)}/reschedule`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(booking) });
