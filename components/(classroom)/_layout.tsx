import { Stack } from 'expo-router'
import React from 'react'
import { View,Text } from 'react-native'

type Props = {}

export default function ClassLayout({}: Props) {
    return (
       <Stack>
        <Stack.Screen name='feature'></Stack.Screen>
       </Stack>
       )
}