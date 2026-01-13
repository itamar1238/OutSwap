/**
 * Outfit Detail Screen
 * Displays detailed information about a specific outfit
 */

import { OutfitAPI, RatingAPI } from "@/services/api";
import { Outfit, Rating } from "@/types";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOutfit();
    loadRatings();
  }, [id]);

  const loadOutfit = async () => {
    if (!id) return;

    const response = await OutfitAPI.getById(id);
    if (response.success && response.data) {
      setOutfit(response.data);
    } else {
      Alert.alert("Error", "Failed to load outfit details");
    }
    setLoading(false);
  };

  const loadRatings = async () => {
    if (!id) return;

    const response = await RatingAPI.getForOutfit(id);
    if (response.success && response.data) {
      setRatings(response.data);
    }
  };

  const handleRentNow = () => {
    if (!outfit) return;
    router.push(`/rentals/create?outfitId=${outfit.id}`);
  };

  const handleContactOwner = () => {
    Alert.alert("Contact Owner", "Messaging feature coming soon!");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4af37" />
      </View>
    );
  }

  if (!outfit) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Outfit not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        style={styles.backButton}
      >
        <BlurView intensity={60} tint="dark" style={styles.backButtonBlur}>
          <Text style={styles.backButtonIcon}>←</Text>
        </BlurView>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ScrollView horizontal pagingEnabled style={styles.imageGallery}>
          {outfit.images.length > 0 ? (
            outfit.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.image} />
            ))
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </ScrollView>

        {/* Outfit Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{outfit.title}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>★ {outfit.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>
                  ({outfit.totalRatings} reviews)
                </Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.price}>${outfit.pricePerHour}/hr</Text>
              <Text style={styles.priceDay}>${outfit.pricePerDay}/day</Text>
            </View>
          </View>

          {/* Size and Category */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Size</Text>
              <Text style={styles.metaValue}>{outfit.size}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{outfit.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue}>{outfit.location.city}</Text>
            </View>
          </View>

          {/* Style Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Style Tags</Text>
            <View style={styles.tagsContainer}>
              {outfit.styleTags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{outfit.description}</Text>
          </View>

          {/* Owner Info */}
          {outfit.owner && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Owner</Text>
              <View style={styles.ownerCard}>
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{outfit.owner.name}</Text>
                  <Text style={styles.ownerRating}>
                    ★ {outfit.owner.rating.toFixed(1)} (
                    {outfit.owner.totalRatings} reviews)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleContactOwner}
                >
                  <Text style={styles.contactButtonText}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews ({ratings.length})</Text>
            {ratings.slice(0, 3).map((rating) => (
              <View key={rating.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>
                    {rating.fromUser?.name || "Anonymous"}
                  </Text>
                  <Text style={styles.reviewRating}>★ {rating.rating}</Text>
                </View>
                {rating.comment && (
                  <Text style={styles.reviewComment}>{rating.comment}</Text>
                )}
              </View>
            ))}
            {ratings.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllButtonText}>View all reviews</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.rentButton} onPress={handleRentNow}>
            <Text style={styles.rentButtonText}>Rent Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a0f",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#f5f1e8",
    opacity: 0.6,
  },
  imageGallery: {
    height: 400,
  },
  image: {
    width: 400,
    height: 400,
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    color: "#999",
  },
  detailsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 16,
    color: "#FF9500",
    fontWeight: "600",
  },
  ratingCount: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  priceDay: {
    fontSize: 14,
    color: "#666",
  },
  metaContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    gap: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  ownerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  ownerRating: {
    fontSize: 14,
    color: "#666",
  },
  contactButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  reviewRating: {
    fontSize: 14,
    color: "#FF9500",
    fontWeight: "600",
  },
  reviewComment: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  viewAllButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  rentButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  rentButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
