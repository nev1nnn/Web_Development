function Navbar() {
  return (
    <header className="navbar">
      <a className="logo" href="#home">IPL 2026 Tickets</a>

      <nav aria-label="Main navigation">
        <a href="#matches">Matches</a>
        <a href="#booking">Book Tickets</a>
      </nav>
    </header>
  );
}

export default Navbar;
