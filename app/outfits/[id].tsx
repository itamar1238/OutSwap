/**
 * Outfit Detail Screen
 * Luxury redesign with glass effects and refined typography
 */

import { OutfitAPI, RatingAPI } from "@/services/api";
import { Outfit, Rating } from "@/types";
import {
  CormorantGaramond_500Medium,
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
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  let [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_500Medium,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

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

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#1a0a0f", "#2d1f2e", "#1a0a0f"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>Loading outfit...</Text>
      </View>
    );
  }

  if (!outfit) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={["#1a0a0f", "#2d1f2e", "#1a0a0f"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.errorIcon}>◇</Text>
        <Text style={styles.errorText}>Outfit not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.errorButton}
        >
          <BlurView intensity={40} tint="dark" style={styles.errorButtonBlur}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </BlurView>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a0a0f", "#2d1f2e", "#1a0a0f"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentImageIndex(index);
            }}
          >
            {outfit.images.length > 0 ? (
              outfit.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Text style={styles.placeholderIcon}>◇</Text>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </ScrollView>

          {/* Image Indicators */}
          {outfit.images.length > 1 && (
            <BlurView intensity={30} tint="dark" style={styles.indicators}>
              <View style={styles.indicatorDots}>
                {outfit.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicatorDot,
                      currentImageIndex === index && styles.indicatorDotActive,
                    ]}
                  />
                ))}
              </View>
            </BlurView>
          )}

          {/* Floating Price Tag */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.floatingPrice}
          >
            <BlurView intensity={40} tint="dark" style={styles.priceBlur}>
              <Text style={styles.priceLabel}>Daily Rate</Text>
              <Text style={styles.price}>${outfit.pricePerDay}</Text>
            </BlurView>
          </Animated.View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title & Rating */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.headerSection}
          >
            <BlurView intensity={25} tint="dark" style={styles.headerBlur}>
              <Text style={styles.title}>{outfit.title}</Text>
              <View style={styles.ratingRow}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingStar}>★</Text>
                  <Text style={styles.rating}>{outfit.rating.toFixed(1)}</Text>
                  <Text style={styles.ratingCount}>
                    ({outfit.totalRatings})
                  </Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{outfit.category}</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* Meta Info */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.metaSection}
          >
            <BlurView intensity={25} tint="dark" style={styles.metaBlur}>
              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>◆</Text>
                  <Text style={styles.metaLabel}>Size</Text>
                  <Text style={styles.metaValue}>{outfit.size}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>○</Text>
                  <Text style={styles.metaLabel}>Location</Text>
                  <Text style={styles.metaValue}>
                    {outfit.location.city || "N/A"}
                  </Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>△</Text>
                  <Text style={styles.metaLabel}>Available</Text>
                  <Text style={styles.metaValue}>
                    {outfit.available ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* Style Tags */}
          {outfit.styleTags.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(500).duration(600)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Style Tags</Text>
              <View style={styles.tagsContainer}>
                {outfit.styleTags.map((tag, index) => (
                  <BlurView
                    key={index}
                    intensity={20}
                    tint="dark"
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </BlurView>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Description */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>About This Outfit</Text>
            <BlurView intensity={20} tint="dark" style={styles.descriptionBlur}>
              <Text style={styles.description}>{outfit.description}</Text>
            </BlurView>
          </Animated.View>

          {/* Owner Info */}
          {outfit.owner && (
            <Animated.View
              entering={FadeInDown.delay(700).duration(600)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Hosted By</Text>
              <BlurView intensity={25} tint="dark" style={styles.ownerCard}>
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{outfit.owner.name}</Text>
                  <View style={styles.ownerRatingRow}>
                    <Text style={styles.ownerRatingStar}>★</Text>
                    <Text style={styles.ownerRating}>
                      {outfit.owner.rating.toFixed(1)}
                    </Text>
                    <Text style={styles.ownerRatingCount}>
                      ({outfit.owner.totalRatings} reviews)
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleContactOwner}
                  activeOpacity={0.8}
                >
                  <BlurView
                    intensity={40}
                    tint="dark"
                    style={styles.contactBlur}
                  >
                    <Text style={styles.contactButtonText}>Contact</Text>
                  </BlurView>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          )}

          {/* Reviews */}
          {ratings.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(800).duration(600)}
              style={styles.section}
            >
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <Text style={styles.reviewCount}>({ratings.length})</Text>
              </View>
              {ratings.slice(0, 3).map((rating, index) => (
                <BlurView
                  key={rating.id}
                  intensity={20}
                  tint="dark"
                  style={[styles.reviewCard, { marginTop: index > 0 ? 12 : 0 }]}
                >
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>
                      {rating.fromUser?.name || "Anonymous"}
                    </Text>
                    <View style={styles.reviewRatingContainer}>
                      <Text style={styles.reviewStar}>★</Text>
                      <Text style={styles.reviewRating}>{rating.rating}</Text>
                    </View>
                  </View>
                  {rating.comment && (
                    <Text style={styles.reviewComment}>{rating.comment}</Text>
                  )}
                </BlurView>
              ))}
              {ratings.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllButtonText}>
                    View all {ratings.length} reviews
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <BlurView intensity={80} tint="dark" style={styles.bottomBar}>
        <LinearGradient
          colors={["rgba(26, 10, 15, 0.8)", "rgba(45, 31, 46, 0.8)"]}
          style={styles.bottomBarGradient}
        >
          <View style={styles.bottomBarContent}>
            <View>
              <Text style={styles.bottomLabel}>Total from</Text>
              <Text style={styles.bottomPrice}>${outfit.pricePerDay}/day</Text>
            </View>
            <TouchableOpacity
              style={styles.rentButton}
              onPress={handleRentNow}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#d4af37", "#c9a961"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rentButtonGradient}
              >
                <Text style={styles.rentButtonText}>Reserve Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a0f",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "rgba(245, 241, 232, 0.5)",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorIcon: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 80,
    color: "rgba(212, 175, 55, 0.3)",
    marginBottom: 20,
  },
  errorText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: "rgba(245, 241, 232, 0.6)",
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    overflow: "hidden",
    borderRadius: 8,
  },
  errorButtonBlur: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  errorButtonText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
    color: "#d4af37",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
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
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 28,
    color: "#d4af37",
    marginLeft: -2,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    position: "relative",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: "#0a0507",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 60,
    color: "rgba(212, 175, 55, 0.2)",
    marginBottom: 12,
  },
  placeholderText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "rgba(245, 241, 232, 0.3)",
  },
  indicators: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  indicatorDots: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(245, 241, 232, 0.3)",
  },
  indicatorDotActive: {
    width: 20,
    backgroundColor: "#d4af37",
  },
  floatingPrice: {
    position: "absolute",
    top: 80,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  priceBlur: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  priceLabel: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: "rgba(245, 241, 232, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  price: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 32,
    color: "#d4af37",
    letterSpacing: 0.5,
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 12,
  },
  headerBlur: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    overflow: "hidden",
  },
  title: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 32,
    color: "#f5f1e8",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingStar: {
    fontSize: 18,
    color: "#d4af37",
  },
  rating: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#f5f1e8",
  },
  ratingCount: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "rgba(245, 241, 232, 0.5)",
  },
  categoryBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  categoryText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 12,
    color: "#d4af37",
    textTransform: "capitalize",
  },
  metaSection: {
    marginBottom: 20,
    overflow: "hidden",
    borderRadius: 12,
  },
  metaBlur: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    overflow: "hidden",
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flex: 1,
    alignItems: "center",
  },
  metaIcon: {
    fontSize: 24,
    color: "#d4af37",
    marginBottom: 8,
  },
  metaLabel: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: "rgba(245, 241, 232, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#f5f1e8",
    textTransform: "capitalize",
  },
  metaDivider: {
    width: 1,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 24,
    color: "#f5f1e8",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    overflow: "hidden",
  },
  tagText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 12,
    color: "#d4af37",
  },
  descriptionBlur: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    overflow: "hidden",
  },
  description: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 15,
    color: "rgba(245, 241, 232, 0.8)",
    lineHeight: 24,
  },
  ownerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    overflow: "hidden",
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#f5f1e8",
    marginBottom: 6,
  },
  ownerRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ownerRatingStar: {
    fontSize: 14,
    color: "#d4af37",
  },
  ownerRating: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
    color: "#f5f1e8",
  },
  ownerRatingCount: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.5)",
  },
  contactButton: {
    overflow: "hidden",
    borderRadius: 8,
  },
  contactBlur: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    overflow: "hidden",
  },
  contactButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#d4af37",
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
    gap: 8,
  },
  reviewCount: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: "rgba(245, 241, 232, 0.5)",
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    overflow: "hidden",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#f5f1e8",
  },
  reviewRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewStar: {
    fontSize: 14,
    color: "#d4af37",
  },
  reviewRating: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
    color: "#f5f1e8",
  },
  reviewComment: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "rgba(245, 241, 232, 0.7)",
    lineHeight: 20,
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
    color: "#d4af37",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.2)",
    overflow: "hidden",
  },
  bottomBarGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  bottomBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomLabel: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "rgba(245, 241, 232, 0.5)",
    marginBottom: 4,
  },
  bottomPrice: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 24,
    color: "#f5f1e8",
  },
  rentButton: {
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#d4af37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rentButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  rentButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#1a0a0f",
    textAlign: "center",
  },
});
