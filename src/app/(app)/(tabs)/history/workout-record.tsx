import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";
import { GetWorkoutRecordQueryResult } from "@/lib/sanity/types";
import { formatDate, formatTime, formatWorkoutDuration } from "lib/utils";
import { Ionicons } from "@expo/vector-icons";

export const getWorkoutRecordQuery =
  defineQuery(`*[_type == "workout" && _id == $workoutId][0] {
    _id,
    _type,
    _createdAt,
    date,
    duration,
    exercises[] {
      exercise-> {
        _id,
        name,
        description
      },
      sets[] {
        reps,
        weight,
        weightUnit,
        _type,
        _key
      },
      _type,
      key
    }
  }`);

const WorkoutRecord = () => {
  const { workoutId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [workout, setWorkout] = useState<GetWorkoutRecordQueryResult | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) return;

      try {
        const result = await client.fetch(getWorkoutRecordQuery, {
          workoutId,
        });
        setWorkout(result);
      } catch (error) {
        console.error("Error fetching workout: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  const getTotalSets = () => {
    return (
      workout?.exercises?.reduce((total, exercise) => {
        return total + (exercise.sets?.length || 0);
      }, 0) || 0
    );
  };

  const getTotalVolume = () => {
    let totalVolume = 0;
    let unit = "lbs";

    workout?.exercises?.forEach((exercise) => {
      exercise.sets?.forEach((set) => {
        if (set.weight && set.reps) {
          totalVolume += set.weight * set.reps;
          unit = set.weightUnit || "lbs";
        }
      });
    });
    return { volume: totalVolume, unit };
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteWorkout,
        },
      ]
    );
  };

  const deleteWorkout = async () => {
    if (!workoutId) return;

    setDeleting(true);

    try {
      await fetch("/api/delete-workout", {
        method: "POST",
        body: JSON.stringify({ workoutId }),
      });

      router.replace("/(app)/(tabs)/history?refresh=true");
    } catch (error) {
      console.error("Error deleting workout: ", error);
      Alert.alert("Error", "Failed to delete workout. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { volume, unit } = getTotalVolume();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Workout Summary */}
        <View className="bg-white p-6 border-b border-gray-300">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Workout Summary
            </Text>
            <TouchableOpacity
              onPress={handleDeleteWorkout}
              disabled={deleting}
              className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                  <Text className="text-white font-medium ml-2">Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 ml-3 font-medium">
              {formatDate(workout.date)} at {formatTime(workout.date)}
            </Text>
          </View>

          {/* Duration */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 ml-3 font-medium">
              {formatWorkoutDuration(workout.duration)}
            </Text>
          </View>

          {/* Num exercises */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="fitness-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 ml-3 font-medium">
              {workout.exercises?.length || 0} exercises
            </Text>
          </View>

          {/* Total Sets */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="bar-chart-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 ml-3 font-medium">
              {getTotalSets()} total sets
            </Text>
          </View>

          {/* Volume */}
          {volume > 0 && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="barbell-outline" size={20} color="#6B7280" />
              <Text className="text-gray-700 ml-3 font-medium">
                {volume.toLocaleString()} {unit} total volume
              </Text>
            </View>
          )}
        </View>

        {/* Exercise List */}
        <View className="space-y-4 p-6 gap-4">
          {workout.exercises?.map((exerciseData, idx) => (
            <View
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {/* Exercise Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {exerciseData.exercise?.name || "Unknown Exercise"}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {exerciseData.sets?.length || 0} sets completed
                  </Text>
                </View>
                <View className="bg-blue-100 rounded-full w-10 h-10 items-center justify-center">
                  <Text className="text-blue-600 font-bold">{idx + 1}</Text>
                </View>
              </View>

              {/* Sets */}
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Sets:
                </Text>
                {exerciseData.sets?.map((set, setIndex) => (
                  <View
                    key={set._key}
                    className="bg-gray-50 rounded-lg p-3 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <View className="bg-gray-200 rounded-full w-6 h-6 items-center justify-center mr-3">
                        <Text className="text-gray-700 text-xs font-medium">
                          {setIndex + 1}
                        </Text>
                      </View>
                      <Text className="text-gray-900 font-medium">
                        {set.reps} reps
                      </Text>
                    </View>
                    {set.weight && (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="barbell-outline"
                          size={16}
                          color="#6B7280"
                        />
                        <Text className="text-gray-700 ml-2 font-medium">
                          {set.weight} {set.weightUnit || "lbs"}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/*  Exercise Volume Summary */}
              {exerciseData.sets && exerciseData.sets.length > 0 && (
                <View className="mt-4 pt-4 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">
                      Exercise Volume:
                    </Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {exerciseData.sets
                        .reduce((total, set) => {
                          return total + (set.weight || 0) * (set.reps || 0);
                        }, 0)
                        .toLocaleString()}{" "}
                      {exerciseData.sets[0]?.weightUnit || "lbs"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutRecord;
