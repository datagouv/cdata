// Shared colour palette for the coloured hero banner (HeroBanner) and the
// HeroBloc colour picker. Keeping it here avoids repeating the same mapping in
// every hero consumer. `purple` and `brown` are two names for the same
// illustration colour, kept for backward compatibility with existing data.
export function heroBgColor(color: 'primary' | 'green' | 'purple' | 'brown' | 'dark'): string {
  return {
    primary: 'bg-new-blue-illustration',
    green: 'bg-new-green-illustration',
    purple: 'bg-new-brown-illustration',
    brown: 'bg-new-brown-illustration',
    dark: 'bg-gray-dark',
  }[color]
}
