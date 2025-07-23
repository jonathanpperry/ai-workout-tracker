import { View, Text, SafeAreaView, StatusBar } from "react-native";
import React from "react";
import SafeViewAndroid from "@/app/components/SafeViewAndroid";

const ActiveWorkout = () => {
  return (
    <SafeAreaView style={SafeViewAndroid.AndroidSafeArea} className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      <Text>ActiveWorkout</Text>
    </SafeAreaView>
  );
};

export default ActiveWorkout;
