import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchTickets } from "../config/api";

const FILTERS = ["All", "Unpaid", "Paid", "Contested"];

// Maps a ticket type to an icon + accent color for its icon badge.
const TICKET_STYLE = {
  "Stop Sign Violation": { icon: "stop-circle-outline", color: "#D85A30" }, // coral
  "Speeding (School Zone)": { icon: "speedometer-outline", color: "#BA7517" }, // amber
  "Parking Violation": { icon: "car-outline", color: "#185FA5" }, // blue
};

// Maps a ticket status to pill colors.
const STATUS_STYLE = {
  Unpaid: { bg: "#FAEEDA", text: "#854F0B" },
  Paid: { bg: "#EAF3DE", text: "#3B6D11" },
  Contested: { bg: "#FCEBEB", text: "#A32D2D" },
};

export default function TicketListScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchTickets().then(setTickets);
  }, []);

  const filteredTickets =
    activeFilter === "All"
      ? tickets
      : tickets.filter((t) => t.status === activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Detected tickets</Text>

      {/* Filter tabs */}
      <View style={styles.tabRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.tab, activeFilter === filter && styles.tabActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.tabText,
                activeFilter === filter && styles.tabTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ticket list */}
      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const ticketStyle = TICKET_STYLE[item.type] || {
            icon: "alert-circle-outline",
            color: "#5F5E5A",
          };
          const statusStyle = STATUS_STYLE[item.status] || {
            bg: "#F1EFE8",
            text: "#444441",
          };

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("TicketDetail", { ticket: item })}
            >
              <Ionicons
                name={ticketStyle.icon}
                size={20}
                color={ticketStyle.color}
                style={styles.icon}
              />
              <View style={styles.cardText}>
                <Text style={styles.ticketType}>{item.type}</Text>
                <Text style={styles.ticketMeta}>
                  {item.time} · {item.zone}
                </Text>
              </View>
              <View
                style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}
              >
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No tickets in this category.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: "700", marginTop: 12, marginBottom: 12 },
  tabRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: { paddingVertical: 8, paddingHorizontal: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#2563eb" },
  tabText: { color: "#888", fontWeight: "500" },
  tabTextActive: { color: "#2563eb" },
  list: { paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  icon: { marginRight: 10 },
  cardText: { flex: 1 },
  ticketType: { fontSize: 13, fontWeight: "600" },
  ticketMeta: { fontSize: 11, color: "#888", marginTop: 2 },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: "700" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
