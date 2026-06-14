import { API_URL } from "./apiBase";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

// GET - All agents
export const getAgents = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users/agents`, {
      headers: authHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch agents");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// GET - All users
export const getUsers = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: authHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch users");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// GET - Single user
export const getUser = async (token, id) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: authHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user");
    }

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
