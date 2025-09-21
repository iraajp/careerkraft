import React, { useState, useCallback, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppState, QAndA, Roadmap, User } from "./types";
import Welcome from "./components/Welcome";
import Questionnaire from "./components/Questionnaire";
import RoadmapDisplay from "./components/RoadmapDisplay";
import MentorCall from "./components/MentorCall";
import { generateRoadmaps } from "./services/geminiService";
import Spinner from "./components/Spinner";
import LoadingRoadmap from "./components/LoadingRoadmap";
import { BotMessageSquareIcon, LogOutIcon } from "./components/icons";
import PhoneNumberInput from "./components/PhoneNumberInput";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://careerkraft.up.railway.app"
    : "http://localhost:3001";

const App: React.FC = () => {
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<QAndA[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } catch (err) {
        setAppState(AppState.LOGIN);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkSession();
  }, []);

  const handleStart = () => setAppState(AppState.QUESTIONNAIRE);

  const handleQuestionnaireComplete = useCallback(
    async (history: QAndA[]) => {
      setConversationHistory(history);
      setError(null);
      // Navigate to generating state first
      navigate("/generating-roadmaps");
      try {
        const generatedRoadmaps = await generateRoadmaps(history);
        if (generatedRoadmaps && generatedRoadmaps.length > 0) {
          setRoadmaps(generatedRoadmaps);
          navigate("/roadmaps");
        } else {
          setError(
            "Sorry, I couldn't generate any roadmaps. Please try again."
          );
          navigate("/questionnaire");
        }
      } catch (e) {
        console.error(e);
        const errorMessage =
          e instanceof Error ? e.message : "An error occurred.";
        setError(`Error generating roadmaps: ${errorMessage}`);
        navigate("/dashboard");
      }
    },
    [navigate]
  );

  const handleRoadmapSelect = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    navigate("/call-setup");
  };

  const handleCallSubmit = async (phoneNumber: string) => {
    if (!selectedRoadmap) {
      setError("Something went wrong. Please select a roadmap again.");
      setAppState(AppState.VIEWING_ROADMAPS);
      return false;
    }
    setError(null);

    try {
      // Format the phone number to remove any non-digit characters except '+'
      const formattedPhone = phoneNumber.startsWith("+")
        ? "+" + phoneNumber.slice(1).replace(/\D/g, "")
        : phoneNumber.replace(/\D/g, "");

      // Add '+1' prefix if not present and it's a 10-digit US number
      const finalPhone = formattedPhone.startsWith("+")
        ? formattedPhone
        : formattedPhone.length === 10
        ? "+1" + formattedPhone
        : "+" + formattedPhone;

      // Ensure we have a publicly accessible webhook URL for Twilio
      // For development, use ngrok URL
      // For production, use your actual domain
      const webhookBaseUrl =
        process.env.NODE_ENV === "production"
          ? "https://careerkraft.up.railway.app" // Replace with your production URL
          : "https://b8bdaf53bb41.ngrok-free.app";

      const response = await fetch(`${API_BASE_URL}/api/start-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: finalPhone,
          careerPath: selectedRoadmap.title,
          webhookUrl: `${webhookBaseUrl}/api/twilio/voice`,
          roadmapDetails: {
            title: selectedRoadmap.title,
            description: selectedRoadmap.description,
            nodes: selectedRoadmap.nodes.map((node) => node.data.label),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Call initiation error:", errorData);

        // More descriptive error messages based on the error
        if (errorData.error?.includes("Url is not a valid URL")) {
          throw new Error(
            "Server configuration error: Invalid webhook URL. Please contact support."
          );
        } else if (errorData.error?.includes("webhook")) {
          throw new Error(
            "Unable to configure call webhook. Please try again later."
          );
        } else {
          throw new Error(errorData.message || "Failed to initiate call.");
        }
      }

      const data = await response.json();
      console.log("Call initiation response:", data);

      navigate("/mentor-call");
      return true;
    } catch (err) {
      console.error("Call initiation error:", err);
      const message =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to start call: ${message}`);
      return false;
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    setCurrentUser(null);
    handleRestart();
    navigate("/login");
  };

  const handleRestart = () => {
    setConversationHistory([]);
    setRoadmaps([]);
    setSelectedRoadmap(null);
    setError(null);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans relative">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider">CareerKraft.com</h1>
        </div>
        {currentUser && (
          <div className="flex items-center gap-4">
            <span className="text-gray-300 hidden sm:inline">
              {currentUser.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              <LogOutIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </header>

      {error && (
        <div
          className="absolute top-24 bg-red-800 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in"
          onClick={() => setError(null)}
        >
          <p>{error}</p>
        </div>
      )}
      <main className="w-full max-w-5xl mx-auto flex-grow flex items-center justify-center pt-16 sm:pt-0">
        <Routes>
          <Route
            path="/login"
            element={
              !currentUser ? (
                <Login
                  onLoginSuccess={(user) => {
                    setCurrentUser(user);
                  }}
                  onSwitchToSignup={() => navigate("/signup")}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !currentUser ? (
                <Signup
                  onSignupSuccess={(user) => {
                    setCurrentUser(user);
                  }}
                  onSwitchToLogin={() => navigate("/login")}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/questionnaire"
              element={
                <Questionnaire onComplete={handleQuestionnaireComplete} />
              }
            />
            <Route path="/generating-roadmaps" element={<LoadingRoadmap />} />
            <Route
              path="/roadmaps"
              element={
                <RoadmapDisplay
                  roadmaps={roadmaps}
                  onSelect={handleRoadmapSelect}
                />
              }
            />
            <Route
              path="/call-setup"
              element={
                selectedRoadmap ? (
                  <PhoneNumberInput
                    roadmap={selectedRoadmap}
                    onCallSubmit={handleCallSubmit}
                    onBack={() => navigate("/roadmaps")}
                  />
                ) : (
                  <Navigate to="/roadmaps" replace />
                )
              }
            />
            <Route
              path="/mentor-call"
              element={
                selectedRoadmap ? (
                  <MentorCall
                    roadmap={selectedRoadmap}
                    onEndCall={() => navigate("/dashboard")}
                  />
                ) : (
                  <Navigate to="/roadmaps" replace />
                )
              }
            />
          </Route>

          <Route
            path="/"
            element={
              <Navigate to={currentUser ? "/dashboard" : "/login"} replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
