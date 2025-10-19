import EventForm from "../components/CreateEventForm";
import Footer from "../components/Footer";
import "../css/CreateForm.css";

const CreateEventPage = () => {
  return (
    <section>
      <h1 className="create-event-title">Create New Event</h1>
      <EventForm />
      <Footer />
    </section>
  );
};

export default CreateEventPage;
