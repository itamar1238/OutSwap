import {
  CormorantGaramond_400Regular,
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
import { router } from "expo-router";
import { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const shimmer = useSharedValue(0);

  let [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_400Regular,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + shimmer.value * 0.3,
  }));

  if (!fontsLoaded) {
    return null;
  }

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Atmospheric Background */}
      <LinearGradient
        colors={["#1a0a0f", "#3d1f2e", "#1a0a0f"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Accent Shimmer */}
      <Animated.View style={[styles.accentShimmer, shimmerStyle]}>
        <LinearGradient
          colors={["transparent", "#d4af37", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Hero Section */}
      <Animated.View
        entering={FadeInUp.duration(800).springify()}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>OutSwap</Text>
        <View style={styles.heroUnderline} />
        <Text style={styles.heroSubtitle}>Curated Fashion Rental</Text>
        <Text style={styles.heroTagline}>Sustainable. Local. Refined.</Text>
      </Animated.View>

      {/* Action Cards */}
      <View style={styles.actionsContainer}>
        <AnimatedTouchable
          entering={FadeInDown.delay(200).duration(600).springify()}
          onPress={() => handlePress("/outfits/browse")}
          activeOpacity={0.9}
          style={styles.primaryAction}
        >
          <BlurView intensity={40} tint="dark" style={styles.glassCard}>
            <LinearGradient
              colors={["rgba(212, 175, 55, 0.15)", "rgba(212, 175, 55, 0.05)"]}
              style={styles.cardGradient}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>✦</Text>
              </View>
              <Text style={styles.primaryCardTitle}>Discover</Text>
              <Text style={styles.primaryCardSubtitle}>
                Browse curated outfits from your community
              </Text>
            </LinearGradient>
          </BlurView>
        </AnimatedTouchable>

        <View style={styles.secondaryActions}>
          <AnimatedTouchable
            entering={FadeInDown.delay(400).duration(600).springify()}
            onPress={() => handlePress("/outfits/create")}
            activeOpacity={0.9}
            style={styles.secondaryAction}
          >
            <BlurView intensity={30} tint="dark" style={styles.glassCardSmall}>
              <View style={styles.cardIconSmall}>
                <Text style={styles.cardIconTextSmall}>+</Text>
              </View>
              <Text style={styles.secondaryCardTitle}>List</Text>
              <Text style={styles.secondaryCardSubtitle}>
                Share your wardrobe
              </Text>
            </BlurView>
          </AnimatedTouchable>

          <AnimatedTouchable
            entering={FadeInDown.delay(600).duration(600).springify()}
            onPress={() => handlePress("/rentals")}
            activeOpacity={0.9}
            style={styles.secondaryAction}
          >
            <BlurView intensity={30} tint="dark" style={styles.glassCardSmall}>
              <View style={styles.cardIconSmall}>
                <Text style={styles.cardIconTextSmall}>◈</Text>
              </View>
              <Text style={styles.secondaryCardTitle}>Rentals</Text>
              <Text style={styles.secondaryCardSubtitle}>Manage bookings</Text>
            </BlurView>
          </AnimatedTouchable>
        </View>
      </View>

      {/* Feature Pills */}
      <Animated.View
        entering={FadeInUp.delay(800).duration(600)}
        style={styles.features}
      >
        <BlurView intensity={20} tint="dark" style={styles.featurePill}>
          <Text style={styles.featureText}>Sustainable Fashion</Text>
        </BlurView>
        <BlurView intensity={20} tint="dark" style={styles.featurePill}>
          <Text style={styles.featureText}>Verified Community</Text>
        </BlurView>
        <BlurView intensity={20} tint="dark" style={styles.featurePill}>
          <Text style={styles.featureText}>Insured Rentals</Text>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a0f",
  },
  accentShimmer: {
    position: "absolute",
    top: 100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  hero: {
    paddingTop: 120,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 60,
  },
  heroTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 72,
    color: "#f5f1e8",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroUnderline: {
    width: 120,
    height: 1,
    backgroundColor: "#d4af37",
    marginVertical: 16,
  },
  heroSubtitle: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
    color: "#d4af37",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTagline: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 1,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  primaryAction: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
  },
  glassCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    overflow: "hidden",
  },
  cardGradient: {
    flex: 1,
    padding: 28,
    justifyContent: "flex-end",
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cardIconText: {
    fontSize: 28,
    color: "#d4af37",
  },
  primaryCardTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 32,
    color: "#f5f1e8",
    marginBottom: 6,
    letterSpacing: 1,
  },
  primaryCardSubtitle: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.7)",
    letterSpacing: 0.5,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 16,
  },
  secondaryAction: {
    flex: 1,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
  },
  glassCardSmall: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    padding: 20,
    justifyContent: "flex-end",
  },
  cardIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIconTextSmall: {
    fontSize: 20,
    color: "#d4af37",
  },
  secondaryCardTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 24,
    color: "#f5f1e8",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  secondaryCardSubtitle: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 0.3,
  },
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 10,
  },
  featurePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    overflow: "hidden",
  },
  featureText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 11,
    color: "rgba(245, 241, 232, 0.7)",
    letterSpacing: 0.5,
  },
});
