const DetailsFooter = ({ country }) => (
  <section className="border-t border-white/5 bg-[#020b1c]">
    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-center text-xs uppercase tracking-[0.3em] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:text-left sm:text-[0.7rem]">
      <p>Mission Desk — Premium visa partners</p>
      <p>
        {country.country} desk • {country.serviceWindow}
      </p>
    </div>
  </section>
);

export default DetailsFooter;


