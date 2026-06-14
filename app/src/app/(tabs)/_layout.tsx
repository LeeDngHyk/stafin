import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { colors } from "@/lib/theme";

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "핫 트랜드", tabBarIcon: ({ focused }) => <Icon emoji="🔥" focused={focused} /> }}
      />
      <Tabs.Screen
        name="myfin"
        options={{ title: "MyFin", tabBarIcon: ({ focused }) => <Icon emoji="⭐" focused={focused} /> }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{ title: "맞춤 포트폴리오", tabBarIcon: ({ focused }) => <Icon emoji="📊" focused={focused} /> }}
      />
    </Tabs>
  );
}
