import * as LucideIcons from "lucide-react";

const icons = {
  circlePlus: LucideIcons.CirclePlus,
  swords: LucideIcons.Swords,
  dices: LucideIcons.Dices,
  search: LucideIcons.Search
}

export function Icon({ name, size = 20, className }) {
  const IconComponent = icons[name]
  return <IconComponent size={size} className={className} />
}
