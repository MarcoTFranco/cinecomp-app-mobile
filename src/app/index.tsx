import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { api } from "@/services/api";

// Tela temporária: só confirma que o app alcança o back-end.
export default function Index() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => {
        setStatus("ok");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(`${err.message}\nURL: ${api.defaults.baseURL}`);
      });
  }, []);

  return (
    <View style={styles.container}>
      {status === "loading" && <ActivityIndicator size="large" />}
      {status === "ok" && <Text style={styles.ok}>✅ {message}</Text>}
      {status === "error" && <Text style={styles.error}>❌ {message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  ok: { fontSize: 18, color: "#1a7f37", textAlign: "center" },
  error: { fontSize: 16, color: "#cf222e", textAlign: "center" },
});
