export const combineDateAndTime = (date, time) => {
  if (!date || !time) {
    throw new Error("Date or time is missing");
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Invalid time format");
  }

  const combineDateAndTime = `${date}T${time}:00Z`;
  const dateTime = new Date(combineDateAndTime);

  if (isNaN(dateTime)) {
    throw new Error("Invalid date-time format");
  }
  return dateTime.toISOString();
};
