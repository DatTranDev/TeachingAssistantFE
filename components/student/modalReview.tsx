import React from 'react'
import {View,Text} from 'react-native'
import RatingLayout from '../ui/ratingLayout'
type Props = {
    changeUnderstand:(start: number) => void,
    changeQuantity:(start: number) => void,
    changeText:(text:string)=>void
}

export default function ModalReview({changeQuantity, changeUnderstand, changeText}: Props) {
  return (
   <View>

   </View>
  )
}