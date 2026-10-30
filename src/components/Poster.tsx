import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { colors } from "@/styles/theme";
import { isSafeImageUrl } from "@/utils/format";

interface PosterProps {
  uri: string | null | undefined;
  title: string;
  style?: ViewStyle;
}

// Pôster do filme com fallback quando a URL é vazia, inválida ou falha ao carregar.
export function Poster({ uri, title, style }: PosterProps) {
  const [failed, setFailed] = useState(false);
  const showImage = isSafeImageUrl(uri) && !failed;

  return (
    <View style={[styles.container, style]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`Pôster de ${title}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <Ionicons name="film-outline" size={40} color={colors.placeholderBlue} accessibilityLabel="Sem pôster" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 2 / 3,
    width: "100%",
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
