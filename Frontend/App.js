import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";

const startingTickets = [
  {
    id: "1",
    type: "Stop Sign Violation",
    time: "10:30 AM",
    zone: "Parking Lot A",
    rule: "Failure to stop at stop sign",
    status: "Unpaid",
  },
  {
    id: "2",
    type: "Speeding (School Zone)",
    time: "11:15 AM",
    zone: "School Zone",
    rule: "Speed limit exceeded",
    status: "Unpaid",
  },
  {
    id: "3",
    type: "Parking Violation",
    time: "12:05 PM",
    zone: "Parking Lot B",
    rule: "Improper parking",
    status: "Paid",
  },
];

export default function App() {
  const [screen, setScreen] = useState("Camera");
  const [tickets, setTickets] = useState(startingTickets);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState("All");

  function openTicket(ticket) {
    setSelectedTicket(ticket);
    setScreen("Details");
  }

  function changePaymentStatus() {
    const newStatus =
      selectedTicket.status === "Paid" ? "Unpaid" : "Paid";

    const updatedTicket = {
      ...selectedTicket,
      status: newStatus,
    };

    setTickets(
      tickets.map((ticket) =>
        ticket.id === selectedTicket.id ? updatedTicket : ticket
      )
    );

    setSelectedTicket(updatedTicket);
  }

  function showTickets() {
    setScreen("Tickets");
  }

  function showCamera() {
    setScreen("Camera");
  }

  function showEvidence() {
    setScreen("Evidence");
  }

  const visibleTickets =
    filter === "All"
      ? tickets
      : tickets.filter((ticket) => ticket.status === filter);

  function getStatusStyle(status) {
    if (status === "Paid") {
      return styles.paidStatus;
    }

    if (status === "Contested") {
      return styles.contestedStatus;
    }

    return styles.unpaidStatus;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>DASH CAM</Text>
        <Text style={styles.headerSubtitle}>Ticket Management</Text>
      </View>

      {screen === "Camera" && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.pageTitle}>Camera</Text>
          <Text style={styles.description}>
            Monitor your dash camera and review detected tickets.
          </Text>

          <View style={styles.cameraBox}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraTitle}>Camera Not Connected</Text>
            <Text style={styles.cameraText}>
              Your dash camera connection will be added later.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={showTickets}
          >
            <Text style={styles.primaryButtonText}>View Detected Tickets</Text>
          </TouchableOpacity>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ticket Summary</Text>
            <Text style={styles.summaryText}>
              Total tickets: {tickets.length}
            </Text>
            <Text style={styles.summaryText}>
              Unpaid tickets:{" "}
              {tickets.filter((ticket) => ticket.status === "Unpaid").length}
            </Text>
            <Text style={styles.summaryText}>
              Paid tickets:{" "}
              {tickets.filter((ticket) => ticket.status === "Paid").length}
            </Text>
          </View>
        </ScrollView>
      )}

      {screen === "Tickets" && (
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Detected Tickets</Text>
          <Text style={styles.description}>
            Select a ticket to view its information.
          </Text>

          <View style={styles.filterRow}>
            {["All", "Unpaid", "Paid"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterButton,
                  filter === item && styles.activeFilter,
                ]}
                onPress={() => setFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.activeFilterText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView>
            {visibleTickets.length === 0 && (
              <Text style={styles.emptyText}>
                No tickets in this category.
              </Text>
            )}

            {visibleTickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() => openTicket(ticket)}
              >
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketTitle}>{ticket.type}</Text>
                  <Text style={styles.ticketMeta}>
                    {ticket.time} · {ticket.zone}
                  </Text>
                </View>

                <Text style={[styles.status, getStatusStyle(ticket.status)]}>
                  {ticket.status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {screen === "Details" && selectedTicket && (
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={showTickets}>
            <Text style={styles.backButton}>‹ Back to tickets</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Ticket Details</Text>
          <Text style={styles.ticketTitle}>{selectedTicket.type}</Text>

          <Text style={[styles.status, getStatusStyle(selectedTicket.status)]}>
            {selectedTicket.status}
          </Text>

          <TouchableOpacity
            style={styles.evidenceBox}
            onPress={showEvidence}
          >
            <Text style={styles.cameraIcon}>🎥</Text>
            <Text style={styles.evidenceTitle}>View Evidence</Text>
            <Text style={styles.evidenceText}>
              Tap to view ticket evidence
            </Text>
          </TouchableOpacity>

          <View style={styles.summaryCard}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{selectedTicket.time}</Text>

            <View style={styles.line} />

            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{selectedTicket.zone}</Text>

            <View style={styles.line} />

            <Text style={styles.detailLabel}>Rule</Text>
            <Text style={styles.detailValue}>{selectedTicket.rule}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentButton,
              selectedTicket.status === "Paid" && styles.unpaidButton,
            ]}
            onPress={changePaymentStatus}
            disabled={selectedTicket.status === "Contested"}
          >
            <Text style={styles.paymentButtonText}>
              {selectedTicket.status === "Paid"
                ? "☐ Mark as Unpaid"
                : "☑ Mark as Paid"}
            </Text>
          </TouchableOpacity>

          {selectedTicket.status === "Contested" && (
            <Text style={styles.description}>
              Contested tickets cannot be marked as paid here.
            </Text>
          )}
        </ScrollView>
      )}

      {screen === "Evidence" && (
        <View style={styles.content}>
          <TouchableOpacity onPress={() => setScreen("Details")}>
            <Text style={styles.backButton}>‹ Back to ticket</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Ticket Evidence</Text>

          <View style={styles.cameraBox}>
            <Text style={styles.cameraIcon}>🎥</Text>
            <Text style={styles.cameraTitle}>No Video Available</Text>
            <Text style={styles.cameraText}>
              Video evidence will appear here when it is connected to the
              backend.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={showCamera}
        >
          <Text style={styles.navIcon}>⌂</Text>
          <Text
            style={[
              styles.navText,
              screen === "Camera" && styles.activeNavText,
            ]}
          >
            Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={showTickets}
        >
          <Text style={styles.navIcon}>▤</Text>
          <Text
            style={[
              styles.navText,
              (screen === "Tickets" || screen === "Details" ||
                screen === "Evidence") && styles.activeNavText,
            ]}
          >
            Tickets
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logo: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#2563EB",
  },
  headerSubtitle: {
    color: "#64748B",
    marginTop: 3,
    fontSize: 12,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 21,
  },
  cameraBox: {
    backgroundColor: "#E2E8F0",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 210,
    marginBottom: 20,
  },
  cameraIcon: {
    fontSize: 38,
    marginBottom: 12,
  },
  cameraTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  cameraText: {
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  summaryText: {
    color: "#475569",
    marginBottom: 8,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 18,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  activeFilter: {
    backgroundColor: "#2563EB",
  },
  filterText: {
    color: "#475569",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  ticketCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ticketInfo: {
    flex: 1,
    paddingRight: 8,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 5,
  },
  ticketMeta: {
    color: "#64748B",
    fontSize: 12,
  },
  status: {
    overflow: "hidden",
    borderRadius: 7,
    paddingVertical: 6,
    paddingHorizontal: 9,
    fontSize: 11,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginTop: 10,
  },
  paidStatus: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  unpaidStatus: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  contestedStatus: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 35,
  },
  backButton: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 22,
  },
  evidenceBox: {
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    padding: 25,
    alignItems: "center",
    marginVertical: 20,
  },
  evidenceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  evidenceText: {
    color: "#64748B",
    marginTop: 5,
  },
  detailLabel: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 5,
  },
  detailValue: {
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  line: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  paymentButton: {
    backgroundColor: "#16A34A",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  unpaidButton: {
    backgroundColor: "#64748B",
  },
  paymentButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 12,
  },
  navButton: {
    alignItems: "center",
    flex: 1,
  },
  navIcon: {
    fontSize: 21,
    color: "#64748B",
  },
  navText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
  },
  activeNavText: {
    color: "#2563EB",
    fontWeight: "bold",
  },
});

