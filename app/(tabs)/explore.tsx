import { OutfitCategory } from "@/types";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
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
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ExploreScreen() {
  let [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_500Medium,
    CormorantGaramond_400Regular,
    Montserrat_400Regular,
    Montserrat_500Medium,
  });

  const categories: {
    name: OutfitCategory;
    icon: string;
    gradient: string[];
  }[] = [
    { name: "formal", icon: "◆", gradient: ["#2d1319", "#1a0a0f"] },
    { name: "casual", icon: "○", gradient: ["#1f1a1a", "#0f0a0a"] },
    { name: "sportswear", icon: "△", gradient: ["#1a1f1f", "#0a0f0f"] },
    { name: "party", icon: "✦", gradient: ["#2d191f", "#1a0a0f"] },
    { name: "business", icon: "■", gradient: ["#1f1f1a", "#0f0f0a"] },
    { name: "wedding", icon: "◇", gradient: ["#29191f", "#190a0f"] },
  ];

  if (!fontsLoaded) {
    return null;
  }

  const handleCategoryPress = (category: OutfitCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/outfits/browse?category=${category}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Background */}
      <LinearGradient
        colors={["#1a0a0f", "#2d1f2e", "#1a0a0f"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View
        entering={FadeInUp.duration(600).springify()}
        style={styles.header}
      >
        <Text style={styles.title}>Collections</Text>
        <View style={styles.titleUnderline} />
        <Text style={styles.subtitle}>Curated by occasion & style</Text>
      </Animated.View>

      {/* Categories */}
      <View style={styles.categoriesGrid}>
        {categories.map((category, index) => (
          <AnimatedTouchable
            key={category.name}
            entering={FadeInDown.delay(index * 100)
              .duration(600)
              .springify()}
            onPress={() => handleCategoryPress(category.name)}
            activeOpacity={0.9}
            style={styles.categoryCard}
          >
            <BlurView intensity={30} tint="dark" style={styles.categoryBlur}>
              <LinearGradient
                colors={category.gradient}
                style={styles.categoryGradient}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>
                  {category.name.charAt(0).toUpperCase() +
                    category.name.slice(1)}
                </Text>
                <View style={styles.categoryLine} />
              </LinearGradient>
            </BlurView>
          </AnimatedTouchable>
        ))}
      </View>

      {/* Philosophy Section */}
      <Animated.View
        entering={FadeInUp.delay(800).duration(600)}
        style={styles.philosophySection}
      >
        <BlurView intensity={40} tint="dark" style={styles.philosophyCard}>
          <Text style={styles.philosophyTitle}>Our Philosophy</Text>
          <Text style={styles.philosophyText}>
            Sustainable luxury through shared fashion. Every garment has a
            story, and every rental extends that narrative while reducing waste.
          </Text>
          <Text style={styles.philosophyText}>
            We believe in circular fashion — where style meets sustainability,
            and community replaces consumption.
          </Text>
        </BlurView>
      </Animated.View>

      {/* How It Works */}
      <Animated.View
        entering={FadeInUp.delay(1000).duration(600)}
        style={styles.processSection}
      >
        <Text style={styles.sectionTitle}>The Process</Text>

        <BlurView intensity={25} tint="dark" style={styles.processCard}>
          <View style={styles.processStep}>
            <Text style={styles.stepNumber}>I</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Discover</Text>
              <Text style={styles.stepText}>
                Browse our curated collection of premium outfits from verified
                local wardrobes
              </Text>
            </View>
          </View>
        </BlurView>

        <BlurView intensity={25} tint="dark" style={styles.processCard}>
          <View style={styles.processStep}>
            <Text style={styles.stepNumber}>II</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Reserve</Text>
              <Text style={styles.stepText}>
                Select your dates, confirm pricing, and request your rental
              </Text>
            </View>
          </View>
        </BlurView>

        <BlurView intensity={25} tint="dark" style={styles.processCard}>
          <View style={styles.processStep}>
            <Text style={styles.stepNumber}>III</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Experience</Text>
              <Text style={styles.stepText}>
                Enjoy your outfit with full damage protection and community
                trust
              </Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>

      {/* Trust Badges */}
      <Animated.View
        entering={FadeInUp.delay(1200).duration(600)}
        style={styles.trustSection}
      >
        <View style={styles.trustBadges}>
          <BlurView intensity={20} tint="dark" style={styles.trustBadge}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>Verified</Text>
          </BlurView>
          <BlurView intensity={20} tint="dark" style={styles.trustBadge}>
            <Text style={styles.trustIcon}>◈</Text>
            <Text style={styles.trustText}>Insured</Text>
          </BlurView>
          <BlurView intensity={20} tint="dark" style={styles.trustBadge}>
            <Text style={styles.trustIcon}>○</Text>
            <Text style={styles.trustText}>Sustainable</Text>
          </BlurView>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0a0f",
  },
  content: {
    paddingBottom: 60,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  title: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 48,
    color: "#f5f1e8",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  titleUnderline: {
    width: 80,
    height: 1,
    backgroundColor: "#d4af37",
    marginVertical: 12,
  },
  subtitle: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "rgba(245, 241, 232, 0.6)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  categoriesGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 40,
  },
  categoryCard: {
    width: "47.5%",
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
  },
  categoryBlur: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    overflow: "hidden",
  },
  categoryGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  categoryIcon: {
    fontSize: 32,
    color: "#d4af37",
  },
  categoryName: {
    fontFamily: "CormorantGaramond_500Medium",
    fontSize: 20,
    color: "#f5f1e8",
    letterSpacing: 0.5,
    textTransform: "capitalize",
  },
  categoryLine: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(212, 175, 55, 0.3)",
  },
  philosophySection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  philosophyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    padding: 28,
    overflow: "hidden",
  },
  philosophyTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 28,
    color: "#f5f1e8",
    letterSpacing: 1,
    marginBottom: 16,
  },
  philosophyText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "rgba(245, 241, 232, 0.7)",
    lineHeight: 22,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  processSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 32,
    color: "#f5f1e8",
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: "center",
  },
  processCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.08)",
    padding: 20,
    marginBottom: 12,
    overflow: "hidden",
  },
  processStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  stepNumber: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 32,
    color: "#d4af37",
    width: 40,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 20,
    color: "#f5f1e8",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  stepText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "rgba(245, 241, 232, 0.65)",
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  trustSection: {
    paddingHorizontal: 24,
  },
  trustBadges: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  trustBadge: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 241, 232, 0.1)",
    padding: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  trustIcon: {
    fontSize: 20,
    color: "#d4af37",
    marginBottom: 8,
  },
  trustText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 10,
    color: "rgba(245, 241, 232, 0.7)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
