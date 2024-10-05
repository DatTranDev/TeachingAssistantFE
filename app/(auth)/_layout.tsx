import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

type Props = {}

const AuthLayout = (props: Props) => {
  return (
   <>
      <Stack>
        <Stack.Screen name='sign-in' options={{ headerShown: false }}/>
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name='regisInfo' options={{ headerShown: false }}/>
      </Stack>
   </>
  )
}

export default AuthLayout