import { useWindowDimensions } from "react-native";

import { breakpoints } from "@/styles/theme";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= breakpoints.tablet;
  const isLargeTablet = width >= breakpoints.largeTablet;
  const isLandscape = width > height;

  return { width, height, isTablet, isLargeTablet, isLandscape };
}

// Quantidade de colunas da grade de cards conforme a largura disponível.
export function useGridColumns(minItemWidth = 160) {
  const { width, isTablet } = useResponsive();
  const contentWidth = isTablet ? width - 260 : width;
  return Math.max(2, Math.min(5, Math.floor(contentWidth / minItemWidth)));
}
