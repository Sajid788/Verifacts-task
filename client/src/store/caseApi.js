import { API_URL } from "./apiBase";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

// GET - All cases
export const getCases = async (token) => {
  try {
    const response = await fetch(`${API_URL}/cases`, {
      headers: authHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch cases");
    }

    return data.cases;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// GET - Single case
export const getCase = async (token, id) => {
  try {
    const response = await fetch(`${API_URL}/cases/${id}`, {
      headers: authHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch case");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// POST - Create case
export const createCase = async (token, body) => {
  try {
    const response = await fetch(`${API_URL}/cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create case");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// PATCH - Update case status
export const updateCaseStatus = async (token, id, status, note) => {
  try {
    const response = await fetch(`${API_URL}/cases/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({ status, note }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update status");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// PATCH - Assign case
export const assignCase = async (token, id, assignedTo) => {
  try {
    const response = await fetch(`${API_URL}/cases/${id}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({ assignedTo }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to assign case");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// POST - Add comment
export const addComment = async (token, id, text) => {
  try {
    const response = await fetch(`${API_URL}/cases/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add comment");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// POST - Upload document
export const uploadDocument = async (token, id, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/cases/${id}/documents`, {
      method: "POST",
      headers: authHeaders(token),
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload document");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
