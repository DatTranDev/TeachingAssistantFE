import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

type Props = {}

const AuthLayout = (props: Props) => {
  return (
   <>
      <Stack>
        <Stack.Screen name='sign-in' options={{ headerShown: false }}/>
        <Stack.Screen name="sign-up/index" options={{ headerShown: false }} />
        <Stack.Screen name='sign-up/signUp' options={{ headerShown: false }}/>
        <Stack.Screen name='sign-up/verify' options={{ headerShown: false }}/>
        <Stack.Screen name='forgotPassword/index' options={{ headerShown: false }}/>
        <Stack.Screen name='forgotPassword/verify' options={{ headerShown: false }}/>
        <Stack.Screen name='forgotPassword/changePassword' options={{ headerShown: false }}/>
      </Stack>
   </>
  )
}

export default AuthLayout