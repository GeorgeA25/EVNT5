import { auth } from "../firebase/firebaseConfig";

export const handleAddToGoogleCalendar = async (eventData) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error(
      "Cant add event to google calendar until you are logged in"
    );
    return;
  }
  console.log(currentUser);

  const idToken = await currentUser.getIdToken();

  const outcome = await fetch(
    "https://addeventtogooglecalendar-o53weyim5q-nw.a.run.app",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(eventData),
    }
  );

  const result = await outcome.json();

  if (outcome.status === 403 && result.error?.includes("authorization")) {
    return { needsRedirect: true, eventData };
  }

  if (!outcome.ok || !result.success) {
    throw new Error(result.error || "failed to add event to google calendar");
  }
  return result.data;
};
