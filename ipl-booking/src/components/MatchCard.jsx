function MatchCard({ match }) {
  return (
    <article className="match-card">
      <p className="match-number">{match.id}</p>
      <h2>{match.team1} <span>vs</span> {match.team2}</h2>
      <p>{match.date} · {match.time}</p>
      <p>{match.venue}</p>
      <a className="button" href="#booking">Book tickets</a>
    </article>
  );
}

export default MatchCard;
