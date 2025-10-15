import emailjs from "@emailjs/browser";

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const sendConfirmationEmail = async ({
  toEmail,
  name,
  title,
  date,
  location,
  startTime,
  endTime,
  time,
}) => {
  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: toEmail,
        name,
        title,
        date,
        location,
        startTime,
        endTime,
        time,
      },
      publicKey
    );
    console.log("email sent successfully");
  } catch (error) {
    console.error("error sending confirmation email", error);
  }
};

export default sendConfirmationEmail;
