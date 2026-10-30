// Tokens extraídos do design "Zeus" no Figma (cores, fontes, raios e sombras).

export const colors = {
  primary: "#001529",
  primaryDark: "#000911",
  secondary: "#13385B",
  secondaryLight: "#E9F0F6",
  background: "#E6E8EA",
  surface: "#FFFFFF",
  searchBackground: "#F5F7FA",
  title: "#343C6A",
  text: "#000000",
  textMuted: "#515151",
  placeholder: "#B0B0B0",
  placeholderBlue: "#8BA3CB",
  border: "#000000",
  borderLight: "#D9DDE2",
  iconDark: "#333333",
  success: "#2E7D32",
  successLight: "#E8F5E9",
  danger: "#C62828",
  dangerLight: "#FDECEA",
  warning: "#ED6C02",
  white: "#FFFFFF",
  overlay: "rgba(0, 9, 17, 0.55)",
} as const;

export const fonts = {
  regular: "OpenSans_400Regular",
  semiBold: "OpenSans_600SemiBold",
  bold: "OpenSans_700Bold",
} as const;

export const fontSizes = {
  label: 12,
  paragraph: 14,
  subtitle: 16,
  title: 20,
  subheading: 22,
  headline: 28,
  display: 40,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
} as const;

// Pontos de quebra para o layout responsivo (celular x tablet).
export const breakpoints = {
  tablet: 768,
  largeTablet: 1024,
} as const;
