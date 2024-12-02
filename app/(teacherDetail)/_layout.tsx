import React from 'react'
import{View,Text,SafeAreaView} from 'react-native'
import { Stack } from 'expo-router'

type Props = {}

export default function TeacherDetailLayout({}: Props) {
  return (
    <Stack>
      <Stack.Screen name='classDetail/document' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/discussion' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/feature' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/sessions' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/addClass' options={{headerShown:false}}/>
    </Stack>
  )
}