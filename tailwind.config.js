/** @type {import('tailwindcss').Config} */
/* eslint-disable */
const plugin = require('tailwindcss/plugin')

function wrapUtilities(utilities) {
  // Hack to enable AutoCompletion on VSCode
  // https://github.com/tailwindlabs/tailwindcss-intellisense/issues/227#issuecomment-1139895799
  return reduce(
    utilities,
    (result, value, key) => {
      result[key] = value

      if (isString(value)) {
        // Custom utility is a string of other utility classes so we'll display them as is
        result[`.${key}`] = { tw: value }
      } else {
        result[`.${key}`] = value
      }
      return result
    },
    {},
  )
}


module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        main: {
          '50': '#fafcea',
          '100': '#f6fac7',
          '200': '#eef58a',
          '300': '#ecf054',
          '400': '#eae725',
          '500': '#dacf18',
          '600': '#bca512',
          '700': '#967912',
          '800': '#7c5f17',
          '900': '#6a4e19',
        },
        secondary: {
          '50': '#f6f5ef',
          '100': '#eae9dd',
          '200': '#d8d8be',
          '300': '#bebf97',
          '400': '#9b9c64',
          '500': '#898b57',
          '600': '#6b6d43',
          '700': '#535536',
          '800': '#43452f',
          '900': '#3a3c2b',
        }
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        btn: {
          padding: 3,
          borderRadius: 10,
          textTransform: `uppercase`,
          backgroundColor: `#333`,
        },
        'resize-repeat': {
          resizeMode: `repeat`,
        },
        'flex-0': {
          flex: 0
        },
        bbbb: `px-4 py-1 rounded-full bg-red-800 text-white`,
        btnn: {
          backgroundColor: "yellow",
          borderWidth: 3,
          borderRadius: 5,
          flex: 0,
          width: 105,
          height: 105,
          alignSelf: 'center',
        },

      })
    }),
  ],

}
