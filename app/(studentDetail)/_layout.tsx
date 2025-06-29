import React from 'react'
import{View,Text,SafeAreaView} from 'react-native'
import { Stack } from 'expo-router'

type Props = {}

export default function StudentDetailLayout({}: Props) {
  return (
    <Stack>
        <Stack.Screen name='notification/notificationDetail' options={{headerShown: false,}}/>
        <Stack.Screen name='profileDetail/editProfile' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/feature' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/addClass' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/review' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/detailReview' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/discussion/listRoom' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/generalRoom' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/rollCall/rollCall' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/document' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/detailDocument' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/discussionRoom' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/rollCall/absence' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/discussion/fixedGroup' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/discussion/joinFixedGroup' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/discussion/randomGroup' options={{headerShown: false,}}/>
        <Stack.Screen name='classDetail/discussion/reviewGroup' options={{headerShown: false,}}/>
    </Stack>
  )
}