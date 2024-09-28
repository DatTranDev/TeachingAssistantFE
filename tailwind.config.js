/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{
        blue_primary:"#82BFF6",
        gray_primary:"#767676"
      },
      fontFamily:{
        mregular:["Montserrat-Regular","sans-serif"],
        mmedium:["Montserrat-Medium","sans-serif"],
        msemibold:["Montserrat-SemiBold","sans-serif"],
        mbold:["Montserrat-Bold","sans-serif"],
      },
    },
  },
  plugins: [],
}

