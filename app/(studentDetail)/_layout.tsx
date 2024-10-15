import React from 'react'
import{View,Text,SafeAreaView} from 'react-native'
import { Stack } from 'expo-router'

type Props = {}

export default function StudentDetailLayout({}: Props) {
  return (
    <Stack>
        <Stack.Screen name='profileDetail/editProfile' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/feature' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/addClass' options={{headerShown: false,}}/>
        
    </Stack>
  )
}