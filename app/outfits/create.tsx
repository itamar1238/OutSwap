import { OutfitAPI } from "@/services/api";
import { ClothingSize, CreateOutfitInput, OutfitCategory } from "@/types";
import { validateOutfitInput } from "@/utils/validation";
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
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateOutfitScreen() {
  let [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Montserrat_400Regular,
    Montserrat_500Medium,
  });

  const [formData, setFormData] = useState<CreateOutfitInput>({
    title: "",
    description: "",
    images: [],
    size: "M" as ClothingSize,
    category: "casual" as OutfitCategory,
    styleTags: [],
    pricePerHour: 0,
    pricePerDay: 0,
    location: {
      latitude: 0,
      longitude: 0,
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
    availabilityDates: [],
  });

  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulating image picker - in production, use expo-image-picker
    const dummyImageUrl = `https://picsum.photos/400/600?random=${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, dummyImageUrl],
    }));
  };

  const handleRemoveImage = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.styleTags.includes(newTag.trim())) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFormData((prev) => ({
        ...prev,
        styleTags: [...prev.styleTags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData((prev) => ({
      ...prev,
      styleTags: prev.styleTags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async () => {
    // Add default coordinates if not set (center of US)
    const outfitData = {
      ...formData,
      location: {
        ...formData.location,
        // Use default coordinates if not provided (can be enhanced with geocoding later)
        latitude: formData.location.latitude || 39.8283,
        longitude: formData.location.longitude || -98.5795,
      },
      // Ensure availability dates is always an array
      availabilityDates: formData.availabilityDates || [],
    };

    const validation = validateOutfitInput(outfitData);
    if (!validation.isValid) {
      Alert.alert(
        "Validation Error",
        validation.errors.map((e) => `${e.field}: ${e.message}`).join("\n")
      );
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await OutfitAPI.create(outfitData);
      if (response.success) {
        Alert.alert("Success", "Outfit created successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to create outfit");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a0a0f", "#2d1f2e", "#1a0a0f"]}
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
        <BlurView intensity={40} tint="dark" style={styles.backButtonBlur}>
          <Text style={styles.backButtonIcon}>←</Text>
        </BlurView>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Listing</Text>

        {/* Images Section */}
        <BlurView intensity={30} tint="dark" style={styles.inputCard}>
          <Text style={styles.label}>Photos ({formData.images.length})</Text>
          <View style={styles.imagesContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imagePreview}>
                <Text style={styles.imagePreviewText}>Image {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveImage(index)}
                  style={styles.removeImageButton}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={handleAddImage}
              style={styles.addImageButton}
            >
              <BlurView intensity={25} tint="dark" style={styles.addImageBlur}>
                <Text style={styles.addImageIcon}>+</Text>
                <Text style={styles.addImageText}>Add Photo</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </BlurView>

        <BlurView intensity={30} tint="dark" style={styles.inputCard}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, title: value }))
            }
            placeholder="Enter outfit title"
            placeholderTextColor="rgba(245, 241, 232, 0.3)"
          />
        </BlurView>

        <BlurView intensity={30} tint="dark" style={styles.inputCard}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
            placeholder="Describe your outfit"
            placeholderTextColor="rgba(245, 241, 232, 0.3)"
            multiline
            numberOfLines={4}
          />
        </BlurView>

        <BlurView intensity={30} tint="dark" style={styles.inputCard}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsRow}>
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
                  setFormData((prev) => ({ ...prev, category: cat }));
                }}
              >
                <BlurView
                  intensity={formData.category === cat ? 40 : 20}
                  tint="dark"
                  style={[
                    styles.option,
                    formData.category === cat && styles.optionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.category === cat && styles.optionTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>

        <BlurView intensity={30} tint="dark" style={styles.inputCard}>
          <Text style={styles.label}>Size</Text>
          <View style={styles.optionsRow}>
            {(["XS", "S", "M", "L", "XL", "XXL"] as ClothingSize[]).map(
              (size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormData((prev) => ({ ...prev, size }));
                  }}
                >
                  <BlurView
                    intensity={formData.size === size ? 40 : 20}
                    tint="dark"
                    style={[
                      styles.sizeOption,
                      formData.size === size && styles.optionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.size === size && styles.optionTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              )
            )}
          </View>
        </BlurView>
        {/* Style Tags Section */}
        <BlurView intensity={30} tint="dark" style={styles.inputCard}>
          <Text style={styles.label}>
            Style Tags ({formData.styleTags.length})
          </Text>
          <View style={styles.tagsInputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="e.g., elegant, vintage"
              placeholderTextColor="rgba(245, 241, 232, 0.3)"
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity
              onPress={handleAddTag}
              style={styles.addTagButton}
            >
              <BlurView intensity={40} tint="dark" style={styles.addTagBlur}>
                <Text style={styles.addTagText}>Add</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
          {formData.styleTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.styleTags.map((tag) => (
                <BlurView
                  key={tag}
                  intensity={25}
                  tint="dark"
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(tag)}
                    style={styles.removeTagButton}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </BlurView>
              ))}
            </View>
          )}
        </BlurView>

        {/* Location Section */}
        <BlurView intensity={30} tint="dark" style={styles.inputCard}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={formData.location.city}
            onChangeText={(value) =>
              setFormData((prev) => ({
                ...prev,
                location: { ...prev.location, city: value },
              }))
            }
            placeholder="City"
            placeholderTextColor="rgba(245, 241, 232, 0.3)"
          />
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            value={formData.location.state}
            onChangeText={(value) =>
              setFormData((prev) => ({
                ...prev,
                location: { ...prev.location, state: value },
              }))
            }
            placeholder="State/Province"
            placeholderTextColor="rgba(245, 241, 232, 0.3)"
          />
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            value={formData.location.zipCode}
            onChangeText={(value) =>
              setFormData((prev) => ({
                ...prev,
                location: { ...prev.location, zipCode: value },
              }))
            }
            placeholder="Zip Code"
            placeholderTextColor="rgba(245, 241, 232, 0.3)"
          />
        </BlurView>
        <View style={styles.priceRow}>
          <BlurView
            intensity={30}
            tint="dark"
            style={[styles.inputCard, { flex: 1 }]}
          >
            <Text style={styles.label}>Price/Hour</Text>
            <TextInput
              style={styles.input}
              value={formData.pricePerHour.toString()}
              onChangeText={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  pricePerHour: parseFloat(value) || 0,
                }))
              }
              placeholder="0"
              placeholderTextColor="rgba(245, 241, 232, 0.3)"
              keyboardType="numeric"
            />
          </BlurView>
          <BlurView
            intensity={30}
            tint="dark"
            style={[styles.inputCard, { flex: 1 }]}
          >
            <Text style={styles.label}>Price/Day</Text>
            <TextInput
              style={styles.input}
              value={formData.pricePerDay.toString()}
              onChangeText={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  pricePerDay: parseFloat(value) || 0,
                }))
              }
              placeholder="0"
              placeholderTextColor="rgba(245, 241, 232, 0.3)"
              keyboardType="numeric"
            />
          </BlurView>
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          <LinearGradient
            colors={["#d4af37", "#b8941f"]}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Creating..." : "Create Listing"}
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
  inputCard: {
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
    marginBottom: 12,
  },
  input: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: "#f5f1e8",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 241, 232, 0.2)",
    paddingVertical: 8,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    overflow: "hidden",
  },
  sizeOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    overflow: "hidden",
  },
  optionActive: { borderColor: "rgba(212, 175, 55, 0.4)" },
  optionText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.6)",
    textTransform: "capitalize",
  },
  optionTextActive: { color: "#d4af37" },
  priceRow: { flexDirection: "row", gap: 16 },
  imagesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  imagePreview: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  imagePreviewText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: "rgba(245, 241, 232, 0.5)",
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#d4af37",
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    fontSize: 18,
    color: "#1a0a0f",
    fontWeight: "bold",
    marginTop: -2,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  addImageBlur: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.2)",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageIcon: {
    fontSize: 32,
    color: "#d4af37",
    marginBottom: 4,
  },
  addImageText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: "rgba(245, 241, 232, 0.5)",
  },
  tagsInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  addTagButton: {
    minWidth: 60,
  },
  addTagBlur: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    overflow: "hidden",
  },
  addTagText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 12,
    color: "#d4af37",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    overflow: "hidden",
  },
  tagText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 12,
    color: "#d4af37",
    letterSpacing: 0.5,
    marginRight: 8,
  },
  removeTagButton: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  removeTagText: {
    fontSize: 16,
    color: "#d4af37",
    fontWeight: "bold",
    marginTop: -2,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 16,
    color: "#1a0a0f",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
