import React, { useState } from 'react'
import { View, Text,TouchableOpacity } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome';
type Props = {
    rating?: number;
    size: number,
    style?: String,
    readOnly?: boolean,
    changeRating?:(start: number) => void,
    color?:string
}

export default function RatingLayout({ rating, size, style, readOnly, changeRating,color }: Props) {
    if (!rating || !readOnly) {
        rating = 0;
    }
    if(!color)
    {
        color='#82BFF6'
    }
    const [star,setStar]= useState(rating)
    const layout = () => {
        const list = []
       
        
        if (readOnly) {
           
            for (let i = 0; i < Math.trunc(star); i++) {
                list.push(<FontAwesome key={i} name="star" size={size} color={color} />)
            }
            if (star - Math.trunc(star) > 0) {
                list.push(<FontAwesome key={Math.trunc(star)} name="star-half-empty" size={size} color={color} />)
                for (let i = 0; i < 4 - Math.trunc(star); i++) {
                    list.push(<FontAwesome key={5 - i} name="star-o" size={size} color={color} />)
                }
            } else {
                for (let i = 0; i < 5 - Math.trunc(star); i++) {
                    list.push(<FontAwesome key={5 - i} name="star-o" size={size} color={color} />)
                }
            }
        }
        else {
            for (let i = 0; i < Math.trunc(star); i++) {
                list.push(<TouchableOpacity  key={i} onPress={ ()=>{setStar(i+1);if(changeRating)changeRating(i+1)}}><FontAwesome name="star" size={size} color={color} /></TouchableOpacity>)
            }
            for (let i = 0; i < 5 - Math.trunc(star); i++) {
                list.push(<TouchableOpacity  key={5 - i} onPress={ ()=>{setStar(i+Math.trunc(star)+1);if(changeRating)changeRating(i+Math.trunc(star)+1)}}><FontAwesome name="star-o" size={size} color={color} /></TouchableOpacity>)
              
            }
        }


        return list;
    }
    return (
        <View className={`flex-row ${style}`}>
            {layout()}
        </View>
    )
}