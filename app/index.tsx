import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'
import  { useState, useEffect, useRef,useContext } from 'react';
type Props = {}

export default function index(){
    return <Redirect href="/timetable"/>
}