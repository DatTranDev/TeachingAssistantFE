import React from 'react'
import{View,Text,SafeAreaView} from 'react-native'
import { Stack } from 'expo-router'

type Props = {}

export default function TeacherDetailLayout({}: Props) {
  return (
    <Stack>
      <Stack.Screen name='classDetail/teachFeature/document' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/discussion' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/feature' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/sessions' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/addClass' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/index' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/review' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/chat' options={{headerShown:false}}/>

    </Stack>
  )
}