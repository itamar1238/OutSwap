import { OutfitAPI, RentalAPI } from "@/services/api";
import { Outfit } from "@/types";
import { validateRentalInput } from "@/utils/validation";
import {
  CormorantGaramond_600SemiBold,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
} from "@expo-google-fonts/montserrat";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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

export default function CreateRentalScreen() {
  let [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Montserrat_400Regular,
    Montserrat_500Medium,
  });

  const { outfitId } = useLocalSearchParams<{ outfitId: string }>();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );

  useEffect(() => {
    loadOutfit();
  }, [outfitId]);

  const loadOutfit = async () => {
    if (!outfitId) return;
    const response = await OutfitAPI.getById(outfitId);
    if (response.success && response.data) {
      setOutfit(response.data);
    }
    setLoading(false);
  };

  const calculatePrice = () => {
    if (!outfit) return 0;
    return RentalAPI.calculatePrice(
      startDate,
      endDate,
      outfit.pricePerHour,
      outfit.pricePerDay
    );
  };

  const handleSubmit = async () => {
    if (!outfit) return;

    const validation = validateRentalInput({
      outfitId: outfit.id,
      startDate,
      endDate,
      notes: "",
    });
    if (!validation.isValid) {
      Alert.alert(
        "Validation Error",
        validation.errors.map((e) => e.message).join("\n")
      );
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await RentalAPI.createRequest({
        outfitId: outfit.id,
        startDate,
        endDate,
        notes: "",
      });
      if (response.success) {
        Alert.alert("Success", "Rental request submitted!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to create rental");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#1a0a0f", "#2d1f2e"]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  if (!outfit) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#1a0a0f", "#2d1f2e"]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.errorText}>Outfit not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a0a0f", "#2d1f2e", "#1a0a0f"]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Request Rental</Text>

        <BlurView intensity={30} tint="dark" style={styles.outfitCard}>
          <Text style={styles.outfitTitle}>{outfit.title}</Text>
          <View style={styles.outfitMeta}>
            <Text style={styles.outfitSize}>{outfit.size}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.outfitCategory}>{outfit.category}</Text>
          </View>
          <Text style={styles.outfitLocation}>{outfit.location.city}</Text>
        </BlurView>

        <BlurView intensity={30} tint="dark" style={styles.dateCard}>
          <Text style={styles.label}>Rental Period</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>
                {startDate.toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.dateSeparator}>→</Text>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateValue}>
                {endDate.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </BlurView>

        <BlurView intensity={40} tint="dark" style={styles.priceCard}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.price}>${calculatePrice()}</Text>
          <Text style={styles.priceDetail}>
            ${outfit.pricePerHour}/hr • ${outfit.pricePerDay}/day
          </Text>
        </BlurView>

        <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
          <LinearGradient
            colors={["#d4af37", "#b8941f"]}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Submitting..." : "Request Rental"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0a0f" },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButtonBlur: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(26, 10, 15, 0.6)",
  },
  backButtonIcon: {
    fontSize: 24,
    color: "#d4af37",
    marginLeft: -2,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 20,
    color: "#f5f1e8",
  },
  content: { padding: 24, paddingTop: 80 },
  title: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 40,
    color: "#f5f1e8",
    letterSpacing: 1,
    marginBottom: 32,
    paddingLeft: 56,
    marginTop: -22,
  },
  outfitCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.15)",
    marginBottom: 20,
    overflow: "hidden",
  },
  outfitTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 24,
    color: "#f5f1e8",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  outfitMeta: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  outfitSize: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 12,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dot: { fontSize: 10, color: "rgba(245, 241, 232, 0.3)", marginHorizontal: 8 },
  outfitCategory: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "rgba(245, 241, 232, 0.5)",
    textTransform: "capitalize",
  },
  outfitLocation: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.4)",
  },
  dateCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    marginBottom: 20,
    overflow: "hidden",
  },
  label: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.7)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateItem: { flex: 1 },
  dateLabel: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: "rgba(245, 241, 232, 0.5)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  dateValue: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 18,
    color: "#f5f1e8",
  },
  dateSeparator: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 20,
    color: "rgba(212, 175, 55, 0.4)",
    marginHorizontal: 16,
  },
  priceCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    marginBottom: 24,
    alignItems: "center",
    overflow: "hidden",
  },
  priceLabel: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  price: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 48,
    color: "#d4af37",
    letterSpacing: 1,
  },
  priceDetail: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.5)",
    marginTop: 4,
  },
  submitButton: { paddingVertical: 18, borderRadius: 12, alignItems: "center" },
  submitButtonText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 16,
    color: "#1a0a0f",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
