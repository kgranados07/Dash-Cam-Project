import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EvidenceScreen({ route, navigation }) {
  const { ticket } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Placeholder for the actual video/image player.
          Once Kevin's backend serves clip URLs, swap this View
          for a real <Video> component (e.g. expo-av). */}
      <View style={styles.mediaPlaceholder}>
        <Ionicons name="image-outline" size={48} color="#555" />
      </View>

      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>{ticket.type}</Text>
        <Text style={styles.overlayMeta}>
          {ticket.time} · {ticket.zone}
        </Text>
        <View style={styles.overlayActions}>
          <TouchableOpacity style={styles.overlayButton}>
            <Text style={styles.overlayButtonText}>▶ Play clip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.overlayButton}>
            <Text style={styles.overlayButtonText}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a18" },
  closeButton: { padding: 16 },
  mediaPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  overlayTitle: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 4 },
  overlayMeta: { color: "#ccc", fontSize: 12, marginBottom: 12 },
  overlayActions: { flexDirection: "row", gap: 10 },
  overlayButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  overlayButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
