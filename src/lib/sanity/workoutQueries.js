// src/lib/sanity/workoutQueries.js
import { defineQuery } from "groq"; // or just define as string if you're not using groq-z

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

export const getWorkoutsQuery = defineQuery(`*[
  _type == "workout" && userId == $userId
] | order(date desc) {
  _id,
  date,
  duration,
  exercises[] {
    exercise-> {
      _id,
      name
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
