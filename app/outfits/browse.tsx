/**
 * Browse Outfits Screen
 * Luxury redesign with glass effects and refined typography
 */

import { OutfitAPI } from "@/services/api";
import {
  ClothingSize,
  Outfit,
  OutfitCategory,
  OutfitSearchParams,
  SortOption,
} from "@/types";
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
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function BrowseOutfitsScreen() {
  const searchParams = useLocalSearchParams<{ category?: OutfitCategory }>();

  let [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_500Medium,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<OutfitSearchParams>({
    sortBy: "newest",
    page: 1,
    limit: 20,
    category: searchParams.category, // Initialize with category from URL
  });

  useEffect(() => {
    searchOutfits();
  }, [filters]);

  // Search when user stops typing
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery !== filters.query) {
        searchOutfits();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const searchOutfits = async () => {
    setLoading(true);

    try {
      const searchParams: OutfitSearchParams = {
        ...filters,
        query: searchQuery || undefined,
      };

      const response = await OutfitAPI.search(searchParams);

      if (response.success && response.data) {
        setOutfits(response.data.data);
      } else {
        console.error("Search failed:", response.error);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof OutfitSearchParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: "newest",
      page: 1,
      limit: 20,
    });
  };

  const renderOutfitCard = ({
    item,
    index,
  }: {
    item: Outfit;
    index: number;
  }) => (
    <AnimatedTouchable
      entering={FadeInDown.delay(index * 80)
        .duration(600)
        .springify()}
      style={styles.outfitCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/outfits/${item.id}`);
      }}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.images[0] }} style={styles.outfitImage} />
      <LinearGradient
        colors={["transparent", "rgba(26, 10, 15, 0.95)"]}
        style={styles.outfitGradient}
      >
        <BlurView intensity={20} tint="dark" style={styles.outfitInfo}>
          <Text style={styles.outfitTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.outfitMeta}>
            <Text style={styles.outfitSize}>{item.size}</Text>
            <Text style={styles.outfitDot}>•</Text>
            <Text style={styles.outfitCategory}>{item.category}</Text>
          </View>
          <View style={styles.outfitFooter}>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★</Text>
              <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.price}>${item.pricePerDay}/day</Text>
          </View>
        </BlurView>
      </LinearGradient>
    </AnimatedTouchable>
  );

  if (!fontsLoaded) {
    return null;
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
      {/* Header with Search */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <Text style={styles.headerTitle}>Browse</Text>
        <View style={styles.searchContainer}>
          <BlurView intensity={30} tint="dark" style={styles.searchBlur}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by style, occasion..."
              placeholderTextColor="rgba(245, 241, 232, 0.4)"
            />
          </BlurView>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilters(true);
            }}
          >
            <BlurView intensity={40} tint="dark" style={styles.filterBlur}>
              <Text style={styles.filterIcon}>⋮⋮</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Sort Options */}
      <ScrollView
        horizontal
        style={styles.sortContainer}
        contentContainerStyle={styles.sortContent}
        showsHorizontalScrollIndicator={false}
      >
        {(
          [
            { value: "newest", label: "Newest" },
            { value: "price-low", label: "Low Price" },
            { value: "price-high", label: "High Price" },
            { value: "rating-high", label: "Top Rated" },
          ] as { value: SortOption; label: string }[]
        ).map((sort) => (
          <TouchableOpacity
            key={sort.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateFilter("sortBy", sort.value);
            }}
          >
            <BlurView
              intensity={filters.sortBy === sort.value ? 40 : 20}
              tint="dark"
              style={[
                styles.sortButton,
                filters.sortBy === sort.value && styles.sortButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  filters.sortBy === sort.value && styles.sortButtonTextActive,
                ]}
              >
                {sort.label}
              </Text>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.loadingText}>Discovering outfits...</Text>
        </View>
      ) : (
        <FlatList
          data={outfits}
          renderItem={renderOutfitCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.outfitsList}
          columnWrapperStyle={styles.outfitsRow}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>◇</Text>
              <Text style={styles.emptyText}>No outfits found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or search radius
              </Text>
            </View>
          }
        />
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient
          colors={["#1a0a0f", "#2d1f2e"]}
          style={styles.modalContainer}
        >
          <BlurView intensity={80} tint="dark" style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Refine Search</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowFilters(false);
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </BlurView>

          <ScrollView style={styles.modalContent}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.filterOptions}>
                {(
                  [
                    "formal",
                    "casual",
                    "sportswear",
                    "party",
                    "business",
                    "wedding",
                  ] as OutfitCategory[]
                ).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateFilter(
                        "category",
                        filters.category === cat ? undefined : cat
                      );
                    }}
                  >
                    <BlurView
                      intensity={filters.category === cat ? 40 : 25}
                      tint="dark"
                      style={[
                        styles.filterOption,
                        filters.category === cat && styles.filterOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filters.category === cat &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Size Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Size</Text>
              <View style={styles.filterOptions}>
                {(["XS", "S", "M", "L", "XL", "XXL"] as ClothingSize[]).map(
                  (size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        updateFilter(
                          "size",
                          filters.size === size ? undefined : size
                        );
                      }}
                    >
                      <BlurView
                        intensity={filters.size === size ? 40 : 25}
                        tint="dark"
                        style={[
                          styles.filterOption,
                          filters.size === size && styles.filterOptionActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            filters.size === size &&
                              styles.filterOptionTextActive,
                          ]}
                        >
                          {size}
                        </Text>
                      </BlurView>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Daily Rate</Text>
              <View style={styles.priceInputs}>
                <BlurView
                  intensity={30}
                  tint="dark"
                  style={styles.priceInputWrapper}
                >
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    placeholderTextColor="rgba(245, 241, 232, 0.3)"
                    keyboardType="numeric"
                    value={filters.minPrice?.toString() || ""}
                    onChangeText={(value) =>
                      updateFilter(
                        "minPrice",
                        value ? parseFloat(value) : undefined
                      )
                    }
                  />
                </BlurView>
                <Text style={styles.priceSeparator}>—</Text>
                <BlurView
                  intensity={30}
                  tint="dark"
                  style={styles.priceInputWrapper}
                >
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    placeholderTextColor="rgba(245, 241, 232, 0.3)"
                    keyboardType="numeric"
                    value={filters.maxPrice?.toString() || ""}
                    onChangeText={(value) =>
                      updateFilter(
                        "maxPrice",
                        value ? parseFloat(value) : undefined
                      )
                    }
                  />
                </BlurView>
              </View>
            </View>

            {/* Radius */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>
                Search Radius: {filters.radiusKm || 10} km
              </Text>
              <View style={styles.radiusOptions}>
                {[5, 10, 25, 50, 100].map((radius) => (
                  <TouchableOpacity
                    key={radius}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateFilter("radiusKm", radius);
                    }}
                  >
                    <BlurView
                      intensity={filters.radiusKm === radius ? 40 : 25}
                      tint="dark"
                      style={[
                        styles.radiusOption,
                        filters.radiusKm === radius &&
                          styles.radiusOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.radiusOptionText,
                          filters.radiusKm === radius &&
                            styles.radiusOptionTextActive,
                        ]}
                      >
                        {radius}
                      </Text>
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Clear Filters Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                clearFilters();
              }}
            >
              <BlurView intensity={30} tint="dark" style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </BlurView>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </Modal>
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
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.1)",
  },
  headerTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 36,
    color: "#f5f1e8",
    letterSpacing: 1,
    marginBottom: 16,
    paddingLeft: 56,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
  },
  searchBlur: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    overflow: "hidden",
  },
  searchInput: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: "#f5f1e8",
    letterSpacing: 0.3,
  },
  filterButton: {
    width: 48,
    height: 48,
  },
  filterBlur: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  filterIcon: {
    fontSize: 20,
    color: "#d4af37",
  },
  sortContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.08)",
  },
  sortContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    overflow: "hidden",
  },
  sortButtonActive: {
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  sortButtonText: {
    fontSize: 11,
    fontFamily: "Montserrat_500Medium",
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sortButtonTextActive: {
    color: "#d4af37",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 0.5,
  },
  outfitsList: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  outfitsRow: {
    gap: 12,
  },
  outfitCard: {
    flex: 1,
    height: 280,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  outfitImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2d1f2e",
  },
  outfitGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: "flex-end",
  },
  outfitInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.15)",
    overflow: "hidden",
  },
  outfitTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 18,
    color: "#f5f1e8",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  outfitMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  outfitSize: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 11,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  outfitDot: {
    fontSize: 10,
    color: "rgba(245, 241, 232, 0.3)",
    marginHorizontal: 6,
  },
  outfitCategory: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: "rgba(245, 241, 232, 0.5)",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  outfitFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: "#d4af37",
  },
  ratingValue: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: "#f5f1e8",
  },
  price: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 16,
    color: "#d4af37",
    letterSpacing: 0.5,
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
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.15)",
  },
  modalTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 28,
    color: "#f5f1e8",
    letterSpacing: 1,
  },
  modalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalClose: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "#d4af37",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterLabel: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 18,
    color: "#f5f1e8",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    overflow: "hidden",
  },
  filterOptionActive: {
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  filterOptionText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.6)",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  filterOptionTextActive: {
    color: "#d4af37",
  },
  priceInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  priceInputWrapper: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    overflow: "hidden",
  },
  priceInput: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Montserrat_500Medium",
    color: "#f5f1e8",
  },
  priceSeparator: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: "rgba(245, 241, 232, 0.4)",
  },
  radiusOptions: {
    flexDirection: "row",
    gap: 8,
  },
  radiusOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    alignItems: "center",
    overflow: "hidden",
  },
  radiusOptionActive: {
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  radiusOptionText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 0.3,
  },
  radiusOptionTextActive: {
    color: "#d4af37",
  },
  clearButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    alignItems: "center",
    marginTop: 16,
    overflow: "hidden",
  },
  clearButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
