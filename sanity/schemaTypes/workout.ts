import {defineField, defineType, defineArrayMember} from 'sanity'

export default defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  icon: () => '🏋️',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: 'The Clerk ID of the user who performed this workout',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Workout Date',
      description: 'The date when this workout was performed',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      description: 'Total time spent on this workout measured in seconds',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'exercises',
      title: 'Exercises',
      description:
        'List of exercises performed during this workout with their sets, reps, and weights',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'workoutExercise',
          title: 'Workout Exercise',
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise',
              description: 'The exercise that was performed',
              type: 'reference',
              to: [{type: 'exercise'}],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              description:
                'Individual sets performed for this exercise with reps and weight details',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'set',
                  title: 'Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Reps',
                      description: 'Number of repetitions completed in this set',
                      type: 'number',
                      validation: (Rule) => Rule.required().min(0),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      description: 'Amount of weight used for this set',
                      type: 'number',
                      validation: (Rule) => Rule.min(0),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      description: 'The unit of measurement for the weight (pounds or kilograms)',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Pounds (lbs)', value: 'lbs'},
                          {title: 'Kilograms (kg)', value: 'kg'},
                        ],
                        layout: 'radio',
                      },
                      initialValue: 'lbs',
                    }),
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      unit: 'weightUnit',
                    },
                    prepare({reps, weight, unit}) {
                      return {
                        title: `${reps} reps${weight ? ` @ ${weight}${unit}` : ''}`,
                        subtitle: 'Set',
                      }
                    },
                  },
                }),
              ],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: {
              exerciseName: 'exercise.name',
              sets: 'sets',
            },
            prepare({exerciseName, sets}) {
              const setCount = sets?.length || 0
              return {
                title: exerciseName || 'Unknown Exercise',
                subtitle: `${setCount} set${setCount !== 1 ? 's' : ''}`,
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      userId: 'userId',
      date: 'date',
      duration: 'duration',
      exercises: 'exercises',
    },
    prepare({userId, date, duration, exercises}) {
      const exerciseCount = exercises?.length || 0
      const durationMinutes = duration ? Math.round(duration / 60) : 0
      return {
        title: `Workout - ${date || 'No date'}`,
        subtitle: `${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} • ${durationMinutes} min • User: ${userId}`,
      }
    },
  },
})
