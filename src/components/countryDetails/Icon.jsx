const Icon = ({ name, className = "h-5 w-5 text-emerald-300" }) => {
  const commonProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "capital":
      return (
        <svg {...commonProps}>
          <path d="M5 21h14M6 21V9l6-4 6 4v12" />
          <path d="M10 13h4" />
        </svg>
      );
    case "currency":
      return (
        <svg {...commonProps}>
          <path d="M12 3v18" />
          <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "language":
      return (
        <svg {...commonProps}>
          <path d="M5 8h14M5 12h14M5 16h6" />
          <path d="M14 16l2 4 2-4" />
        </svg>
      );
    case "travel":
      return (
        <svg {...commonProps}>
          <path d="m2 12 20-5-5 20-4-9-9-4z" />
          <path d="m6 18 3-3" />
        </svg>
      );
    case "season":
      return (
        <svg {...commonProps}>
          <path d="m12 2 1.88 5.78L20 8l-4.88 3.78L16.76 18 12 14.84 7.24 18l1.64-6.22L4 8l6.12-.22z" />
        </svg>
      );
    case "document":
      return (
        <svg {...commonProps}>
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
          <path d="M15 2v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
        </svg>
      );
    case "time":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      );
    case "faq":
      return (
        <svg {...commonProps}>
          <path d="M12 18h.01" />
          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 9 7 9s7-4 7-9a7 7 0 0 0-7-7z" />
          <path d="m9.09 9a3 3 0 0 1 5.83 1c0 1.5-1 2-2 2" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};

export default Icon;


