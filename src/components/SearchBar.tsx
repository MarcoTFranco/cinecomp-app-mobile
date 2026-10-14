import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { colors, fonts, fontSizes, radii, spacing } from "@/styles/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

// Campo de busca em pílula do topo do Zeus ("Buscar na página").
export function SearchBar({ value, onChangeText, placeholder = "Buscar" }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={colors.placeholderBlue} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholderBlue}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        maxLength={80}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" hitSlop={10} onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={20} color={colors.placeholderBlue} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.subtitle,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
});
