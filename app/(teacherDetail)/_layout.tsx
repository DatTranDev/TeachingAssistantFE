import React from 'react'
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
      <Stack.Screen name='classDetail/editClass' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/attendance/rollCall' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/attendance/absence' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/attendance/menuAttendance' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/setting' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/statistical/index' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/statistical/rollCall' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/statistical/review' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/statistical/interaction' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/statistical/absence' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/notification/index' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/notification/cancellation' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/notification/reschedule' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/studentList' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/groupManager/index' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/groupRandom' options={{headerShown:false}}/>
      <Stack.Screen name='classDetail/teachFeature/groupChat' options={{headerShown:false}}/>
    </Stack>
  )
}