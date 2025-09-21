import type { QAndA, QuestionWithOptions, Roadmap } from "../types";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://careerkraft.up.railway.app"
    : "http://localhost:3001";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "An unknown error occurred" }));
    console.error("Server error response:", {
      status: response.status,
      statusText: response.statusText,
      errorData,
    });
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  const data = await response.json();
  console.log("Raw server response:", data);
  return data as T;
}

export const generateQuestion = async (
  history: QAndA[]
): Promise<QuestionWithOptions> => {
  const response = await fetch(`${API_BASE_URL}/api/generate-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ history }),
  });

  const data = await handleResponse<QuestionWithOptions>(response);

  // Normalize the response structure
  const normalizedData = {
    question: data?.question?.trim() ?? "",
    options: Array.isArray(data?.options)
      ? data.options.map((opt) => String(opt).trim())
      : [],
  };

  // Validate the normalized data
  if (!normalizedData.question) {
    throw new Error("Server response missing valid question");
  }

  if (
    !Array.isArray(normalizedData.options) ||
    normalizedData.options.length < 4 ||
    normalizedData.options.length > 6
  ) {
    throw new Error("Server response must include 4-6 options");
  }

  if (normalizedData.options.some((opt) => !opt)) {
    throw new Error("All options must be non-empty strings");
  }

  return normalizedData;
};

export const generateRoadmaps = async (
  history: QAndA[]
): Promise<Roadmap[]> => {
  if (history.length !== 4) {
    throw new Error(
      "Exactly 4 questions must be answered before generating roadmaps"
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/generate-roadmaps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ history }),
  });

  const data = await handleResponse<{ roadmaps: Roadmap[] }>(response);

  // Validate the response structure
  if (!data || !Array.isArray(data.roadmaps) || data.roadmaps.length === 0) {
    throw new Error("Invalid roadmaps format received from server");
  }

  // Normalize and validate each roadmap
  const validatedRoadmaps = data.roadmaps.map((roadmap) => {
    if (
      !roadmap.title ||
      !roadmap.description ||
      !Array.isArray(roadmap.nodes) ||
      !Array.isArray(roadmap.edges)
    ) {
      throw new Error("Invalid roadmap structure");
    }
    return roadmap;
  });

  return validatedRoadmaps;
};
