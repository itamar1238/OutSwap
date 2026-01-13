import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#d4af37",
        tabBarInactiveTintColor: "rgba(245, 241, 232, 0.4)",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "rgba(26, 10, 15, 0.85)",
          borderTopColor: "rgba(212, 175, 55, 0.15)",
          borderTopWidth: 1,
          position: "absolute",
          elevation: 0,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontFamily: "System",
          fontSize: 11,
          fontWeight: "500",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: "hidden",
              backgroundColor: "rgba(26, 10, 15, 0.75)",
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="sparkles" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
