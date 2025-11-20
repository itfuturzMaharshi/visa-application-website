import Reveal from "./Reveal";

const destinations = [
  {
    country: "United Arab Emirates",
    visas: "53K+ Visas on Time",
    eta: "21 Nov, 09:27 PM",
    image:
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Thailand",
    visas: "32K+ Visas on Time",
    eta: "20 Nov, 01:01 AM",
    image:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Switzerland",
    visas: "30K+ Visas on Time",
    eta: "18 Dec, 12:00 AM",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Vietnam",
    visas: "27K+ Visas on Time",
    eta: "24 Nov, 05:05 PM",
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Indonesia",
    visas: "16K+ Visas on Time",
    eta: "19 Nov, 07:41 PM",
    image:
      "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Iceland",
    visas: "17K+ Visas on Time",
    eta: "28 Nov, 03:12 PM",
    image:
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "United States",
    visas: "25K+ Visas on Time",
    eta: "02 Dec, 11:30 AM",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Hong Kong",
    visas: "19K+ Visas on Time",
    eta: "05 Dec, 05:50 PM",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Brazil",
    visas: "22K+ Visas on Time",
    eta: "14 Dec, 11:45 AM",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Italy",
    visas: "41K+ Visas on Time",
    eta: "08 Dec, 03:30 PM",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Spain",
    visas: "37K+ Visas on Time",
    eta: "11 Dec, 07:15 PM",
    image:
      "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "France",
    visas: "45K+ Visas on Time",
    eta: "09 Dec, 09:20 AM",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Germany",
    visas: "38K+ Visas on Time",
    eta: "13 Dec, 01:05 PM",
    image:
      "https://images.unsplash.com/photo-1473959383410-b9c02ffbff2c?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Canada",
    visas: "29K+ Visas on Time",
    eta: "07 Dec, 10:10 AM",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Australia",
    visas: "33K+ Visas on Time",
    eta: "18 Dec, 08:40 AM",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "New Zealand",
    visas: "18K+ Visas on Time",
    eta: "21 Dec, 06:25 PM",
    image:
      "https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Japan",
    visas: "40K+ Visas on Time",
    eta: "06 Dec, 04:55 PM",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "South Korea",
    visas: "24K+ Visas on Time",
    eta: "15 Dec, 02:45 PM",
    image:
      "https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Portugal",
    visas: "21K+ Visas on Time",
    eta: "12 Dec, 08:15 AM",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Greece",
    visas: "27K+ Visas on Time",
    eta: "16 Dec, 10:30 AM",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "South Africa",
    visas: "19K+ Visas on Time",
    eta: "22 Dec, 05:10 PM",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Egypt",
    visas: "26K+ Visas on Time",
    eta: "17 Dec, 11:55 AM",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Turkey",
    visas: "31K+ Visas on Time",
    eta: "10 Dec, 04:10 PM",
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Malaysia",
    visas: "23K+ Visas on Time",
    eta: "19 Dec, 07:05 PM",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Philippines",
    visas: "18K+ Visas on Time",
    eta: "20 Dec, 09:45 AM",
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Mexico",
    visas: "28K+ Visas on Time",
    eta: "09 Dec, 06:00 PM",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Argentina",
    visas: "17K+ Visas on Time",
    eta: "25 Dec, 03:35 PM",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  },
  {
    country: "Morocco",
    visas: "20K+ Visas on Time",
    eta: "18 Dec, 05:25 PM",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  },
];

const focusTags = [
  "Priority Interview",
  "Executive Trips",
  "Family Travel",
  "Digital Nomads",
  "Residency Programs",
];

const insights = [
  { label: "Avg visa approvals / day", value: "740+" },
  { label: "Active country desks", value: "36" },
  { label: "Fastest record this week", value: "11h" },
];

const Destinations = () => (
  <section
    id="destinations"
    className="relative overflow-hidden bg-linear-to-b from-[#030b1a] via-[#05132b] to-[#071a3d]  text-white"
  >
    <div className="relative mx-auto  p-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {destinations.map((destination, index) => (
          <Reveal key={destination.country} delay={index * 60}>
            <article className="group relative flex h-80 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-slate-950/40 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10">
              <img
                src={destination.image}
                alt={destination.country}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-b from-slate-950/10 via-slate-950/40 to-slate-950/90" />
              <div className="relative z-10 flex flex-1 flex-col justify-between p-6">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/70">
                  <span>Mission Desk</span>
                  <span>{destination.eta}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    {destination.country}
                  </h3>
                  <p className="mt-2 text-sm text-blue-100/80">
                    {destination.visas}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-blue-100/60">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Concierge ready
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                      Track
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Destinations;
