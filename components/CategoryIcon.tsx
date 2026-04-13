import React from "react";

interface CategoryIconProps {
  categoryName: string;
  className?: string;
}

export function CategoryIcon({ categoryName, className = "w-4 h-4" }: CategoryIconProps) {
  let iconName = "";

  switch (categoryName.toLowerCase()) {
    case "development":
      iconName = "Development.svg";
      break;
    case "design":
      iconName = "Design.svg";
      break;
    case "business":
      iconName = "Business.svg";
      break;
    case "marketing":
      iconName = "Marketing.svg";
      break;
    case "data science":
      iconName = "DataScience.svg";
      break;
    default:
      return null;
  }

  return (
    <span
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: `url(/icons/${iconName})`,
        WebkitMaskImage: `url(/icons/${iconName})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}
