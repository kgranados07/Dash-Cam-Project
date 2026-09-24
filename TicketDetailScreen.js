import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Same icon/status maps used in TicketListScreen, kept consistent (Option B style).
const TICKET_STYLE = {
  "Stop Sign Violation": { icon: "stop-circle-outline", color: "#D85A30" },
  "Speeding (School Zone)": { icon: "speedometer-outline", color: "#BA7517" },
  "Parking Violation": { icon: "car-outline", color: "#185FA5" },
};

const STATUS_STYLE = {
  Unpaid: { bg: "#FAEEDA", text: "#854F0B" },
  Paid: { bg: "#EAF3DE", text: "#3B6D11" },
  Contested: { bg: "#FCEBEB", text: "#A32D2D" },
};

export default function TicketDetailScreen({ route, navigation }) {
  const { ticket } = route.params;
  const ticketStyle = TICKET_STYLE[ticket.type] || {
    icon: "alert-circle-outline",
    color: "#5F5E5A",
  };
  const statusStyle = STATUS_STYLE[ticket.status] || {
    bg: "#F1EFE8",
    text: "#444441",
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color="#666" />
        <Text style={styles.backText}>Back to tickets</Text>
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <Ionicons name={ticketStyle.icon} size={26} color={ticketStyle.color} />
        <Text style={styles.title}>{ticket.type}</Text>
      </View>

      <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusText, { color: statusStyle.text }]}>
          {ticket.status}
        </Text>
      </View>

      {/* Evidence thumbnail — tap to open full evidence view */}
      <TouchableOpacity
        style={styles.evidenceThumb}
        onPress={() => navigation.navigate("Evidence", { ticket })}
      >
        <Ionicons name="videocam-outline" size={28} color="#999" />
        <Text style={styles.evidenceHint}>Tap to view evidence</Text>
      </TouchableOpacity>

      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{ticket.time}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>{ticket.zone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rule</Text>
          <Text style={styles.infoValue}>{ticket.rule}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contestButton}>
          <Text style={styles.contestButtonText}>Contest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  backRow: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 18 },
  backText: { fontSize: 13, color: "#666", marginLeft: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "700", marginLeft: 10 },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 18,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  evidenceThumb: {
    height: 140,
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  evidenceHint: { fontSize: 12, color: "#999", marginTop: 6 },
  infoBlock: { marginBottom: 24 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  infoLabel: { fontSize: 12, color: "#999" },
  infoValue: { fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: "auto", marginBottom: 24 },
  payButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  payButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  contestButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  contestButtonText: { color: "#555", fontWeight: "700", fontSize: 13 },
});
