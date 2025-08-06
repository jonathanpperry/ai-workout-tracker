import SafeViewAndroid from "@/app/components/SafeViewAndroid";
import { GetWorkoutsQueryResult } from "@/lib/sanity/types";
import { useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function HomePage() {
  // const { user } = useUser();
  // const router = useRouter();
  // const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([]);
  // const [loading, setLoading] = useState(false);
  // const [refreshing, setRefreshing] = useState(false);

  return (
    <SafeAreaView
      style={SafeViewAndroid.AndroidSafeArea}
      className="flex flex-1"
    ></SafeAreaView>
  );
}
