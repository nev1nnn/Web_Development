import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import "./App.css";
import { supabase } from "./supabase";

const selectedMatch = matches.find((match) => match.id === form.matchId);
const pricePerTicket = selectedMatch
  ? Number(selectedMatch[`${form.stand.toLowerCase()}_price`] ?? 0)
  : 0;
const total = pricePerTicket * Number(form.tickets);


const initialForm = {
  name: "",
  email: "",
  phone: "",
  matchId: "",
  stand: "General",
  tickets: 1,
};

function App() {
  const [matches, setMatches] = useState([]);
  const [matchesError, setMatchesError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMatches() {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date");

      if (!active) return;

      if (error) {
        setMatchesError(error.message);
        return;
      }

      setMatchesError("");
      setMatches(data ?? []);
    }

    loadMatches();

    const channel = supabase
      .channel("matches-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        loadMatches
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const pricePerTicket = form.matchId
    ? prices[form.matchId][form.stand]
    : 0;

  const total = pricePerTicket * Number(form.tickets);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const { data, error } = await supabase.rpc("book_match", {
      p_match_id: form.matchId,
      p_full_name: form.name,
      p_email: form.email,
      p_phone: form.phone,
      p_stand: form.stand.toLowerCase(),
      p_ticket_count: Number(form.tickets),
    });

    if (error) {
      console.error("Booking failed:", error);
      showToast(`Booking failed: ${error.message}`);
      return;
    }

    console.log("Booking result:", data);
    showToast("Booking saved successfully.");
  }


  function handleReset() {
    setForm(initialForm);
    setToast("");
  }

  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <section className="matches-section" id="matches">
          <h2>Upcoming Matches</h2>
          <div className="match-grid">
            {matches.map((match) => (
              <article className="match-card" key={match.id}>
                <p>{match.id}</p>
                <h3>{match.teams}</h3>
                <a className="button" href="#booking">
                  Book tickets
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="booking-section" id="booking">
          <div className="booking-form-card">
            <h2>Book your tickets</h2>

            <form onSubmit={handleSubmit} onReset={handleReset}>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={60}
                placeholder="Your full name"
              />

              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="you@example.com"
              />

              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                minLength={7}
                maxLength={15}
                placeholder="Phone number"
              />

              <label htmlFor="matchId">Select a match</label>
              <select
                id="matchId"
                name="matchId"
                value={form.matchId}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Choose a match
                </option>
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.id} — {match.teams}
                  </option>
                ))}
              </select>

              <label htmlFor="stand">Stand category</label>
              <select
                id="stand"
                name="stand"
                value={form.stand}
                onChange={handleChange}
              >
                <option value="General">General</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>

              <label htmlFor="tickets">Number of tickets (1–10)</label>
              <input
                id="tickets"
                name="tickets"
                type="number"
                value={form.tickets}
                onChange={handleChange}
                required
                min="1"
                max="10"
              />

              <div className="form-buttons">
                <button className="button" type="submit">
                  Submit booking
                </button>
                <button className="reset-button" type="reset">
                  Reset
                </button>
              </div>
            </form>
          </div>

          <aside className="summary-card" aria-live="polite">
            <h2>Booking Summary</h2>
            <p>
              Match:{" "}
              {form.matchId
                ? matches.find((match) => match.id === form.matchId)?.teams
                : "Not selected"}
            </p>
            <p>Stand: {form.matchId ? form.stand : "Not selected"}</p>
            <p>Tickets: {form.tickets}</p>
            <p>Price per ticket: Rs. {pricePerTicket.toLocaleString("en-IN")}</p>
            <strong>Total: Rs. {total.toLocaleString("en-IN")}</strong>
          </aside>
        </section>
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}

export default App;
