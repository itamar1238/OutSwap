import { RentalAPI } from "@/services/api";
import { Rental } from "@/types";
import {
  CormorantGaramond_600SemiBold,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type RentalTab = "renter" | "owner";

export default function MyRentalsScreen() {
  let [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  const [activeTab, setActiveTab] = useState<RentalTab>("renter");
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = "current-user-id";

  useEffect(() => {
    loadRentals();
  }, [activeTab]);

  const loadRentals = async () => {
    setLoading(true);
    const response =
      activeTab === "renter"
        ? await RentalAPI.getByRenter(userId)
        : await RentalAPI.getByOwner(userId);
    if (response.success && response.data) {
      setRentals(response.data);
    }
    setLoading(false);
  };

  const handleConfirmRental = async (rentalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const response = await RentalAPI.confirm(rentalId);
    if (response.success) {
      Alert.alert("Success", "Rental confirmed!");
      loadRentals();
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a0a0f", "#2d1f2e", "#1a0a0f"]}
        style={StyleSheet.absoluteFillObject}
      />

      <BlurView intensity={80} tint="dark" style={styles.header}>
        <Text style={styles.title}>My Rentals</Text>
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("renter");
            }}
          >
            <BlurView
              intensity={activeTab === "renter" ? 40 : 20}
              tint="dark"
              style={[styles.tab, activeTab === "renter" && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "renter" && styles.tabTextActive,
                ]}
              >
                Renting
              </Text>
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("owner");
            }}
          >
            <BlurView
              intensity={activeTab === "owner" ? 40 : 20}
              tint="dark"
              style={[styles.tab, activeTab === "owner" && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "owner" && styles.tabTextActive,
                ]}
              >
                Hosting
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d4af37" />
          </View>
        ) : rentals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>◇</Text>
            <Text style={styles.emptyText}>No rentals yet</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === "renter"
                ? "Start browsing to rent outfits"
                : "Create listings to host"}
            </Text>
          </View>
        ) : (
          rentals.map((rental) => (
            <BlurView
              key={rental.id}
              intensity={30}
              tint="dark"
              style={styles.rentalCard}
            >
              <View style={styles.rentalHeader}>
                <Text style={styles.rentalTitle}>{rental.outfit.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    styles[
                      `status${
                        rental.status.charAt(0).toUpperCase() +
                        rental.status.slice(1)
                      }` as keyof typeof styles
                    ],
                  ]}
                >
                  <Text style={styles.statusText}>{rental.status}</Text>
                </View>
              </View>
              <View style={styles.rentalInfo}>
                <Text style={styles.rentalDate}>
                  {new Date(rental.startDate).toLocaleDateString()} -{" "}
                  {new Date(rental.endDate).toLocaleDateString()}
                </Text>
                <Text style={styles.rentalPrice}>${rental.totalPrice}</Text>
              </View>
              {activeTab === "owner" && rental.status === "pending" && (
                <TouchableOpacity
                  onPress={() => handleConfirmRental(rental.id)}
                  style={styles.confirmButton}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </BlurView>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0a0f" },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.15)",
  },
  title: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 36,
    color: "#f5f1e8",
    letterSpacing: 1,
    marginBottom: 20,
  },
  tabBar: { flexDirection: "row", gap: 12 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    overflow: "hidden",
  },
  tabActive: { borderColor: "rgba(212, 175, 55, 0.4)" },
  tabText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tabTextActive: { color: "#d4af37" },
  content: { padding: 24 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    color: "rgba(212, 175, 55, 0.3)",
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 20,
    color: "#f5f1e8",
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.5)",
    textAlign: "center",
  },
  rentalCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    marginBottom: 16,
    overflow: "hidden",
  },
  rentalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rentalTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 20,
    color: "#f5f1e8",
    letterSpacing: 0.5,
    flex: 1,
  },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  statusPending: { backgroundColor: "rgba(255, 193, 7, 0.2)" },
  statusConfirmed: { backgroundColor: "rgba(76, 175, 80, 0.2)" },
  statusActive: { backgroundColor: "rgba(33, 150, 243, 0.2)" },
  statusCompleted: { backgroundColor: "rgba(158, 158, 158, 0.2)" },
  statusCancelled: { backgroundColor: "rgba(244, 67, 54, 0.2)" },
  statusText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 10,
    color: "#f5f1e8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  rentalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rentalDate: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.6)",
  },
  rentalPrice: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 20,
    color: "#d4af37",
    letterSpacing: 0.5,
  },
  confirmButton: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    color: "#d4af37",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
