import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

import { colors, fonts, fontSizes, radii, spacing } from "@/styles/theme";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  secure?: boolean;
}

// "Caixa de preenchimento" do Zeus: borda escura, cantos de 16 e label acima.
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, secure = false, multiline, style, ...inputProps },
  ref
) {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.box,
          multiline && styles.boxMultiline,
          focused && styles.boxFocused,
          !!error && styles.boxError,
        ]}
      >
        <TextInput
          {...inputProps}
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={hidden}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
        {secure && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
            hitSlop={12}
            onPress={() => setHidden((value) => !value)}
          >
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={22} color={colors.iconDark} />
          </Pressable>
        )}
      </View>
      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.paragraph,
    color: colors.text,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    backgroundColor: "transparent",
    gap: spacing.sm,
  },
  boxMultiline: { alignItems: "flex-start", paddingVertical: spacing.sm },
  boxFocused: { borderColor: colors.secondary },
  boxError: { borderColor: colors.danger },
  input: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.subtitle,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  inputMultiline: { minHeight: 110 },
  error: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.label,
    color: colors.danger,
  },
});
